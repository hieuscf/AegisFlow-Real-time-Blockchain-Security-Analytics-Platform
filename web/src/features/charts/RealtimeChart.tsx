import { LineChart, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface RealtimeChartProps {
  className?: string;
}

export function RealtimeChart({ className }: RealtimeChartProps) {
  return (
    <Card data-animate className={cn('flex min-h-[380px] flex-col lg:min-h-[480px]', className)}>
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <div>
            <CardTitle>Realtime Chart</CardTitle>
            <CardDescription>Live market candles via WebSocket</CardDescription>
          </div>
          <TrendingUp className="h-5 w-5 text-aegis-mint" aria-hidden />
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col">
        <div className="flex flex-1 flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-aegis-border bg-aegis-bg/80 p-8 text-center">
          <LineChart className="h-12 w-12 text-aegis-mint/80" aria-hidden />
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">
              TradingView Lightweight Charts integration point
            </p>
            <p className="font-mono text-xs text-muted-foreground/80">
              chart.update() on incoming price events
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
