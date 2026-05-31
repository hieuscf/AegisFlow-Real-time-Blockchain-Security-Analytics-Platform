import { useIsDesktop } from '@/hooks';
import { cn } from '@/lib/utils';
import { useUiStore } from '@/store';

interface HeaderProps {
  className?: string;
}

export function Header({ className }: HeaderProps) {
  const isDesktop = useIsDesktop();
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);

  return (
    <header className={cn('flex items-center justify-between border-b border-border px-4 py-3', className)}>
      <div className="flex items-center gap-3">
        {!isDesktop && (
          <button type="button" onClick={toggleSidebar} aria-label="Open menu">
            Menu
          </button>
        )}
        <span className="text-sm font-semibold">AegisFlow</span>
      </div>
    </header>
  );
}
