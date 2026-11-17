#!/usr/bin/env node
// Sends a signed, Alchemy-shaped ADDRESS_ACTIVITY webhook to a running
// /api/webhooks/payment route, for local testing.
//
//   node --env-file=.env.local scripts/send-test-webhook.mjs [url] [--bad-signature]
//
// Uses ALCHEMY_WEBHOOK_SIGNING_KEY, PUBLIC_RECEIVING_ADDRESS and PUBLIC_CHAIN
// from the environment. A valid request makes the route send a REAL conversion
// to Lucia, tagged with a fake tx hash starting 0x7e57.
import crypto from 'node:crypto';
import { CHAINS, resolveChainKey } from '../shared/payment.js';

const url = process.argv.slice(2).find((a) => a.startsWith('http')) ?? 'http://localhost:3000/api/webhooks/payment';
const badSignature = process.argv.includes('--bad-signature');

const signingKey = process.env.ALCHEMY_WEBHOOK_SIGNING_KEY;
const receiver = process.env.PUBLIC_RECEIVING_ADDRESS;
if (!signingKey || !receiver) {
  console.error('Set ALCHEMY_WEBHOOK_SIGNING_KEY and PUBLIC_RECEIVING_ADDRESS (e.g. in .env.local).');
  process.exit(1);
}
const chainKey = resolveChainKey(process.env.PUBLIC_CHAIN);

const txHash = `0x7e57${crypto.randomBytes(30).toString('hex')}`;
const payload = {
  webhookId: 'wh_local_test',
  id: `whevt_${crypto.randomBytes(8).toString('hex')}`,
  createdAt: new Date().toISOString(),
  type: 'ADDRESS_ACTIVITY',
  event: {
    network: chainKey === 'mainnet' ? 'ETH_MAINNET' : 'ETH_SEPOLIA',
    activity: [{
      blockNum: '0x1',
      hash: txHash,
      fromAddress: '0x000000000000000000000000000000000000beef',
      toAddress: receiver.toLowerCase(),
      value: 1,
      asset: 'USDC',
      category: 'token',
      rawContract: {
        rawValue: `0x${(1_000_000).toString(16).padStart(64, '0')}`,
        address: CHAINS[chainKey].usdc.toLowerCase(),
        decimals: 6,
      },
      log: { removed: false },
    }],
  },
};

// Sign the exact bytes we send, as Alchemy does.
const body = JSON.stringify(payload, null, 2);
const signature = badSignature
  ? 'not-a-real-signature'
  : crypto.createHmac('sha256', signingKey).update(body, 'utf8').digest('hex');

const res = await fetch(url, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'X-Alchemy-Signature': signature },
  body,
});
console.log(`POST ${url} -> ${res.status}`);
console.log(await res.text());
console.log(`tx hash: ${txHash}`);
