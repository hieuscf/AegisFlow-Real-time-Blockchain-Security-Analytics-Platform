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
const WalletPage = lazy(() =>
  import('@/app/WalletPage').then((m) => ({ default: m.WalletPage })),
);
const SecurityPage = lazy(() =>
  import('@/app/SecurityPage').then((m) => ({ default: m.SecurityPage })),
);

export function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route element={<AppShell />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/alerts" element={<AlertsPage />} />
        <Route path="/wallet" element={<WalletPage />} />
        <Route path="/security" element={<SecurityPage />} />
      </Route>
    </Routes>
  );
}
