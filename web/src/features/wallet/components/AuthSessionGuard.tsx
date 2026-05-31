import { useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useAuthStore } from '@/store/authStore';

export function AuthSessionGuard() {
  const { address, isConnected } = useAccount();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const authAddress = useAuthStore((s) => s.address);
  const logout = useAuthStore((s) => s.logout);

  useEffect(() => {
    if (!isAuthenticated) return;

    if (!isConnected) {
      logout();
      return;
    }

    if (
      address &&
      authAddress &&
      address.toLowerCase() !== authAddress.toLowerCase()
    ) {
      logout();
    }
  }, [isConnected, isAuthenticated, address, authAddress, logout]);

  return null;
}
