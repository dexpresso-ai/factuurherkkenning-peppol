import { AlertCircle, CheckCircle2, Info, XCircle } from 'lucide-react';
import type { ValidationIssue } from '@/types';
import { cn } from '@/lib/utils';

interface ValidationBlockProps {
  issues: ValidationIssue[];
  /** Toon ook een success-block als er geen issues zijn. */
  showSuccessWhenEmpty?: boolean;
}

const severityStyle = {
  success: {
    container: 'border-success/30 bg-success/5',
    icon: 'text-success',
    Icon: CheckCircle2,
  },
  info: {
    container: 'border-primary/30 bg-primary/5',
    icon: 'text-primary',
    Icon: Info,
  },
  warning: {
    container: 'border-warning/40 bg-warning/10',
    icon: 'text-amber-700',
    Icon: AlertCircle,
  },
  error: {
    container: 'border-destructive/30 bg-destructive/5',
    icon: 'text-destructive',
    Icon: XCircle,
  },
} as const;

export function ValidationBlock({
  issues,
  showSuccessWhenEmpty = true,
}: ValidationBlockProps) {
  if (issues.length === 0) {
    if (!showSuccessWhenEmpty) return null;
    const cfg = severityStyle.success;
    return (
      <div className={cn('flex items-start gap-3 rounded-lg border p-3', cfg.container)}>
        <cfg.Icon className={cn('mt-0.5 h-4 w-4 shrink-0', cfg.icon)} />
        <div className="text-sm">
          <div className="font-medium text-foreground">Alle validaties geslaagd</div>
          <div className="text-muted-foreground">
            UBL gegenereerd, BIS Billing 3.0 conform, klaar voor Peppol.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {issues.map((iss, idx) => {
        const cfg = severityStyle[iss.severity];
        return (
          <div
            key={idx}
            className={cn('flex items-start gap-3 rounded-lg border p-3', cfg.container)}
          >
            <cfg.Icon className={cn('mt-0.5 h-4 w-4 shrink-0', cfg.icon)} />
            <div className="min-w-0 text-sm">
              <div className="flex flex-wrap items-baseline gap-x-2">
                <span className="font-medium text-foreground">{iss.message}</span>
                <span className="font-mono text-[10px] text-muted-foreground">
                  {iss.code}
                </span>
              </div>
              {iss.field && (
                <div className="mt-0.5 text-xs text-muted-foreground">
                  Veld: <span className="font-mono">{iss.field}</span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
