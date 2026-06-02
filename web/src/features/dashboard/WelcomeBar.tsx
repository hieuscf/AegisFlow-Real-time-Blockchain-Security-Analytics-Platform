import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useWebSocketStore } from '@/store';

const THREAT_LEVELS = [
  { min: 0,  max: 0,  label: 'All Clear',     color: '#00FF85', bg: 'rgba(0,255,133,0.08)',  border: 'rgba(0,255,133,0.25)' },
  { min: 1,  max: 2,  label: 'Low',           color: '#00E5FF', bg: 'rgba(0,229,255,0.08)',  border: 'rgba(0,229,255,0.25)' },
  { min: 3,  max: 5,  label: 'Moderate',      color: '#F59E0B', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.25)' },
  { min: 6,  max: Infinity, label: 'High',    color: '#FF4D6D', bg: 'rgba(255,77,109,0.10)', border: 'rgba(255,77,109,0.30)' },
] as const;

function getThreatLevel(criticalCount: number) {
  return THREAT_LEVELS.find((t) => criticalCount >= t.min && criticalCount <= t.max) ?? THREAT_LEVELS[0];
}

function LiveClock() {
  const [time, setTime] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <span className="font-mono text-xs tabular-nums text-aegis-muted">
      {time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
      {' · '}
      {time.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
    </span>
  );
}

export function WelcomeBar() {
  const alerts       = useWebSocketStore((s) => s.alerts);
  const criticalCount= alerts.filter((a) => a.level === 'CRITICAL').length;
  const level        = getThreatLevel(criticalCount);

  return (
    <motion.div
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="flex flex-wrap items-center justify-between gap-4"
    >
      {/* Left */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Security{' '}
          <span className="gradient-text">Intelligence</span>
          {' '}Center
        </h1>
        <div className="mt-1 flex items-center gap-3">
          <LiveClock />
          <span className="text-aegis-muted/40">·</span>
          <span className="text-xs text-aegis-muted">Ethereum Mainnet</span>
        </div>
      </div>

      {/* Threat level */}
      <motion.div
        key={level.label}
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className={cn('flex items-center gap-2.5 rounded-2xl border px-4 py-2.5')}
        style={{ background: level.bg, borderColor: level.border }}
      >
        <div
          className="relative flex h-2.5 w-2.5 items-center justify-center"
        >
          <span
            className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"
            style={{ backgroundColor: level.color }}
          />
          <span
            className="relative inline-flex h-2 w-2 rounded-full"
            style={{ backgroundColor: level.color }}
          />
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: level.color }}>
            Threat Level
          </p>
          <p className="text-sm font-bold text-white">{level.label}</p>
        </div>
      </motion.div>
    </motion.div>
  );
}
