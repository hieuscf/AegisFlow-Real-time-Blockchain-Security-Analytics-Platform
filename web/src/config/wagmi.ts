import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { mainnet, sepolia } from 'wagmi/chains';

const walletConnectProjectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID;

if (!walletConnectProjectId) {
  console.warn(
    '[AegisFlow] VITE_WALLETCONNECT_PROJECT_ID is missing. WalletConnect connectors will not work.',
  );
}

export const wagmiConfig = getDefaultConfig({
  appName: 'AegisFlow',
  projectId: walletConnectProjectId ?? '00000000000000000000000000000000',
  chains: [mainnet, sepolia],
  ssr: false,
});
