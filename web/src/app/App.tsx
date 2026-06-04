import { lazy } from 'react';
import { Route, Routes } from 'react-router-dom';

import { AppShell } from '@/components/layout/AppShell';
import { LandingPage } from '@/features/landing';

const DashboardPage = lazy(() =>
  import('@/app/DashboardPage').then((m) => ({ default: m.DashboardPage })),
);
const AnalyticsPage = lazy(() =>
  import('@/app/AnalyticsPage').then((m) => ({ default: m.AnalyticsPage })),
);
const AlertsPage = lazy(() =>
  import('@/app/AlertsPage').then((m) => ({ default: m.AlertsPage })),
);

export function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route element={<AppShell />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/alerts" element={<AlertsPage />} />
      </Route>
    </Routes>
  );
}
