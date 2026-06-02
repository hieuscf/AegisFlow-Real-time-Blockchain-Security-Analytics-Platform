import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, AlertTriangle, Info, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useWebSocketStore } from '@/store';
import type { SecurityAlert, AlertLevel } from '@/types/alert';

const LEVEL = {
  CRITICAL: {
    icon:    ShieldAlert,
    accent:  '#FF4D6D',
    bg:      'rgba(255,77,109,0.06)',
    border:  'rgba(255,77,109,0.25)',
    topLine: 'rgba(255,77,109,0.6)',
    badge:   'bg-[#FF4D6D]/15 text-[#FF4D6D] border-[#FF4D6D]/25',
    pulse:   true,
  },
  WARNING: {
    icon:    AlertTriangle,
    accent:  '#F59E0B',
    bg:      'rgba(245,158,11,0.05)',
    border:  'rgba(245,158,11,0.20)',
    topLine: 'rgba(245,158,11,0.5)',
    badge:   'bg-[#F59E0B]/15 text-[#F59E0B] border-[#F59E0B]/25',
    pulse:   false,
  },
  INFO: {
    icon:    Info,
    accent:  '#00E5FF',
    bg:      'rgba(0,229,255,0.03)',
    border:  'rgba(0,229,255,0.12)',
    topLine: 'rgba(0,229,255,0.3)',
    badge:   'bg-[#00E5FF]/10 text-[#00E5FF] border-[#00E5FF]/20',
    pulse:   false,
  },
} as const;

function relativeTime(iso: string) {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60)   return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  return `${Math.floor(s / 3600)}h ago`;
}

function AlertCard({ alert }: { alert: SecurityAlert }) {
  const cfg  = LEVEL[alert.level];
  const Icon = cfg.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 20, scale: 0.97 }}
      animate={{ opacity: 1, x: 0,  scale: 1    }}
      exit={{    opacity: 0, x: -20, scale: 0.97 }}
      transition={{ duration: 0.28, ease: 'easeOut' }}
      className="relative overflow-hidden rounded-xl p-4"
      style={{
        background:   cfg.bg,
        border:       `1px solid ${cfg.border}`,
        boxShadow:    cfg.pulse ? `0 0 16px ${cfg.accent}20` : undefined,
      }}
    >
      {/* Top accent line */}
      <div
        className="absolute inset-x-0 top-0 h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${cfg.topLine}, transparent)` }}
      />

      {/* Pulsing overlay for CRITICAL */}
      {cfg.pulse && (
        <motion.div
          className="absolute inset-0 rounded-xl"
          style={{ background: `${cfg.accent}06` }}
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}

      <div className="relative flex items-start gap-3">
        {/* Icon */}
        <div
          className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
          style={{ backgroundColor: `${cfg.accent}18`, color: cfg.accent }}
        >
          <Icon className="h-4 w-4" />
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn('rounded-md border px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider', cfg.badge)}
            >
              {alert.level}
            </span>
            <span className="truncate text-xs font-semibold text-white">{alert.title}</span>
            <time className="ml-auto shrink-0 text-[10px] text-aegis-muted/60">{relativeTime(alert.createdAt)}</time>
          </div>
          <p className="mt-1.5 line-clamp-2 text-[11px] leading-relaxed text-aegis-muted/80">
            {alert.message}
          </p>
          {(alert.tokenAddress || alert.txHash) && (
            <div className="mt-2 flex flex-wrap gap-2">
              {alert.tokenAddress && (
                <span className="rounded-md border border-white/8 bg-white/4 px-2 py-0.5 font-mono text-[9px] text-aegis-muted/70">
                  {alert.tokenAddress.slice(0, 6)}…{alert.tokenAddress.slice(-4)}
                </span>
              )}
              {alert.txHash && (
                <span className="rounded-md border border-white/8 bg-white/4 px-2 py-0.5 font-mono text-[9px] text-aegis-muted/70">
                  tx: {alert.txHash.slice(0, 8)}…
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 py-16">
      <div
        className="flex h-14 w-14 items-center justify-center rounded-2xl border border-aegis-border/40"
        style={{ background: 'rgba(0,229,255,0.05)' }}
      >
        <Shield className="h-6 w-6 text-aegis-primary/50" />
      </div>
      <div className="text-center">
        <p className="text-sm font-semibold text-aegis-muted">All clear</p>
        <p className="mt-1 text-xs text-aegis-muted/50">
          Monitoring for threats in real-time
        </p>
      </div>
      {/* Scanning line animation */}
      <div className="relative h-px w-24 overflow-hidden rounded-full bg-aegis-border/30">
        <motion.div
          className="absolute inset-y-0 w-12 rounded-full bg-aegis-primary/60"
          animate={{ x: ['-100%', '200%'] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>
    </div>
  );
}

type FilterLevel = AlertLevel | 'ALL';

export function SecurityFeed() {
  const alerts       = useWebSocketStore((s) => s.alerts);
  const clearAlerts  = useWebSocketStore((s) => s.clearAlerts);
  const wsStatus     = useWebSocketStore((s) => s.status);
  const isLive       = wsStatus === 'connected';

  const criticalCount = alerts.filter((a) => a.level === 'CRITICAL').length;

  const FILTERS: { label: string; value: FilterLevel }[] = [
    { label: 'All',      value: 'ALL'      },
    { label: 'Critical', value: 'CRITICAL' },
    { label: 'Warning',  value: 'WARNING'  },
    { label: 'Info',     value: 'INFO'     },
  ];

  const [filter, setFilter] = useState<FilterLevel>('ALL');
  const filtered = filter === 'ALL' ? alerts : alerts.filter((a) => a.level === filter);

  return (
    <div className="card-gradient-border flex flex-col overflow-hidden rounded-2xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/6 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-aegis-danger/10">
            <ShieldAlert className="h-4 w-4 text-aegis-danger" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Threat Intelligence</p>
            {criticalCount > 0 && (
              <p className="text-[10px] font-bold text-aegis-danger">{criticalCount} critical active</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Live indicator */}
          <div className="flex items-center gap-1.5 rounded-full border border-white/8 bg-white/4 px-2.5 py-1 text-[10px]">
            <span className={cn('h-1.5 w-1.5 rounded-full', isLive ? 'bg-aegis-success live-dot' : 'bg-aegis-muted/40')} />
            <span className={isLive ? 'text-aegis-success' : 'text-aegis-muted'}>{isLive ? 'Live' : 'Offline'}</span>
          </div>
          {alerts.length > 0 && (
            <button
              type="button"
              onClick={clearAlerts}
              className="rounded-lg px-2 py-1 text-[10px] text-aegis-muted/50 transition-colors hover:text-aegis-muted"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 border-b border-white/6 px-4 py-2">
        {FILTERS.map(({ label, value }) => {
          const count = value === 'ALL' ? alerts.length : alerts.filter((a) => a.level === value).length;
          return (
            <button
              key={value}
              type="button"
              onClick={() => setFilter(value)}
              className={cn(
                'flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-medium transition-all',
                filter === value
                  ? 'bg-aegis-primary/10 text-aegis-primary'
                  : 'text-aegis-muted/60 hover:text-aegis-muted',
              )}
            >
              {label}
              {count > 0 && (
                <span className={cn(
                  'rounded-full px-1.5 py-px text-[9px] font-bold',
                  filter === value ? 'bg-aegis-primary/20' : 'bg-white/6',
                )}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Feed */}
      <div className="flex flex-1 flex-col gap-2 overflow-y-auto p-3">
        {filtered.length === 0 ? (
          <EmptyState />
        ) : (
          <AnimatePresence initial={false}>
            {filtered.map((alert) => (
              <AlertCard key={alert.id} alert={alert} />
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}

/* Need useState import */
import { useState } from 'react';
