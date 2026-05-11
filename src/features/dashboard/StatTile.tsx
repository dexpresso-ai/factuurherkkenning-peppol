import type { LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatTileProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  tone?: 'default' | 'success' | 'warning' | 'destructive' | 'info';
  to?: string;
  hint?: string;
}

const toneStyles = {
  default: {
    iconBg: 'bg-white/[0.055] text-muted-foreground border-white/10',
    accent: 'text-foreground',
    glow: 'from-white/10',
  },
  info: {
    iconBg: 'bg-primary/10 text-primary border-primary/20',
    accent: 'text-primary',
    glow: 'from-primary/20',
  },
  success: {
    iconBg: 'bg-success/10 text-success border-success/20',
    accent: 'text-success',
    glow: 'from-success/20',
  },
  warning: {
    iconBg: 'bg-warning/15 text-warning border-warning/25',
    accent: 'text-warning',
    glow: 'from-warning/20',
  },
  destructive: {
    iconBg: 'bg-destructive/10 text-destructive border-destructive/20',
    accent: 'text-destructive',
    glow: 'from-destructive/20',
  },
} as const;

export function StatTile({
  label,
  value,
  icon: Icon,
  tone = 'default',
  to,
  hint,
}: StatTileProps) {
  const styles = toneStyles[tone];

  const inner = (
    <div className="group relative flex h-full min-h-[158px] flex-col justify-between overflow-hidden rounded-3xl border border-white/10 bg-card/72 p-5 shadow-card backdrop-blur-2xl transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-glow">
      <div className={cn('pointer-events-none absolute -right-10 -top-14 h-36 w-36 rounded-full bg-gradient-to-br to-transparent blur-2xl transition-opacity duration-300 group-hover:opacity-100', styles.glow)} />
      <div className="relative flex items-start justify-between">
        <div className={cn('flex h-11 w-11 items-center justify-center rounded-2xl border shadow-inner', styles.iconBg)}>
          <Icon className="h-5 w-5" />
        </div>
        {to && (
          <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/[0.035] text-muted-foreground transition-all group-hover:bg-primary/10 group-hover:text-primary">
            <ArrowUpRight className="h-4 w-4" />
          </div>
        )}
      </div>
      <div className="relative mt-5">
        <div className={cn('text-4xl font-semibold tabular-nums tracking-tight', styles.accent)}>
          {value}
        </div>
        <div className="mt-1.5 text-sm font-medium text-foreground/90">{label}</div>
        {hint && <div className="mt-2 text-[11px] leading-relaxed text-muted-foreground">{hint}</div>}
      </div>
    </div>
  );

  return to ? <Link to={to}>{inner}</Link> : inner;
}
