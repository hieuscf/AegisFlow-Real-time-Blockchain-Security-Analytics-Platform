import { ConnectButton } from '@rainbow-me/rainbowkit';
import { motion } from 'framer-motion';
import { Link2, LogIn, ShieldCheck, Wallet } from 'lucide-react';
import { useSiweAuth } from '@/features/wallet/hooks';
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

  const connectionLabel = isConnecting
    ? 'connecting'
    : isConnected
      ? 'connected'
      : 'disconnected';

  return (
    <div className="flex flex-col gap-6 px-5 pb-8 pt-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Wallet className="h-6 w-6 text-aegis-success" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Wallet</h1>
            <p className="text-xs text-aegis-muted/60">
              Connect via RainbowKit · Sign in with Ethereum (SIWE)
            </p>
          </div>
        </div>
        <ConnectButton chainStatus="icon" showBalance={false} />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          {
            label: 'Wallet',
            value: isConnected && address ? shortenAddress(address) : 'Not connected',
            sub: isConnected ? `Chain ID ${chainId ?? '—'}` : 'Use Connect Wallet above',
            accent: '#00FF85',
          },
          {
            label: 'SIWE Session',
            value: isAuthenticated && authAddress ? shortenAddress(authAddress) : 'Unsigned',
            sub: authStatus === 'signing' ? 'Awaiting signature…' : 'JWT session for API access',
            accent: '#00E5FF',
          },
          {
            label: 'Auth Status',
            value: isAuthenticated ? 'Authenticated' : 'Guest',
            sub: isAuthenticated ? 'Protected routes unlocked' : 'Sign in after connecting',
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
            <p className="mt-1 text-xl font-bold text-white" style={{ color: card.accent }}>
              {card.value}
            </p>
            <p className="mt-1 text-[11px] text-aegis-muted/60">{card.sub}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="card-gradient-border rounded-2xl p-5">
          <div className="mb-4 flex items-center gap-2">
            <Link2 className="h-4 w-4 text-aegis-primary" />
            <h2 className="text-sm font-semibold text-white">Connection</h2>
          </div>
          <div className="space-y-3 text-sm text-aegis-muted">
            <div className="flex items-center justify-between rounded-xl border border-white/5 bg-white/2 px-4 py-3">
              <span>Provider status</span>
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
              WalletConnect and MetaMask are supported when{' '}
              <code className="text-aegis-primary">VITE_WALLETCONNECT_PROJECT_ID</code> is set.
              Session state syncs to the header and dashboard guard.
            </p>
          </div>
        </section>

        <section className="card-gradient-border rounded-2xl p-5">
          <div className="mb-4 flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-aegis-secondary" />
            <h2 className="text-sm font-semibold text-white">Sign-In with Ethereum</h2>
          </div>
          <div className="space-y-4 text-sm text-aegis-muted">
            <p className="text-xs leading-relaxed text-aegis-muted/70">
              After connecting, sign a SIWE message to obtain a JWT for analytics API routes.
              Nonce is issued by <code className="text-aegis-primary">GET /api/auth/nonce</code>.
            </p>
            {isConnected && !isAuthenticated && (
              <button
                type="button"
                onClick={() => { void signIn(); }}
                disabled={isSigningIn}
                className={cn(
                  'flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-semibold transition-all',
                  isSigningIn
                    ? 'cursor-wait border-aegis-warning/30 text-aegis-warning'
                    : 'border-aegis-primary/30 bg-aegis-primary/10 text-aegis-primary hover:bg-aegis-primary/15',
                )}
              >
                <LogIn className="h-3.5 w-3.5" />
                {isSigningIn ? 'Signing…' : 'Sign in with Ethereum'}
              </button>
            )}
            {isAuthenticated && (
              <p className="rounded-xl border border-aegis-success/20 bg-aegis-success/5 px-4 py-3 text-xs text-aegis-success">
                Session active for {authAddress ? shortenAddress(authAddress) : 'your wallet'}.
                Use Sign Out in the header to end the session.
              </p>
            )}
            {!isConnected && (
              <p className="rounded-xl border border-aegis-border/30 bg-white/2 px-4 py-3 text-xs text-aegis-muted/70">
                Connect a wallet to enable SIWE sign-in.
              </p>
            )}
          </div>
        </section>
      </div>

      <p className="text-center text-[11px] text-aegis-muted/50">
        Full wallet analytics and portfolio views — planned for a future release.
      </p>
    </div>
  );
}
