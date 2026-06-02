import { LayoutDashboard, Bell, Activity, Wallet, Shield, ChevronLeft } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useUiStore } from '@/store';

const NAV_ITEMS = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
  { label: 'Alerts',    icon: Bell,            href: '/alerts' },
  { label: 'Analytics', icon: Activity,        href: '/analytics' },
  { label: 'Wallet',    icon: Wallet,          href: '/wallet' },
  { label: 'Security',  icon: Shield,          href: '/security' },
] as const;

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const collapsed = useUiStore((s) => s.sidebarCollapsed);
  const toggleCollapsed = useUiStore((s) => s.toggleSidebarCollapsed);
  const { pathname } = useLocation();

  return (
    <aside
      className={cn(
        'flex h-full flex-col border-r border-aegis-border bg-aegis-surface transition-all duration-300',
        collapsed ? 'w-[60px]' : 'w-56',
        className,
      )}
    >
      {/* Logo */}
      <div className={cn('flex items-center gap-2.5 px-4 py-5', collapsed && 'justify-center px-3')}>
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-linear-to-br from-aegis-primary to-aegis-secondary">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L4 6v6c0 5.5 3.5 10.7 8 12 4.5-1.3 8-6.5 8-12V6L12 2z" fill="white" />
          </svg>
        </div>
        {!collapsed && (
          <span className="text-sm font-bold tracking-tight">
            Aegis<span className="text-aegis-primary">Flow</span>
          </span>
        )}
      </div>

      {/* Collapse toggle */}
      <div className="flex justify-end px-2 pb-2">
        <button
          type="button"
          onClick={toggleCollapsed}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="rounded-lg p-1.5 text-aegis-muted transition-colors hover:bg-aegis-elevated hover:text-foreground"
        >
          <ChevronLeft
            className={cn('h-4 w-4 transition-transform duration-300', collapsed && 'rotate-180')}
          />
        </button>
      </div>

      <div className="mx-3 mb-3 border-t border-aegis-border" />

      {/* Nav */}
      <nav className="flex flex-1 flex-col gap-0.5 px-2 pb-4">
        {NAV_ITEMS.map(({ label, icon: Icon, href }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={label}
              to={href}
              title={collapsed ? label : undefined}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                collapsed && 'justify-center px-0',
                active
                  ? 'bg-aegis-primary/10 text-aegis-primary'
                  : 'text-aegis-muted hover:bg-aegis-elevated hover:text-foreground',
              )}
            >
              <Icon
                className={cn(
                  'h-4 w-4 shrink-0',
                  active ? 'text-aegis-primary' : 'text-current',
                )}
              />
              {!collapsed && <span>{label}</span>}
              {!collapsed && active && (
                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-aegis-primary" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom hint */}
      {!collapsed && (
        <div className="mx-3 mb-4 rounded-lg border border-aegis-border bg-aegis-bg/60 px-3 py-2.5">
          <p className="text-[10px] font-medium uppercase tracking-wider text-aegis-muted">
            MVP · Local
          </p>
          <p className="mt-0.5 text-[10px] text-aegis-muted/60">
            Uniswap V2 · Mainnet
          </p>
        </div>
      )}
    </aside>
  );
}
