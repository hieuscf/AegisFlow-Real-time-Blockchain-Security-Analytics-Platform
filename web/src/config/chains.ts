import { mainnet, sepolia, type Chain } from 'wagmi/chains';

/** Chains available in the connect modal. */
export const supportedChains = [mainnet, sepolia] as const satisfies readonly Chain[];

export const defaultChain = mainnet;

/** Must match `Chain ID` in analytics SIWE message (`services/analytics/src/auth/siwe.ts`). */
export const SIWE_CHAIN_ID = 1;

export function isSupportedChain(chainId: number | undefined): boolean {
  if (chainId === undefined) return false;
  return supportedChains.some((chain) => chain.id === chainId);
}

export function getChainName(chainId: number | undefined): string {
  if (chainId === undefined) return 'Unknown';
  return supportedChains.find((chain) => chain.id === chainId)?.name ?? `Chain ${chainId}`;
}
