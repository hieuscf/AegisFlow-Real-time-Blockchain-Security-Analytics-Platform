import { motion } from 'framer-motion';
import { useWebSocketStore } from '@/store';
import { cn } from '@/lib/utils';

/* ── Widget wrapper ─────────────────────────────────────────────── */
function Widget({
  title, accent, children, index,
}: {
  title: string; accent: string; children: React.ReactNode; index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.15 + index * 0.07 }}
      whileHover={{ y: -2, transition: { duration: 0.15 } }}
      className="card-gradient-border relative overflow-hidden rounded-2xl p-5"
    >
      <div
        className="absolute inset-x-0 top-0 h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }}
      />
      <p className="mb-4 text-xs font-semibold uppercase tracking-widest" style={{ color: accent }}>
        {title}
      </p>
      {children}
    </motion.div>
  );
}

/* ── Alert distribution bars ────────────────────────────────────── */
function AlertDistribution() {
  const alerts = useWebSocketStore((s) => s.alerts);
  const total  = alerts.length || 1;

  const levels = [
    { label: 'Critical', count: alerts.filter((a) => a.level === 'CRITICAL').length, color: '#FF4D6D' },
    { label: 'Warning',  count: alerts.filter((a) => a.level === 'WARNING').length,  color: '#F59E0B' },
    { label: 'Info',     count: alerts.filter((a) => a.level === 'INFO').length,     color: '#00E5FF' },
  ];

  return (
    <Widget title="Alert Distribution" accent="#FF4D6D" index={0}>
      {alerts.length === 0 ? (
        <p className="text-xs text-aegis-muted/50">No alerts recorded yet</p>
      ) : (
        <div className="space-y-3">
          {levels.map(({ label, count, color }) => (
            <div key={label}>
              <div className="mb-1 flex items-center justify-between">
                <span className="text-xs text-aegis-muted">{label}</span>
                <span className="text-xs font-bold text-white">{count}</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(count / total) * 100}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}60` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </Widget>
  );
}

/* ── Top tokens by activity ─────────────────────────────────────── */
function TokenActivity() {
  const priceUpdates = useWebSocketStore((s) => s.priceUpdates);

  const tokenMap = new Map<string, { count: number; latestPrice: number }>();
  for (const u of priceUpdates) {
    const existing = tokenMap.get(u.tokenAddress);
    if (!existing) {
      tokenMap.set(u.tokenAddress, { count: 1, latestPrice: u.price });
    } else {
      existing.count++;
    }
  }

  const topTokens = Array.from(tokenMap.entries())
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 4);

  return (
    <Widget title="Token Activity" accent="#7C3AED" index={1}>
      {topTokens.length === 0 ? (
        <p className="text-xs text-aegis-muted/50">Awaiting swap events…</p>
      ) : (
        <div className="space-y-2.5">
          {topTokens.map(([addr, { count, latestPrice }]) => (
            <div key={addr} className="flex items-center justify-between">
              <div>
                <p className="font-mono text-xs text-white">
                  {addr.slice(0, 6)}…{addr.slice(-4)}
                </p>
                <p className="text-[10px] text-aegis-muted">${latestPrice.toFixed(4)}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-aegis-secondary">{count}</p>
                <p className="text-[10px] text-aegis-muted">events</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </Widget>
  );
}

/* ── System health ───────────────────────────────────────────────── */
function SystemHealth() {
  const status    = useWebSocketStore((s) => s.status);
  const alertCount= useWebSocketStore((s) => s.alerts.length);

  const score = status === 'connected'
    ? Math.max(0, 100 - alertCount * 5)
    : 0;

  const color =
    score >= 80 ? '#00FF85' :
    score >= 50 ? '#F59E0B' :
    '#FF4D6D';

  const strokeDash = 2 * Math.PI * 28;
  const offset     = strokeDash * (1 - score / 100);

  return (
    <Widget title="Security Score" accent="#00FF85" index={2}>
      <div className="flex items-center gap-5">
        <div className="relative h-16 w-16 shrink-0">
          <svg width="64" height="64" viewBox="0 0 64 64">
            <circle cx="32" cy="32" r="28" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="5" />
            <motion.circle
              cx="32" cy="32" r="28"
              fill="none"
              stroke={color}
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray={strokeDash}
              initial={{ strokeDashoffset: strokeDash }}
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
              transform="rotate(-90 32 32)"
              style={{ filter: `drop-shadow(0 0 6px ${color}80)` }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg font-bold" style={{ color }}>{score}</span>
          </div>
        </div>
        <div>
          <p className="text-base font-bold text-white">
            {score >= 80 ? 'Healthy' : score >= 50 ? 'Degraded' : 'At Risk'}
          </p>
          <p className="mt-0.5 text-xs text-aegis-muted">
            {status === 'connected' ? 'Realtime monitoring active' : 'Not connected to analytics'}
          </p>
          <p className="mt-1.5 text-[10px] text-aegis-muted/60 uppercase tracking-wider">
            {alertCount} alert{alertCount !== 1 ? 's' : ''} this session
          </p>
        </div>
      </div>
    </Widget>
  );
}

/* ── Pipeline status ─────────────────────────────────────────────── */
function PipelineStatus() {
  const status = useWebSocketStore((s) => s.status);

  const SERVICES = [
    { label: 'Blockchain Indexer',  ok: true,                    note: 'Uniswap V2 · Mainnet' },
    { label: 'Kafka Stream',        ok: true,                    note: 'market-swaps topic'  },
    { label: 'Analytics Core',      ok: true,                    note: 'Price engine active' },
    { label: 'WebSocket Hub',       ok: status === 'connected',  note: 'Socket.IO · port 8080' },
    { label: 'Slither Auditor',     ok: false,                   note: 'SLITHER_ENABLED=false' },
  ] as const;

  return (
    <Widget title="Pipeline Status" accent="#00E5FF" index={3}>
      <div className="space-y-2">
        {SERVICES.map(({ label, ok, note }) => (
          <div key={label} className="flex items-center justify-between">
            <div>
              <p className="text-xs text-white">{label}</p>
              <p className="text-[10px] text-aegis-muted/60">{note}</p>
            </div>
            <span
              className={cn(
                'flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider',
                ok
                  ? 'border-aegis-success/25 bg-aegis-success/8 text-aegis-success'
                  : 'border-aegis-muted/20 bg-aegis-muted/5 text-aegis-muted/60',
              )}
            >
              {ok && <span className="h-1 w-1 rounded-full bg-aegis-success live-dot" />}
              {ok ? 'OK' : 'OFF'}
            </span>
          </div>
        ))}
      </div>
    </Widget>
  );
}

/* ── Grid ───────────────────────────────────────────────────────── */
export function AnalyticsGrid() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <AlertDistribution />
      <TokenActivity />
      <SystemHealth />
      <PipelineStatus />
    </div>
  );
}
