import { AlertTriangle, Info, ShieldAlert, Wifi } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useWebSocketStore } from '@/store';
import type { SecurityAlert, AlertLevel } from '@/types/alert';

const LEVEL_CONFIG: Record<
  AlertLevel,
  {
    label: string;
    border: string;
    bg: string;
    badge: string;
    icon: typeof Info;
    iconClass: string;
  }
> = {
  INFO: {
    label: 'INFO',
    border: 'border-l-aegis-info',
    bg: 'bg-aegis-surface',
    badge: 'bg-aegis-muted/20 text-aegis-muted',
    icon: Info,
    iconClass: 'text-aegis-info',
  },
  WARNING: {
    label: 'WARN',
    border: 'border-l-aegis-warning',
    bg: 'bg-aegis-warning/5',
    badge: 'bg-aegis-warning/20 text-aegis-warning',
    icon: AlertTriangle,
    iconClass: 'text-aegis-warning',
  },
  CRITICAL: {
    label: 'CRIT',
    border: 'border-l-aegis-danger',
    bg: 'bg-aegis-danger/5',
    badge: 'bg-aegis-danger/20 text-aegis-danger',
    icon: ShieldAlert,
    iconClass: 'text-aegis-danger',
  },
};

function AlertRow({ alert }: { alert: SecurityAlert }) {
  const cfg = LEVEL_CONFIG[alert.level];
  const Icon = cfg.icon;
  const isCritical = alert.level === 'CRITICAL';

  return (
    <div
      className={cn(
        'border-l-2 px-3 py-2.5 transition-all',
        cfg.border,
        cfg.bg,
        isCritical && 'animate-pulse-critical',
      )}
    >
      <div className="flex items-start gap-2">
        <Icon className={cn('mt-0.5 h-3.5 w-3.5 shrink-0', cfg.iconClass)} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                'inline-block rounded px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider',
                cfg.badge,
              )}
            >
              {cfg.label}
            </span>
            <span className="truncate text-xs font-medium text-foreground">{alert.title}</span>
          </div>
          <p className="mt-0.5 line-clamp-2 text-[11px] leading-relaxed text-aegis-muted">
            {alert.message}
          </p>
          {(alert.tokenAddress || alert.txHash) && (
            <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5">
              {alert.tokenAddress && (
                <span className="font-mono text-[10px] text-aegis-muted/60">
                  {alert.tokenAddress.slice(0, 6)}…{alert.tokenAddress.slice(-4)}
                </span>
              )}
              {alert.txHash && (
                <span className="font-mono text-[10px] text-aegis-muted/60">
                  tx:{alert.txHash.slice(0, 8)}…
                </span>
              )}
            </div>
          )}
        </div>
        <time
          className="ml-1 shrink-0 text-[10px] text-aegis-muted/60"
          dateTime={alert.createdAt}
          title={new Date(alert.createdAt).toLocaleString()}
        >
          {formatRelativeTime(alert.createdAt)}
        </time>
      </div>
    </div>
  );
}

function formatRelativeTime(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return `${diff}s`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  return `${Math.floor(diff / 3600)}h`;
}

function EmptyFeed() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 py-12 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full border border-aegis-border bg-aegis-elevated">
        <Wifi className="h-5 w-5 text-aegis-muted/50" />
      </div>
      <div>
        <p className="text-sm font-medium text-aegis-muted">Listening for alerts…</p>
        <p className="mt-0.5 text-xs text-aegis-muted/60">
          Alerts will appear here as events are detected
        </p>
      </div>
    </div>
  );
}

export function SecurityFeed() {
  const alerts = useWebSocketStore((s) => s.alerts);
  const status = useWebSocketStore((s) => s.status);
  const clearAlerts = useWebSocketStore((s) => s.clearAlerts);

  const criticalCount = alerts.filter((a) => a.level === 'CRITICAL').length;

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-aegis-border bg-aegis-surface">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-aegis-border px-4 py-3">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 text-aegis-primary" />
          <span className="text-sm font-semibold">Security Feed</span>
          {alerts.length > 0 && (
            <span className="rounded-full bg-aegis-elevated px-2 py-0.5 text-xs font-medium text-aegis-muted">
              {alerts.length}
            </span>
          )}
          {criticalCount > 0 && (
            <span className="animate-pulse-critical rounded-full bg-aegis-danger/20 px-2 py-0.5 text-xs font-semibold text-aegis-danger">
              {criticalCount} critical
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <span
              className={cn(
                'h-1.5 w-1.5 rounded-full',
                status === 'connected' ? 'bg-aegis-success animate-pulse-live' : 'bg-aegis-muted/40',
              )}
            />
            <span className="text-xs text-aegis-muted">
              {status === 'connected' ? 'Live' : 'Offline'}
            </span>
          </div>
          {alerts.length > 0 && (
            <button
              type="button"
              onClick={clearAlerts}
              className="rounded px-2 py-0.5 text-xs text-aegis-muted/60 transition-colors hover:text-aegis-muted"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Alert list */}
      <div className="flex flex-1 flex-col divide-y divide-aegis-border overflow-y-auto">
        {alerts.length === 0 ? (
          <EmptyFeed />
        ) : (
          alerts.map((alert) => <AlertRow key={alert.id} alert={alert} />)
        )}
      </div>
    </div>
  );
}
