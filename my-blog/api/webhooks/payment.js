// POST /api/webhooks/payment
// Receives Alchemy ADDRESS_ACTIVITY webhooks for the receiving address and
// records a Lucia conversion for each payment of at least 1 USDC or at least
// MIN_ETH of native ETH.
import { formatUnits } from 'viem';
import { PRICE_USD, USDC_DECIMALS } from '../../shared/payment.js';
import { findQualifyingPayments, isValidAlchemySignature } from '../_lib/alchemy.js';
import { ConfigError, getServerConfig, json } from '../_lib/config.js';
import { sendLuciaConversion } from '../_lib/lucia.js';

export default {
  async fetch(request) {
    if (request.method !== 'POST') return json({ error: 'Method not allowed.' }, 405);

    const signingKey = process.env.ALCHEMY_WEBHOOK_SIGNING_KEY;
    if (!signingKey) {
      console.error('[webhook] ALCHEMY_WEBHOOK_SIGNING_KEY is not set');
      return json({ error: 'Webhook is not configured.' }, 500);
    }

    // Verify against the exact bytes Alchemy sent, before any JSON parsing.
    const rawBody = await request.text();
    if (!isValidAlchemySignature(rawBody, request.headers.get('x-alchemy-signature'), signingKey)) {
      return json({ error: 'Invalid signature.' }, 401);
    }

    let payload;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return json({ error: 'Body is not valid JSON.' }, 400);
    }

    if (payload?.type !== 'ADDRESS_ACTIVITY') {
      return json({ ignored: true, reason: `Unhandled webhook type ${payload?.type}` });
    }

    let config;
    try {
      config = getServerConfig();
    } catch (error) {
      console.error('[webhook] config error:', error.message);
      return json({ error: error instanceof ConfigError ? error.message : 'Server misconfigured.' }, 500);
    }

    const payments = findQualifyingPayments(payload.event?.activity, config);
    const results = await Promise.allSettled(payments.map((p) => sendLuciaConversion({
      wallet: p.from,
      txHash: p.txHash,
      chainKey: config.chainKey,
      asset: p.asset,
      paidAmount: formatUnits(p.units, p.asset === 'USDC' ? USDC_DECIMALS : 18),
      // USDC is already in dollars. There's no price feed for ETH, so an ETH
      // payment is recorded at the $1 list price.
      amountUsd: p.asset === 'USDC' ? Number(formatUnits(p.units, USDC_DECIMALS)) : PRICE_USD,
    })));

    const failed = results.filter((r) => r.status === 'rejected');
    payments.forEach((p, i) => {
      const r = results[i];
      if (r.status === 'fulfilled') console.log(`[webhook] conversion sent for ${p.asset} payment ${p.txHash} from ${p.from}`);
      else console.error(`[webhook] conversion failed for ${p.txHash}:`, r.reason?.message);
    });

    // A non-2xx makes Alchemy retry the whole delivery, so only ask for a
    // retry when Lucia or the network failed (5xx, no response). A 4xx means
    // Lucia rejected the request itself, and a retry would fail the same way.
    // Without a confirmed Lucia dedupe field, a retry can re-send conversions
    // that already succeeded in this batch. That trade favors not losing them.
    const retryable = failed.some((r) => !(r.reason?.status >= 400 && r.reason?.status < 500));
    if (retryable) return json({ error: 'Failed to record conversion.', received: payments.length }, 502);

    return json({ received: payments.length });
  },
};
