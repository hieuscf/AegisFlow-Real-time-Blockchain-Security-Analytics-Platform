import { useEffect, useRef, useState } from 'react';
import {
  createChart,
  LineSeries,
  CrosshairMode,
  LastPriceAnimationMode,
  type IChartApi,
  type ISeriesApi,
  type Time,
} from 'lightweight-charts';
import { Activity } from 'lucide-react';
import { cn } from '@/lib/utils';
import { shortenAddress } from '@/lib/format';
import { useWebSocketStore } from '@/store';
import type { PriceUpdatePayload } from '@/types/blockchain';

const C = {
  bg: '#0B1120',
  border: '#1A2840',
  text: '#94A3B8',
  price: '#00E5FF',
  ma: '#7C3AED',
  grid: '#1A2840',
} as const;

function toSec(iso: string): number {
  return Math.floor(new Date(iso).getTime() / 1000);
}

function dedupeBySecond(updates: PriceUpdatePayload[]): PriceUpdatePayload[] {
  const map = new Map<number, PriceUpdatePayload>();
  for (const u of updates) {
    map.set(toSec(u.timestamp), u);
  }
  return Array.from(map.values()).sort((a, b) => toSec(a.timestamp) - toSec(b.timestamp));
}

function getUniqueTokens(updates: PriceUpdatePayload[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const u of updates) {
    if (!seen.has(u.tokenAddress)) {
      seen.add(u.tokenAddress);
      result.push(u.tokenAddress);
    }
  }
  return result;
}

export function RealtimeChart() {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const priceSerRef = useRef<ISeriesApi<'Line'> | null>(null);
  const maSerRef = useRef<ISeriesApi<'Line'> | null>(null);

  const priceUpdates = useWebSocketStore((s) => s.priceUpdates);
  const [selectedToken, setSelectedToken] = useState<string | null>(null);

  const allTokens = getUniqueTokens(priceUpdates);
  const activeToken = selectedToken ?? allTokens[0] ?? null;

  const filteredRaw = activeToken
    ? priceUpdates.filter((u) => u.tokenAddress === activeToken)
    : [];
  const deduped = dedupeBySecond([...filteredRaw].reverse());

  // Init chart once container is available
  useEffect(() => {
    const el = containerRef.current;
    if (!el || chartRef.current) return;

    const chart = createChart(el, {
      layout: {
        background: { color: C.bg },
        textColor: C.text,
        fontSize: 11,
      },
      grid: {
        vertLines: { color: C.grid, style: 1 },
        horzLines: { color: C.grid, style: 1 },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: { color: C.border, width: 1, labelBackgroundColor: C.bg },
        horzLine: { color: C.border, width: 1, labelBackgroundColor: C.bg },
      },
      rightPriceScale: { borderColor: C.border },
      timeScale: {
        borderColor: C.border,
        timeVisible: true,
        secondsVisible: true,
        rightOffset: 5,
      },
      width: el.clientWidth,
      height: el.clientHeight || 300,
    });

    priceSerRef.current = chart.addSeries(LineSeries, {
      color: C.price,
      lineWidth: 2,
      title: 'Price',
      lastPriceAnimation: LastPriceAnimationMode.Continuous,
      priceLineVisible: true,
      priceLineColor: C.price,
      crosshairMarkerVisible: true,
      crosshairMarkerRadius: 4,
    });

    maSerRef.current = chart.addSeries(LineSeries, {
      color: C.ma,
      lineWidth: 1,
      lineStyle: 1,
      title: 'MA',
      lastPriceAnimation: LastPriceAnimationMode.Disabled,
      priceLineVisible: false,
      crosshairMarkerVisible: false,
    });

    chartRef.current = chart;

    const ro = new ResizeObserver(() => {
      if (el && chartRef.current) {
        chartRef.current.applyOptions({
          width: el.clientWidth,
          height: el.clientHeight || 300,
        });
      }
    });
    ro.observe(el);

    return () => {
      ro.disconnect();
      chartRef.current?.remove();
      chartRef.current = null;
      priceSerRef.current = null;
      maSerRef.current = null;
    };
  }, []);

  // Push data whenever filtered set changes
  useEffect(() => {
    if (!priceSerRef.current || !maSerRef.current) return;

    if (deduped.length === 0) {
      priceSerRef.current.setData([]);
      maSerRef.current.setData([]);
      return;
    }

    priceSerRef.current.setData(
      deduped.map((u) => ({ time: toSec(u.timestamp) as Time, value: u.price })),
    );
    maSerRef.current.setData(
      deduped.map((u) => ({ time: toSec(u.timestamp) as Time, value: u.movingAverage })),
    );

    chartRef.current?.timeScale().scrollToRealTime();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deduped.length, activeToken]);

  const latest = deduped.at(-1);
  const hasData = deduped.length > 0;

  return (
    <div className="flex min-h-0 flex-col overflow-hidden rounded-xl border border-aegis-border bg-aegis-surface">
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-aegis-border px-4 py-3">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-aegis-primary" />
          <span className="text-sm font-semibold">Realtime Price</span>
          {latest && (
            <span className="font-mono text-sm font-bold text-aegis-primary">
              ${latest.price.toFixed(6)}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Legend */}
          <div className="hidden items-center gap-3 text-xs sm:flex">
            <span className="flex items-center gap-1.5">
              <span className="h-0.5 w-4 rounded bg-aegis-primary" />
              <span className="text-aegis-muted">Price</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-0.5 w-4 rounded bg-aegis-secondary" />
              <span className="text-aegis-muted">MA</span>
            </span>
          </div>

          {/* Token chips */}
          {allTokens.length > 0 && (
            <div className="flex items-center gap-1">
              {allTokens.slice(0, 3).map((addr) => (
                <button
                  key={addr}
                  type="button"
                  onClick={() => setSelectedToken(addr)}
                  className={cn(
                    'rounded-full px-2 py-0.5 font-mono text-[10px] font-medium transition-colors',
                    activeToken === addr
                      ? 'bg-aegis-primary/20 text-aegis-primary'
                      : 'bg-aegis-elevated text-aegis-muted hover:text-foreground',
                  )}
                >
                  {shortenAddress(addr, 3)}
                </button>
              ))}
              {allTokens.length > 3 && (
                <span className="text-xs text-aegis-muted">+{allTokens.length - 3}</span>
              )}
            </div>
          )}

          <span className="text-xs text-aegis-muted">{deduped.length} pts</span>
        </div>
      </div>

      {/* Chart area — container always mounted so chart can init */}
      <div className="relative min-h-0 flex-1">
        <div ref={containerRef} className="absolute inset-0" />

        {/* Empty overlay */}
        {!hasData && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-aegis-border bg-aegis-elevated">
              <Activity className="h-5 w-5 text-aegis-muted/50" />
            </div>
            <div>
              <p className="text-sm font-medium text-aegis-muted">Waiting for price data…</p>
              <p className="mt-0.5 text-xs text-aegis-muted/60">
                Price updates stream in as swaps are detected
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
