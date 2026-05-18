import { LineChart } from 'lucide-react';
import { Card } from '@/components/ui/Card';

export function ChartPanel() {
  return (
    <Card title="Realtime Chart" className="flex min-h-[420px] flex-col">
      <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-aegis-border bg-aegis-bg/50 p-8 text-center">
        <LineChart className="h-10 w-10 text-aegis-accent" aria-hidden />
        <p className="text-sm text-slate-400">
          TradingView Lightweight Charts will render live candles here.
        </p>
        <p className="font-mono text-xs text-slate-500">@tradingview/lightweight-charts — coming next</p>
      </div>
    </Card>
  );
}
