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
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  end?: boolean;
}

interface SidebarProps {
  mobileOpen?: boolean;
  onClose?: () => void;
}

const navItems: NavItem[] = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/invoices', label: 'Facturen', icon: FileText },
  { to: '/exceptions', label: 'Uitval', icon: AlertTriangle },
  { to: '/suppliers', label: 'Leveranciers', icon: Building2 },
  { to: '/audit', label: 'Auditlog', icon: ClipboardList },
  { to: '/settings', label: 'Instellingen', icon: Settings },
];

export function Sidebar({ mobileOpen = false, onClose }: SidebarProps) {
  return (
    <>
      <button
        type="button"
        aria-label="Menu sluiten"
        onClick={onClose}
        className={cn(
          'fixed inset-0 z-40 bg-black/70 backdrop-blur-sm transition-opacity lg:hidden',
          mobileOpen ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
      />

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex h-full w-[min(86vw,18.5rem)] shrink-0 flex-col border-r border-white/10 bg-[#0b0b0b]/92 shadow-elevated backdrop-blur-2xl transition-transform duration-300 lg:relative lg:z-20 lg:w-72 lg:translate-x-0 lg:bg-black/25',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-52 bg-[radial-gradient(circle_at_18%_8%,hsl(var(--primary)/0.2),transparent_18rem)]" />

        <div className="relative flex h-20 items-center gap-3 border-b border-white/10 px-5 lg:px-6">
          <div className="relative grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-[14px] border border-primary/35 bg-[#111] text-primary shadow-glow">
            <span className="absolute inset-0 bg-[linear-gradient(135deg,hsl(var(--primary)/0.22),transparent_62%)]" />
            <span className="relative text-sm font-extrabold tracking-[-0.08em]">Dx</span>
          </div>
          <div className="min-w-0">
            <div className="truncate text-[15px] font-extrabold leading-tight tracking-[-0.035em] text-foreground">
              Peppol Access Agent
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
              <Sparkles className="h-3 w-3 text-primary" />
              Factuurhub · Peppol Agent
            </div>
          </div>
          <button
            type="button"
            aria-label="Menu sluiten"
            onClick={onClose}
            className="ml-auto flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-muted-foreground transition hover:border-primary/35 hover:text-primary lg:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="relative flex-1 overflow-y-auto px-4 py-5">
          <div className="dx-eyebrow px-3 pb-3 text-[10px]">
            Navigatie
          </div>
          <ul className="flex flex-col gap-1.5">
            {navItems.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.end}
                  onClick={onClose}
                  className={({ isActive }) =>
                    cn(
                      'group relative flex items-center gap-3 overflow-hidden rounded-2xl px-3.5 py-3 text-sm font-semibold transition-all duration-300 motion-safe:hover:translate-x-1',
                      isActive
                        ? 'border border-primary/20 bg-primary/[0.12] text-foreground shadow-glow'
                        : 'border border-transparent text-muted-foreground hover:border-white/10 hover:bg-white/[0.055] hover:text-foreground',
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <span className="absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full bg-primary shadow-[0_0_18px_hsl(var(--primary)/0.8)]" />
                      )}
                      <span
                        className={cn(
                          'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition-all duration-300',
                          isActive
                            ? 'border-primary/30 bg-primary/15 text-primary'
                            : 'border-white/10 bg-white/[0.035] text-muted-foreground group-hover:border-primary/25 group-hover:text-primary',
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
          <div className="rounded-3xl border border-primary/20 bg-primary/10 p-4 shadow-card">
            <div className="flex items-center gap-2 text-xs font-semibold text-primary">
              <span className="h-2 w-2 rounded-full bg-primary shadow-[0_0_18px_hsl(var(--primary)/0.7)]" />
              Shot live
            </div>
            <div className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
              Mailbox → herkennen → controleren → Peppol. Gebrouwen voor snelheid.
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
