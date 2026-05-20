import type { ReactNode } from 'react';
import { useIsDesktop } from '@/hooks';
import { cn } from '@/lib/utils';
import { useUiStore } from '@/store';
import { Sidebar } from './Sidebar';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const isDesktop = useIsDesktop();
  const sidebarOpen = useUiStore((s) => s.sidebarOpen);
  const setSidebarOpen = useUiStore((s) => s.setSidebarOpen);

  return (
    <div className="flex min-h-screen">
      {isDesktop ? (
        <div className="hidden shrink-0 lg:block">
          <Sidebar className="sticky top-0 h-screen rounded-none border-y-0 border-l-0" />
        </div>
      ) : (
        <>
          {sidebarOpen && (
            <button
              type="button"
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close sidebar overlay"
            />
          )}
          <div
            className={cn(
              'fixed inset-y-0 left-0 z-50 transition-transform duration-300 lg:hidden',
              sidebarOpen ? 'translate-x-0' : '-translate-x-full',
            )}
          >
            <Sidebar className="h-full rounded-none" />
          </div>
        </>
      )}

      <div className="flex min-w-0 flex-1 flex-col p-3 md:p-5 lg:p-6">{children}</div>
    </div>
  );
}
