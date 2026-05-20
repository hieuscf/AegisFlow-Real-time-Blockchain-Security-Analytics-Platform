import { AlertTriangle, Info, ShieldAlert } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { AlertLevel, SecurityAlert } from '@/types/alert';
import { cn } from '@/lib/utils';

interface SecurityFeedProps {
  alerts: SecurityAlert[];
  className?: string;
}

const levelStyles: Record<AlertLevel, string> = {
  INFO: 'border-aegis-border bg-aegis-elevated text-aegis-mint',
  WARNING: 'border-aegis-warning/40 bg-aegis-warning/10 text-aegis-warning',
  CRITICAL:
    'border-aegis-negative/40 bg-aegis-negative/10 text-aegis-negative animate-pulse-critical',
};

const levelIcons = {
  INFO: Info,
  WARNING: AlertTriangle,
  CRITICAL: ShieldAlert,
} as const;

export function SecurityFeed({ alerts, className }: SecurityFeedProps) {
  return (
    <Card data-animate className={cn('flex min-h-[380px] flex-col lg:min-h-[480px]', className)}>
      <CardHeader>
        <CardTitle>Security Feed</CardTitle>
        <CardDescription>Realtime alerts from analytics pipeline</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col overflow-hidden">
        <ul className="flex flex-1 flex-col gap-2 overflow-y-auto pr-1">
          {alerts.length === 0 ? (
            <li className="rounded-lg border border-dashed border-aegis-border p-8 text-center text-sm text-muted-foreground">
              Waiting for realtime alerts…
            </li>
          ) : (
            alerts.map((alert) => {
              const Icon = levelIcons[alert.level];
              return (
                <li
                  key={alert.id}
                  className={cn('rounded-lg border px-3 py-2.5', levelStyles[alert.level])}
                >
                  <div className="flex items-start gap-2">
                    <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold uppercase tracking-wide">
                        {alert.level}
                      </p>
                      <p className="text-sm font-medium text-foreground">{alert.title}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{alert.message}</p>
                      <p className="mt-1 font-mono text-[10px] text-muted-foreground/80">
                        {new Date(alert.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </li>
              );
            })
          )}
        </ul>
      </CardContent>
    </Card>
  );
}
