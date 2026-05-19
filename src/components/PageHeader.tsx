import * as React from 'react';
import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn('flex flex-wrap items-end justify-between gap-3', className)}>
      <div className="min-w-0">
        <div className="dx-eyebrow mb-1.5 text-[10px]">
          <Sparkles className="h-3 w-3" />
          Peppol Access Agent
        </div>
        <h1 className="gradient-text truncate text-[clamp(1.55rem,2.7vw,2.65rem)] font-extrabold leading-[0.98] tracking-[-0.07em]">
          {title}
        </h1>
        {description && (
          <p className="mt-2 max-w-2xl text-xs leading-relaxed text-muted-foreground sm:text-sm">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
