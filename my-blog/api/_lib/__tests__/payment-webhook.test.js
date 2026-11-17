// @vitest-environment node
import crypto from 'node:crypto';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { findQualifyingPayments, isValidAlchemySignature } from '../alchemy.js';
import { CHAINS } from '../../../shared/payment.js';

const SIGNING_KEY = 'whsec_test_key';
const RECEIVER = '0x1111111111111111111111111111111111111111';
const BUYER = '0x2222222222222222222222222222222222222222';
const USDC = CHAINS.sepolia.usdc;
const TX = `0x${'ab'.repeat(32)}`;

const sign = (body) => crypto.createHmac('sha256', SIGNING_KEY).update(body, 'utf8').digest('hex');
const rawValue = (units) => `0x${units.toString(16).padStart(64, '0')}`;

function activity(overrides = {}) {
  return {
    fromAddress: BUYER,
    toAddress: RECEIVER,
    hash: TX,
    category: 'token',
    asset: 'USDC',
    value: 1,
    rawContract: { rawValue: rawValue(1_000_000n), address: USDC.toLowerCase(), decimals: 6 },
    log: { removed: false },
    ...overrides,
  };
}

function payload(items) {
  return {
    webhookId: 'wh_test',
    id: 'whevt_test',
    createdAt: '2026-11-16T00:00:00.000Z',
    type: 'ADDRESS_ACTIVITY',
    event: { network: 'ETH_SEPOLIA', activity: items },
  };
}

describe('isValidAlchemySignature', () => {
  it('accepts an HMAC-SHA256 hex digest of the raw body', () => {
    const body = '{"a": 1}';
    expect(isValidAlchemySignature(body, sign(body), SIGNING_KEY)).toBe(true);
  });

  it('rejects a digest of a re-serialized body', () => {
    const body = '{"a": 1}';
    expect(isValidAlchemySignature(body, sign(JSON.stringify(JSON.parse(body))), SIGNING_KEY)).toBe(false);
  });

  it('rejects missing or malformed signatures', () => {
    expect(isValidAlchemySignature('x', null, SIGNING_KEY)).toBe(false);
    expect(isValidAlchemySignature('x', 'abc', SIGNING_KEY)).toBe(false);
  });
});

describe('findQualifyingPayments', () => {
  const cfg = { usdcAddress: USDC, receivingAddress: RECEIVER };

  it('accepts 1 USDC to the receiving address', () => {
    const [p] = findQualifyingPayments([activity()], cfg);
    expect(p).toMatchObject({ txHash: TX, units: 1_000_000n });
    expect(p.from.toLowerCase()).toBe(BUYER);
  });

  it('rejects the wrong token, wrong recipient, too little, and reorged logs', () => {
    const items = [
      activity({ rawContract: { rawValue: rawValue(1_000_000n), address: CHAINS.mainnet.usdc } }),
      activity({ toAddress: BUYER }),
      activity({ rawContract: { rawValue: rawValue(999_999n), address: USDC } }),
      activity({ log: { removed: true } }),
      activity({ category: 'external' }),
    ];
    expect(findQualifyingPayments(items, cfg)).toEqual([]);
  });
});

describe('POST /api/webhooks/payment', () => {
  let handler;
  let fetchMock;

  beforeEach(async () => {
    vi.resetModules();
    process.env.ALCHEMY_WEBHOOK_SIGNING_KEY = SIGNING_KEY;
    process.env.ALCHEMY_RPC_URL = 'https://example.invalid/rpc';
    process.env.PUBLIC_RECEIVING_ADDRESS = RECEIVER;
    process.env.PUBLIC_CHAIN = 'sepolia';
    process.env.LUCIA_API_KEY = 'lucia_test';
    fetchMock = vi.fn().mockResolvedValue(new Response('{}', { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);
    handler = (await import('../../webhooks/payment.js')).default;
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  const post = (body, signature = sign(body)) => handler.fetch(new Request('http://localhost/api/webhooks/payment', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Alchemy-Signature': signature },
    body,
  }));

  it('rejects a bad signature without calling Lucia', async () => {
    const res = await post(JSON.stringify(payload([activity()])), 'deadbeef');
    expect(res.status).toBe(401);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('sends one Lucia conversion keyed on the wallet and tx hash', async () => {
    const res = await post(JSON.stringify(payload([activity(), activity({ toAddress: BUYER })])));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ received: 1 });
    expect(fetchMock).toHaveBeenCalledTimes(1);

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('https://api.luciaprotocol.com/api/events-ingestion/conversions');
    expect(init.headers['X-API-KEY']).toBe('lucia_test');
    const body = JSON.parse(init.body);
    expect(body).toMatchObject({ tag: 'pipeline_audit_purchase', amount: 1 });
    expect(body.details.txHash).toBe(TX);
    expect(body.details.dedupeId).toBe(TX);
    expect(body.details.wallet.toLowerCase()).toBe(BUYER);
  });

  it('returns 502 so Alchemy retries when Lucia fails', async () => {
    fetchMock.mockResolvedValue(new Response('nope', { status: 500 }));
    const res = await post(JSON.stringify(payload([activity()])));
    expect(res.status).toBe(502);
  });
});
