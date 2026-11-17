// Server-side Lucia conversion.
//
// Documented at https://docs.luciaprotocol.com/docs/core-features/attribution-api:
//   POST https://api.luciaprotocol.com/api/events-ingestion/conversions
//   headers: X-API-KEY, Content-Type: application/json
//   body:    { tag, amount, details }
//
// UNVERIFIED: the docs define no field for the buyer's wallet and no
// dedupe/idempotency ID, and the published OpenAPI schema for this body
// (CreateConversionDto) is empty. Until Lucia confirms the real field names,
// the wallet and transaction hash go inside `details`. That means Lucia may
// not dedupe Alchemy's retries, and may not join this conversion to the
// browser session linked through LuciaSDK.sendWalletInfo().
const LUCIA_CONVERSIONS_URL = 'https://api.luciaprotocol.com/api/events-ingestion/conversions';

export const CONVERSION_TAG = 'pipeline_audit_purchase';

export async function sendLuciaConversion({ wallet, txHash, amountUsdc, chainKey }) {
  const apiKey = process.env.LUCIA_API_KEY;
  if (!apiKey) throw new Error('LUCIA_API_KEY is not set.');

  const res = await fetch(LUCIA_CONVERSIONS_URL, {
    method: 'POST',
    headers: { 'X-API-KEY': apiKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      tag: CONVERSION_TAG,
      amount: amountUsdc,
      details: {
        wallet,
        walletAddress: wallet,
        txHash,
        dedupeId: txHash,
        chain: chainKey,
        currency: 'USDC',
        product: 'pipeline-audit-pdf',
      },
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Lucia conversion failed: HTTP ${res.status} ${text.slice(0, 300)}`);
  }
  return res.status;
}
