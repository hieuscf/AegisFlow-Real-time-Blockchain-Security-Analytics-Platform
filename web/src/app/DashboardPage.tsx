import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { SecurityFeed } from '@/features/alerts/SecurityFeed';
import { RealtimeChart } from '@/features/charts/RealtimeChart';
import { useWebSocketConnection } from '@/hooks';
import { useWebSocketStore } from '@/store';
import type { SecurityAlert } from '@/types/alert';

const seedAlerts: SecurityAlert[] = [
  {
    id: 'seed-1',
    level: 'INFO',
    type: 'PRICE_UPDATE',
    title: 'Market stable',
    message: 'Token price within normal range.',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'seed-2',
    level: 'WARNING',
    type: 'PRICE_ANOMALY',
    title: 'Unusual volatility',
    message: 'Price dropped 35% below moving average.',
    tokenAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
    createdAt: new Date().toISOString(),
  },
];

export function DashboardPage() {
  useWebSocketConnection();

  const alerts = useWebSocketStore((s) => s.alerts);
  const displayAlerts = alerts.length > 0 ? alerts : seedAlerts;

  return (
    <DashboardLayout>
      <RealtimeChart />
      <SecurityFeed alerts={displayAlerts} />
    </DashboardLayout>
  );
}
