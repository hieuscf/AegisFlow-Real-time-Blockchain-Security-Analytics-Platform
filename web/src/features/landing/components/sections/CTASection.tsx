import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function CTASection() {
  return (
    <section className="relative py-28 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-grid opacity-20" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-r from-aegis-primary/10 via-aegis-secondary/10 to-aegis-primary/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 rounded-full border border-aegis-primary/30 bg-aegis-primary/5 px-4 py-1.5 mb-8"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-aegis-success live-dot" />
          <span className="text-xs font-medium text-aegis-primary">Platform Ready — Try It Today</span>
        </motion.div>

        {/* Heading */}
        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.65, delay: 0.08 }}
          className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight mb-6"
        >
          Protect Your Blockchain Infrastructure{' '}
          <span className="gradient-primary">in Real Time</span>
        </motion.h2>

        {/* Sub */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.16 }}
          className="text-xl text-aegis-muted leading-relaxed mb-12 max-w-2xl mx-auto"
        >
          Join Web3 security teams using AegisFlow to detect threats, automate audits, and protect DeFi protocols — before attackers strike.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.24 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14"
        >
          <Link
            to="/dashboard"
            className="group inline-flex items-center gap-2.5 px-8 py-4 rounded-xl text-base font-bold bg-aegis-primary text-aegis-bg hover:bg-aegis-primary/90 transition-all glow-primary active:scale-95 min-w-[200px] justify-center"
          >
            Launch Platform
            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
          <a
            href="#"
            className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl text-base font-bold border border-aegis-border bg-aegis-surface/40 text-white hover:border-aegis-primary/40 hover:bg-aegis-primary/5 transition-all min-w-[200px] justify-center"
          >
            <svg className="w-5 h-5 text-aegis-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Schedule Demo
          </a>
        </motion.div>

        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.36 }}
          className="flex flex-wrap items-center justify-center gap-6 text-xs text-aegis-muted"
        >
          {[
            { icon: '🛡️', label: 'No credit card required' },
            { icon: '⚡', label: 'Set up in 5 minutes' },
            { icon: '🔓', label: 'Open source core' },
            { icon: '🐳', label: 'Docker ready' },
          ].map((b) => (
            <div key={b.label} className="flex items-center gap-1.5">
              <span>{b.icon}</span>
              <span>{b.label}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
