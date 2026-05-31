import type { Address } from 'viem';

export interface SiweNonceResponse {
  nonce: string;
  message: string;
  address: string;
}

export interface SiweVerifyResponse {
  token: string;
  address: string;
}

export interface WalletSnapshot {
  address: Address | undefined;
  chainId: number | undefined;
  isConnected: boolean;
  isConnecting: boolean;
  isReconnecting: boolean;
}

export type AuthStatus = 'idle' | 'signing' | 'authenticated' | 'error';
