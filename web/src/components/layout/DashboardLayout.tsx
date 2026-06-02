import type { ReactNode } from 'react';
import { Header } from './Header';

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen min-w-0 flex-1 flex-col">
      <Header />
      <div className="min-h-0 flex-1">{children}</div>
    </div>
  );
}
