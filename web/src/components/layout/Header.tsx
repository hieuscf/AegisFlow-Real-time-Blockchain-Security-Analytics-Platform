import { Menu, Moon, Sun, Wifi, WifiOff } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { WalletBadge } from '@/features/wallet/WalletBadge';
import { useIsDesktop } from '@/hooks';
import { cn } from '@/lib/utils';
import { useThemeStore, useUiStore, useWebSocketStore } from '@/store';

interface HeaderProps {
  className?: string;
}

const statusVariant = {
  idle: 'secondary',
  connecting: 'warning',
  connected: 'success',
  disconnected: 'warning',
  error: 'critical',
} as const;

export function Header({ className }: HeaderProps) {
  const isDesktop = useIsDesktop();
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);
  const wsStatus = useWebSocketStore((s) => s.status);
  const mode = useThemeStore((s) => s.mode);
  const toggleMode = useThemeStore((s) => s.toggleMode);

  const connected = wsStatus === 'connected';

  return (
    <header
      data-animate
      className={cn(
        'glass-card flex flex-wrap items-center justify-between gap-4 px-4 py-3 md:px-6',
        className,
      )}
    >
      <div className="flex items-center gap-3">
        {!isDesktop && (
          <Button variant="ghost" size="icon" onClick={toggleSidebar} aria-label="Open menu">
            <Menu className="h-5 w-5" />
          </Button>
        )}
        <div>
          <h1 className="text-lg font-bold tracking-tight md:text-xl">
            <span className="text-gradient-aegis">AegisFlow</span>
          </h1>
          <p className="text-xs text-muted-foreground">
            Realtime Blockchain Security &amp; Analytics
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 md:gap-3">
        <Badge
          variant={statusVariant[wsStatus]}
          className={cn(
            'gap-1.5 uppercase tracking-wide',
            connected && 'border-aegis-mint/40',
          )}
        >
          {connected && (
            <span className="h-1.5 w-1.5 rounded-full bg-aegis-mint animate-pulse-live" />
          )}
          {connected ? (
            <Wifi className="h-3 w-3" aria-hidden />
          ) : (
            <WifiOff className="h-3 w-3" aria-hidden />
          )}
          <span>{connected ? 'Live' : wsStatus}</span>
        </Badge>

        <WalletBadge />

        <Button
          variant="ghost"
          size="icon"
          onClick={toggleMode}
          aria-label={`Switch to ${mode === 'dark' ? 'light' : 'dark'} mode`}
        >
          {mode === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
      </div>
    </header>
  );
}
