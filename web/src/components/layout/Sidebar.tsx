import {
  Activity,
  Bell,
  ChevronLeft,
  LayoutDashboard,
  Search,
  Shield,
  Wallet,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { useUiStore } from '@/store';

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, active: true },
  { label: 'Alerts', icon: Bell, active: false },
  { label: 'Analytics', icon: Activity, active: false },
  { label: 'Wallet', icon: Wallet, active: false },
  { label: 'Security', icon: Shield, active: false },
] as const;

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const collapsed = useUiStore((s) => s.sidebarCollapsed);
  const toggleCollapsed = useUiStore((s) => s.toggleSidebarCollapsed);

  return (
    <aside
      data-animate
      className={cn(
        'panel-sidebar flex h-full flex-col transition-all duration-300',
        collapsed ? 'w-[72px]' : 'w-56',
        className,
      )}
    >
      <div className="flex items-center gap-2 px-4 py-5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-aegis-mint/15">
          <Shield className="h-4 w-4 text-aegis-mint" aria-hidden />
        </div>
        {!collapsed && (
          <span className="text-sm font-bold tracking-tight text-foreground">AegisFlow</span>
        )}
      </div>

      {!collapsed && (
        <div className="px-3 pb-3">
          <div className="flex items-center gap-2 rounded-lg border border-aegis-border bg-aegis-bg px-3 py-2 text-muted-foreground">
            <Search className="h-3.5 w-3.5 shrink-0" aria-hidden />
            <span className="flex-1 text-xs">Search…</span>
            <kbd className="rounded border border-aegis-border bg-aegis-elevated px-1.5 py-0.5 font-mono text-[10px]">
              ⌘K
            </kbd>
          </div>
        </div>
      )}

      <Separator className="bg-aegis-border" />

      <div className="flex items-center justify-end p-2">
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0 text-muted-foreground hover:text-aegis-mint"
          onClick={toggleCollapsed}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <ChevronLeft
            className={cn('h-4 w-4 transition-transform', collapsed && 'rotate-180')}
          />
        </Button>
      </div>

      <nav className="flex flex-1 flex-col gap-0.5 px-2 pb-4">
        {navItems.map(({ label, icon: Icon, active }) => (
          <button
            key={label}
            type="button"
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
              active
                ? 'nav-active'
                : 'text-muted-foreground hover:bg-aegis-elevated hover:text-foreground',
            )}
          >
            <Icon
              className={cn('h-4 w-4 shrink-0', active && 'text-aegis-mint')}
              aria-hidden
            />
            {!collapsed && <span>{label}</span>}
          </button>
        ))}
      </nav>
    </aside>
  );
}
