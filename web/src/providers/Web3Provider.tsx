import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { WagmiProvider } from 'wagmi';
import { wagmiConfig } from '@/config/wagmi';
import { AuthSessionGuard } from '@/features/wallet/components/AuthSessionGuard';
import { WalletStateSync } from '@/features/wallet/components/WalletStateSync';
import { useAuthStore } from '@/store/authStore';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const aegisRainbowTheme = darkTheme({
  accentColor: '#00ffa3',
  accentColorForeground: '#0a0b0d',
  borderRadius: 'medium',
  overlayBlur: 'small',
});

interface Web3ProviderProps {
  children: ReactNode;
}

export function Web3Provider({ children }: Web3ProviderProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    useAuthStore.persist.rehydrate();
  }, []);

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={aegisRainbowTheme} modalSize="compact">
          {mounted ? (
            <>
              <WalletStateSync />
              <AuthSessionGuard />
              {children}
            </>
          ) : null}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
