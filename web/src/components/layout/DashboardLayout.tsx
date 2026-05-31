import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Header } from './Header';

interface DashboardLayoutProps {
  children: ReactNode;
  className?: string;
}

export function DashboardLayout({ children, className }: DashboardLayoutProps) {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <Header />
      <main className={cn('flex min-h-0 flex-1 flex-col', className)}>{children}</main>
    </div>
  );
}
