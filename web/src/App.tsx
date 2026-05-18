import { DashboardHeader } from '@/components/DashboardHeader';
import { ChartPanel } from '@/components/ChartPanel';
import { LiveFeed } from '@/components/LiveFeed';
import type { SecurityAlert } from '@/types/alert';

const demoAlerts: SecurityAlert[] = [
  {
    id: '1',
    level: 'INFO',
    type: 'PRICE_UPDATE',
    title: 'Market stable',
    message: 'Token price within normal range.',
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    level: 'WARNING',
    type: 'PRICE_ANOMALY',
    title: 'Unusual volatility',
    message: 'Price dropped 35% below moving average.',
    tokenAddress: '0x…',
    createdAt: new Date().toISOString(),
  },
];

function App() {
  return (
    <div className="mx-auto flex min-h-full max-w-7xl flex-col gap-6 p-4 md:p-6">
      <DashboardHeader />

      <main className="grid flex-1 gap-4 lg:grid-cols-[1.4fr_1fr]">
        <ChartPanel />
        <LiveFeed alerts={demoAlerts} />
      </main>
    </div>
  );
}

export default App;
