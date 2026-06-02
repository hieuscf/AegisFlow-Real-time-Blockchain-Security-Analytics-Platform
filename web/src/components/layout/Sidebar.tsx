import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Bell, Activity, Wallet, Shield,
  ChevronLeft, Zap,
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useUiStore, useWebSocketStore } from '@/store';

const NAV_ITEMS = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
  { label: 'Alerts',    icon: Bell,            href: '/alerts' },
  { label: 'Analytics', icon: Activity,        href: '/analytics' },
  { label: 'Wallet',    icon: Wallet,          href: '/wallet' },
  { label: 'Security',  icon: Shield,          href: '/security' },
] as const;

const GLOW: Record<string, string> = {
  '/dashboard': 'rgba(0,229,255,0.15)',
  '/alerts':    'rgba(255,77,109,0.12)',
  '/analytics': 'rgba(124,58,237,0.12)',
  '/wallet':    'rgba(0,255,133,0.12)',
  '/security':  'rgba(245,158,11,0.12)',
};

interface SidebarProps { className?: string }

export function Sidebar({ className }: SidebarProps) {
  const collapsed      = useUiStore((s) => s.sidebarCollapsed);
  const toggleCollapsed= useUiStore((s) => s.toggleSidebarCollapsed);
  const wsStatus       = useWebSocketStore((s) => s.status);
  const { pathname }   = useLocation();

  return (
    <aside
      className={cn(
        'glass flex h-full flex-col rounded-2xl transition-all duration-300 ease-out',
        collapsed ? 'w-[64px]' : 'w-[220px]',
        className,
      )}
    >
      {/* Logo */}
      <div className={cn(
        'flex items-center gap-3 px-4 py-5',
        collapsed && 'justify-center px-3',
      )}>
        <div className="relative shrink-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-linear-to-br from-aegis-primary to-aegis-secondary glow-cyan">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L4 6v6c0 5.5 3.5 10.7 8 12 4.5-1.3 8-6.5 8-12V6L12 2z" fill="white" />
            </svg>
          </div>
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden whitespace-nowrap text-sm font-bold tracking-tight"
            >
              Aegis<span className="gradient-text">Flow</span>
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Collapse button */}
      <div className={cn('flex px-3 pb-2', collapsed ? 'justify-center' : 'justify-end')}>
        <button
          type="button"
          onClick={toggleCollapsed}
          aria-label={collapsed ? 'Expand' : 'Collapse'}
          className="rounded-lg p-1.5 text-aegis-muted/50 transition-colors hover:bg-white/5 hover:text-aegis-muted"
        >
          <ChevronLeft className={cn('h-3.5 w-3.5 transition-transform duration-300', collapsed && 'rotate-180')} />
        </button>
      </div>

      <div className="mx-3 mb-3 h-px bg-aegis-border/40" />

      {/* Nav */}
      <nav className="flex flex-1 flex-col gap-1 px-2 pb-4">
        {NAV_ITEMS.map(({ label, icon: Icon, href }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={label}
              to={href}
              title={collapsed ? label : undefined}
              className={cn(
                'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                collapsed && 'justify-center px-0',
                active
                  ? 'text-aegis-primary'
                  : 'text-aegis-muted hover:text-foreground',
              )}
              style={active ? { backgroundColor: GLOW[href] ?? 'rgba(0,229,255,0.10)' } : undefined}
            >
              {/* Active glow blob */}
              {active && (
                <motion.div
                  layoutId="nav-active-bg"
                  className="absolute inset-0 rounded-xl"
                  style={{ backgroundColor: GLOW[href] ?? 'rgba(0,229,255,0.10)' }}
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                />
              )}

              <Icon
                className={cn(
                  'relative h-4 w-4 shrink-0 transition-colors',
                  active ? 'text-aegis-primary' : 'text-aegis-muted group-hover:text-foreground',
                )}
              />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.2 }}
                    className="relative overflow-hidden whitespace-nowrap"
                  >
                    {label}
                  </motion.span>
                )}
              </AnimatePresence>
              {!collapsed && active && (
                <span className="relative ml-auto h-1.5 w-1.5 rounded-full bg-aegis-primary live-dot" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Status footer */}
      {!collapsed && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mx-3 mb-4 rounded-xl border border-aegis-border/30 bg-white/2 p-3"
          >
            <div className="flex items-center gap-2">
              <Zap className="h-3 w-3 text-aegis-primary" />
              <span className="text-[10px] font-semibold uppercase tracking-widest text-aegis-muted">
                System Status
              </span>
            </div>
            <div className="mt-2 space-y-1.5">
              {[
                { label: 'Indexer',    ok: true  },
                { label: 'Analytics',  ok: true  },
                { label: 'Realtime',   ok: wsStatus === 'connected' },
              ].map((s) => (
                <div key={s.label} className="flex items-center justify-between">
                  <span className="text-[10px] text-aegis-muted/70">{s.label}</span>
                  <span className={cn(
                    'flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider',
                    s.ok ? 'text-aegis-success' : 'text-aegis-muted',
                  )}>
                    {s.ok && <span className="h-1 w-1 rounded-full bg-aegis-success live-dot" />}
                    {s.ok ? 'OK' : 'OFF'}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      )}
    </aside>
  );
}
