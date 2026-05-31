import { motion } from 'framer-motion'

const NODES = [
  { id: 'uni',     label: 'Uniswap V2',       sub: 'Event source',          color: '#FF007A', icon: '◈' },
  { id: 'idx',     label: 'Event Listener',    sub: 'Go / ethclient',        color: '#00E5FF', icon: '⬡' },
  { id: 'kafka',   label: 'Kafka',             sub: 'market-swaps topic',    color: '#00B4D8', icon: '⬢' },
  { id: 'engine',  label: 'Analytics Engine',  sub: 'Price & OHLC analysis', color: '#7C3AED', icon: '⬡' },
  { id: 'threat',  label: 'Threat Detection',  sub: 'Anomaly scoring',       color: '#F59E0B', icon: '⬡' },
  { id: 'slither', label: 'Slither Scanner',   sub: 'Smart contract audit',  color: '#00FF85', icon: '⬡' },
  { id: 'ws',      label: 'WebSocket Gateway', sub: 'security-alerts topic', color: '#00E5FF', icon: '⬡' },
  { id: 'dash',    label: 'Dashboard',         sub: 'Real-time UI',          color: '#FF007A', icon: '▣' },
]

export default function ArchitectureSection() {
  return (
    <section id="architecture" className="relative py-24 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-grid opacity-20" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-aegis-secondary/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-xs font-semibold text-aegis-primary uppercase tracking-[0.25em] mb-4">
            System Design
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-5">
            End-to-end{' '}
            <span className="gradient-primary">pipeline</span>
          </h2>
          <p className="text-lg text-aegis-muted max-w-xl mx-auto">
            From raw blockchain events to security alerts in under 50ms — a Kafka-powered architecture built for scale.
          </p>
        </motion.div>

        {/* Pipeline */}
        <div className="flex flex-col items-center gap-0">
          {NODES.map((node, i) => (
            <motion.div
              key={node.id}
              initial={{ opacity: 0, scale: 0.85 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="flex flex-col items-center"
            >
              {/* Node card */}
              <div
                className="relative group glass rounded-2xl px-8 py-4 flex items-center gap-5 min-w-[300px] sm:min-w-[380px] cursor-default hover:-translate-y-0.5 transition-all duration-300"
                style={{ boxShadow: `0 0 0 1px ${node.color}22` }}
              >
                {/* Left icon */}
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-xl font-bold shrink-0 node-pulse"
                  style={{ background: `${node.color}18`, color: node.color, border: `1px solid ${node.color}40` }}
                >
                  {node.icon}
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-white">{node.label}</div>
                  <div className="text-xs text-aegis-muted font-mono">{node.sub}</div>
                </div>

                {/* Step badge */}
                <div
                  className="text-[10px] font-mono font-bold px-2 py-1 rounded-lg shrink-0"
                  style={{ background: `${node.color}15`, color: node.color }}
                >
                  {String(i + 1).padStart(2, '0')}
                </div>

                {/* Glow line */}
                <div
                  className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                  style={{ boxShadow: `inset 0 0 0 1px ${node.color}50, 0 0 20px ${node.color}15` }}
                />
              </div>

              {/* Connector */}
              {i < NODES.length - 1 && (
                <div className="flex flex-col items-center my-1">
                  <svg width="24" height="36" viewBox="0 0 24 36" fill="none">
                    <defs>
                      <linearGradient id={`flow-${i}`} x1="12" y1="0" x2="12" y2="36" gradientUnits="userSpaceOnUse">
                        <stop stopColor={node.color} stopOpacity="0.6" />
                        <stop offset="1" stopColor={NODES[i + 1]!.color} stopOpacity="0.6" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M12 0 L12 28 M8 24 L12 32 L16 24"
                      stroke={`url(#flow-${i})`}
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeDasharray="3 3"
                      className="flow-dash"
                    />
                  </svg>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Stats footer */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-14 grid grid-cols-3 gap-4 text-center"
        >
          {[
            { label: 'End-to-end latency', value: '<50ms' },
            { label: 'Pipeline stages',     value: '8 nodes' },
            { label: 'Kafka throughput',    value: '100K msg/s' },
          ].map((s) => (
            <div key={s.label} className="glass rounded-xl py-5 px-3">
              <div className="text-xl font-bold gradient-primary">{s.value}</div>
              <div className="text-[11px] text-aegis-muted mt-1">{s.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
