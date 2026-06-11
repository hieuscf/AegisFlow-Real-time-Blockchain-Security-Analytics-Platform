import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Wallet } from 'lucide-react';

import { isWalletConnectConfigured } from '@/config/wagmi';
import { WrongNetworkBanner } from '@/features/wallet/components/WrongNetworkBanner';
import { cn } from '@/lib/utils';

interface ConnectWalletPanelProps {
  className?: string;
  compact?: boolean;
}

const WALLET_HINTS = [
  { name: 'MetaMask', note: 'Browser extension — works without WalletConnect' },
  { name: 'Coinbase Wallet', note: 'Extension or mobile app' },
  { name: 'Browser wallet', note: 'Any injected EIP-1193 provider' },
  ...(isWalletConnectConfigured
    ? [{ name: 'WalletConnect', note: 'Scan QR with mobile wallet' }]
    : []),
] as const;

export function ConnectWalletPanel({ className, compact = false }: ConnectWalletPanelProps) {
  return (
    <section className={cn('card-gradient-border rounded-2xl p-5', className)}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Wallet className="h-4 w-4 text-aegis-success" />
          <h2 className="text-sm font-semibold text-white">Connect wallet</h2>
        </div>
        <ConnectButton
          chainStatus={compact ? 'none' : 'icon'}
          showBalance={!compact}
          accountStatus={compact ? 'avatar' : 'full'}
        />
      </div>

      <WrongNetworkBanner requireSiweChain className="mb-4" />

      {!isWalletConnectConfigured && (
        <p className="mb-4 rounded-xl border border-aegis-primary/20 bg-aegis-primary/5 px-3 py-2 text-[11px] leading-relaxed text-aegis-muted/80">
          <span className="font-medium text-aegis-primary">Tip:</span> MetaMask and browser
          extensions work out of the box. For WalletConnect / mobile wallets, add{' '}
          <code className="text-aegis-primary">VITE_WALLETCONNECT_PROJECT_ID</code> to{' '}
          <code className="text-aegis-primary">web/.env</code> (free at{' '}
          <a
            href="https://cloud.walletconnect.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-aegis-primary underline-offset-2 hover:underline"
          >
            cloud.walletconnect.com
          </a>
          ).
        </p>
      )}

      {!compact && (
        <ul className="space-y-2">
          {WALLET_HINTS.map((wallet) => (
            <li
              key={wallet.name}
              className="flex items-center justify-between rounded-xl border border-white/5 bg-white/2 px-3 py-2"
            >
              <span className="text-xs font-medium text-white">{wallet.name}</span>
              <span className="text-[10px] text-aegis-muted/60">{wallet.note}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
