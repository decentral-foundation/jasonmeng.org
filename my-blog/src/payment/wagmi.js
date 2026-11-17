import { createConfig, fallback, http, injected, unstable_connector } from 'wagmi';
import { mainnet, sepolia } from 'wagmi/chains';
import { CHAINS, DEFAULT_CHAIN, resolveChainKey } from '../../shared/payment.js';

function readChainKey() {
  try {
    return resolveChainKey(import.meta.env.PUBLIC_CHAIN);
  } catch (error) {
    console.error(error.message, `Falling back to ${DEFAULT_CHAIN}.`);
    return DEFAULT_CHAIN;
  }
}

export const chainKey = readChainKey();
export const chain = chainKey === 'mainnet' ? mainnet : sepolia;
export const usdcAddress = CHAINS[chainKey].usdc;
export const explorerUrl = CHAINS[chainKey].explorer;
export const receivingAddress = import.meta.env.PUBLIC_RECEIVING_ADDRESS || '';

// Only the injected connector (MetaMask, Rabby, Coinbase extension, ...).
// Reads go through the wallet's own RPC first, then viem's public RPC, so
// the Alchemy URL never ships to the browser.
export const wagmiConfig = createConfig({
  chains: [chain],
  connectors: [injected()],
  transports: {
    [chain.id]: fallback([unstable_connector(injected), http()]),
  },
});
