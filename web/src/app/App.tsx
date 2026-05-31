import { Routes, Route } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { DashboardPage } from '@/app/DashboardPage';
import { LandingPage } from '@/features/landing';
import { Web3Provider } from '@/providers/Web3Provider';

function DashboardRoute() {
  return (
    <Web3Provider>
      <AppLayout>
        <DashboardPage />
      </AppLayout>
    </Web3Provider>
  );
}

export function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/dashboard" element={<DashboardRoute />} />
    </Routes>
  );
}
