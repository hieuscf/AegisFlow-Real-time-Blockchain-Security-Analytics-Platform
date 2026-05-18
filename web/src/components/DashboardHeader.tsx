import { Activity, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';

export function DashboardHeader() {
  const { isAuthenticated, address, clearSession } = useAuth();

  return (
    <header className="flex flex-wrap items-center justify-between gap-4 border-b border-aegis-border pb-4">
      <div className="flex items-center gap-3">
        <Activity className="h-6 w-6 text-aegis-accent" aria-hidden />
        <div>
          <h1 className="text-lg font-semibold tracking-tight">AegisFlow</h1>
          <p className="text-xs text-slate-400">Realtime Blockchain Security Dashboard</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {isAuthenticated && address ? (
          <>
            <span className="hidden font-mono text-xs text-slate-400 sm:inline">
              {address.slice(0, 6)}…{address.slice(-4)}
            </span>
            <Button variant="secondary" onClick={clearSession}>
              Disconnect
            </Button>
          </>
        ) : (
          <Button variant="primary">
            <Wallet className="h-4 w-4" aria-hidden />
            Connect Wallet
          </Button>
        )}
      </div>
    </header>
  );
}
