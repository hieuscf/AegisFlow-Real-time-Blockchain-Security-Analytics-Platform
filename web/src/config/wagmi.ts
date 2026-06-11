import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import {
  coinbaseWallet,
  injectedWallet,
  metaMaskWallet,
  rainbowWallet,
  walletConnectWallet,
} from '@rainbow-me/rainbowkit/wallets';

import { supportedChains } from '@/config/chains';

const rawProjectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID?.trim() ?? '';

const PLACEHOLDER_IDS = new Set([
  '',
  'your_walletconnect_cloud_project_id',
  '00000000000000000000000000000000',
]);

/** True when a real WalletConnect Cloud project id is configured. */
export const isWalletConnectConfigured =
  rawProjectId.length > 0 && !PLACEHOLDER_IDS.has(rawProjectId);

if (!isWalletConnectConfigured) {
  console.warn(
    '[AegisFlow] Set VITE_WALLETCONNECT_PROJECT_ID in web/.env for WalletConnect / mobile wallets. ' +
      'MetaMask and other browser extensions still work via injected connector.',
  );
}

const walletConnectProjectId = isWalletConnectConfigured
  ? rawProjectId
  : '00000000000000000000000000000000';

const popularWallets = [
  metaMaskWallet,
  coinbaseWallet,
  injectedWallet,
  ...(isWalletConnectConfigured ? [walletConnectWallet, rainbowWallet] : []),
];

export const wagmiConfig = getDefaultConfig({
  appName: 'AegisFlow',
  projectId: walletConnectProjectId,
  chains: [...supportedChains],
  wallets: [
    {
      groupName: 'Connect a wallet',
      wallets: popularWallets,
    },
  ],
  ssr: false,
});
