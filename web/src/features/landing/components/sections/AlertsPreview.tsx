import { motion } from 'framer-motion'

interface Alert {
  level: 'CRITICAL' | 'WARNING' | 'INFO'
  emoji: string
  title: string
  message: string
  token: string
  metric: string
  time: string
}

const ALERTS: Alert[] = [
  {
    level: 'CRITICAL',
    emoji: '🔴',
    title: 'Abnormal price drop detected',
    message: 'Token price collapsed 32% below the 1-hour moving average. Possible rug pull or liquidity drain.',
    token: '0x742d35Cc6634C0532925a3b844Bc454f6a8be7a',
    metric: 'Drop: -32%',
    time: '2 seconds ago',
  },
  {
    level: 'WARNING',
    emoji: '🟡',
    title: 'High volatility detected',
    message: 'Abnormal price swings detected. Volatility index exceeded threshold of 15% in under 60 seconds.',
    token: '0xABC123f35Cc6634C0532925a3b844Bc9e7595f0',
    metric: 'Volatility: 18%',
    time: '5 seconds ago',
  },
  {
    level: 'CRITICAL',
    emoji: '🔴',
    title: 'Flash loan attack pattern',
    message: 'Sequence of large borrow → swap → repay within a single block detected on pair WETH/USDC.',
    token: '0xDEF999C6634C0532925a3b844Bc9e7595f0bEb',
    metric: 'Block: 19,842,301',
    time: '18 seconds ago',
  },
  {
    level: 'INFO',
    emoji: '🔵',
    title: 'Audit completed successfully',
    message: 'Slither scan finished. No critical vulnerabilities found. 2 medium severity issues flagged for review.',
    token: '0x999abc35Cc6634C0532925a3b844Bc9e7595f0',
    metric: 'Issues: 0 critical, 2 medium',
    time: '34 seconds ago',
  },
  {
    level: 'WARNING',
    emoji: '🟡',
    title: 'Unusual swap volume spike',
    message: '10× normal volume detected in last 5 minutes. Could indicate pump activity or sandwich bot.',
    token: '0x111DEF35Cc6634C0532925a3b844Bc9e7595f0',
    metric: 'Volume: +1,040%',
    time: '52 seconds ago',
  },
]

const LEVEL_STYLES = {
  CRITICAL: {
    badge: 'bg-aegis-danger/15 text-aegis-danger border-aegis-danger/30',
    card:  'border-aegis-danger/25 bg-aegis-danger/5 hover:border-aegis-danger/50',
    dot:   'bg-aegis-danger',
    glow:  'hover:shadow-[0_0_24px_rgba(255,77,109,0.12)]',
  },
  WARNING: {
    badge: 'bg-aegis-warning/15 text-aegis-warning border-aegis-warning/30',
    card:  'border-aegis-warning/25 bg-aegis-warning/5 hover:border-aegis-warning/50',
    dot:   'bg-aegis-warning',
    glow:  'hover:shadow-[0_0_24px_rgba(245,158,11,0.12)]',
  },
  INFO: {
    badge: 'bg-aegis-primary/10 text-aegis-primary border-aegis-primary/25',
    card:  'border-aegis-primary/20 bg-aegis-primary/3 hover:border-aegis-primary/40',
    dot:   'bg-aegis-primary',
    glow:  'hover:shadow-[0_0_24px_rgba(0,229,255,0.08)]',
  },
}

export default function AlertsPreview() {
  return (
    <section id="security" className="relative py-24 overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-aegis-danger/4 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <p className="text-xs font-semibold text-aegis-danger uppercase tracking-[0.25em] mb-4">
            Threat Intelligence
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-5">
            Security alerts,{' '}
            <span className="gradient-primary">in real time</span>
          </h2>
          <p className="text-lg text-aegis-muted max-w-xl mx-auto">
            Every anomaly is instantly classified, scored, and broadcast to your team and integrations.
          </p>
        </motion.div>

        {/* Alert feed */}
        <div className="relative">
          {/* Feed header */}
          <div className="flex items-center justify-between mb-4 px-1">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-aegis-danger live-dot" />
              <span className="text-xs font-mono text-aegis-muted uppercase tracking-widest">
                Live Security Feed
              </span>
            </div>
            <div className="text-[11px] font-mono text-aegis-muted">
              Last updated: <span className="text-white">just now</span>
            </div>
          </div>

          {/* Cards */}
          <div className="space-y-3">
            {ALERTS.map((a, i) => {
              const s = LEVEL_STYLES[a.level]
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  className={`group relative rounded-2xl border p-4 transition-all duration-300 cursor-default ${s.card} ${s.glow}`}
                >
                  <div className="flex gap-4">
                    {/* Level column */}
                    <div className="flex flex-col items-center gap-2 pt-0.5 shrink-0">
                      <span className="text-xl leading-none">{a.emoji}</span>
                      <div className={`w-px flex-1 ${s.dot} opacity-20 rounded-full`} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <span className={`text-[10px] font-bold font-mono uppercase tracking-widest px-2 py-0.5 rounded border ${s.badge}`}>
                          {a.level}
                        </span>
                        <h3 className="text-sm font-semibold text-white">{a.title}</h3>
                      </div>
                      <p className="text-sm text-aegis-muted leading-relaxed mb-3">{a.message}</p>
                      <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-[11px] font-mono">
                        <span className="text-aegis-muted">
                          Token: <span className="text-white">{a.token.slice(0, 8)}…{a.token.slice(-4)}</span>
                        </span>
                        <span className="text-aegis-muted">
                          {a.metric.split(':')[0]}:{' '}
                          <span className={a.level === 'CRITICAL' ? 'text-aegis-danger' : a.level === 'WARNING' ? 'text-aegis-warning' : 'text-aegis-primary'}>
                            {a.metric.split(':')[1]}
                          </span>
                        </span>
                        <span className="text-aegis-muted/60">Detected: {a.time}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* Blur tail */}
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-aegis-bg to-transparent pointer-events-none" />
        </div>

        {/* CTA link */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center mt-8"
        >
          <button className="text-sm text-aegis-primary hover:text-white transition-colors font-medium group">
            View full alert history
            <span className="ml-1 group-hover:translate-x-1 inline-block transition-transform">→</span>
          </button>
        </motion.div>
      </div>
    </section>
  )
}
