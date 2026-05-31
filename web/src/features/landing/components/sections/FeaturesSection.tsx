import { motion } from 'framer-motion'

const FEATURES = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    color: 'text-aegis-primary',
    glow: 'group-hover:shadow-[0_0_24px_rgba(0,229,255,0.2)]',
    tag: 'Real-Time',
    title: 'Event Monitoring',
    desc: 'Track Uniswap V2 swap events with sub-second latency directly from the Ethereum node, with zero data loss.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    color: 'text-aegis-secondary',
    glow: 'group-hover:shadow-[0_0_24px_rgba(124,58,237,0.2)]',
    tag: 'Infrastructure',
    title: 'Kafka Streaming Pipeline',
    desc: 'Reliable, horizontally scalable event-driven architecture. Process millions of blockchain events per second with guaranteed delivery.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    color: 'text-aegis-primary',
    glow: 'group-hover:shadow-[0_0_24px_rgba(0,229,255,0.2)]',
    tag: 'Analytics',
    title: 'Price Intelligence Engine',
    desc: 'Continuous token price analysis with moving averages, volatility scoring, and anomaly detection against historical baselines.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    color: 'text-aegis-danger',
    glow: 'group-hover:shadow-[0_0_24px_rgba(255,77,109,0.2)]',
    tag: 'Detection',
    title: 'Threat Detection',
    desc: 'Identify abnormal price drops, wash trading, flash loan attacks, and suspicious market manipulation in real time.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    color: 'text-aegis-success',
    glow: 'group-hover:shadow-[0_0_24px_rgba(0,255,133,0.2)]',
    tag: 'Security',
    title: 'Automated Smart Contract Audits',
    desc: 'Trigger Slither security scans automatically on suspicious contracts. Get structured vulnerability reports in seconds.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
    ),
    color: 'text-aegis-warning',
    glow: 'group-hover:shadow-[0_0_24px_rgba(245,158,11,0.2)]',
    tag: 'Alerting',
    title: 'Instant Alerting',
    desc: 'Broadcast critical security alerts via WebSockets to all connected dashboards and integrations in under 50ms.',
  },
]

export default function FeaturesSection() {
  return (
    <section id="features" className="relative py-24 overflow-hidden">
      {/* Background orbs */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-aegis-secondary/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-aegis-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-xs font-semibold text-aegis-primary uppercase tracking-[0.25em] mb-4">
            Platform Capabilities
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-5">
            Everything you need to{' '}
            <span className="gradient-primary">secure DeFi</span>
          </h2>
          <p className="text-lg text-aegis-muted max-w-2xl mx-auto">
            A complete security intelligence platform from blockchain events to automated audits, built for real-time DeFi environments.
          </p>
        </motion.div>

        {/* Feature grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className={`group relative card-gradient-border p-6 overflow-hidden cursor-default transition-all duration-300 ${f.glow} hover:-translate-y-1`}
            >
              {/* Shimmer */}
              <div className="shimmer-line rounded-2xl" />

              {/* Tag */}
              <div className="flex items-center justify-between mb-4">
                <span className={`text-[10px] font-semibold uppercase tracking-widest ${f.color} opacity-70`}>
                  {f.tag}
                </span>
                <div className={`p-2.5 rounded-xl bg-aegis-surface/60 border border-aegis-border/40 ${f.color} group-hover:scale-110 transition-transform`}>
                  {f.icon}
                </div>
              </div>

              <h3 className="text-lg font-bold text-white mb-3 leading-snug">{f.title}</h3>
              <p className="text-sm text-aegis-muted leading-relaxed">{f.desc}</p>

              {/* Bottom line accent */}
              <div className={`absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-current to-transparent ${f.color} opacity-0 group-hover:opacity-40 transition-opacity`} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
