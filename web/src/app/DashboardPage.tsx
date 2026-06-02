import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { WelcomeBar }      from '@/features/dashboard/WelcomeBar';
import { KpiCards }        from '@/features/dashboard/KpiCards';
import { AnalyticsGrid }   from '@/features/dashboard/AnalyticsGrid';
import { RealtimeChart }   from '@/features/charts/RealtimeChart';
import { SecurityFeed }    from '@/features/alerts/SecurityFeed';
import { useWebSocketConnection } from '@/hooks';

export function DashboardPage() {
  useWebSocketConnection();

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 px-5 pb-8 pt-2">

        {/* Welcome + threat level */}
        <WelcomeBar />

        {/* KPI row */}
        <KpiCards />

        {/* Main: chart + threat feed */}
        <div className="grid min-h-0 gap-5 lg:grid-cols-[1.5fr_1fr]" style={{ minHeight: '480px' }}>
          <RealtimeChart />
          <SecurityFeed />
        </div>

        {/* Analytics grid */}
        <AnalyticsGrid />

      </div>
    </DashboardLayout>
  );
}
