// POST /api/download
//
// Streams the PDF to a buyer who proves payment in one of two ways:
//
//   { txHash, signature }
//     The receipt for txHash must have succeeded and pay the receiving
//     address either at least 1 USDC (a USDC Transfer log, checked with viem)
//     or at least MIN_ETH of native ETH (direct or internal, found with
//     Alchemy's Transfers API so smart-contract wallets work). `signature`
//     must be the payer signing txDownloadMessage(txHash).
//
//   { address, issuedAt, signature }   ("Already paid?")
//     `signature` must be `address` signing restoreDownloadMessage(address,
//     issuedAt) within the last SIGNATURE_MAX_AGE_MS. Alchemy's Transfers API
//     must show that `address` has sent the receiving address, on the
//     configured chain, at least 1 USDC in total or at least MIN_ETH in total.
//
// KNOWN LIMIT: there is no replay protection. The same tx hash and signature
// can download the PDF any number of times, and a restore signature works
// repeatedly until it expires. Fixing that needs a key-value store (for
// example Vercel KV or Upstash Redis) to record used tx hashes and nonces.
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import path from 'node:path';
import { Readable } from 'node:stream';
import { erc20Abi, getAddress, isAddress, isHex, parseEventLogs } from 'viem';
import {
  MIN_ETH,
  PDF_FILENAME,
  PRICE_UNITS,
  SIGNATURE_MAX_AGE_MS,
  restoreDownloadMessage,
  txDownloadMessage,
} from '../shared/payment.js';
import { ethPaymentsInTx, hasPaid } from './_lib/alchemy.js';
import { ConfigError, getServerConfig, json } from './_lib/config.js';

// Lives outside public/ so this route is the only way to reach it. Bundled
// into this function by "includeFiles" in vercel.json.
const PDF_PATH = path.join(process.cwd(), 'content', 'pipeline-audit', 'pipeline-audit.pdf');

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

const isTxHash = (v) => typeof v === 'string' && /^0x[0-9a-fA-F]{64}$/.test(v);
const isSignature = (v) => typeof v === 'string' && isHex(v) && v.length >= 132;

async function verifyTxPayment({ publicClient, usdcAddress, receivingAddress }, txHash, signature) {
  // Payers whose payment in this transaction qualifies.
  const payers = new Set();
  let receipt;
  try {
    receipt = await publicClient.getTransactionReceipt({ hash: txHash });
  } catch (error) {
    if (error?.name === 'TransactionReceiptNotFoundError') {
      throw new HttpError(409, 'That transaction is not confirmed yet. Wait a moment and try again.');
    }
    throw error;
  }

  if (receipt.status !== 'success') {
    throw new HttpError(402, 'That transaction failed on-chain, so no USDC was transferred.');
  }

  parseEventLogs({ abi: erc20Abi, eventName: 'Transfer', logs: receipt.logs })
    .filter((log) => getAddress(log.address) === usdcAddress
      && getAddress(log.args.to) === receivingAddress
      && log.args.value >= PRICE_UNITS)
    .forEach((log) => payers.add(getAddress(log.args.from)));

  // No USDC payment: look for native ETH instead.
  if (payers.size === 0) {
    const eth = await ethPaymentsInTx(publicClient, { txHash, blockNumber: receipt.blockNumber, receivingAddress });
    eth.forEach((p) => payers.add(p.from));
  }

  if (payers.size === 0) {
    throw new HttpError(402, `That transaction does not pay this site at least 1 USDC or ${MIN_ETH} ETH.`);
  }

  // Check the signature against each qualifying payer. verifyMessage also
  // handles smart-contract wallets (ERC-1271 / ERC-6492).
  const message = txDownloadMessage(txHash);
  for (const payer of payers) {
    const ok = await publicClient.verifyMessage({ address: payer, message, signature });
    if (ok) return;
  }
  throw new HttpError(401, 'The signature was not made by the wallet that sent the payment.');
}

async function verifyRestore(config, address, issuedAt, signature) {
  const issued = Date.parse(issuedAt);
  if (Number.isNaN(issued)) throw new HttpError(400, 'issuedAt must be an ISO timestamp.');
  const age = Date.now() - issued;
  if (age > SIGNATURE_MAX_AGE_MS || age < -60_000) {
    throw new HttpError(401, 'That signature has expired. Sign again to download.');
  }

  const ok = await config.publicClient.verifyMessage({
    address,
    message: restoreDownloadMessage(address, issuedAt),
    signature,
  });
  if (!ok) throw new HttpError(401, 'The signature does not match that wallet.');

  const paid = await hasPaid(config.publicClient, {
    from: address,
    usdcAddress: config.usdcAddress,
    receivingAddress: config.receivingAddress,
  });
  if (!paid) {
    throw new HttpError(402, `No payment of at least 1 USDC or ${MIN_ETH} ETH from ${address} was found on ${config.chain.name}.`);
  }
}

async function streamPdf() {
  const { size } = await stat(PDF_PATH);
  return new Response(Readable.toWeb(createReadStream(PDF_PATH)), {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Length': String(size),
      'Content-Disposition': `attachment; filename="${PDF_FILENAME}"`,
      'Cache-Control': 'no-store',
    },
  });
}

export default {
  async fetch(request) {
    if (request.method !== 'POST') return json({ error: 'Method not allowed.' }, 405);

    let body;
    try {
      body = await request.json();
    } catch {
      return json({ error: 'Send a JSON body.' }, 400);
    }

    try {
      const config = getServerConfig();
      const { txHash, address, issuedAt, signature } = body ?? {};

      if (!isSignature(signature)) throw new HttpError(400, 'A wallet signature is required.');

      if (txHash !== undefined && txHash !== null) {
        if (!isTxHash(txHash)) throw new HttpError(400, 'txHash must be a 0x-prefixed 32-byte hash.');
        await verifyTxPayment(config, txHash, signature);
      } else {
        if (!isAddress(address ?? '')) throw new HttpError(400, 'Send either txHash or a wallet address.');
        await verifyRestore(config, getAddress(address), String(issuedAt ?? ''), signature);
      }

      return await streamPdf();
    } catch (error) {
      if (error instanceof HttpError) return json({ error: error.message }, error.status);
      if (error instanceof ConfigError) {
        console.error('[download] config error:', error.message);
        return json({ error: 'Downloads are not configured yet.' }, 500);
      }
      console.error('[download] unexpected error:', error);
      return json({ error: 'Could not verify the payment right now. Please try again.' }, 502);
    }
  },
};
