import { motion } from 'framer-motion';
import { LogIn, ShieldCheck, Wallet } from 'lucide-react';
import { formatEther } from 'viem';
import { useBalance } from 'wagmi';

import { getChainName } from '@/config/chains';
import { ConnectWalletPanel } from '@/features/wallet/components/ConnectWalletPanel';
import { WrongNetworkBanner } from '@/features/wallet/components/WrongNetworkBanner';
import { useSiweAuth, useSupportedChain } from '@/features/wallet/hooks';
import { shortenAddress } from '@/lib/format';
import { cn } from '@/lib/utils';
import { useAuthStore, useWalletStore } from '@/store';

const STATUS_STYLES = {
  connected: 'border-aegis-success/25 bg-aegis-success/8 text-aegis-success',
  connecting: 'border-aegis-warning/25 bg-aegis-warning/8 text-aegis-warning',
  disconnected: 'border-aegis-muted/20 bg-aegis-muted/5 text-aegis-muted',
} as const;

export function WalletPage() {
  const { address, chainId, isConnected, isConnecting } = useWalletStore();
  const authStatus = useAuthStore((s) => s.status);
  const { isAuthenticated, authAddress, signIn, isSigningIn } = useSiweAuth();
  const { onSiweChain } = useSupportedChain();

  const { data: balance } = useBalance({
    address: address as `0x${string}` | undefined,
    query: { enabled: Boolean(address) },
  });

  const connectionLabel = isConnecting
    ? 'connecting'
    : isConnected
      ? 'connected'
      : 'disconnected';

  const balanceLabel =
    balance !== undefined
      ? `${Number.parseFloat(formatEther(balance.value)).toFixed(4)} ${balance.symbol}`
      : '—';

  return (
    <div className="flex flex-col gap-6 px-5 pb-8 pt-4">
      <div className="flex items-center gap-3">
        <Wallet className="h-6 w-6 text-aegis-success" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Wallet</h1>
          <p className="text-xs text-aegis-muted/60">
            MetaMask, Coinbase, browser wallets · WalletConnect (mobile)
          </p>
        </div>
      </div>

      <WrongNetworkBanner requireSiweChain />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: 'Address',
            value: isConnected && address ? shortenAddress(address) : 'Not connected',
            sub: isConnected ? getChainName(chainId) : 'Click Connect Wallet below',
            accent: '#00FF85',
          },
          {
            label: 'Balance',
            value: isConnected ? balanceLabel : '—',
            sub: isConnected ? `Chain ID ${chainId ?? '—'}` : 'Shown after connect',
            accent: '#00E5FF',
          },
          {
            label: 'SIWE Session',
            value: isAuthenticated && authAddress ? shortenAddress(authAddress) : 'Unsigned',
            sub: authStatus === 'signing' ? 'Awaiting signature…' : 'JWT for API access',
            accent: '#7C3AED',
          },
          {
            label: 'Status',
            value: isAuthenticated ? 'Authenticated' : isConnected ? 'Connected' : 'Offline',
            sub: isAuthenticated ? 'Session active' : 'Connect then sign in',
            accent: isAuthenticated ? '#00FF85' : '#F59E0B',
          },
        ].map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="card-gradient-border rounded-2xl p-4"
          >
            <p className="text-[10px] font-semibold uppercase tracking-widest text-aegis-muted">
              {card.label}
            </p>
            <p className="mt-1 text-lg font-bold text-white" style={{ color: card.accent }}>
              {card.value}
            </p>
            <p className="mt-1 text-[11px] text-aegis-muted/60">{card.sub}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <ConnectWalletPanel />

        <section className="card-gradient-border rounded-2xl p-5">
          <div className="mb-4 flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-aegis-secondary" />
            <h2 className="text-sm font-semibold text-white">Sign-In with Ethereum</h2>
          </div>
          <div className="space-y-4 text-sm text-aegis-muted">
            <div className="flex items-center justify-between rounded-xl border border-white/5 bg-white/2 px-4 py-3">
              <span>Provider</span>
              <span
                className={cn(
                  'rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider',
                  STATUS_STYLES[connectionLabel],
                )}
              >
                {connectionLabel}
              </span>
            </div>
            <p className="text-xs leading-relaxed text-aegis-muted/70">
              After connecting on <strong className="text-white">Ethereum Mainnet</strong>, sign a
              SIWE message to obtain a JWT. The backend issues nonces via{' '}
              <code className="text-aegis-primary">GET /api/auth/nonce</code>.
            </p>
            {isConnected && !isAuthenticated && (
              <button
                type="button"
                onClick={() => { void signIn(); }}
                disabled={isSigningIn || !onSiweChain}
                className={cn(
                  'flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-semibold transition-all',
                  isSigningIn || !onSiweChain
                    ? 'cursor-not-allowed border-white/8 text-aegis-muted'
                    : 'border-aegis-primary/30 bg-aegis-primary/10 text-aegis-primary hover:bg-aegis-primary/15',
                )}
              >
                <LogIn className="h-3.5 w-3.5" />
                {isSigningIn ? 'Signing…' : 'Sign in with Ethereum'}
              </button>
            )}
            {isConnected && !onSiweChain && (
              <p className="text-[11px] text-aegis-warning">
                Switch to Ethereum Mainnet before signing in.
              </p>
            )}
            {isAuthenticated && (
              <p className="rounded-xl border border-aegis-success/20 bg-aegis-success/5 px-4 py-3 text-xs text-aegis-success">
                Session active for {authAddress ? shortenAddress(authAddress) : 'your wallet'}.
              </p>
            )}
            {!isConnected && (
              <p className="rounded-xl border border-aegis-border/30 bg-white/2 px-4 py-3 text-xs text-aegis-muted/70">
                Connect a real wallet using the panel on the left.
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
