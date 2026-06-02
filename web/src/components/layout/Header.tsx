import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Menu, Wifi, WifiOff, Loader2, LogIn, LogOut, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { shortenAddress } from '@/lib/format';
import { useIsDesktop } from '@/hooks';
import { useUiStore, useWebSocketStore } from '@/store';
import { useSiweAuth } from '@/features/wallet/hooks';

interface HeaderProps {
  className?: string;
}

const WS_STATUS_CONFIG = {
  connected:    { dot: 'bg-aegis-success',  text: 'Live',        icon: Wifi,    color: 'text-aegis-success' },
  connecting:   { dot: 'bg-aegis-warning animate-pulse',  text: 'Connecting', icon: Loader2, color: 'text-aegis-warning' },
  disconnected: { dot: 'bg-aegis-danger',   text: 'Offline',     icon: WifiOff, color: 'text-aegis-danger' },
  error:        { dot: 'bg-aegis-danger animate-pulse', text: 'Error', icon: WifiOff, color: 'text-aegis-danger' },
  idle:         { dot: 'bg-aegis-muted',    text: 'Idle',        icon: WifiOff, color: 'text-aegis-muted' },
} as const;

function WsStatusBadge() {
  const status = useWebSocketStore((s) => s.status);
  const cfg = WS_STATUS_CONFIG[status];
  const Icon = cfg.icon;

  return (
    <div className="hidden items-center gap-1.5 rounded-full border border-aegis-border bg-aegis-surface px-2.5 py-1 sm:flex">
      <span className={cn('h-1.5 w-1.5 rounded-full', cfg.dot)} />
      <Icon className={cn('h-3 w-3', cfg.color, status === 'connecting' && 'animate-spin')} />
      <span className={cn('text-xs font-medium', cfg.color)}>{cfg.text}</span>
    </div>
  );
}

function SiweAuthButton() {
  const {
    isConnected,
    isAuthenticated,
    isSigningIn,
    authAddress,
    error,
    signIn,
    signOut,
    clearError,
  } = useSiweAuth();

  if (!isConnected) return null;

  if (isAuthenticated && authAddress) {
    return (
      <div className="flex items-center gap-2">
        <div className="hidden items-center gap-1.5 rounded-full border border-aegis-success/30 bg-aegis-success/10 px-2.5 py-1 text-xs font-medium text-aegis-success sm:flex">
          <span className="h-1.5 w-1.5 rounded-full bg-aegis-success animate-pulse-live" />
          {shortenAddress(authAddress)}
        </div>
        <button
          type="button"
          onClick={signOut}
          title="Sign out"
          className="flex items-center gap-1.5 rounded-lg border border-aegis-border px-3 py-1.5 text-xs font-medium text-aegis-muted transition-colors hover:border-aegis-danger/50 hover:text-aegis-danger"
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
          title={error}
          className="flex items-center gap-1 text-xs text-aegis-danger"
        >
          <AlertTriangle className="h-3.5 w-3.5" />
          <span className="hidden sm:inline max-w-[120px] truncate">{error}</span>
        </button>
      )}
      <button
        type="button"
        onClick={() => { void signIn(); }}
        disabled={isSigningIn}
        className={cn(
          'flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all',
          isSigningIn
            ? 'cursor-not-allowed border-aegis-border text-aegis-muted opacity-60'
            : 'border-aegis-primary/40 bg-aegis-primary/10 text-aegis-primary hover:border-aegis-primary/70 hover:bg-aegis-primary/20',
        )}
      >
        {isSigningIn ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <LogIn className="h-3.5 w-3.5" />
        )}
        <span>{isSigningIn ? 'Signing…' : 'Sign In'}</span>
      </button>
    </div>
  );
}

export function Header({ className }: HeaderProps) {
  const isDesktop = useIsDesktop();
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);

  return (
    <header
      className={cn(
        'flex items-center justify-between gap-3 border-b border-aegis-border bg-aegis-surface/80 px-4 py-2.5 backdrop-blur-sm',
        className,
      )}
    >
      <div className="flex items-center gap-3">
        {!isDesktop && (
          <button
            type="button"
            onClick={toggleSidebar}
            aria-label="Open menu"
            className="rounded-lg p-1.5 text-aegis-muted transition-colors hover:bg-aegis-elevated hover:text-foreground"
          >
            <Menu className="h-4 w-4" />
          </button>
        )}
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-linear-to-br from-aegis-primary to-aegis-secondary">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L4 6v6c0 5.5 3.5 10.7 8 12 4.5-1.3 8-6.5 8-12V6L12 2z" fill="white" />
            </svg>
          </div>
          <span className="text-sm font-bold tracking-tight">
            Aegis<span className="text-aegis-primary">Flow</span>
          </span>
        </div>
        <WsStatusBadge />
      </div>

      <div className="flex items-center gap-2">
        <SiweAuthButton />
        <ConnectButton
          showBalance={false}
          chainStatus="none"
          accountStatus="avatar"
        />
      </div>
    </header>
  );
}
