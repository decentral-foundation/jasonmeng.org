import crypto from 'node:crypto';
import { getAddress, isAddress } from 'viem';
import { PRICE_UNITS } from '../../shared/payment.js';

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

/**
 * Picks the USDC payments out of an ADDRESS_ACTIVITY payload's
 * event.activity[]. A payment must use the configured chain's USDC contract,
 * go to the receiving address, and be worth at least PRICE_UNITS.
 *
 * Matching on the USDC contract address (which differs per chain) means a
 * Sepolia webhook can never unlock mainnet, so event.network is not checked.
 * https://www.alchemy.com/docs/reference/address-activity-webhook
 */
export function findQualifyingPayments(activity, { usdcAddress, receivingAddress }) {
  if (!Array.isArray(activity)) return [];
  const payments = [];
  for (const item of activity) {
    if (!item || (item.category !== 'token' && item.category !== 'erc20')) continue;
    if (item.log?.removed === true) continue; // dropped by a chain reorg
    if (!sameAddress(item.rawContract?.address, usdcAddress)) continue;
    if (!sameAddress(item.toAddress, receivingAddress)) continue;
    if (!isAddress(item.fromAddress ?? '')) continue;
    const units = toBigInt(item.rawContract?.rawValue);
    if (units === null || units < PRICE_UNITS) continue;
    if (typeof item.hash !== 'string') continue;
    payments.push({
      from: getAddress(item.fromAddress),
      txHash: item.hash.toLowerCase(),
      units,
    });
  }
  return payments;
}

/**
 * Sums every USDC transfer from `from` to the receiving address using
 * alchemy_getAssetTransfers, stopping early once `target` is reached.
 * https://www.alchemy.com/docs/reference/alchemy-getassettransfers
 */
export async function totalPaidBy(publicClient, { from, usdcAddress, receivingAddress, target }) {
  let total = 0n;
  let pageKey;
  do {
    const result = await publicClient.request({
      method: 'alchemy_getAssetTransfers',
      params: [{
        fromBlock: '0x0',
        toBlock: 'latest',
        fromAddress: from,
        toAddress: receivingAddress,
        contractAddresses: [usdcAddress],
        category: ['erc20'],
        excludeZeroValue: true,
        maxCount: '0x3e8',
        ...(pageKey ? { pageKey } : {}),
      }],
    });
    for (const transfer of result?.transfers ?? []) {
      const units = toBigInt(transfer.rawContract?.value);
      if (units !== null) total += units;
      if (total >= target) return total;
    }
    pageKey = result?.pageKey || undefined;
  } while (pageKey);
  return total;
}
