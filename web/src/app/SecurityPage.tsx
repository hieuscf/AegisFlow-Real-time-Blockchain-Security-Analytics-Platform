import { motion } from 'framer-motion';
import { ArrowRight, FileSearch, Scan, Shield, ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';

import { cn } from '@/lib/utils';
import { useWebSocketStore } from '@/store';

const AUDIT_PIPELINE = [
  {
    step: '1',
    title: 'Anomaly detected',
    desc: 'Price drop exceeds ANOMALY_DROP_THRESHOLD vs moving average.',
  },
  {
    step: '2',
    title: 'Audit triggered',
    desc: 'Analytics pipeline calls runContractAudit(token contract).',
  },
  {
    step: '3',
    title: 'Slither scan',
    desc: 'CLI when SLITHER_ENABLED=true; mock JSON report otherwise.',
  },
  {
    step: '4',
    title: 'Alert broadcast',
    desc: 'CRITICAL_ALERT + audit summary over Socket.IO security-feed.',
  },
] as const;

const PLANNED_FEATURES = [
  'On-demand contract scans from dashboard',
  'Audit history table (PostgreSQL audit_results)',
  'Severity breakdown from Slither JSON output',
  'Exportable PDF / JSON reports',
] as const;

export function SecurityPage() {
  const criticalCount = useWebSocketStore((s) =>
    s.alerts.filter((a) => a.level === 'CRITICAL').length,
  );

  return (
    <div className="flex flex-col gap-6 px-5 pb-8 pt-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Shield className="h-6 w-6 text-aegis-warning" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Security</h1>
            <p className="text-xs text-aegis-muted/60">
              Smart contract auditing · Slither integration · threat monitoring
            </p>
          </div>
        </div>
        <Link
          to="/alerts"
          className="flex items-center gap-2 rounded-xl border border-aegis-danger/30 bg-aegis-danger/8 px-3 py-2 text-xs font-medium text-aegis-danger transition-colors hover:bg-aegis-danger/12"
        >
          <ShieldAlert className="h-3.5 w-3.5" />
          View alerts
          {criticalCount > 0 && (
            <span className="rounded-full bg-aegis-danger px-1.5 py-0.5 text-[10px] font-bold text-white">
              {criticalCount}
            </span>
          )}
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: 'Auditor', value: 'Slither', sub: 'Wrapper + mock fallback', accent: '#F59E0B', ok: false },
          { label: 'Live mode', value: 'Disabled', sub: 'Set SLITHER_ENABLED=true on server', accent: '#FF4D6D', ok: false },
          { label: 'Session threats', value: criticalCount, sub: 'CRITICAL alerts this session', accent: '#FF4D6D', ok: criticalCount === 0 },
        ].map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="card-gradient-border rounded-2xl p-4"
          >
            <p className="text-[10px] font-semibold uppercase tracking-widest text-aegis-muted">
              {card.label}
            </p>
            <p className="mt-1 text-2xl font-bold tabular-nums" style={{ color: card.accent }}>
              {card.value}
            </p>
            <p className="mt-1 text-[11px] text-aegis-muted/60">{card.sub}</p>
            <span
              className={cn(
                'mt-3 inline-flex rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider',
                card.ok
                  ? 'border-aegis-success/25 bg-aegis-success/8 text-aegis-success'
                  : 'border-aegis-muted/20 bg-aegis-muted/5 text-aegis-muted/60',
              )}
            >
              {card.ok ? 'OK' : 'MVP stub'}
            </span>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="card-gradient-border rounded-2xl p-5">
          <div className="mb-4 flex items-center gap-2">
            <Scan className="h-4 w-4 text-aegis-warning" />
            <h2 className="text-sm font-semibold text-white">Automated audit pipeline</h2>
          </div>
          <ol className="space-y-3">
            {AUDIT_PIPELINE.map((item, i) => (
              <motion.li
                key={item.step}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + i * 0.05 }}
                className="flex gap-3 rounded-xl border border-white/5 bg-white/2 px-4 py-3"
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-aegis-warning/15 text-[11px] font-bold text-aegis-warning">
                  {item.step}
                </span>
                <div>
                  <p className="text-xs font-medium text-white">{item.title}</p>
                  <p className="mt-0.5 text-[11px] text-aegis-muted/70">{item.desc}</p>
                </div>
              </motion.li>
            ))}
          </ol>
        </section>

        <section className="card-gradient-border rounded-2xl p-5">
          <div className="mb-4 flex items-center gap-2">
            <FileSearch className="h-4 w-4 text-aegis-primary" />
            <h2 className="text-sm font-semibold text-white">Coming next</h2>
          </div>
          <ul className="space-y-2">
            {PLANNED_FEATURES.map((feature) => (
              <li
                key={feature}
                className="flex items-start gap-2 text-xs text-aegis-muted/80"
              >
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-aegis-primary/60" />
                {feature}
              </li>
            ))}
          </ul>
          <p className="mt-4 rounded-xl border border-aegis-border/30 bg-white/2 px-4 py-3 text-[11px] leading-relaxed text-aegis-muted/60">
            Audit results are persisted to PostgreSQL when the database is available.
            Enable live Slither on the analytics service to replace mock reports with real scans.
          </p>
        </section>
      </div>
    </div>
  );
}
