import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity, ShieldAlert, TrendingDown, TrendingUp,
  Zap, BarChart3, AlertTriangle, Layers,
} from 'lucide-react';

import { RealtimeChart }           from '@/features/charts/RealtimeChart';
import { useWebSocketStore }       from '@/store';
import type { SecurityAlert }      from '@/types/alert';
import type { PriceUpdatePayload } from '@/types/blockchain';
import { shortenAddress }          from '@/lib/format';
import { cn }                      from '@/lib/utils';

/* ─────────────────────────────────────────────────────────────── helpers */

function relativeTime(iso: string): string {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60)   return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  return `${Math.floor(s / 3600)}h ago`;
}

/** Parse "Price dropped 89.43% vs moving average…" → 89.43 */
function parseDropPercent(message: string): number | null {
  const m = message.match(/dropped\s+([\d.]+)%/);
  return m ? parseFloat(m[1] ?? '0') : null;
}

interface TokenStat {
  address:       string;
  latestPrice:   number;
  movingAverage: number;
  deviation:     number;
  eventCount:    number;
  sparkline:     number[];
}

function buildTokenStats(updates: PriceUpdatePayload[]): TokenStat[] {
  const map = new Map<
    string,
    { prices: number[]; ma: number; count: number }
  >();

  // updates[0] is newest — iterate in order (newest first)
  for (const u of updates) {
    const entry = map.get(u.tokenAddress);
    if (!entry) {
      map.set(u.tokenAddress, {
        prices: [u.price],
        ma:     u.movingAverage,
        count:  1,
      });
    } else {
      entry.prices.push(u.price);
      entry.count += 1;
    }
  }

  return Array.from(map.entries())
    .sort((a, b) => b[1].count - a[1].count)
    .map(([address, { prices, ma, count }]) => {
      const latest = prices[0] ?? 0;
      const deviation = ma > 0 ? ((latest - ma) / ma) * 100 : 0;
      const sparkline = prices.slice(0, 20).reverse(); // oldest→newest
      return { address, latestPrice: latest, movingAverage: ma, deviation, eventCount: count, sparkline };
    });
}

function swapRateLast60s(updates: PriceUpdatePayload[]): number {
  const cutoff = Date.now() - 60_000;
  return updates.filter((u) => new Date(u.timestamp).getTime() >= cutoff).length;
}

/* ─────────────────────────────────────────────────────────────── Sparkline */

function Sparkline({ values, color }: { values: number[]; color: string }) {
  if (values.length < 2) return <span className="text-aegis-muted/30 text-[10px]">—</span>;
  const max = Math.max(...values, 1);
  const min = Math.min(...values);
  const range = max - min || 1;
  const W = 64; const H = 22;
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * W;
    const y = H - ((v - min) / range) * H;
    return `${x},${y}`;
  });
  const fill = `M${pts[0]} ${pts.slice(1).map((p) => `L${p}`).join(' ')} L${W},${H} L0,${H} Z`;
  const line = `M${pts[0]} ${pts.slice(1).map((p) => `L${p}`).join(' ')}`;
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="overflow-visible">
      <defs>
        <linearGradient id={`spk-${color.slice(1)}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0"    />
        </linearGradient>
      </defs>
      <path d={fill} fill={`url(#spk-${color.slice(1)})`} />
      <path d={line} fill="none" stroke={color} strokeWidth="1.5"
            strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────── Section wrapper */

function Section({
  title, accent, children, className, index = 0,
}: {
  title: string; accent: string; children: React.ReactNode;
  className?: string; index?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y:  0 }}
      transition={{ duration: 0.45, delay: 0.1 + index * 0.07 }}
      className={cn('card-gradient-border relative overflow-hidden rounded-2xl p-5', className)}
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

/* ─────────────────────────────────────────────────────────────── KPI Row */

interface StatCardProps {
  label: string; value: string | number; sub: string;
  icon: React.ReactNode; accent: string; index: number;
  badge?: React.ReactNode;
}

function StatCard({ label, value, sub, icon, accent, index, badge }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y:  0 }}
      transition={{ duration: 0.45, delay: index * 0.08 }}
      whileHover={{ y: -3, transition: { duration: 0.15 } }}
      className="card-gradient-border group relative overflow-hidden rounded-2xl p-5"
    >
      <div
        className="absolute -inset-px rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: `radial-gradient(circle at 50% 0%, ${accent}18 0%, transparent 65%)` }}
      />
      <div
        className="absolute inset-x-0 top-0 h-px rounded-full"
        style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }}
      />
      <div className="relative flex items-start justify-between">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-110"
          style={{ backgroundColor: `${accent}18`, color: accent }}
        >
          {icon}
        </div>
        {badge}
      </div>
      <div className="relative mt-4">
        <div className="text-3xl font-bold tracking-tight text-white tabular-nums">{value}</div>
        <div className="mt-1 text-xs font-medium text-aegis-muted">{label}</div>
        <div className="mt-0.5 text-[11px]" style={{ color: `${accent}cc` }}>{sub}</div>
      </div>
    </motion.div>
  );
}

function AnalyticsKpiRow({ stats }: { stats: TokenStat[] }) {
  const priceUpdates = useWebSocketStore((s) => s.priceUpdates);
  const alerts       = useWebSocketStore((s) => s.alerts);
  const status       = useWebSocketStore((s) => s.status);

  const criticalCount = alerts.filter((a) => a.level === 'CRITICAL').length;
  const swapRate      = swapRateLast60s(priceUpdates);
  const topToken      = stats[0];
  const isLive        = status === 'connected';

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        index={0}
        label="Swap Events"
        value={priceUpdates.length}
        sub={swapRate > 0 ? `${swapRate} / last 60s` : 'Awaiting data'}
        icon={<Activity className="h-5 w-5" />}
        accent="#00E5FF"
        badge={
          isLive ? (
            <span className="flex items-center gap-1.5 rounded-full border border-aegis-success/25
                             bg-aegis-success/8 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-aegis-success">
              <span className="h-1 w-1 rounded-full bg-aegis-success live-dot" />
              Live
            </span>
          ) : null
        }
      />
      <StatCard
        index={1}
        label="Active Tokens"
        value={stats.length}
        sub={stats.length > 0 ? `Top: ${shortenAddress(stats[0]?.address ?? '', 4)}` : 'No tokens yet'}
        icon={<Layers className="h-5 w-5" />}
        accent="#7C3AED"
      />
      <StatCard
        index={2}
        label="Current Price"
        value={topToken ? `$${topToken.latestPrice.toFixed(4)}` : '—'}
        sub={
          topToken
            ? `MA $${topToken.movingAverage.toFixed(4)} · ${topToken.deviation >= 0 ? '+' : ''}${topToken.deviation.toFixed(1)}%`
            : 'Awaiting price stream'
        }
        icon={(topToken?.deviation ?? 0) >= 0
          ? <TrendingUp  className="h-5 w-5" />
          : <TrendingDown className="h-5 w-5" />
        }
        accent={topToken ? (topToken.deviation >= -20 ? '#00FF85' : topToken.deviation >= -50 ? '#F59E0B' : '#FF4D6D') : '#00E5FF'}
      />
      <StatCard
        index={3}
        label="Anomalies"
        value={criticalCount}
        sub={criticalCount > 0 ? 'Abnormal price drops detected' : 'No anomalies this session'}
        icon={<ShieldAlert className="h-5 w-5" />}
        accent={criticalCount > 0 ? '#FF4D6D' : '#00FF85'}
      />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────── Crash Timeline */

function CrashRow({ alert }: { alert: SecurityAlert }) {
  const drop = parseDropPercent(alert.message);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x:  0 }}
      exit={{    opacity: 0, x: -12 }}
      transition={{ duration: 0.25 }}
      className="flex items-start gap-3 rounded-xl border border-[#FF4D6D]/20 bg-[#FF4D6D]/5 p-3"
      style={{ boxShadow: '0 0 12px rgba(255,77,109,0.08)' }}
    >
      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#FF4D6D]/15">
        <AlertTriangle className="h-3.5 w-3.5 text-[#FF4D6D]" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-bold text-[#FF4D6D]">
            {drop !== null ? `−${drop.toFixed(1)}% drop` : 'Anomaly'}
          </span>
          <span className="text-[10px] text-aegis-muted/60 shrink-0">
            {relativeTime(alert.createdAt)}
          </span>
        </div>
        {alert.tokenAddress && (
          <p className="mt-0.5 font-mono text-[10px] text-aegis-muted/70">
            {shortenAddress(alert.tokenAddress, 6)}
          </p>
        )}
        <p className="mt-1 text-[10px] leading-relaxed text-aegis-muted/60 line-clamp-2">
          {alert.message}
        </p>
      </div>
    </motion.div>
  );
}

function CrashTimeline() {
  const alerts = useWebSocketStore((s) => s.alerts);
  const crashes = useMemo(
    () => alerts.filter((a) => a.level === 'CRITICAL'),
    [alerts],
  );

  return (
    <Section title="Crash Events" accent="#FF4D6D" index={1} className="flex flex-col">
      {crashes.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 py-10">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/8 bg-white/3">
            <ShieldAlert className="h-5 w-5 text-aegis-muted/30" />
          </div>
          <p className="text-xs text-aegis-muted/50">No crash events detected</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2 overflow-y-auto" style={{ maxHeight: '400px' }}>
          <AnimatePresence initial={false}>
            {crashes.map((a) => (
              <CrashRow key={a.id} alert={a} />
            ))}
          </AnimatePresence>
        </div>
      )}
    </Section>
  );
}

/* ─────────────────────────────────────────────────────────────── Token Stats Table */

function DeviationBadge({ pct }: { pct: number }) {
  const color =
    pct >= -10  ? '#00FF85' :
    pct >= -30  ? '#F59E0B' :
    pct >= -60  ? '#FF8C42' :
                  '#FF4D6D';

  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold tabular-nums"
      style={{ backgroundColor: `${color}18`, color, border: `1px solid ${color}30` }}
    >
      {pct >= 0 ? <TrendingUp className="h-2.5 w-2.5" /> : <TrendingDown className="h-2.5 w-2.5" />}
      {pct >= 0 ? '+' : ''}{pct.toFixed(1)}%
    </span>
  );
}

function TokenStatsTable({ stats }: { stats: TokenStat[] }) {
  return (
    <Section title="Token Stats" accent="#7C3AED" index={2}>
      {stats.length === 0 ? (
        <p className="py-6 text-center text-xs text-aegis-muted/50">Awaiting swap events…</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[500px] text-xs">
            <thead>
              <tr className="border-b border-aegis-border/30">
                {['Token', 'Price', 'Mov. Avg', 'Deviation', 'Events', 'Trend'].map((h) => (
                  <th
                    key={h}
                    className="pb-2 text-left text-[10px] font-semibold uppercase tracking-wider text-aegis-muted/60"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <AnimatePresence initial={false}>
                {stats.map((t, i) => (
                  <motion.tr
                    key={t.address}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.04 }}
                    className="border-b border-aegis-border/15 last:border-0"
                  >
                    <td className="py-2.5 pr-3">
                      <span className="font-mono text-white">{shortenAddress(t.address, 5)}</span>
                    </td>
                    <td className="py-2.5 pr-3 tabular-nums text-white">
                      ${t.latestPrice < 0.001 ? t.latestPrice.toExponential(2) : t.latestPrice.toFixed(4)}
                    </td>
                    <td className="py-2.5 pr-3 tabular-nums text-aegis-muted">
                      ${t.movingAverage < 0.001 ? t.movingAverage.toExponential(2) : t.movingAverage.toFixed(4)}
                    </td>
                    <td className="py-2.5 pr-3">
                      <DeviationBadge pct={t.deviation} />
                    </td>
                    <td className="py-2.5 pr-3 tabular-nums text-aegis-secondary font-bold">
                      {t.eventCount}
                    </td>
                    <td className="py-2.5">
                      <Sparkline
                        values={t.sparkline}
                        color={t.deviation >= -20 ? '#00FF85' : t.deviation >= -50 ? '#F59E0B' : '#FF4D6D'}
                      />
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      )}
    </Section>
  );
}

/* ─────────────────────────────────────────────────────────────── MA Deviation Panel */

function MaDeviationBar({ token }: { token: TokenStat }) {
  const absPct   = Math.min(Math.abs(token.deviation), 100);
  const isAbove  = token.deviation >= 0;
  const barColor = isAbove
    ? '#00FF85'
    : token.deviation >= -20  ? '#00FF85'
    : token.deviation >= -50  ? '#F59E0B'
    : '#FF4D6D';

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] text-white">{shortenAddress(token.address, 5)}</span>
        <span className="text-[10px] font-bold tabular-nums" style={{ color: barColor }}>
          {isAbove ? '+' : ''}{token.deviation.toFixed(1)}%
        </span>
      </div>
      {/* Centered bar */}
      <div className="relative h-2 overflow-hidden rounded-full bg-white/5">
        <div className="absolute inset-y-0 left-1/2 w-px bg-aegis-border/40" />
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${absPct / 2}%` }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="absolute inset-y-0 rounded-full"
          style={{
            left:  isAbove ? '50%' : undefined,
            right: isAbove ? undefined : `${50 - absPct / 2}%`,
            backgroundColor: barColor,
            boxShadow: `0 0 8px ${barColor}60`,
          }}
        />
      </div>
    </div>
  );
}

function SwapRateMeter() {
  const priceUpdates = useWebSocketStore((s) => s.priceUpdates);
  const rate = swapRateLast60s(priceUpdates);
  const max  = 30;
  const pct  = Math.min((rate / max) * 100, 100);
  const color = pct > 70 ? '#FF4D6D' : pct > 35 ? '#F59E0B' : '#00FF85';

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="h-3.5 w-3.5" style={{ color }} />
          <span className="text-xs text-aegis-muted">Swap Rate</span>
        </div>
        <span className="text-sm font-bold tabular-nums text-white">
          {rate} <span className="text-[10px] font-normal text-aegis-muted">/ 60s</span>
        </span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-white/5">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="h-full rounded-full"
          style={{ backgroundColor: color, boxShadow: `0 0 10px ${color}50` }}
        />
      </div>
      <div className="flex justify-between text-[9px] text-aegis-muted/40">
        <span>0</span>
        <span>{max}+</span>
      </div>
    </div>
  );
}

function MaDeviationPanel({ stats }: { stats: TokenStat[] }) {
  return (
    <Section title="MA Deviation" accent="#00E5FF" index={3}>
      {stats.length === 0 ? (
        <p className="py-4 text-xs text-aegis-muted/50">Awaiting price data…</p>
      ) : (
        <div className="space-y-4">
          <p className="text-[10px] text-aegis-muted/50">
            Price deviation from 10-sample moving average
          </p>
          <div className="space-y-3">
            {stats.slice(0, 5).map((t) => (
              <MaDeviationBar key={t.address} token={t} />
            ))}
          </div>
          <div className="mt-4 border-t border-aegis-border/30 pt-4">
            <SwapRateMeter />
          </div>
        </div>
      )}
    </Section>
  );
}

/* ─────────────────────────────────────────────────────────────── Page Header */

function AnalyticsHeader() {
  const status = useWebSocketStore((s) => s.status);
  const isLive = status === 'connected';

  return (
    <div className="flex items-center justify-between">
      <div>
        <div className="flex items-center gap-3">
          <BarChart3 className="h-6 w-6 text-aegis-secondary" />
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Analytics
          </h1>
          {isLive && (
            <span className="flex items-center gap-1.5 rounded-full border border-aegis-primary/30
                             bg-aegis-primary/8 px-2.5 py-0.5 text-[10px] font-bold uppercase
                             tracking-widest text-aegis-primary">
              <span className="h-1.5 w-1.5 rounded-full bg-aegis-primary live-dot" />
              Live
            </span>
          )}
        </div>
        <p className="mt-1 text-xs text-aegis-muted/60">
          Realtime price analytics · anomaly detection · market health
        </p>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────── Page */

export function AnalyticsPage() {
  const priceUpdates = useWebSocketStore((s) => s.priceUpdates);
  const tokenStats   = useMemo(() => buildTokenStats(priceUpdates), [priceUpdates]);

  return (
    <div className="flex flex-col gap-6 px-5 pb-8 pt-4">

        <AnalyticsHeader />

        <AnalyticsKpiRow stats={tokenStats} />

        {/* Chart + Crash Timeline */}
        <div className="grid min-h-0 gap-5 lg:grid-cols-[1.5fr_1fr]" style={{ minHeight: '460px' }}>
          <RealtimeChart />
          <CrashTimeline />
        </div>

        {/* Token Stats + MA Deviation */}
        <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
          <TokenStatsTable stats={tokenStats} />
          <MaDeviationPanel stats={tokenStats} />
        </div>

    </div>
  );
}
