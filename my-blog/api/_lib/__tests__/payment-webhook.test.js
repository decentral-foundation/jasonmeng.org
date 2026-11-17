// @vitest-environment node
import crypto from 'node:crypto';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ethPaymentsInTx, findQualifyingPayments, hasPaid, isValidAlchemySignature } from '../alchemy.js';
import { CHAINS, MIN_ETH_WEI } from '../../../shared/payment.js';

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

describe('findQualifyingPayments: native ETH', () => {
  const cfg = { usdcAddress: USDC, receivingAddress: RECEIVER };
  const eth = (wei, overrides = {}) => activity({
    category: 'external',
    asset: 'ETH',
    rawContract: { rawValue: rawValue(wei), address: null, decimals: 18 },
    ...overrides,
  });

  it('accepts exactly 0.00055 ETH (the rule is "at least")', () => {
    expect(MIN_ETH_WEI).toBe(550_000_000_000_000n);
    const [p] = findQualifyingPayments([eth(MIN_ETH_WEI)], cfg);
    expect(p).toMatchObject({ asset: 'ETH', units: MIN_ETH_WEI });
  });

  it('accepts internal ETH transfers from smart-contract wallets', () => {
    expect(findQualifyingPayments([eth(MIN_ETH_WEI, { category: 'internal' })], cfg)).toHaveLength(1);
  });

  it('rejects 1 wei under the minimum, and ETH to another address', () => {
    expect(findQualifyingPayments([eth(MIN_ETH_WEI - 1n), eth(MIN_ETH_WEI, { toAddress: BUYER })], cfg)).toEqual([]);
  });
});

describe('Transfers API checks', () => {
  const client = (transfers) => ({ request: vi.fn(async ({ params: [p] }) => ({
    transfers: transfers.filter((t) => (p.contractAddresses ? t.asset === 'USDC' : t.asset === 'ETH')),
  })) });
  const t = (asset, wei, extra = {}) => ({ asset, hash: TX, from: BUYER, rawContract: { value: rawValue(wei) }, ...extra });
  const cfg = { from: BUYER, usdcAddress: USDC, receivingAddress: RECEIVER };

  it('hasPaid: USDC total, ETH total, or neither', async () => {
    expect(await hasPaid(client([t('USDC', 500_000n), t('USDC', 500_000n)]), cfg)).toBe(true);
    expect(await hasPaid(client([t('ETH', MIN_ETH_WEI)]), cfg)).toBe(true);
    expect(await hasPaid(client([t('USDC', 999_999n), t('ETH', MIN_ETH_WEI - 1n)]), cfg)).toBe(false);
  });

  it('ethPaymentsInTx: only transfers in this tx at or above the minimum', async () => {
    const other = `0x${'cd'.repeat(32)}`;
    const found = await ethPaymentsInTx(
      client([t('ETH', MIN_ETH_WEI), t('ETH', MIN_ETH_WEI, { hash: other }), t('ETH', 1n)]),
      { txHash: TX, blockNumber: 123n, receivingAddress: RECEIVER },
    );
    expect(found).toHaveLength(1);
    expect(found[0].from.toLowerCase()).toBe(BUYER);
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
    expect(body.details).toMatchObject({ paidAsset: 'USDC', paidAmount: '1' });
  });

  it('records an ETH payment at the $1 list price', async () => {
    const ethPay = activity({
      category: 'external',
      asset: 'ETH',
      rawContract: { rawValue: rawValue(MIN_ETH_WEI), address: null, decimals: 18 },
    });
    const res = await post(JSON.stringify(payload([ethPay])));
    expect(await res.json()).toEqual({ received: 1 });
    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.amount).toBe(1);
    expect(body.details).toMatchObject({ paidAsset: 'ETH', paidAmount: '0.00055', dedupeId: TX });
  });

  it('returns 502 so Alchemy retries when Lucia fails', async () => {
    fetchMock.mockResolvedValue(new Response('nope', { status: 500 }));
    const res = await post(JSON.stringify(payload([activity()])));
    expect(res.status).toBe(502);
  });
});
