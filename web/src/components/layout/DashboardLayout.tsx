import type { ReactNode } from 'react';
import { useGsapEntrance } from '@/hooks';
import { cn } from '@/lib/utils';
import { Header } from './Header';

interface DashboardLayoutProps {
  children: ReactNode;
  className?: string;
}

export function DashboardLayout({ children, className }: DashboardLayoutProps) {
  const mainRef = useGsapEntrance<HTMLElement>();

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 md:gap-5">
      <Header />
      <main ref={mainRef} className={cn('grid min-h-0 flex-1 gap-4 lg:grid-cols-[1.4fr_1fr]', className)}>
        {children}
      </main>
    </div>
  );
}
