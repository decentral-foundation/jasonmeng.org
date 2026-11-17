// Payment constants shared by the browser bundle (src/) and the Vercel
// functions (api/). Keep this file free of env reads and Node/browser-only APIs.

export const PRODUCT_NAME = 'The 15-Minute Sales Pipeline Self-Audit';
export const PDF_FILENAME = '15-minute-sales-pipeline-self-audit.pdf';

// USDC contract addresses, from Circle's official list:
// https://developers.circle.com/stablecoins/usdc-contract-addresses
export const CHAINS = {
  sepolia: {
    id: 11155111,
    name: 'Ethereum Sepolia',
    usdc: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238',
    explorer: 'https://sepolia.etherscan.io',
  },
  mainnet: {
    id: 1,
    name: 'Ethereum',
    usdc: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    explorer: 'https://etherscan.io',
  },
};

export const DEFAULT_CHAIN = 'sepolia';

// List price in USD, used as the Lucia conversion amount for ETH payments.
export const PRICE_USD = 1;

// 1 USDC. USDC has 6 decimals on both networks.
export const USDC_DECIMALS = 6;
export const PRICE_UNITS = 1_000_000n;

// Native ETH alternative: a payment counts when it is AT LEAST this much.
export const MIN_ETH = '0.00055';
export const MIN_ETH_WEI = 550_000_000_000_000n; // 0.00055 ETH in wei

// How old a signed "already paid" message may be before /api/download rejects it.
export const SIGNATURE_MAX_AGE_MS = 10 * 60 * 1000;

/** Returns "sepolia" or "mainnet". Throws on anything else. */
export function resolveChainKey(value) {
  const key = (value || DEFAULT_CHAIN).trim().toLowerCase();
  if (!Object.hasOwn(CHAINS, key)) {
    throw new Error(`Unknown PUBLIC_CHAIN "${value}". Use "sepolia" or "mainnet".`);
  }
  return key;
}

/** Message the paying wallet signs to download with a known transaction hash. */
export function txDownloadMessage(txHash) {
  return `Download "${PRODUCT_NAME}"\nTransaction: ${txHash.toLowerCase()}`;
}

/** Message a returning buyer signs to prove they own the wallet that paid. */
export function restoreDownloadMessage(address, issuedAt) {
  return `Download "${PRODUCT_NAME}"\nWallet: ${address.toLowerCase()}\nIssued at: ${issuedAt}`;
}
