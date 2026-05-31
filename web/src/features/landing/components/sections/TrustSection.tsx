import { motion } from 'framer-motion'

const TECH = [
  {
    name: 'Ethereum',
    icon: (
      <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none">
        <path d="M11.944 17.97L4.58 13.62 11.943 24l7.37-10.38-7.372 4.35zM12.056 0L4.69 12.223l7.365 4.354 7.365-4.35L12.056 0z" fill="#627EEA" />
      </svg>
    ),
  },
  {
    name: 'Uniswap',
    icon: (
      <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none">
        <circle cx="12" cy="12" r="12" fill="#FF007A" fillOpacity="0.15" />
        <path d="M8.5 7c.5-1 2-1.5 3 0 .5.8 0 2-1 2.5-1.2.6-2.5 0-2.5-1.5 0-.4.2-.8.5-1zM15 8.5c.5-1.5 2.5-1.5 3 0 .3.8-.2 1.8-1 2.2-1 .5-2.3-.2-2.3-1.2 0-.4.1-.7.3-1zM7 14c0-1.5 1.5-3 4-3s4 1 4 3c0 2-2 3.5-4 3.5S7 16 7 14z" fill="#FF007A" />
      </svg>
    ),
  },
  {
    name: 'Apache Kafka',
    icon: (
      <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none">
        <rect x="2" y="6" width="4" height="4" rx="1" fill="#231F20" stroke="#00B4D8" strokeWidth="1.5" />
        <rect x="10" y="2" width="4" height="4" rx="1" fill="#231F20" stroke="#00B4D8" strokeWidth="1.5" />
        <rect x="10" y="10" width="4" height="4" rx="1" fill="#231F20" stroke="#00B4D8" strokeWidth="1.5" />
        <rect x="10" y="18" width="4" height="4" rx="1" fill="#231F20" stroke="#00B4D8" strokeWidth="1.5" />
        <rect x="18" y="6" width="4" height="4" rx="1" fill="#231F20" stroke="#00B4D8" strokeWidth="1.5" />
        <line x1="6" y1="8" x2="10" y2="4" stroke="#00B4D8" strokeWidth="1.5" />
        <line x1="6" y1="8" x2="10" y2="12" stroke="#00B4D8" strokeWidth="1.5" />
        <line x1="6" y1="8" x2="10" y2="20" stroke="#00B4D8" strokeWidth="1.5" />
        <line x1="14" y1="4" x2="18" y2="8" stroke="#00B4D8" strokeWidth="1.5" />
        <line x1="14" y1="12" x2="18" y2="8" stroke="#00B4D8" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    name: 'Docker',
    icon: (
      <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none">
        <path d="M13.2 11H15v1.8h-1.8V11zm-2.4 0h1.8v1.8h-1.8V11zm-2.4 0h1.8v1.8H8.4V11zm-2.4 0H7.8v1.8H6V11zm4.8-2.4H12.6v1.8h-1.8V8.6zm-2.4 0h1.8v1.8H8.4V8.6zm-2.4 0H7.8v1.8H6V8.6zm4.8-2.4H12.6v1.8h-1.8V6.2zm19.2 5.2c-.3-2-1.8-3.2-3.8-3.2-.8 0-1.6.2-2.2.6-.6-1.4-2-2.4-3.6-2.4-.6 0-1.2.1-1.8.4V14c0 2.2 1.8 4 4 4H20c2.2 0 4-1.8 4-4 0-.2 0-.4-.1-.6z" fill="#2496ED" />
      </svg>
    ),
  },
  {
    name: 'Slither',
    icon: (
      <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" fill="none" stroke="#00FF85" strokeWidth="1.5" />
        <path d="M8 14c1-2 6-2 8 0" stroke="#00FF85" strokeWidth="2" strokeLinecap="round" />
        <circle cx="9" cy="10" r="1.5" fill="#00FF85" />
        <circle cx="15" cy="10" r="1.5" fill="#00FF85" />
      </svg>
    ),
  },
  {
    name: 'Go',
    icon: (
      <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none">
        <path d="M1.8 10c-.1.3 0 .6.3.7l1.5.7c.2.1.4 0 .5-.2l.3-.8c.1-.2 0-.5-.2-.6L2.6 9.2c-.3-.1-.7.3-.8.8zM5.2 9.5l-.3.8 9.7 4.5.3-.8-9.7-4.5zm10 4.7l-.3.8 6.8-1.7-.3-.8-6.2 1.7zm-5-6.7c-1.7.8-2.2 3-1.5 4.7.7 1.7 2.7 2.5 4.4 1.7 1.7-.8 2.5-2.7 1.8-4.5-.8-1.7-2.8-2.7-4.7-1.9z" fill="#00ACD7" />
      </svg>
    ),
  },
]

export default function TrustSection() {
  return (
    <section className="relative py-16 overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center text-sm font-medium text-aegis-muted uppercase tracking-[0.2em] mb-10"
        >
          Built for modern Web3 Security Teams — powered by
        </motion.p>

        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10">
          {TECH.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.07 }}
              className="group flex flex-col items-center gap-2.5 px-5 py-4 rounded-2xl border border-aegis-border/40 bg-aegis-surface/30 hover:border-aegis-primary/30 hover:bg-aegis-primary/5 transition-all cursor-default"
            >
              <div className="opacity-75 group-hover:opacity-100 transition-opacity">
                {t.icon}
              </div>
              <span className="text-[11px] font-medium text-aegis-muted group-hover:text-white transition-colors">
                {t.name}
              </span>
            </motion.div>
          ))}
        </div>

        {/* Divider */}
        <div className="mt-16 h-px bg-gradient-to-r from-transparent via-aegis-border to-transparent" />
      </div>
    </section>
  )
}
