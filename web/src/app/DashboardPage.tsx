import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { RealtimeChart } from '@/features/charts/RealtimeChart';
import { SecurityFeed } from '@/features/alerts/SecurityFeed';
import { useWebSocketConnection } from '@/hooks';

export function DashboardPage() {
  useWebSocketConnection();

  return (
    <DashboardLayout>
      <div className="grid h-full min-h-0 gap-4 p-4 lg:grid-cols-[1.4fr_1fr]">
        <RealtimeChart />
        <SecurityFeed />
      </div>
    </DashboardLayout>
  );
}
