import { Routes, Route } from 'react-router-dom';
import { AppLayout }      from '@/components/layout/AppLayout';
import { DashboardPage }  from '@/app/DashboardPage';
import { AnalyticsPage }  from '@/app/AnalyticsPage';
import { LandingPage }    from '@/features/landing';
import { Web3Provider }   from '@/providers/Web3Provider';

function AppRoute({ children }: { children: React.ReactNode }) {
  return (
    <Web3Provider>
      <AppLayout>{children}</AppLayout>
    </Web3Provider>
  );
}

export function App() {
  return (
    <Routes>
      <Route path="/"          element={<LandingPage />} />
      <Route path="/dashboard" element={<AppRoute><DashboardPage /></AppRoute>} />
      <Route path="/analytics" element={<AppRoute><AnalyticsPage /></AppRoute>} />
    </Routes>
  );
}
