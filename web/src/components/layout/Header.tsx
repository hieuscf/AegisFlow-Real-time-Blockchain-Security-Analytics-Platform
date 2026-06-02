import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Menu, LogIn, LogOut, Loader2, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { shortenAddress } from '@/lib/format';
import { useIsDesktop } from '@/hooks';
import { useUiStore, useWebSocketStore } from '@/store';
import { useSiweAuth } from '@/features/wallet/hooks';

const WS_LABEL = {
  connected:    { text: 'Live',       dot: 'bg-aegis-success live-dot', tx: 'text-aegis-success' },
  connecting:   { text: 'Connecting', dot: 'bg-aegis-warning animate-pulse', tx: 'text-aegis-warning' },
  disconnected: { text: 'Offline',    dot: 'bg-aegis-danger',  tx: 'text-aegis-danger' },
  error:        { text: 'Error',      dot: 'bg-aegis-danger animate-pulse', tx: 'text-aegis-danger' },
  idle:         { text: 'Idle',       dot: 'bg-aegis-muted/40', tx: 'text-aegis-muted' },
} as const;

function SiweControls() {
  const { isConnected, isAuthenticated, isSigningIn, authAddress, error, signIn, signOut, clearError } =
    useSiweAuth();

  if (!isConnected) return null;

  if (isAuthenticated && authAddress) {
    return (
      <div className="flex items-center gap-2">
        <div className="hidden items-center gap-1.5 rounded-full border border-aegis-success/25 bg-aegis-success/8 px-2.5 py-1 text-[11px] font-medium text-aegis-success sm:flex">
          <span className="h-1.5 w-1.5 rounded-full bg-aegis-success live-dot" />
          {shortenAddress(authAddress)}
        </div>
        <button
          type="button"
          onClick={signOut}
          className="flex items-center gap-1.5 rounded-xl border border-white/8 px-3 py-1.5 text-[11px] font-medium text-aegis-muted transition-all hover:border-aegis-danger/40 hover:text-aegis-danger"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Sign Out</span>
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {error && (
        <button
          type="button"
          onClick={clearError}
          className="flex items-center gap-1 text-[11px] text-aegis-danger"
          title={error}
        >
          <AlertTriangle className="h-3 w-3" />
        </button>
      )}
      <button
        type="button"
        onClick={() => { void signIn(); }}
        disabled={isSigningIn}
        className={cn(
          'flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-[11px] font-semibold transition-all',
          isSigningIn
            ? 'cursor-not-allowed border-white/8 text-aegis-muted'
            : 'border-aegis-primary/30 bg-aegis-primary/8 text-aegis-primary hover:bg-aegis-primary/15 hover:border-aegis-primary/50',
        )}
      >
        {isSigningIn ? <Loader2 className="h-3 w-3 animate-spin" /> : <LogIn className="h-3 w-3" />}
        {isSigningIn ? 'Signing…' : 'Sign In'}
      </button>
    </div>
  );
}

interface HeaderProps { className?: string }

export function Header({ className }: HeaderProps) {
  const isDesktop    = useIsDesktop();
  const toggleSidebar= useUiStore((s) => s.toggleSidebar);
  const wsStatus     = useWebSocketStore((s) => s.status);
  const wsConfig     = WS_LABEL[wsStatus];

  return (
    <header
      className={cn(
        'flex items-center justify-between gap-3 px-5 py-3',
        className,
      )}
    >
      {/* Left */}
      <div className="flex items-center gap-3">
        {!isDesktop && (
          <button
            type="button"
            onClick={toggleSidebar}
            className="rounded-xl p-2 text-aegis-muted transition-colors hover:bg-white/5 hover:text-foreground"
          >
            <Menu className="h-4 w-4" />
          </button>
        )}

        {/* WS pill */}
        <div className={cn(
          'flex items-center gap-1.5 rounded-full border border-white/8 bg-white/4 px-3 py-1 text-[11px] font-medium backdrop-blur-sm',
          wsConfig.tx,
        )}>
          <span className={cn('h-1.5 w-1.5 rounded-full', wsConfig.dot)} />
          {wsConfig.text}
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2.5">
        <SiweControls />
        <ConnectButton showBalance={false} chainStatus="none" accountStatus="avatar" />
      </div>
    </header>
  );
}
