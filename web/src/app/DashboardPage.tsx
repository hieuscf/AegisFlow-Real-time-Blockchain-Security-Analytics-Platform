import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useWebSocketConnection } from '@/hooks';

export function DashboardPage() {
  useWebSocketConnection();

  return (
    <DashboardLayout>
      <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
        Dashboard content
      </div>
    </DashboardLayout>
  );
}
