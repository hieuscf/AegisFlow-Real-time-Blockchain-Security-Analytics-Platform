import { useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useWalletStore } from '@/store/walletStore';

export function WalletStateSync() {
  const { address, chainId, isConnected, isConnecting, isReconnecting } = useAccount();
  const setSnapshot = useWalletStore((s) => s.setSnapshot);

  useEffect(() => {
    setSnapshot({
      address,
      chainId,
      isConnected,
      isConnecting,
      isReconnecting,
    });
  }, [address, chainId, isConnected, isConnecting, isReconnecting, setSnapshot]);

  return null;
}
