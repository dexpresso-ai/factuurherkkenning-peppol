import { confidenceLevel, formatPercent } from '@/utils/formatters';
import { cn } from '@/lib/utils';

interface ConfidenceIndicatorProps {
  score: number;
  className?: string;
  showLabel?: boolean;
}

const config = {
  high: {
    bar: 'from-success to-primary',
    text: 'text-success',
    label: 'Hoog',
  },
  medium: {
    bar: 'from-warning to-primary',
    text: 'text-warning',
    label: 'Gemiddeld',
  },
  low: {
    bar: 'from-destructive to-warning',
    text: 'text-destructive',
    label: 'Laag',
  },
} as const;

export function ConfidenceIndicator({
  score,
  className,
  showLabel = false,
}: ConfidenceIndicatorProps) {
  if (score <= 0) {
    return <span className="text-xs text-muted-foreground">—</span>;
  }
  const level = confidenceLevel(score);
  const cfg = config[level];

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="h-2 w-20 overflow-hidden rounded-full border border-white/10 bg-black/30 p-[2px] shadow-inner">
        <div
          className={cn('h-full rounded-full bg-gradient-to-r shadow-[0_0_16px_currentColor] transition-all duration-500', cfg.bar)}
          style={{ width: `${Math.min(100, Math.max(0, score * 100))}%` }}
        />
      </div>
      <span className={cn('text-xs font-semibold tabular-nums', cfg.text)}>
        {formatPercent(score)}
      </span>
      {showLabel && (
        <span className="text-xs text-muted-foreground">· {cfg.label}</span>
      )}
    </div>
  );
}
