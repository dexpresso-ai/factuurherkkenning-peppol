import * as React from 'react';
import { FileDigit, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BrandMarkProps {
  compact?: boolean;
  className?: string;
  markClassName?: string;
  textClassName?: string;
}

export function BrandMark({
  compact = false,
  className,
  markClassName,
  textClassName,
}: BrandMarkProps) {
  return (
    <div className={cn('brand-lockup group inline-flex min-w-0 items-center gap-3', className)}>
      <div
        className={cn(
          'brand-emblem relative grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-[14px] border border-primary/40 bg-[#111111] text-primary shadow-glow',
          markClassName,
        )}
        aria-hidden
      >
        <span className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(var(--primary)/0.3),transparent_42%),linear-gradient(135deg,hsl(var(--primary)/0.12),transparent_62%)]" />
        <span className="absolute inset-x-2 bottom-1 h-px bg-gradient-to-r from-transparent via-primary/70 to-transparent" />
        <FileDigit className="relative h-5 w-5" />
      </div>

      {!compact && (
        <div className={cn('min-w-0', textClassName)}>
          <div className="truncate text-[15px] font-extrabold leading-tight tracking-[-0.04em] text-foreground">
            Peppol Access Agent
          </div>
          <div className="mt-1 inline-flex max-w-full items-center gap-1.5 truncate text-[11px] font-medium text-muted-foreground">
            <Sparkles className="h-3 w-3 shrink-0 text-primary" />
            <span className="truncate">Mailbox · AI · Peppol</span>
          </div>
        </div>
      )}
    </div>
  );
}
