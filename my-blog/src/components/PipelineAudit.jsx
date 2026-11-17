import { useCallback, useEffect, useRef, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider, useConnect, useConnection, useSignMessage, useSwitchChain, useWriteContract } from 'wagmi';
import { readContract, waitForTransactionReceipt } from 'wagmi/actions';
import { erc20Abi, getAddress, isAddress } from 'viem';
import lucia from '../lucia';
import {
  PRICE_UNITS,
  PRODUCT_NAME,
  restoreDownloadMessage,
  txDownloadMessage,
} from '../../shared/payment.js';
import { chain, chainKey, explorerUrl, receivingAddress, usdcAddress, wagmiConfig } from '../payment/wagmi';
import { clearPurchase, loadPurchase, savePurchase } from '../payment/purchaseStorage';
import { requestDownload } from '../payment/download';

const queryClient = new QueryClient();

const shortAddress = (a) => `${a.slice(0, 6)}…${a.slice(-4)}`;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function friendlyError(error) {
  const text = `${error?.name ?? ''} ${error?.shortMessage ?? ''} ${error?.message ?? ''}`;
  if (/UserRejected|User rejected|denied|4001/i.test(text)) return 'You cancelled the request in your wallet.';
  return error?.shortMessage || error?.message || 'Something went wrong.';
}

// The server's RPC can lag the wallet's by a block or two, so retry the
// download a few times while /api/download says "not confirmed yet" (409).
async function downloadWithRetry(body) {
  for (let attempt = 0; ; attempt += 1) {
    try {
      return await requestDownload(body);
    } catch (error) {
      if (error.status !== 409 || attempt >= 5) throw error;
      await sleep(4000);
    }
  }
}

const BUSY = new Set(['connecting', 'switching', 'wallet', 'confirming', 'signing', 'downloading']);

function PurchasePanel() {
  const { address, chainId, isConnected, connector } = useConnection();
  const { connectAsync, connectors } = useConnect();
  const { switchChainAsync } = useSwitchChain();
  const { writeContractAsync } = useWriteContract();
  const { signMessageAsync } = useSignMessage();

  const [status, setStatus] = useState({ phase: 'idle', message: '' });
  const [purchase, setPurchase] = useState(() => loadPurchase(chain.id));
  const resumeStarted = useRef(false);
  const busy = BUSY.has(status.phase);
  const configured = isAddress(receivingAddress);

  // Tie the wallet to the visitor's Lucia session as soon as it connects.
  useEffect(() => {
    if (isConnected && address) {
      lucia.sendWalletInfo(address, {
        chainId,
        connectorType: 'injected',
        provider: connector?.name,
      });
    }
  }, [isConnected, address, chainId, connector?.name]);

  const remember = useCallback((record) => {
    savePurchase(record);
    setPurchase(record);
  }, []);

  const ensureWallet = useCallback(async () => {
    let account = address;
    let current = chainId;
    if (!isConnected || !account) {
      const injectedConnector = connectors[0];
      if (!injectedConnector || typeof window === 'undefined' || !window.ethereum) {
        throw new Error('No browser wallet found. Install MetaMask or another browser wallet, then reload this page.');
      }
      setStatus({ phase: 'connecting', message: 'Connect your wallet to continue…' });
      const result = await connectAsync({ connector: injectedConnector });
      account = result.accounts[0];
      current = result.chainId;
    }
    if (current !== chain.id) {
      setStatus({ phase: 'switching', message: `Switch your wallet to ${chain.name}…` });
      await switchChainAsync({ chainId: chain.id });
    }
    return getAddress(account);
  }, [address, chainId, isConnected, connectors, connectAsync, switchChainAsync]);

  // Wait for confirmation, collect the signature, then download.
  const finishPurchase = useCallback(async (record) => {
    let current = record;
    if (!current.signature) {
      setStatus({ phase: 'confirming', message: 'Waiting for your transaction to confirm…' });
      const receipt = await waitForTransactionReceipt(wagmiConfig, { hash: current.txHash, chainId: chain.id });
      if (receipt.status !== 'success') {
        clearPurchase();
        setPurchase(null);
        throw new Error('The transaction failed on-chain, so no USDC was sent. You can try again.');
      }

      const account = await ensureWallet();
      if (account !== current.from) {
        throw new Error(`Switch your wallet to the account that paid (${shortAddress(current.from)}), then try again.`);
      }
      setStatus({ phase: 'signing', message: 'Sign a message to prove the payment came from you. It costs no gas.' });
      const signature = await signMessageAsync({ account, message: txDownloadMessage(current.txHash) });
      current = { ...current, signature };
      remember(current);
    }

    setStatus({ phase: 'downloading', message: 'Verifying your payment and preparing the PDF…' });
    await downloadWithRetry({ txHash: current.txHash, signature: current.signature });
    remember({ ...current, downloaded: true });
    setStatus({ phase: 'done', message: 'Your download has started. Thanks for buying!' });
  }, [ensureWallet, remember, signMessageAsync]);

  const run = useCallback(async (task) => {
    try {
      await task();
    } catch (error) {
      console.error('[pipeline-audit]', error);
      setStatus({ phase: 'error', message: friendlyError(error) });
    }
  }, []);

  const handleBuy = () => run(async () => {
    lucia.buttonClick('pipeline_audit_buy');
    if (!configured) throw new Error('Payments are not configured yet. Please check back soon.');

    const from = await ensureWallet();
    const balance = await readContract(wagmiConfig, {
      address: usdcAddress,
      abi: erc20Abi,
      functionName: 'balanceOf',
      args: [from],
      chainId: chain.id,
    });
    if (balance < PRICE_UNITS) {
      throw new Error(
        chainKey === 'sepolia'
          ? `This wallet has less than 1 test USDC on ${chain.name}. Get some free at faucet.circle.com, plus a little Sepolia ETH for gas.`
          : `This wallet has less than 1 USDC on ${chain.name}. You also need a little ETH for gas.`,
      );
    }

    setStatus({ phase: 'wallet', message: 'Approve the 1 USDC transfer in your wallet…' });
    const txHash = await writeContractAsync({
      address: usdcAddress,
      abi: erc20Abi,
      functionName: 'transfer',
      args: [receivingAddress, PRICE_UNITS],
      chainId: chain.id,
    });

    // Saved before confirmation so a buyer who closes the tab can resume.
    const record = { chainId: chain.id, txHash, from };
    remember(record);
    await finishPurchase(record);
  });

  const handleRestore = () => run(async () => {
    lucia.buttonClick('pipeline_audit_restore');
    const from = await ensureWallet();
    const issuedAt = new Date().toISOString();
    setStatus({ phase: 'signing', message: 'Sign a message to prove you own this wallet. It costs no gas.' });
    const signature = await signMessageAsync({ account: from, message: restoreDownloadMessage(from, issuedAt) });
    setStatus({ phase: 'downloading', message: 'Looking up your payment…' });
    await requestDownload({ address: from, issuedAt, signature });
    setStatus({ phase: 'done', message: 'Payment found. Your download has started.' });
  });

  const handleResume = () => run(() => finishPurchase(purchase));

  // Pick up an unfinished purchase automatically when the buyer returns.
  useEffect(() => {
    if (resumeStarted.current || !purchase || purchase.downloaded) return;
    const canSign = isConnected && address && getAddress(address) === purchase.from;
    if (purchase.signature || canSign) {
      resumeStarted.current = true;
      run(() => finishPurchase(purchase));
    }
  }, [purchase, isConnected, address, finishPurchase, run]);

  const statusStyles = {
    done: 'bg-green-50 text-green-800',
    error: 'bg-red-50 text-red-800',
  };

  return (
    <div className="border border-gray-200 rounded-lg p-6 space-y-5">
      <div className="flex items-baseline justify-between gap-4 flex-wrap">
        <div>
          <div className="text-3xl font-bold text-gray-900">$1</div>
          <div className="text-sm text-gray-600">Paid in USDC on {chain.name}</div>
        </div>
        {chainKey === 'sepolia' && (
          <span className="text-xs font-medium px-2 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
            Testnet: uses free test USDC
          </span>
        )}
      </div>

      {purchase && !purchase.downloaded && status.phase !== 'done' && (
        <div className="p-4 rounded-md bg-gray-50 text-gray-700 text-sm space-y-2">
          <p>
            We found an unfinished purchase from {shortAddress(purchase.from)}.{' '}
            <a
              href={`${explorerUrl}/tx/${purchase.txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              View transaction
            </a>
          </p>
          {!busy && (
            <button type="button" onClick={handleResume} className="underline font-medium text-gray-900">
              Finish my download
            </button>
          )}
        </div>
      )}

      {status.message && (
        <div
          role="status"
          className={`p-4 rounded-md text-sm ${statusStyles[status.phase] ?? 'bg-gray-50 text-gray-700'}`}
        >
          {status.message}
        </div>
      )}

      {purchase?.downloaded ? (
        <button
          type="button"
          onClick={handleResume}
          disabled={busy}
          className={`w-full px-6 py-3 bg-gray-900 text-white rounded-md transition-colors ${busy ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-800'}`}
        >
          Download again
        </button>
      ) : (
        <button
          type="button"
          onClick={handleBuy}
          disabled={busy || !configured}
          className={`w-full px-6 py-3 bg-gray-900 text-white rounded-md transition-colors ${busy || !configured ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-800'}`}
        >
          {busy ? 'Working…' : 'Buy for $1'}
        </button>
      )}

      <button
        type="button"
        onClick={handleRestore}
        disabled={busy}
        className="w-full text-sm text-gray-600 hover:text-gray-900 underline disabled:opacity-50"
      >
        Already paid? Get your download
      </button>

      <p className="text-xs text-gray-500">
        Requires a browser wallet such as MetaMask. Payments sent from an exchange can&apos;t be matched to a
        download. {isConnected && address ? `Connected: ${shortAddress(address)}.` : ''}
      </p>
    </div>
  );
}

function PipelineAudit() {
  useEffect(() => {
    lucia.pageView('PipelineAudit');
  }, []);

  return (
    <div className="max-w-[768px] mx-auto px-4 py-12 leading-relaxed text-gray-800">
      <p className="text-sm uppercase tracking-wide text-gray-500 mb-2">Founder playbook · PDF · 10 pages</p>
      <h2 className="text-4xl font-bold mb-6 text-gray-900">{PRODUCT_NAME}</h2>

      <div className="grid gap-10 md:grid-cols-[1fr_280px]">
        <div className="space-y-6 text-gray-700">
          <p className="text-lg">
            Most early-stage pipelines leak in the same five places. This audit helps you find yours in fifteen
            minutes, with nothing but a pen and your CRM open.
          </p>

          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-900">What&apos;s inside</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>A 20-question scorecard</strong> covering lead sources, follow-up speed, stage definitions,
                attribution, and close rates, with a total score
              </li>
              <li><strong>Stage-by-stage benchmarks</strong> showing what a healthy result looks like</li>
              <li><strong>The five most common pipeline leaks</strong>, each with a one-paragraph fix</li>
              <li>
                <strong>The attribution test:</strong> do you know which channel your last 10 deals came from?
              </li>
              <li><strong>A free live pipeline audit offer</strong> if you want a second pair of eyes</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-900">How buying works</h3>
            <ol className="list-decimal pl-5 space-y-2">
              <li>Connect a browser wallet.</li>
              <li>Send 1 USDC. Your wallet asks you to approve it.</li>
              <li>Sign a free message to prove the payment came from you.</li>
              <li>The PDF downloads straight away.</li>
            </ol>
            <p className="text-sm text-gray-600">
              If you close the tab before it downloads, come back to this page and it picks up where you left off.
            </p>
          </div>
        </div>

        <aside>
          <PurchasePanel />
        </aside>
      </div>
    </div>
  );
}

export default function PipelineAuditPage() {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <PipelineAudit />
      </QueryClientProvider>
    </WagmiProvider>
  );
}
