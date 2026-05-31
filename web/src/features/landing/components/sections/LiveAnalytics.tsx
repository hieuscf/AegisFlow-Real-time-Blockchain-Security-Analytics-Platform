import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'

/* ── Animated counter hook ─────────────────────────────────────── */
function useCounter(end: number, duration = 1800, start = false) {
  const [count, setCount] = useState(0)
  const frame = useRef<number | null>(null)

  useEffect(() => {
    if (!start) return
    const startTime = performance.now()
    const tick = (now: number) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.floor(eased * end))
      if (progress < 1) frame.current = requestAnimationFrame(tick)
    }
    frame.current = requestAnimationFrame(tick)
    return () => { if (frame.current) cancelAnimationFrame(frame.current) }
  }, [end, duration, start])

  return count
}

/* ── Metric card ──────────────────────────────────────────────── */
interface MetricProps {
  label: string
  suffix: string
  end: number
  decimals?: number
  icon: React.ReactNode
  color: string
  sub: string
  started: boolean
}

function MetricCard({ label, suffix, end, decimals = 0, icon, color, sub, started }: MetricProps) {
  const count = useCounter(end, 1800, started)
  const display = decimals > 0 ? (count / Math.pow(10, decimals)).toFixed(decimals) : count.toLocaleString()

  return (
    <div className="group card-gradient-border p-5 hover:-translate-y-1 transition-all duration-300 cursor-default overflow-hidden">
      <div className="shimmer-line rounded-2xl" />
      <div className="flex items-start justify-between mb-4">
        <div className={`p-2.5 rounded-xl bg-aegis-surface border border-aegis-border/40 ${color}`}>
          {icon}
        </div>
        <div className="flex items-center gap-1.5 text-[10px] font-mono text-aegis-success bg-aegis-success/10 border border-aegis-success/20 rounded-full px-2 py-0.5">
          <div className="w-1 h-1 rounded-full bg-aegis-success live-dot" />
          LIVE
        </div>
      </div>
      <div className="flex items-end gap-1 mb-1">
        <span className={`text-3xl font-extrabold tracking-tight ${color}`}>{display}</span>
        <span className={`text-lg font-bold mb-0.5 ${color} opacity-70`}>{suffix}</span>
      </div>
      <div className="text-sm font-semibold text-white mb-1">{label}</div>
      <div className="text-xs text-aegis-muted">{sub}</div>
    </div>
  )
}

/* ── Throughput chart ──────────────────────────────────────────── */
function ThroughputBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = Math.round((value / max) * 100)
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 bg-aegis-surface rounded-full h-1.5 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: `${pct}%` }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          className="h-full rounded-full"
          style={{ background: color }}
        />
      </div>
      <span className="text-[10px] font-mono text-aegis-muted w-8 text-right">{pct}%</span>
    </div>
  )
}

/* ── Kafka throughput panel ────────────────────────────────────── */
function KafkaPanel() {
  const topics = [
    { name: 'market-swaps',     msgs: 8240,  max: 10000, color: '#00E5FF' },
    { name: 'price-analysis',   msgs: 4120,  max: 10000, color: '#7C3AED' },
    { name: 'security-alerts',  msgs: 380,   max: 10000, color: '#FF4D6D' },
    { name: 'audit-results',    msgs: 92,    max: 10000, color: '#00FF85' },
  ]
  return (
    <div className="card-gradient-border p-5 overflow-hidden">
      <div className="shimmer-line rounded-2xl" />
      <div className="flex items-center gap-2 mb-5">
        <div className="w-2 h-2 rounded-full bg-aegis-secondary animate-pulse" />
        <span className="text-xs font-mono text-aegis-muted uppercase tracking-widest">Kafka Topics / sec</span>
      </div>
      <div className="space-y-3">
        {topics.map((t) => (
          <div key={t.name}>
            <div className="flex justify-between text-[10px] font-mono mb-1.5">
              <span className="text-aegis-muted">{t.name}</span>
              <span className="text-white font-semibold">{t.msgs.toLocaleString()} msg/s</span>
            </div>
            <ThroughputBar value={t.msgs} max={t.max} color={t.color} />
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── Main section ─────────────────────────────────────────────── */
const METRICS: Omit<MetricProps, 'started'>[] = [
  {
    label: 'Swap Volume',
    suffix: 'M',
    end: 142,
    color: 'text-aegis-primary',
    sub: 'USD in last 24 hours',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    label: 'Active Tokens',
    suffix: '',
    end: 4287,
    color: 'text-aegis-secondary',
    sub: 'Tracked on Uniswap V2',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
  },
  {
    label: 'Alerts Triggered',
    suffix: '',
    end: 1843,
    color: 'text-aegis-danger',
    sub: 'Security events this week',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
  },
  {
    label: 'Audits Completed',
    suffix: '',
    end: 312,
    color: 'text-aegis-success',
    sub: 'Slither scans completed',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
  {
    label: 'Real-time TPS',
    suffix: 'K',
    end: 12,
    color: 'text-aegis-primary',
    sub: 'Transactions per second',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
]

export default function LiveAnalytics() {
  const [started, setStarted] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry?.isIntersecting) setStarted(true) },
      { threshold: 0.3 },
    )
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])

  return (
    <section id="analytics" ref={ref} className="relative py-24 overflow-hidden">
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-aegis-primary/5 rounded-full blur-[130px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <p className="text-xs font-semibold text-aegis-primary uppercase tracking-[0.25em] mb-4">
            Live Metrics
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-5">
            Real-time{' '}
            <span className="gradient-primary">analytics</span>
          </h2>
          <p className="text-lg text-aegis-muted max-w-xl mx-auto">
            Watch the platform process DeFi events as they happen, with live counters updated every second.
          </p>
        </motion.div>

        {/* Metrics grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-6">
          {METRICS.map((m, i) => (
            <motion.div
              key={m.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.07 }}
            >
              <MetricCard {...m} started={started} />
            </motion.div>
          ))}
        </div>

        {/* Kafka throughput */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.35 }}
        >
          <KafkaPanel />
        </motion.div>
      </div>
    </section>
  )
}
