import * as React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  AlertTriangle,
  Building2,
  ClipboardList,
  Settings,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  end?: boolean;
}

const navItems: NavItem[] = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/invoices', label: 'Facturen', icon: FileText },
  { to: '/exceptions', label: 'Uitval', icon: AlertTriangle },
  { to: '/suppliers', label: 'Leveranciers', icon: Building2 },
  { to: '/audit', label: 'Auditlog', icon: ClipboardList },
  { to: '/settings', label: 'Instellingen', icon: Settings },
];

export function Sidebar() {
  return (
    <aside className="relative z-20 hidden h-full w-72 shrink-0 flex-col border-r border-white/10 bg-black/25 backdrop-blur-2xl lg:flex">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-primary/10 to-transparent" />

      <div className="relative flex h-20 items-center gap-3 border-b border-white/10 px-6">
        <div className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-glow">
          <div className="absolute inset-0 bg-white/20 opacity-0 transition-opacity group-hover:opacity-100" />
          <svg viewBox="0 0 32 32" className="relative h-6 w-6" fill="currentColor">
            <path d="M9 9h7.5a4.5 4.5 0 0 1 0 9H13v5h-4V9Zm4 3v3h3.5a1.5 1.5 0 0 0 0-3H13Z" />
          </svg>
        </div>
        <div className="min-w-0">
          <div className="truncate text-[15px] font-semibold leading-tight tracking-tight text-foreground">
            Peppol Agent
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
            <Sparkles className="h-3 w-3 text-primary" />
            Azure · Acme Holding
          </div>
        </div>
      </div>

      <nav className="relative flex-1 overflow-y-auto px-4 py-5">
        <div className="px-3 pb-3 text-[10px] font-semibold uppercase tracking-[0.24em] text-muted-foreground/80">
          Navigatie
        </div>
        <ul className="flex flex-col gap-1.5">
          {navItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    'group relative flex items-center gap-3 overflow-hidden rounded-2xl px-3.5 py-3 text-sm font-semibold transition-all duration-300 motion-safe:hover:translate-x-1',
                    isActive
                      ? 'bg-gradient-to-r from-primary/20 via-accent/15 to-transparent text-foreground shadow-glow'
                      : 'text-muted-foreground hover:bg-white/[0.055] hover:text-foreground',
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <span className="absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full bg-gradient-to-b from-primary to-accent" />
                    )}
                    <span
                      className={cn(
                        'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition-all duration-300',
                        isActive
                          ? 'border-primary/25 bg-primary/15 text-primary'
                          : 'border-white/10 bg-white/[0.035] text-muted-foreground group-hover:border-white/15 group-hover:text-primary',
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                    </span>
                    <span className="truncate">{item.label}</span>
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="relative border-t border-white/10 p-4">
        <div className="rounded-2xl border border-success/20 bg-success/10 p-4 shadow-card">
          <div className="flex items-center gap-2 text-xs font-semibold text-success">
            <span className="h-2 w-2 rounded-full bg-success shadow-[0_0_18px_hsl(var(--success)/0.7)]" />
            System live
          </div>
          <div className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
            Mock backend v0.1.0 · klaar voor pilotvalidatie
          </div>
        </div>
      </div>
    </aside>
  );
}
