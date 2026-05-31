import { motion } from 'framer-motion'

/* ── Candlestick chart ────────────────────────────────────────── */
const CANDLES = [
  { o: 72, h: 78, l: 68, c: 75, bull: true  },
  { o: 75, h: 82, l: 73, c: 80, bull: true  },
  { o: 80, h: 83, l: 70, c: 71, bull: false },
  { o: 71, h: 76, l: 65, c: 73, bull: true  },
  { o: 73, h: 85, l: 71, c: 83, bull: true  },
  { o: 83, h: 87, l: 74, c: 76, bull: false },
  { o: 76, h: 80, l: 68, c: 70, bull: false },
  { o: 70, h: 79, l: 68, c: 78, bull: true  },
  { o: 78, h: 90, l: 76, c: 88, bull: true  },
  { o: 88, h: 92, l: 80, c: 82, bull: false },
  { o: 82, h: 88, l: 78, c: 85, bull: true  },
  { o: 85, h: 95, l: 83, c: 93, bull: true  },
]

function CandlestickChart() {
  const W = 280; const H = 90; const pad = 4
  const scale = (v: number) => H - ((v - 60) / 40) * (H - pad * 2) - pad
  const cw = 18; const gap = 5

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id="bullGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#00FF85" />
          <stop offset="100%" stopColor="#00CC68" />
        </linearGradient>
        <linearGradient id="bearGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FF4D6D" />
          <stop offset="100%" stopColor="#CC3A55" />
        </linearGradient>
      </defs>
      {/* Grid */}
      {[65, 75, 85, 95].map((v) => (
        <line key={v} x1="0" y1={scale(v)} x2={W} y2={scale(v)} stroke="rgba(26,40,64,0.7)" strokeWidth="1" />
      ))}
      {/* Candles */}
      {CANDLES.map((c, i) => {
        const x = i * (cw + gap) + gap
        const top  = scale(Math.max(c.o, c.c))
        const bot  = scale(Math.min(c.o, c.c))
        const body = Math.max(bot - top, 2)
        const fill = c.bull ? 'url(#bullGrad)' : 'url(#bearGrad)'
        const stroke = c.bull ? '#00FF85' : '#FF4D6D'
        return (
          <g key={i}>
            <line x1={x + cw / 2} y1={scale(c.h)} x2={x + cw / 2} y2={scale(c.l)} stroke={stroke} strokeWidth="1.5" />
            <rect x={x} y={top} width={cw} height={body} rx="2" fill={fill} />
          </g>
        )
      })}
    </svg>
  )
}

/* ── SOC dashboard ────────────────────────────────────────────── */
const FEED_ROWS = [
  { level: 'CRIT', pair: 'XYZ/USDC', event: 'Price drop -32%',   ts: '00:12:04', color: 'text-aegis-danger' },
  { level: 'WARN', pair: 'ABC/ETH',  event: 'Volatility 18%',     ts: '00:11:59', color: 'text-aegis-warning' },
  { level: 'INFO', pair: 'DEF/USDT', event: 'Audit OK',           ts: '00:11:50', color: 'text-aegis-primary' },
  { level: 'CRIT', pair: 'FOO/WETH', event: 'Flash loan detected', ts: '00:11:42', color: 'text-aegis-danger' },
  { level: 'WARN', pair: 'BAR/USDC', event: 'Volume spike +900%', ts: '00:11:38', color: 'text-aegis-warning' },
]

const TOKEN_ROWS = [
  { sym: 'ETH',  price: '$2,451', chg: '+1.2%',  vol: '$142M', bull: true  },
  { sym: 'WBTC', price: '$62,840', chg: '-0.8%', vol: '$88M',  bull: false },
  { sym: 'USDC', price: '$1.00',  chg: '+0.0%',  vol: '$212M', bull: true  },
  { sym: 'UNI',  price: '$8.24',  chg: '+3.1%',  vol: '$24M',  bull: true  },
]

const AUDIT_ROWS = [
  { contract: '0x742d…bEb', status: 'Clean',    score: 98, color: 'text-aegis-success' },
  { contract: '0xABC1…f0b', status: 'Medium',   score: 74, color: 'text-aegis-warning' },
  { contract: '0xDEF9…a01', status: 'Critical', score: 22, color: 'text-aegis-danger'  },
]

export default function DashboardPreview() {
  return (
    <section className="relative py-24 overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-15" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-aegis-primary/4 rounded-full blur-[140px] pointer-events-none" />

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
            SOC Dashboard
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-5">
            Your{' '}
            <span className="gradient-primary">command center</span>
          </h2>
          <p className="text-lg text-aegis-muted max-w-xl mx-auto">
            A unified security operations center for DeFi — price charts, threat feeds, token analytics, and audit results in one view.
          </p>
        </motion.div>

        {/* Dashboard mockup */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative"
        >
          {/* Outer glow */}
          <div className="absolute -inset-4 bg-gradient-to-r from-aegis-primary/8 via-aegis-secondary/8 to-aegis-primary/8 rounded-3xl blur-2xl pointer-events-none" />

          <div className="relative glass rounded-2xl overflow-hidden border border-aegis-border/50">
            {/* Top bar */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-aegis-border/50 bg-aegis-surface/60">
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-aegis-danger/70" />
                  <div className="w-2.5 h-2.5 rounded-full bg-aegis-warning/70" />
                  <div className="w-2.5 h-2.5 rounded-full bg-aegis-success/70" />
                </div>
                <span className="text-xs font-mono text-aegis-muted">AegisFlow — Security Operations Center</span>
              </div>
              <div className="flex items-center gap-4">
                {[
                  { label: 'ETH', val: '2,451', color: 'text-aegis-success' },
                  { label: 'TPS', val: '12K',   color: 'text-aegis-primary' },
                  { label: 'Alerts', val: '3',  color: 'text-aegis-danger'  },
                ].map((s) => (
                  <div key={s.label} className="flex items-center gap-1.5">
                    <span className="text-[10px] text-aegis-muted font-mono">{s.label}</span>
                    <span className={`text-[11px] font-bold font-mono ${s.color}`}>{s.val}</span>
                  </div>
                ))}
                <div className="flex items-center gap-1.5 bg-aegis-success/10 border border-aegis-success/20 rounded-full px-2.5 py-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-aegis-success live-dot" />
                  <span className="text-[9px] font-mono text-aegis-success font-bold">LIVE</span>
                </div>
              </div>
            </div>

            {/* Main grid */}
            <div className="grid lg:grid-cols-[1.5fr_1fr_1fr] gap-px bg-aegis-border/30">
              {/* ── Left: chart + network ── */}
              <div className="bg-aegis-bg/60 p-4 space-y-4">
                {/* Candlestick */}
                <div className="bg-aegis-card/80 rounded-xl p-3 border border-aegis-border/30">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <span className="text-xs font-bold text-white">ETH / USDC</span>
                      <span className="ml-2 text-xs text-aegis-success">▲ $2,451</span>
                    </div>
                    <div className="flex gap-1">
                      {['1m','5m','1h','1d'].map((t) => (
                        <span key={t} className={`text-[9px] font-mono px-1.5 py-0.5 rounded cursor-pointer ${t === '5m' ? 'bg-aegis-primary/20 text-aegis-primary' : 'text-aegis-muted hover:text-white'}`}>{t}</span>
                      ))}
                    </div>
                  </div>
                  <div className="h-[90px]">
                    <CandlestickChart />
                  </div>
                </div>

                {/* Network status */}
                <div className="bg-aegis-card/80 rounded-xl p-3 border border-aegis-border/30">
                  <div className="text-[10px] font-mono text-aegis-muted uppercase tracking-widest mb-3">Network Status</div>
                  <div className="space-y-2.5">
                    {[
                      { label: 'Ethereum',  status: 'healthy',  latency: '12ms'  },
                      { label: 'Kafka',     status: 'healthy',  latency: '2ms'   },
                      { label: 'Analytics', status: 'healthy',  latency: '8ms'   },
                      { label: 'Slither',   status: 'scanning', latency: '—'     },
                    ].map((n) => (
                      <div key={n.label} className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${n.status === 'healthy' ? 'bg-aegis-success live-dot' : 'bg-aegis-primary animate-pulse'}`} />
                        <span className="text-[10px] font-mono text-aegis-muted flex-1">{n.label}</span>
                        <span className={`text-[9px] font-mono ${n.status === 'healthy' ? 'text-aegis-success' : 'text-aegis-primary'}`}>{n.status}</span>
                        <span className="text-[9px] font-mono text-aegis-muted/50 w-8 text-right">{n.latency}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* ── Middle: security feed + tokens ── */}
              <div className="bg-aegis-bg/60 p-4 space-y-4">
                {/* Security feed */}
                <div className="bg-aegis-card/80 rounded-xl p-3 border border-aegis-border/30">
                  <div className="flex items-center gap-1.5 mb-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-aegis-danger animate-pulse" />
                    <span className="text-[10px] font-mono text-aegis-muted uppercase tracking-widest">Security Feed</span>
                  </div>
                  <div className="space-y-1.5">
                    {FEED_ROWS.map((r, i) => (
                      <div key={i} className="flex items-center gap-2 text-[9px] font-mono">
                        <span className={`shrink-0 font-bold w-7 ${r.color}`}>{r.level}</span>
                        <span className="text-aegis-muted shrink-0 w-14 truncate">{r.pair}</span>
                        <span className="text-white flex-1 truncate">{r.event}</span>
                        <span className="text-aegis-muted/50 shrink-0">{r.ts}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Token analytics */}
                <div className="bg-aegis-card/80 rounded-xl p-3 border border-aegis-border/30">
                  <div className="text-[10px] font-mono text-aegis-muted uppercase tracking-widest mb-3">Token Analytics</div>
                  <div className="space-y-2">
                    <div className="grid grid-cols-4 text-[8px] font-mono text-aegis-muted/60 border-b border-aegis-border/30 pb-1.5 mb-1.5">
                      <span>SYM</span><span>PRICE</span><span>CHG</span><span>VOL</span>
                    </div>
                    {TOKEN_ROWS.map((t, i) => (
                      <div key={i} className="grid grid-cols-4 text-[9px] font-mono">
                        <span className="text-white font-bold">{t.sym}</span>
                        <span className="text-aegis-muted">{t.price}</span>
                        <span className={t.bull ? 'text-aegis-success' : 'text-aegis-danger'}>{t.chg}</span>
                        <span className="text-aegis-muted">{t.vol}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* ── Right: audit results + metrics ── */}
              <div className="bg-aegis-bg/60 p-4 space-y-4">
                {/* Audit results */}
                <div className="bg-aegis-card/80 rounded-xl p-3 border border-aegis-border/30">
                  <div className="flex items-center gap-1.5 mb-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-aegis-success live-dot" />
                    <span className="text-[10px] font-mono text-aegis-muted uppercase tracking-widest">Audit Results</span>
                  </div>
                  <div className="space-y-3">
                    {AUDIT_ROWS.map((a, i) => (
                      <div key={i} className="space-y-1.5">
                        <div className="flex items-center justify-between text-[9px] font-mono">
                          <span className="text-aegis-muted">{a.contract}</span>
                          <span className={`font-bold ${a.color}`}>{a.status}</span>
                        </div>
                        <div className="h-1.5 bg-aegis-surface rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{ width: `${a.score}%`, background: a.score > 80 ? '#00FF85' : a.score > 50 ? '#F59E0B' : '#FF4D6D' }}
                          />
                        </div>
                        <div className="text-[8px] font-mono text-aegis-muted/50">Score: {a.score}/100</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Live metrics mini */}
                <div className="bg-aegis-card/80 rounded-xl p-3 border border-aegis-border/30">
                  <div className="text-[10px] font-mono text-aegis-muted uppercase tracking-widest mb-3">Live Metrics</div>
                  <div className="space-y-2">
                    {[
                      { label: 'Events/sec',  val: '12,451', color: 'text-aegis-primary' },
                      { label: 'Alerts today', val: '1,843',  color: 'text-aegis-danger'  },
                      { label: 'Audits/hr',    val: '47',     color: 'text-aegis-success' },
                      { label: 'Kafka lag',    val: '2ms',    color: 'text-aegis-warning' },
                    ].map((m) => (
                      <div key={m.label} className="flex items-center justify-between text-[9px] font-mono">
                        <span className="text-aegis-muted">{m.label}</span>
                        <span className={`font-bold ${m.color}`}>{m.val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
