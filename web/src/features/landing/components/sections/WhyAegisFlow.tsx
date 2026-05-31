import { motion } from 'framer-motion'

const VALUES = [
  {
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    color: 'from-aegis-primary to-blue-400',
    glow: 'rgba(0,229,255,0.2)',
    title: 'Detect Faster',
    desc: 'Real-time monitoring across DeFi ecosystems. Anomalies are identified in milliseconds — not minutes — using a streaming analytics pipeline that never sleeps.',
    bullets: [
      'Sub-50ms alert latency',
      'Uniswap V2 event indexing',
      'Continuous OHLC analysis',
    ],
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    ),
    color: 'from-aegis-secondary to-purple-400',
    glow: 'rgba(124,58,237,0.2)',
    title: 'Respond Automatically',
    desc: 'Trigger automated security workflows the moment a threat is detected. Smart contract audits, alerts, and incident reports — all without human intervention.',
    bullets: [
      'Auto-triggered Slither scans',
      'WebSocket broadcast alerts',
      'Structured audit reports',
    ],
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
    color: 'from-aegis-success to-emerald-400',
    glow: 'rgba(0,255,133,0.2)',
    title: 'Scale Securely',
    desc: 'Kafka-powered architecture designed for growth. Handle millions of blockchain events per second with guaranteed delivery and horizontal scaling from day one.',
    bullets: [
      'Kafka event-driven pipeline',
      'Horizontal pod scaling',
      'Docker Compose local dev',
    ],
  },
]

export default function WhyAegisFlow() {
  return (
    <section className="relative py-24 overflow-hidden">
      <div className="absolute inset-0 bg-aegis-surface/30" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-1 bg-gradient-to-r from-transparent via-aegis-border to-transparent" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-xs font-semibold text-aegis-primary uppercase tracking-[0.25em] mb-4">
            Why AegisFlow
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-5">
            Built for the{' '}
            <span className="gradient-primary">next generation</span>{' '}
            of Web3 security
          </h2>
          <p className="text-lg text-aegis-muted max-w-2xl mx-auto">
            Traditional security tools weren&apos;t built for the speed and complexity of DeFi. AegisFlow was.
          </p>
        </motion.div>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {VALUES.map((v, i) => (
            <motion.div
              key={v.title}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: i * 0.12 }}
              className="group relative glass rounded-2xl p-7 hover:-translate-y-1 transition-all duration-300 cursor-default overflow-hidden"
              style={{ boxShadow: `0 0 0 1px rgba(26,40,64,0.8)` }}
            >
              {/* Hover glow */}
              <div
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{ boxShadow: `inset 0 0 40px ${v.glow}` }}
              />

              {/* Icon */}
              <div className={`inline-flex p-3.5 rounded-2xl bg-gradient-to-br ${v.color} bg-opacity-10 mb-6`}
                style={{ background: `linear-gradient(135deg, ${v.glow}, transparent)`, border: `1px solid ${v.glow}` }}>
                <div className={`bg-gradient-to-br ${v.color} bg-clip-text text-transparent`}>
                  {v.icon}
                </div>
              </div>

              <h3 className="text-xl font-bold text-white mb-3">{v.title}</h3>
              <p className="text-sm text-aegis-muted leading-relaxed mb-5">{v.desc}</p>

              {/* Bullets */}
              <ul className="space-y-2">
                {v.bullets.map((b) => (
                  <li key={b} className="flex items-center gap-2.5 text-sm text-aegis-muted">
                    <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-br ${v.color} shrink-0`} />
                    {b}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
