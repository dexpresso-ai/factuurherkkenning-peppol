import * as React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  MailCheck,
  AlertTriangle,
  Building2,
  ClipboardList,
  Settings,
  X,
} from 'lucide-react';
import { BrandMark } from '@/components/BrandMark';
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
  { to: '/mailbox', label: 'Mailbox', icon: MailCheck },
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
          'fixed inset-0 z-40 bg-black/72 backdrop-blur-md transition-opacity lg:hidden',
          mobileOpen ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
      />

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex h-full w-[min(88vw,19rem)] shrink-0 flex-col border-r border-white/10 bg-[#0b0b0b]/88 shadow-elevated backdrop-blur-2xl transition-transform duration-300 lg:relative lg:z-20 lg:w-72 lg:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="pointer-events-none absolute inset-0 soft-grid opacity-[0.28]" />
        <div className="pointer-events-none absolute -left-28 top-12 h-72 w-72 rounded-full bg-primary/14 blur-3xl" />
        <div className="pointer-events-none absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

        <div className="relative flex h-20 items-center gap-3 border-b border-white/10 px-5 lg:px-6">
          <BrandMark />
          <button
            type="button"
            aria-label="Menu sluiten"
            onClick={onClose}
            className="ml-auto flex h-10 w-10 items-center justify-center rounded-full border border-primary/20 bg-white/[0.045] text-muted-foreground shadow-card transition hover:-translate-y-0.5 hover:border-primary/45 hover:text-primary lg:hidden"
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
                      'group relative flex items-center gap-3 overflow-hidden rounded-2xl border px-3.5 py-3 text-sm font-semibold transition-all duration-200 motion-safe:hover:translate-x-1',
                      isActive
                        ? 'border-primary/30 bg-primary/[0.12] text-foreground shadow-glow'
                        : 'border-transparent text-muted-foreground hover:border-white/10 hover:bg-white/[0.055] hover:text-foreground',
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <span className={cn(
                        'absolute inset-y-2 left-0 w-1 rounded-r-full bg-primary shadow-[0_0_18px_hsl(var(--primary)/0.8)] transition-opacity',
                        isActive ? 'opacity-100' : 'opacity-0',
                      )} />
                      <span
                        className={cn(
                          'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition-all duration-200',
                          isActive
                            ? 'border-primary/35 bg-primary/15 text-primary'
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
          <div className="brand-panel rounded-[24px] p-4">
            <div className="relative z-10 flex items-center gap-2 text-xs font-bold text-primary">
              <span className="h-2 w-2 rounded-full bg-primary shadow-[0_0_18px_hsl(var(--primary)/0.7)]" />
              Live agent-flow
            </div>
            <div className="relative z-10 mt-1 text-[11px] leading-relaxed text-muted-foreground">
              Mailbox → herkennen → controleren → Peppol. Eén rustige, gouden workflow.
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
