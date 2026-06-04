import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, RefreshCw, ShieldAlert } from 'lucide-react';

import { SecurityFeed } from '@/features/alerts/SecurityFeed';
import { useNotifications } from '@/hooks/useNotifications';
import { cn } from '@/lib/utils';
import { useWebSocketStore } from '@/store';

export function AlertsPage() {

  const wsStatus = useWebSocketStore((s) => s.status);
  const setAlerts = useWebSocketStore((s) => s.setAlerts);
  const liveCount = useWebSocketStore((s) => s.alerts.length);

  const { notifications, stats, total, source, loading, error, refetch } =
    useNotifications({ limit: 50 }, 30_000);

  useEffect(() => {
    if (notifications.length > 0 && liveCount === 0) {
      setAlerts(notifications);
    }
  }, [notifications, liveCount, setAlerts]);

  const critical = stats?.byLevel.CRITICAL ?? 0;
  const warning = stats?.byLevel.WARNING ?? 0;
  const info = stats?.byLevel.INFO ?? 0;

  return (
    <div className="flex flex-col gap-6 px-5 pb-8 pt-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Bell className="h-6 w-6 text-aegis-danger" />
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">Notifications</h1>
              <p className="text-xs text-aegis-muted/60">
                REST API + live WebSocket · source: {source ?? '—'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => void refetch()}
            className="flex items-center gap-2 rounded-xl border border-aegis-border/40 bg-white/3 px-3 py-2 text-xs text-aegis-muted transition-colors hover:text-white"
          >
            <RefreshCw className={cn('h-3.5 w-3.5', loading && 'animate-spin')} />
            Refresh
          </button>
        </div>

        {error && (
          <p className="rounded-xl border border-aegis-danger/30 bg-aegis-danger/10 px-4 py-2 text-xs text-aegis-danger">
            {error}
          </p>
        )}

        <div className="grid gap-4 sm:grid-cols-4">
          {[
            { label: 'Total (API)', value: total, accent: '#00E5FF' },
            { label: 'Critical', value: critical, accent: '#FF4D6D' },
            { label: 'Warning', value: warning, accent: '#F59E0B' },
            { label: 'Live session', value: liveCount, accent: '#00FF85' },
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
              <p className="mt-1 text-2xl font-bold tabular-nums text-white" style={{ color: card.accent }}>
                {card.value}
              </p>
            </motion.div>
          ))}
        </div>

        <div className="flex items-center gap-2 text-xs text-aegis-muted/60">
          <ShieldAlert className="h-3.5 w-3.5" />
          WebSocket: {wsStatus === 'connected' ? 'connected' : wsStatus}
          {info > 0 && <span className="ml-2">· {info} info</span>}
        </div>

        <div style={{ minHeight: '520px' }}>
          <SecurityFeed />
        </div>
    </div>
  );
}
