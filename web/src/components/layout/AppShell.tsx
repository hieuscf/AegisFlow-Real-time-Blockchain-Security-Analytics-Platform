import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';

import { useWebSocketConnection } from '@/hooks/useWebSocketConnection';
import { AppLayout } from './AppLayout';
import { DashboardLayout } from './DashboardLayout';

function PageFallback() {
  return (
    <div className="flex flex-1 items-center justify-center py-24">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-aegis-primary/30 border-t-aegis-primary" />
    </div>
  );
}

/**
 * Shared shell for dashboard routes — keeps WebSocket alive across navigations.
 */
export function AppShell() {
  useWebSocketConnection();

  return (
    <AppLayout>
      <DashboardLayout>
        <Suspense fallback={<PageFallback />}>
          <Outlet />
        </Suspense>
      </DashboardLayout>
    </AppLayout>
  );
}
