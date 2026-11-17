# Jasonmeng.org

Personal website built with React and Vite.

## Prerequisites

- Node.js (v18 or higher)
- npm (comes with Node.js)

## Local Development

1. Clone the repository:
   ```bash
   git clone https://github.com/decentral-foundation/jasonmeng.org.git
   cd jasonmeng.org/my-blog
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

   The site will be available at `http://localhost:5173`

## Building for Production

1. Create a production build:
   ```bash
   npm run build
   ```

2. Preview the production build locally:
   ```bash
   npm run preview
   ```

## Pipeline Audit ($1 PDF, paid in USDC)

`/pipeline-audit` sells *The 15-Minute Sales Pipeline Self-Audit* for 1 USDC, or at
least 0.00055 ETH, on Ethereum, and records the sale as a Lucia conversion from a
webhook. There is no
database, auth, payment processor, or storage bucket.

```
Buyer's wallet ──1 USDC or ≥0.00055 ETH──▶ your address
      │                        │
      │                        └─ Alchemy address-activity webhook ─▶ /api/webhooks/payment ─▶ Lucia conversion
      │
      └─ signs message ─▶ /api/download ─▶ checks the chain with viem / Alchemy ─▶ streams the PDF
```

| Path | What it is |
|---|---|
| `my-blog/src/components/PipelineAudit.jsx` | Product page and purchase flow (wagmi, injected connector only) |
| `my-blog/src/components/PipelineAuditCTA.jsx` | Reusable call to action. Add `cta: 'pipeline-audit'` to a post in `src/data/posts.js` to show it under that post |
| `my-blog/api/webhooks/payment.js` | Alchemy webhook → Lucia conversion |
| `my-blog/api/download.js` | Verifies payment and streams the PDF |
| `my-blog/shared/payment.js` | Chain table, USDC addresses, prices (`PRICE_UNITS`, `MIN_ETH`), signed-message text |
| `my-blog/content/pipeline-audit/` | PDF source (`audit.md`), `config.json`, stylesheet, and the built PDF |

### Environment variables

Set these in `my-blog/.env.local` for local work and in Vercel → Project → Settings →
Environment Variables. Never commit real values; `.env.example` lists them.

| Variable | Browser? | Value |
|---|---|---|
| `PUBLIC_CHAIN` | yes | `sepolia` (default) or `mainnet` |
| `PUBLIC_RECEIVING_ADDRESS` | yes | The wallet that receives USDC |
| `ALCHEMY_RPC_URL` | **no** | Alchemy HTTPS URL **for the same network** as `PUBLIC_CHAIN` |
| `ALCHEMY_WEBHOOK_SIGNING_KEY` | **no** | Signing key of the webhook below |
| `LUCIA_API_KEY` | **no** | Lucia API key sent by the server as `X-API-KEY` |

`PUBLIC_*` variables are inlined into the browser bundle at build time (Vite
`envPrefix`), so they must be set for the **build** in Vercel, and a change needs a
redeploy. Never give a secret a `PUBLIC_` or `VITE_` prefix.

### Accepted payments

| Asset | Rule | How it is verified |
|---|---|---|
| USDC | at least 1 USDC in one transfer (tx-hash path) or in total ("already paid") | Transfer log on the configured chain's USDC contract |
| ETH | **at least** 0.00055 ETH (`MIN_ETH` in `shared/payment.js`) | Plain sends *and* internal transfers, so smart-contract wallets (Safe, 4337 accounts) can pay. Found with Alchemy's Transfers API |

Signatures from smart-contract wallets are checked with ERC-1271/6492 through viem.
ETH payments are recorded in Lucia at the $1 list price (`amount: 1`), with the ETH
paid in `details.paidAmount`, because there is no price feed.

USDC contracts come from [Circle's list](https://developers.circle.com/stablecoins/usdc-contract-addresses):
mainnet `0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48`, Sepolia `0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238`.

### Editing the PDF

```bash
cd my-blog
# edit content/pipeline-audit/audit.md, and set auditBookingUrl in content/pipeline-audit/config.json
npm run build:pdf
git add content/pipeline-audit/pipeline-audit.pdf
```

`build:pdf` runs `md-to-pdf` through `npx` (it downloads headless Chrome the first
time). The PDF is committed and lives outside `public/`; `vercel.json` bundles it
into `/api/download` only, so that route is the only way to reach it.

### Creating the Alchemy webhook

1. Deploy first so the route exists: `https://<your-domain>/api/webhooks/payment`.
2. In the [Alchemy dashboard](https://dashboard.alchemy.com/apps/latest/webhooks), create an
   **Address Activity** webhook.
3. Pick the network matching `PUBLIC_CHAIN` (Ethereum Sepolia or Ethereum Mainnet).
4. Webhook URL: `https://<your-domain>/api/webhooks/payment`.
5. Address: your `PUBLIC_RECEIVING_ADDRESS`.
6. Create it, open it, and copy the **signing key** (top right) into
   `ALCHEMY_WEBHOOK_SIGNING_KEY` in Vercel. Redeploy.
7. Use **Test webhook** in the dashboard. The route should answer `200 {"received":0}`
   (Alchemy's sample isn't a USDC payment to you). A `401` means the signing key is wrong.

Use one webhook per network. Each Vercel environment points at one network, so give
Sepolia's webhook a preview URL and mainnet's the production URL.

> Preview deployments behind Vercel Deployment Protection will reject Alchemy's
> requests. Use a protection bypass or an unprotected URL for the Sepolia webhook.

### Testing end to end on Ethereum Sepolia

1. Set `PUBLIC_CHAIN=sepolia`, a Sepolia `ALCHEMY_RPC_URL`, and a receiving address you control.
2. Fund a **different** buyer wallet in MetaMask with:
   - Sepolia ETH for gas, and for the ETH option (any Sepolia faucet), and
   - test USDC from [faucet.circle.com](https://faucet.circle.com) (choose Ethereum Sepolia).
3. Open `/pipeline-audit` on the deployment, click **Buy for $1**, approve the switch to
   Sepolia, approve the 1 USDC transfer, then sign the message. Repeat with
   **Pay with ETH (0.00055)**.
4. The PDF downloads. Check:
   - Vercel logs for `[webhook] conversion sent for 0x…` (the webhook usually arrives within a minute).
   - The conversion `pipeline_audit_purchase` in the Lucia dashboard.
5. Resume: start another purchase, close the tab after approving the transfer, and reopen
   `/pipeline-audit`. It finishes on its own (or shows **Finish my download**).
6. Restore: in a private window, click **Already paid? Get your download**, connect the
   buyer wallet, and sign. The PDF downloads.

### Testing the webhook route locally

`npm run dev` (plain Vite) does **not** serve `/api`. Use the Vercel CLI, which runs
Vite and the functions together:

```bash
cd my-blog
npx vercel link      # once
npx vercel dev       # http://localhost:3000
```

Then, in a second terminal, send a signed Alchemy-shaped payload:

```bash
node --env-file=.env.local scripts/send-test-webhook.mjs http://localhost:3000/api/webhooks/payment
node --env-file=.env.local scripts/send-test-webhook.mjs http://localhost:3000/api/webhooks/payment --bad-signature
```

The first should print `200 {"received":1}` and **sends a real conversion to Lucia**
with a fake tx hash starting `0x7e57`. The second should print `401`. The script signs
with the same `ALCHEMY_WEBHOOK_SIGNING_KEY` the route reads, so both must be in
`.env.local`. To receive real Alchemy deliveries locally, expose port 3000 with a tunnel
such as ngrok and point a Sepolia webhook at it.

Unit tests cover signature checks, payment filtering, and the Lucia request:
`npm test -- --watch=false`.

### Switching to mainnet

1. In the Vercel **Production** environment set `PUBLIC_CHAIN=mainnet` and a **mainnet**
   `ALCHEMY_RPC_URL`. They must match, or every payment check fails.
2. Create a second Address Activity webhook on **Ethereum Mainnet** pointing at the
   production URL, and set its signing key as the Production `ALCHEMY_WEBHOOK_SIGNING_KEY`.
3. Set `auditBookingUrl`, run `npm run build:pdf`, and commit the PDF.
4. Redeploy (needed because `PUBLIC_*` values are baked in at build time).
5. Make one real 1 USDC purchase to confirm, then check the Vercel logs and Lucia.

### Known limits

- **No replay protection.** A tx hash and its signature can download the PDF any number
  of times, and an "already paid" signature works until it expires (10 minutes). Fixing
  this needs a key-value store to record used hashes and nonces.
- **Wallet connect is required.** Payments sent from an exchange can't be matched to a
  buyer, and the injected connector needs a browser extension wallet.
- **ETH is a fixed amount, not $1.** 0.00055 ETH is not pegged to the dollar; update
  `MIN_ETH` and `MIN_ETH_WEI` in `my-blog/shared/payment.js` if the ETH price moves a lot.
- **Smart-wallet webhooks on Sepolia.** Internal (contract-sent) ETH is verified by the
  download route on both networks, but whether Alchemy's address-activity webhook reports
  internal transfers on Sepolia is not documented, so those Lucia conversions may only
  fire on mainnet.
- **Unverified Lucia fields.** Lucia's conversion API documents only `{ tag, amount,
  details }`. The wallet and the tx hash (as `dedupeId`) are sent inside `details`. Until
  Lucia confirms real fields for them, Lucia may count Alchemy's retries twice and may not
  join the conversion to the wallet's browser session. See `my-blog/api/_lib/lucia.js`.

## Content Exceptions

* No political stuff
* Nothing about "the process". No coaching. Nothing about "the grind" 


## More info


If you're testing in staging, you'll want to set both urls
to staging.api.. and debug staging.api
