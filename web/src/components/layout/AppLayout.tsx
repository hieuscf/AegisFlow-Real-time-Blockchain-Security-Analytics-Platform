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
    <div className="relative min-h-screen bg-aegis-bg overflow-x-hidden">

      {/* ── Ambient background ───────────────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Grid */}
        <div className="absolute inset-0 bg-grid opacity-100" />
        {/* Cyan blob — top-left */}
        <div className="absolute -top-64 -left-64 w-[700px] h-[700px] rounded-full bg-aegis-primary/5 blur-[120px]" />
        {/* Purple blob — bottom-right */}
        <div className="absolute -bottom-64 -right-32 w-[600px] h-[600px] rounded-full bg-aegis-secondary/6 blur-[140px]" />
        {/* Subtle center glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[300px] rounded-full bg-aegis-secondary/3 blur-[100px]" />
        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-linear-to-t from-aegis-bg/60 to-transparent" />
      </div>

      {/* ── Layout ───────────────────────────────────────────────── */}
      <div className="relative z-10 flex min-h-screen">

        {/* Desktop floating sidebar */}
        {isDesktop && (
          <div className="hidden shrink-0 lg:block">
            <div className="sticky top-0 h-screen p-3">
              <Sidebar />
            </div>
          </div>
        )}

        {/* Mobile: overlay */}
        {!isDesktop && (
          <>
            {sidebarOpen && (
              <button
                type="button"
                className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
                onClick={() => setSidebarOpen(false)}
                aria-label="Close sidebar"
              />
            )}
            <div
              className={cn(
                'fixed inset-y-0 left-0 z-50 p-3 transition-transform duration-300 ease-out',
                sidebarOpen ? 'translate-x-0' : '-translate-x-full',
              )}
            >
              <Sidebar />
            </div>
          </>
        )}

        {/* Content */}
        <div className="flex min-w-0 flex-1 flex-col">{children}</div>
      </div>
    </div>
  );
}
