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
    <div className={cn('flex flex-wrap items-start justify-between gap-4', className)}>
      <div className="min-w-0">
        <div className="dx-eyebrow mb-2">
          <Sparkles className="h-3 w-3" />
          Peppol Access Agent
        </div>
        <h1 className="gradient-text truncate text-3xl font-extrabold leading-[0.98] tracking-[-0.055em] lg:text-5xl">
          {title}
        </h1>
        {description && (
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground lg:text-[15px]">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
