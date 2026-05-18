import { AlertTriangle, Info, ShieldAlert } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import type { AlertLevel, SecurityAlert } from '@/types/alert';

interface LiveFeedProps {
  alerts: SecurityAlert[];
}

const levelStyles: Record<AlertLevel, string> = {
  INFO: 'border-aegis-info/40 bg-aegis-info/10 text-aegis-info',
  WARNING: 'border-aegis-warning/40 bg-aegis-warning/10 text-aegis-warning',
  CRITICAL: 'border-aegis-critical/40 bg-aegis-critical/10 text-aegis-critical animate-pulse',
};

const levelIcons = {
  INFO: Info,
  WARNING: AlertTriangle,
  CRITICAL: ShieldAlert,
} as const;

export function LiveFeed({ alerts }: LiveFeedProps) {
  return (
    <Card title="Security Feed" className="flex h-full min-h-[420px] flex-col">
      <ul className="flex flex-1 flex-col gap-2 overflow-y-auto pr-1">
        {alerts.length === 0 ? (
          <li className="rounded-lg border border-dashed border-aegis-border p-6 text-center text-sm text-slate-500">
            Waiting for realtime alerts…
          </li>
        ) : (
          alerts.map((alert) => {
            const Icon = levelIcons[alert.level];
            return (
              <li
                key={alert.id}
                className={`rounded-lg border px-3 py-2 ${levelStyles[alert.level]}`}
              >
                <div className="flex items-start gap-2">
                  <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold uppercase tracking-wide">{alert.level}</p>
                    <p className="text-sm font-medium text-slate-100">{alert.title}</p>
                    <p className="mt-1 text-xs text-slate-400">{alert.message}</p>
                    <p className="mt-1 font-mono text-[10px] text-slate-500">
                      {new Date(alert.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </li>
            );
          })
        )}
      </ul>
    </Card>
  );
}
