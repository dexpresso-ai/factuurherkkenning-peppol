import {
  Mail,
  HardDrive,
  ScanSearch,
  ShieldCheck,
  FileEdit,
  CheckCircle2,
  FileCode2,
  Send,
  PackageCheck,
  XCircle,
  RefreshCw,
  type LucideIcon,
} from 'lucide-react';
import type { AuditLogEntry, AuditEventType, AuditSeverity } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/EmptyState';
import { formatDateTime } from '@/utils/formatters';
import { cn } from '@/lib/utils';

const iconMap: Record<AuditEventType, LucideIcon> = {
  mail_received: Mail,
  pdf_stored: HardDrive,
  extraction_started: ScanSearch,
  extraction_completed: CheckCircle2,
  validation: ShieldCheck,
  manual_correction: FileEdit,
  manual_approval: CheckCircle2,
  ubl_generated: FileCode2,
  peppol_submitted: Send,
  peppol_delivered: PackageCheck,
  peppol_failed: XCircle,
  reprocessed: RefreshCw,
};

const severityStyle: Record<
  AuditSeverity,
  { node: string; ring: string; text: string }
> = {
  info: {
    node: 'bg-primary/10 text-primary',
    ring: 'ring-primary/20',
    text: 'text-foreground',
  },
  success: {
    node: 'bg-success/10 text-success',
    ring: 'ring-success/20',
    text: 'text-foreground',
  },
  warning: {
    node: 'bg-warning/15 text-amber-700',
    ring: 'ring-amber-200',
    text: 'text-foreground',
  },
  error: {
    node: 'bg-destructive/10 text-destructive',
    ring: 'ring-destructive/20',
    text: 'text-foreground',
  },
};

interface AuditTimelineProps {
  entries: AuditLogEntry[];
  isLoading?: boolean;
}

export function AuditTimeline({ entries, isLoading }: AuditTimelineProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex gap-4">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-1/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!entries.length) {
    return (
      <EmptyState
        icon={ScanSearch}
        title="Nog geen audit-events"
        description="Zodra deze factuur verwerkt wordt verschijnen hier de tijdlijn-events."
      />
    );
  }

  return (
    <ol className="relative">
      {entries.map((entry, idx) => {
        const Icon = iconMap[entry.type] ?? CheckCircle2;
        const style = severityStyle[entry.severity];
        const isLast = idx === entries.length - 1;

        return (
          <li key={entry.id} className="relative flex gap-4 pb-6">
            {/* Connector line */}
            {!isLast && (
              <span
                aria-hidden
                className="absolute left-4 top-9 h-[calc(100%-1.5rem)] w-px bg-border"
              />
            )}

            {/* Node */}
            <div
              className={cn(
                'relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ring-4 ring-background',
                style.node,
              )}
            >
              <Icon className="h-3.5 w-3.5" />
            </div>

            {/* Content */}
            <div className="flex-1 pt-0.5">
              <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
                <p className={cn('text-sm font-medium', style.text)}>
                  {entry.message}
                </p>
                <time className="font-mono text-[11px] tabular-nums text-muted-foreground">
                  {formatDateTime(entry.timestamp)}
                </time>
              </div>
              <div className="mt-0.5 flex items-center gap-2 text-[11px] text-muted-foreground">
                <span className="rounded bg-muted px-1.5 py-0.5 font-mono">
                  {entry.type}
                </span>
                <span>·</span>
                <span>{entry.actor === 'system' ? 'Systeem' : entry.actor}</span>
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
