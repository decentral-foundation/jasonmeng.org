// Server-side configuration for the /api functions. Files under api/_lib are
// not deployed as routes (Vercel skips paths that start with an underscore).
import { createPublicClient, getAddress, http, isAddress } from 'viem';
import { mainnet, sepolia } from 'viem/chains';
import { CHAINS, resolveChainKey } from '../../shared/payment.js';

export class ConfigError extends Error {}

let cached;

export function getServerConfig() {
  if (cached) return cached;

  let chainKey;
  try {
    chainKey = resolveChainKey(process.env.PUBLIC_CHAIN);
  } catch (error) {
    throw new ConfigError(error.message);
  }

  const rpcUrl = process.env.ALCHEMY_RPC_URL;
  if (!rpcUrl) throw new ConfigError('ALCHEMY_RPC_URL is not set.');

  const receiving = process.env.PUBLIC_RECEIVING_ADDRESS;
  if (!receiving || !isAddress(receiving)) {
    throw new ConfigError('PUBLIC_RECEIVING_ADDRESS is missing or not a valid address.');
  }

  const chain = chainKey === 'mainnet' ? mainnet : sepolia;

  cached = {
    chainKey,
    chain,
    usdcAddress: getAddress(CHAINS[chainKey].usdc),
    receivingAddress: getAddress(receiving),
    publicClient: createPublicClient({ chain, transport: http(rpcUrl) }),
  };
  return cached;
}

export function json(body, status = 200) {
  return Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } });
}
