import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

/* ── Mini dashboard mockup ─────────────────────────────────────── */
const CHART_LINE =
  'M 0 95 C 30 85, 50 65, 80 55 S 120 68, 155 48 S 195 28, 230 32 S 265 50, 295 28 S 330 12, 360 18 S 395 38, 420 22'
const CHART_FILL =
  'M 0 95 C 30 85, 50 65, 80 55 S 120 68, 155 48 S 195 28, 230 32 S 265 50, 295 28 S 330 12, 360 18 S 395 38, 420 22 L 420 130 L 0 130 Z'

const swapEvents = [
  { pair: 'ETH → USDC', val: '$12.4K', dir: 'sell' },
  { pair: 'USDC → ETH', val: '$8.2K',  dir: 'buy'  },
  { pair: 'ETH → WBTC', val: '$33.1K', dir: 'sell' },
]

const pipelineStatus = [
  { label: 'Indexer',   status: 'OK'  },
  { label: 'Kafka',     status: 'OK'  },
  { label: 'Analytics', status: 'OK'  },
  { label: 'Slither',   status: 'RUN' },
]

const heroAlerts = [
  { level: 'CRITICAL', msg: 'Abnormal price drop -32%', time: '2s ago'  },
  { level: 'WARNING',  msg: 'High volatility 18%',      time: '5s ago'  },
  { level: 'INFO',     msg: 'Audit completed OK',        time: '12s ago' },
]

function levelColor(level: string) {
  if (level === 'CRITICAL') return { text: 'text-aegis-danger',  bg: 'bg-aegis-danger/10 border border-aegis-danger/25'  }
  if (level === 'WARNING')  return { text: 'text-aegis-warning', bg: 'bg-aegis-warning/10 border border-aegis-warning/25' }
  return                           { text: 'text-aegis-primary', bg: 'bg-aegis-primary/5 border border-aegis-primary/15' }
}

function DashboardMockup() {
  return (
    <div className="relative w-full">
      {/* Ambient glow */}
      <div className="absolute -inset-6 bg-gradient-to-r from-aegis-primary/10 via-aegis-secondary/8 to-aegis-primary/10 rounded-3xl blur-3xl pointer-events-none" />

      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        className="relative glass rounded-2xl overflow-hidden"
      >
        {/* Title bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-aegis-border/50 bg-aegis-surface/40">
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-aegis-danger/70" />
              <div className="w-2.5 h-2.5 rounded-full bg-aegis-warning/70" />
              <div className="w-2.5 h-2.5 rounded-full bg-aegis-success/70" />
            </div>
            <span className="text-[11px] text-aegis-muted font-mono">aegisflow://monitor</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-aegis-success/10 border border-aegis-success/20 rounded-full px-2.5 py-1">
              <div className="w-1.5 h-1.5 rounded-full bg-aegis-success live-dot" />
              <span className="text-[9px] font-mono text-aegis-success font-bold tracking-wider">LIVE</span>
            </div>
            <span className="text-[10px] text-aegis-muted font-mono">ETH $2,451.32</span>
          </div>
        </div>

        <div className="p-4 space-y-3">
          {/* Price chart */}
          <div className="bg-aegis-card/70 rounded-xl p-3 border border-aegis-border/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold font-mono text-white">ETH / USDC</span>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-aegis-success font-bold">▲ +2.4%</span>
                <span className="text-[9px] text-aegis-muted font-mono">24h</span>
              </div>
            </div>
            <div className="relative h-[72px]">
              <svg viewBox="0 0 420 130" className="w-full h-full" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="heroChartGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor="#00E5FF" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#00E5FF" stopOpacity="0"    />
                  </linearGradient>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                    <feMerge>
                      <feMergeNode in="coloredBlur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>
                {/* Grid lines */}
                {[32, 65, 98].map((y) => (
                  <line key={y} x1="0" y1={y} x2="420" y2={y} stroke="rgba(26,40,64,0.6)" strokeWidth="1" />
                ))}
                <path d={CHART_FILL} fill="url(#heroChartGrad)" />
                <path d={CHART_LINE} fill="none" stroke="#00E5FF" strokeWidth="2" strokeLinecap="round" filter="url(#glow)" />
                {/* Live cursor */}
                <circle cx="420" cy="22" r="3.5" fill="#00E5FF" filter="url(#glow)" />
                <circle cx="420" cy="22" r="7" fill="#00E5FF" fillOpacity="0.2" />
              </svg>
            </div>
          </div>

          {/* Two-col: swaps + pipeline */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-aegis-card/70 rounded-xl p-3 border border-aegis-border/30">
              <div className="flex items-center gap-1.5 mb-2.5">
                <div className="w-1.5 h-1.5 rounded-full bg-aegis-primary" />
                <span className="text-[9px] font-mono text-aegis-muted uppercase tracking-widest">Swap Feed</span>
              </div>
              <div className="space-y-1.5">
                {swapEvents.map((s, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-[9px] font-mono text-aegis-muted">{s.pair}</span>
                    <span className={`text-[9px] font-mono font-semibold ${s.dir === 'buy' ? 'text-aegis-success' : 'text-aegis-danger'}`}>
                      {s.val}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-aegis-card/70 rounded-xl p-3 border border-aegis-border/30">
              <div className="flex items-center gap-1.5 mb-2.5">
                <div className="w-1.5 h-1.5 rounded-full bg-aegis-secondary animate-pulse" />
                <span className="text-[9px] font-mono text-aegis-muted uppercase tracking-widest">Pipeline</span>
              </div>
              <div className="space-y-1.5">
                {pipelineStatus.map((p, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-[9px] font-mono text-aegis-muted">{p.label}</span>
                    <span className={`text-[9px] font-mono font-bold ${p.status === 'OK' ? 'text-aegis-success' : 'text-aegis-primary'}`}>
                      {p.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Alerts */}
          <div className="bg-aegis-card/70 rounded-xl p-3 border border-aegis-border/30">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1.5 h-1.5 rounded-full bg-aegis-danger animate-pulse" />
              <span className="text-[9px] font-mono text-aegis-muted uppercase tracking-widest">Security Alerts</span>
              <span className="ml-auto text-[8px] font-mono bg-aegis-danger/20 text-aegis-danger border border-aegis-danger/25 rounded px-1.5 py-0.5">
                2 Active
              </span>
            </div>
            <div className="space-y-1.5">
              {heroAlerts.map((a, i) => {
                const c = levelColor(a.level)
                return (
                  <div key={i} className={`flex items-center gap-2 rounded-lg px-2 py-1.5 ${c.bg}`}>
                    <span className={`text-[8px] font-mono font-bold shrink-0 ${c.text}`}>{a.level}</span>
                    <span className="text-[9px] text-white flex-1 truncate">{a.msg}</span>
                    <span className="text-[8px] text-aegis-muted shrink-0 font-mono">{a.time}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

/* ── Hero Section ─────────────────────────────────────────────── */
const STATS = [
  { label: 'Events / sec',      value: '12K+' },
  { label: 'Threats detected',  value: '99.7%' },
  { label: 'Avg alert latency', value: '<50ms' },
]

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
      {/* Backgrounds */}
      <div className="absolute inset-0 bg-grid opacity-25" />
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-aegis-primary/6 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-aegis-secondary/6 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[400px] bg-aegis-secondary/4 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-20 lg:py-28">
        <div className="grid lg:grid-cols-2 gap-14 items-center">
          {/* ── Left: copy ─── */}
          <div>
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 rounded-full border border-aegis-primary/30 bg-aegis-primary/5 px-4 py-1.5 mb-7"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-aegis-success live-dot" />
              <span className="text-xs font-medium text-aegis-primary">Real-time Monitoring Active</span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.08 }}
              className="text-4xl sm:text-5xl xl:text-[60px] font-extrabold leading-[1.1] tracking-tight mb-6"
            >
              <span className="text-white">Real-Time</span>{' '}
              <span className="gradient-primary">Blockchain</span>{' '}
              <span className="text-white">Security</span>{' '}
              <span className="text-white">&amp; Analytics</span>
            </motion.h1>

            {/* Sub */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.18 }}
              className="text-lg text-aegis-muted leading-relaxed mb-10 max-w-xl"
            >
              Monitor DeFi activity, detect threats instantly, and automate smart contract security analysis with a unified real-time intelligence platform.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.28 }}
              className="flex flex-wrap gap-4"
            >
              <Link
                to="/dashboard"
                className="group inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold bg-aegis-primary text-aegis-bg hover:bg-aegis-primary/90 transition-all glow-primary active:scale-95"
              >
                Start Monitoring
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <a
                href="#features"
                className="group inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold border border-aegis-border bg-aegis-surface/40 text-white hover:border-aegis-primary/40 hover:bg-aegis-primary/5 transition-all"
              >
                <svg className="w-4 h-4 text-aegis-primary" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
                View Demo
              </a>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.45 }}
              className="flex flex-wrap gap-8 mt-12 pt-8 border-t border-aegis-border/50"
            >
              {STATS.map((s) => (
                <div key={s.label}>
                  <div className="text-2xl font-bold text-white">{s.value}</div>
                  <div className="text-xs text-aegis-muted mt-0.5">{s.label}</div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* ── Right: dashboard ─── */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, delay: 0.15, ease: 'easeOut' }}
          >
            <DashboardMockup />
          </motion.div>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-aegis-bg to-transparent pointer-events-none" />
    </section>
  )
}
