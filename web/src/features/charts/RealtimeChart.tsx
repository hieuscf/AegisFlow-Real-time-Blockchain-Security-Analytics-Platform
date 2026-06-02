import { useEffect, useRef, useState } from 'react';
import {
  createChart,
  AreaSeries,
  LineSeries,
  CrosshairMode,
  LastPriceAnimationMode,
  type IChartApi,
  type ISeriesApi,
  type Time,
} from 'lightweight-charts';
import { motion } from 'framer-motion';
import { Activity, Maximize2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { shortenAddress } from '@/lib/format';
import { useWebSocketStore } from '@/store';
import type { PriceUpdatePayload } from '@/types/blockchain';

const TIME_FILTERS = ['1m', '5m', '1h', 'ALL'] as const;
type TimeFilter = (typeof TIME_FILTERS)[number];

function filterByTime(updates: PriceUpdatePayload[], tf: TimeFilter): PriceUpdatePayload[] {
  if (tf === 'ALL') return updates;
  const minutes = tf === '1m' ? 1 : tf === '5m' ? 5 : 60;
  const cutoff  = Date.now() - minutes * 60 * 1000;
  return updates.filter((u) => new Date(u.timestamp).getTime() >= cutoff);
}

function toSec(iso: string): number {
  return Math.floor(new Date(iso).getTime() / 1000);
}

function dedupeBySecond(updates: PriceUpdatePayload[]): PriceUpdatePayload[] {
  const map = new Map<number, PriceUpdatePayload>();
  for (const u of updates) map.set(toSec(u.timestamp), u);
  return Array.from(map.values()).sort((a, b) => toSec(a.timestamp) - toSec(b.timestamp));
}

function getUniqueTokens(updates: PriceUpdatePayload[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const u of updates) {
    if (!seen.has(u.tokenAddress)) { seen.add(u.tokenAddress); out.push(u.tokenAddress); }
  }
  return out;
}

/* ── Empty state ─────────────────────────────────────────────────── */
function EmptyState() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/8 bg-white/3">
        <Activity className="h-6 w-6 text-aegis-primary/40" />
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-aegis-muted">Awaiting price stream…</p>
        <p className="mt-1 text-xs text-aegis-muted/50">
          Price data will appear as swaps are detected
        </p>
      </div>
      {/* Scanning line */}
      <div className="relative h-px w-32 overflow-hidden rounded-full bg-aegis-border/30">
        <motion.div
          className="absolute inset-y-0 w-16 rounded-full"
          style={{ background: 'linear-gradient(90deg, transparent, #00E5FF, transparent)' }}
          animate={{ x: ['-100%', '200%'] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>
    </div>
  );
}

/* ── Chart component ─────────────────────────────────────────────── */
export function RealtimeChart() {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef     = useRef<IChartApi | null>(null);
  const areaRef      = useRef<ISeriesApi<'Area'> | null>(null);
  const maRef        = useRef<ISeriesApi<'Line'> | null>(null);

  const priceUpdates = useWebSocketStore((s) => s.priceUpdates);

  const [selectedToken, setSelectedToken] = useState<string | null>(null);
  const [timeFilter,    setTimeFilter]    = useState<TimeFilter>('ALL');

  const allTokens  = getUniqueTokens(priceUpdates);
  const activeToken= selectedToken ?? allTokens[0] ?? null;

  const raw     = activeToken ? priceUpdates.filter((u) => u.tokenAddress === activeToken) : [];
  const inWindow= filterByTime([...raw].reverse(), timeFilter);
  const deduped = dedupeBySecond(inWindow);

  const latest = deduped.at(-1);
  const prev   = deduped.at(-2);
  const delta  = latest && prev ? ((latest.price - prev.price) / prev.price) * 100 : 0;
  const isUp   = delta >= 0;

  /* ── Init chart ─── */
  useEffect(() => {
    const el = containerRef.current;
    if (!el || chartRef.current) return;

    const chart = createChart(el, {
      layout: {
        background:  { color: 'transparent' },
        textColor:   '#94A3B8',
        fontSize:    11,
      },
      grid: {
        vertLines: { color: 'rgba(26,40,64,0.35)', style: 1 },
        horzLines: { color: 'rgba(26,40,64,0.35)', style: 1 },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: { color: 'rgba(0,229,255,0.3)', width: 1, labelBackgroundColor: '#0b1428' },
        horzLine: { color: 'rgba(0,229,255,0.3)', width: 1, labelBackgroundColor: '#0b1428' },
      },
      rightPriceScale: { borderColor: 'rgba(26,40,64,0.4)' },
      timeScale: {
        borderColor: 'rgba(26,40,64,0.4)',
        timeVisible: true,
        secondsVisible: true,
        rightOffset: 8,
      },
      width:  el.clientWidth,
      height: el.clientHeight || 340,
    });

    areaRef.current = chart.addSeries(AreaSeries, {
      lineColor:              '#00E5FF',
      topColor:               'rgba(0,229,255,0.22)',
      bottomColor:            'rgba(0,229,255,0)',
      lineWidth:              2,
      title:                  'Price',
      lastPriceAnimation:     LastPriceAnimationMode.Continuous,
      priceLineColor:         '#00E5FF',
      crosshairMarkerVisible: true,
      crosshairMarkerRadius:  5,
      crosshairMarkerBorderColor: '#00E5FF',
      crosshairMarkerBackgroundColor: '#020817',
    });

    maRef.current = chart.addSeries(LineSeries, {
      color:                  'rgba(124,58,237,0.7)',
      lineWidth:              1,
      lineStyle:              2,
      title:                  'MA',
      lastPriceAnimation:     LastPriceAnimationMode.Disabled,
      priceLineVisible:       false,
      crosshairMarkerVisible: false,
    });

    chartRef.current = chart;

    const ro = new ResizeObserver(() => {
      if (el && chartRef.current) {
        chartRef.current.applyOptions({
          width:  el.clientWidth,
          height: el.clientHeight || 340,
        });
      }
    });
    ro.observe(el);

    return () => {
      ro.disconnect();
      chartRef.current?.remove();
      chartRef.current = null;
      areaRef.current  = null;
      maRef.current    = null;
    };
  }, []);

  /* ── Push data ─── */
  useEffect(() => {
    if (!areaRef.current || !maRef.current) return;

    if (deduped.length === 0) {
      areaRef.current.setData([]);
      maRef.current.setData([]);
      return;
    }

    areaRef.current.setData(
      deduped.map((u) => ({ time: toSec(u.timestamp) as Time, value: u.price })),
    );
    maRef.current.setData(
      deduped.map((u) => ({ time: toSec(u.timestamp) as Time, value: u.movingAverage })),
    );

    chartRef.current?.timeScale().scrollToRealTime();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deduped.length, activeToken, timeFilter]);

  const hasData = deduped.length > 0;

  return (
    <div className="card-gradient-border flex min-h-0 flex-col overflow-hidden rounded-2xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/6 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-aegis-primary/10">
            <Activity className="h-4 w-4 text-aegis-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Price Intelligence</p>
            {latest && (
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-aegis-primary">
                  ${latest.price.toFixed(6)}
                </span>
                <span className={cn('text-[10px] font-bold', isUp ? 'text-aegis-success' : 'text-aegis-danger')}>
                  {isUp ? '▲' : '▼'} {Math.abs(delta).toFixed(3)}%
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Legend */}
          <div className="hidden items-center gap-3 sm:flex">
            <span className="flex items-center gap-1.5 text-[10px] text-aegis-muted">
              <span className="h-0.5 w-4 rounded bg-aegis-primary" />
              Price
            </span>
            <span className="flex items-center gap-1.5 text-[10px] text-aegis-muted">
              <span className="h-0.5 w-4 rounded bg-aegis-secondary/70" style={{ borderBottom: '1px dashed #7C3AED' }} />
              MA
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
                    'rounded-lg border px-2 py-0.5 font-mono text-[10px] font-medium transition-all',
                    activeToken === addr
                      ? 'border-aegis-primary/30 bg-aegis-primary/10 text-aegis-primary'
                      : 'border-white/8 bg-white/4 text-aegis-muted hover:text-foreground',
                  )}
                >
                  {shortenAddress(addr, 3)}
                </button>
              ))}
            </div>
          )}

          {/* Time filters */}
          <div className="flex items-center gap-0.5 rounded-xl border border-white/8 bg-white/3 p-0.5">
            {TIME_FILTERS.map((tf) => (
              <button
                key={tf}
                type="button"
                onClick={() => setTimeFilter(tf)}
                className={cn(
                  'rounded-lg px-2 py-0.5 text-[10px] font-medium transition-all',
                  timeFilter === tf
                    ? 'bg-aegis-primary/15 text-aegis-primary'
                    : 'text-aegis-muted/60 hover:text-aegis-muted',
                )}
              >
                {tf}
              </button>
            ))}
          </div>

          <button
            type="button"
            className="rounded-lg p-1.5 text-aegis-muted/40 transition-colors hover:text-aegis-muted"
          >
            <Maximize2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Chart */}
      <div className="relative min-h-0 flex-1" style={{ minHeight: '300px' }}>
        <div ref={containerRef} className="absolute inset-0" />
        {!hasData && <EmptyState />}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-white/6 px-5 py-2">
        <span className="text-[10px] text-aegis-muted/50">{deduped.length} data points</span>
        {latest && (
          <span className="text-[10px] text-aegis-muted/50">
            MA: <span className="font-mono text-aegis-secondary">${latest.movingAverage.toFixed(6)}</span>
          </span>
        )}
      </div>
    </div>
  );
}
