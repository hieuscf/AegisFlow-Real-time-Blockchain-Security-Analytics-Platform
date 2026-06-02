import { motion } from 'framer-motion';
import { ShieldAlert, AlertTriangle, Activity, Wifi } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useWebSocketStore } from '@/store';

/* ── Tiny SVG sparkline ─────────────────────────────────────────── */
function Sparkline({ values, color }: { values: number[]; color: string }) {
  if (values.length < 2) return null;
  const max = Math.max(...values, 1);
  const min = Math.min(...values);
  const range = max - min || 1;
  const W = 80; const H = 28;
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
        <linearGradient id={`sg-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0"   />
        </linearGradient>
      </defs>
      <path d={fill} fill={`url(#sg-${color.replace('#', '')})`} />
      <path d={line} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ── Individual KPI Card ────────────────────────────────────────── */
interface KpiCardProps {
  label:    string;
  value:    string | number;
  sub:      string;
  icon:     React.ReactNode;
  accent:   string;
  glow:     string;
  sparkline?: number[];
  animate?:  boolean;
  index:    number;
}

function KpiCard({ label, value, sub, icon, accent, glow, sparkline, animate = false, index }: KpiCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: 'easeOut' }}
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      className="card-gradient-border group relative cursor-default overflow-hidden rounded-2xl p-5"
    >
      {/* Ambient glow on hover */}
      <div
        className="absolute -inset-px rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: `radial-gradient(circle at 50% 0%, ${glow} 0%, transparent 65%)` }}
      />

      {/* Top accent line */}
      <div
        className="absolute inset-x-0 top-0 h-px rounded-full"
        style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }}
      />

      <div className="relative flex items-start justify-between">
        {/* Icon */}
        <div
          className="flex h-10 w-10 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-110"
          style={{ backgroundColor: `${accent}18`, color: accent }}
        >
          {icon}
        </div>

        {/* Sparkline */}
        {sparkline && (
          <div className="opacity-60">
            <Sparkline values={sparkline} color={accent} />
          </div>
        )}
      </div>

      <div className="relative mt-4">
        <div
          className={cn('text-3xl font-bold tracking-tight text-white', animate && 'tabular-nums')}
        >
          {value}
        </div>
        <div className="mt-1 flex items-center gap-2">
          <span className="text-xs font-medium text-aegis-muted">{label}</span>
        </div>
        <div className="mt-0.5 text-[11px]" style={{ color: `${accent}cc` }}>
          {sub}
        </div>
      </div>
    </motion.div>
  );
}

/* ── KPI Cards container ────────────────────────────────────────── */
export function KpiCards() {
  const alerts       = useWebSocketStore((s) => s.alerts);
  const priceUpdates = useWebSocketStore((s) => s.priceUpdates);
  const wsStatus     = useWebSocketStore((s) => s.status);

  const criticalCount = alerts.filter((a) => a.level === 'CRITICAL').length;
  const warningCount  = alerts.filter((a) => a.level === 'WARNING').length;
  const isLive        = wsStatus === 'connected';

  /* Build a tiny sparkline from last 12 alert counts (cumulative) */
  const alertSparkline = Array.from({ length: 12 }, (_, i) =>
    alerts.filter((_, ai) => ai < alerts.length - i).length,
  ).reverse();

  /* Price sparkline — last 12 price values for the most recent token */
  const recentPrices = priceUpdates.slice(0, 12).map((u) => u.price).reverse();

  const cards: KpiCardProps[] = [
    {
      label:     'Total Alerts',
      value:     alerts.length,
      sub:       alerts.length === 0 ? 'No alerts yet' : `${warningCount} warning · ${criticalCount} critical`,
      icon:      <ShieldAlert className="h-5 w-5" />,
      accent:    '#00E5FF',
      glow:      'rgba(0,229,255,0.12)',
      sparkline: alertSparkline,
      animate:   true,
      index:     0,
    },
    {
      label:     'Active Threats',
      value:     criticalCount,
      sub:       criticalCount > 0 ? 'Immediate investigation required' : 'No critical threats',
      icon:      <AlertTriangle className="h-5 w-5" />,
      accent:    criticalCount > 0 ? '#FF4D6D' : '#00FF85',
      glow:      criticalCount > 0 ? 'rgba(255,77,109,0.15)' : 'rgba(0,255,133,0.10)',
      sparkline: alertSparkline.map((v) => Math.round(v * 0.3)),
      animate:   true,
      index:     1,
    },
    {
      label:     'Price Events',
      value:     priceUpdates.length,
      sub:       priceUpdates.length > 0
        ? `Latest: $${priceUpdates[0]?.price.toFixed(4) ?? '—'}`
        : 'Awaiting price stream',
      icon:      <Activity className="h-5 w-5" />,
      accent:    '#7C3AED',
      glow:      'rgba(124,58,237,0.12)',
      sparkline: recentPrices.length > 1 ? recentPrices : undefined,
      animate:   true,
      index:     2,
    },
    {
      label:     'Network',
      value:     isLive ? 'Live' : 'Offline',
      sub:       isLive ? 'Ethereum Mainnet · Uniswap V2' : 'Reconnecting to analytics hub',
      icon:      <Wifi className="h-5 w-5" />,
      accent:    isLive ? '#00FF85' : '#94A3B8',
      glow:      isLive ? 'rgba(0,255,133,0.12)' : 'rgba(148,163,184,0.08)',
      index:     3,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((c) => (
        <KpiCard key={c.label} {...c} />
      ))}
    </div>
  );
}
