import { cn } from '@/lib/utils';
import { useUiStore } from '@/store';

const navItems = ['Dashboard', 'Alerts', 'Analytics', 'Wallet', 'Security'] as const;

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const collapsed = useUiStore((s) => s.sidebarCollapsed);
  const toggleCollapsed = useUiStore((s) => s.toggleSidebarCollapsed);

  return (
    <aside
      className={cn(
        'flex h-full flex-col border-r border-border transition-all',
        collapsed ? 'w-16' : 'w-56',
        className,
      )}
    >
      <div className="px-4 py-5">
        <span className="text-sm font-semibold">{collapsed ? 'A' : 'AegisFlow'}</span>
      </div>

      <div className="flex justify-end px-2">
        <button
          type="button"
          onClick={toggleCollapsed}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? '→' : '←'}
        </button>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-2 pb-4">
        {navItems.map((label) => (
          <button key={label} type="button" className="rounded px-3 py-2 text-left text-sm">
            {collapsed ? label.charAt(0) : label}
          </button>
        ))}
      </nav>
    </aside>
  );
}
