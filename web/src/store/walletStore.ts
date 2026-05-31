import { create } from 'zustand';
import type { WalletSnapshot } from '@/features/wallet/types';

interface WalletState extends WalletSnapshot {
  setSnapshot: (snapshot: WalletSnapshot) => void;
  reset: () => void;
}

const initialState: WalletSnapshot = {
  address: undefined,
  chainId: undefined,
  isConnected: false,
  isConnecting: false,
  isReconnecting: false,
};

export const useWalletStore = create<WalletState>((set) => ({
  ...initialState,
  setSnapshot: (snapshot) => set(snapshot),
  reset: () => set(initialState),
}));
