import crypto from 'node:crypto';
import { getAddress, isAddress, toHex } from 'viem';
import { MIN_ETH_WEI, PRICE_UNITS } from '../../shared/payment.js';

/**
 * Alchemy signs each webhook delivery with HMAC-SHA256 over the raw request
 * body, keyed by the webhook's signing key, hex encoded, and sends it in the
 * X-Alchemy-Signature header.
 * https://www.alchemy.com/docs/reference/notify-api-quickstart
 */
export function isValidAlchemySignature(rawBody, signature, signingKey) {
  if (!signature || !signingKey) return false;
  const expected = crypto.createHmac('sha256', signingKey).update(rawBody, 'utf8').digest('hex');
  const a = Buffer.from(expected, 'utf8');
  const b = Buffer.from(signature.trim().toLowerCase(), 'utf8');
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

// Alchemy's numeric `value` field is a float (tiny amounts arrive as 1e-18),
// so amounts are always read from the raw hex value instead.
function toBigInt(hex) {
  try {
    return typeof hex === 'string' && hex.startsWith('0x') ? BigInt(hex) : null;
  } catch {
    return null;
  }
}

function sameAddress(a, b) {
  return typeof a === 'string' && typeof b === 'string' && isAddress(a) && isAddress(b)
    && getAddress(a) === getAddress(b);
}

// Native ETH: "external" is a plain send from a wallet; "internal" is ETH
// moved by a contract, which is how smart-contract wallets pay.
const ETH_CATEGORIES = ['external', 'internal'];

/**
 * Picks the payments out of an ADDRESS_ACTIVITY payload's event.activity[].
 * A payment goes to the receiving address and is either at least 1 USDC on
 * the configured chain's USDC contract, or at least MIN_ETH_WEI of native ETH.
 *
 * Matching on the USDC contract address (which differs per chain) means a
 * Sepolia webhook can never unlock mainnet, so event.network is not checked.
 * https://www.alchemy.com/docs/reference/address-activity-webhook
 */
export function findQualifyingPayments(activity, { usdcAddress, receivingAddress }) {
  if (!Array.isArray(activity)) return [];
  const payments = [];
  for (const item of activity) {
    if (!item || typeof item.hash !== 'string') continue;
    if (item.log?.removed === true) continue; // dropped by a chain reorg
    if (!sameAddress(item.toAddress, receivingAddress)) continue;
    if (!isAddress(item.fromAddress ?? '')) continue;
    const units = toBigInt(item.rawContract?.rawValue);
    if (units === null) continue;

    let asset = null;
    if ((item.category === 'token' || item.category === 'erc20')
      && sameAddress(item.rawContract?.address, usdcAddress)
      && units >= PRICE_UNITS) {
      asset = 'USDC';
    } else if (ETH_CATEGORIES.includes(item.category)
      && !item.rawContract?.address
      && units >= MIN_ETH_WEI) {
      asset = 'ETH';
    }
    if (!asset) continue;

    payments.push({
      asset,
      from: getAddress(item.fromAddress),
      txHash: item.hash.toLowerCase(),
      units,
    });
  }
  return payments;
}

async function* assetTransfers(publicClient, params) {
  let pageKey;
  do {
    const result = await publicClient.request({
      method: 'alchemy_getAssetTransfers',
      params: [{ excludeZeroValue: true, maxCount: '0x3e8', ...params, ...(pageKey ? { pageKey } : {}) }],
    });
    yield* result?.transfers ?? [];
    pageKey = result?.pageKey || undefined;
  } while (pageKey);
}

async function sumTransfers(publicClient, params, target) {
  let total = 0n;
  for await (const transfer of assetTransfers(publicClient, params)) {
    const units = toBigInt(transfer.rawContract?.value);
    if (units !== null) total += units;
    if (total >= target) break;
  }
  return total;
}

/**
 * True when `from` has ever paid the receiving address at least 1 USDC in
 * total, or at least MIN_ETH_WEI of ETH in total (direct or internal).
 * https://www.alchemy.com/docs/reference/alchemy-getassettransfers
 */
export async function hasPaid(publicClient, { from, usdcAddress, receivingAddress }) {
  const base = { fromBlock: '0x0', toBlock: 'latest', fromAddress: from, toAddress: receivingAddress };
  const usdc = await sumTransfers(publicClient, { ...base, contractAddresses: [usdcAddress], category: ['erc20'] }, PRICE_UNITS);
  if (usdc >= PRICE_UNITS) return true;
  const eth = await sumTransfers(publicClient, { ...base, category: ETH_CATEGORIES }, MIN_ETH_WEI);
  return eth >= MIN_ETH_WEI;
}

/**
 * Native ETH payments of at least MIN_ETH_WEI to the receiving address made
 * by one transaction, including internal transfers from smart-contract
 * wallets (those have no tx.value and no log, so a trace is needed; Alchemy's
 * Transfers API provides it).
 */
export async function ethPaymentsInTx(publicClient, { txHash, blockNumber, receivingAddress }) {
  const block = toHex(blockNumber);
  const payments = [];
  for await (const transfer of assetTransfers(publicClient, {
    fromBlock: block,
    toBlock: block,
    toAddress: receivingAddress,
    category: ETH_CATEGORIES,
  })) {
    if (transfer.hash?.toLowerCase() !== txHash.toLowerCase()) continue;
    const units = toBigInt(transfer.rawContract?.value);
    if (units !== null && units >= MIN_ETH_WEI && isAddress(transfer.from ?? '')) {
      payments.push({ from: getAddress(transfer.from), units });
    }
  }
  return payments;
}
