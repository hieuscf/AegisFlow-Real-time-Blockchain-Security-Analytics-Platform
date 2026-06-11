import { useCallback } from 'react';
import { useAccount, useDisconnect, useSignMessage } from 'wagmi';

import { SIWE_CHAIN_ID, getChainName } from '@/config/chains';
import { requestSiweNonce, verifySiweLogin } from '@/features/wallet/services/siweAuth';
import { useAuthStore } from '@/store/authStore';

export function useSiweAuth() {
  const { address, chainId, isConnected } = useAccount();
  const { signMessageAsync, isPending: isSignPending } = useSignMessage();
  const { disconnect, isPending: isDisconnectPending } = useDisconnect();

  const status = useAuthStore((s) => s.status);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const authAddress = useAuthStore((s) => s.address);
  const error = useAuthStore((s) => s.error);
  const setSigning = useAuthStore((s) => s.setSigning);
  const setSession = useAuthStore((s) => s.setSession);
  const setError = useAuthStore((s) => s.setError);
  const logout = useAuthStore((s) => s.logout);
  const clearError = useAuthStore((s) => s.clearError);

  const signIn = useCallback(async () => {
    if (!address || !isConnected) {
      setError('Connect a wallet before signing in.');
      return;
    }

    if (chainId !== SIWE_CHAIN_ID) {
      setError(
        `Switch to ${getChainName(SIWE_CHAIN_ID)} (chain ${SIWE_CHAIN_ID}) before signing in.`,
      );
      return;
    }

    setSigning();
    clearError();

    try {
      const { message } = await requestSiweNonce(address);
      const signature = await signMessageAsync({ message });
      const { token, address: verifiedAddress } = await verifySiweLogin(message, signature);
      setSession(token, verifiedAddress);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'SIWE authentication failed';
      setError(message);
      throw err;
    }
  }, [
    address,
    chainId,
    isConnected,
    setSigning,
    clearError,
    signMessageAsync,
    setSession,
    setError,
  ]);

  const signOut = useCallback(async () => {
    logout();
    disconnect();
  }, [logout, disconnect]);

  const isSigningIn = status === 'signing' || isSignPending;
  const isLoading = isSigningIn || isDisconnectPending;

  return {
    address,
    authAddress,
    isConnected,
    isAuthenticated,
    isSigningIn,
    isLoading,
    error,
    signIn,
    signOut,
    clearError,
  };
}
