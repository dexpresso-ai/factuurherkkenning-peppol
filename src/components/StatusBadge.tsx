import * as React from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  FileText,
  Loader2,
  Send,
  XCircle,
  CircleDashed,
} from 'lucide-react';
import type { InvoiceStatus, PeppolStatus } from '@/types';
import { Badge } from '@/components/ui/badge';

interface InvoiceStatusBadgeProps {
  status: InvoiceStatus;
}

interface PeppolStatusBadgeProps {
  status: PeppolStatus;
}

const invoiceStatusConfig: Record<
  InvoiceStatus,
  {
    label: string;
    variant:
      | 'default'
      | 'success'
      | 'warning'
      | 'destructive'
      | 'info'
      | 'muted'
      | 'secondary';
    Icon: React.ComponentType<{ className?: string }>;
  }
> = {
  new: { label: 'Nieuw', variant: 'info', Icon: FileText },
  processing: { label: 'In verwerking', variant: 'secondary', Icon: Loader2 },
  review_required: {
    label: 'Te controleren',
    variant: 'warning',
    Icon: AlertCircle,
  },
  ready_for_peppol: {
    label: 'Klaar voor Peppol',
    variant: 'info',
    Icon: CheckCircle2,
  },
  sent: { label: 'Verzonden', variant: 'success', Icon: Send },
  delivered: { label: 'Afgeleverd', variant: 'success', Icon: CheckCircle2 },
  error: { label: 'Fout', variant: 'destructive', Icon: XCircle },
  rejected: { label: 'Afgewezen', variant: 'destructive', Icon: XCircle },
};

const peppolStatusConfig: Record<
  PeppolStatus,
  { label: string; variant: 'default' | 'success' | 'warning' | 'destructive' | 'muted'; Icon: React.ComponentType<{ className?: string }> }
> = {
  not_sent: { label: 'Niet verzonden', variant: 'muted', Icon: CircleDashed },
  queued: { label: 'In wachtrij', variant: 'muted', Icon: Clock },
  sending: { label: 'Verzenden', variant: 'default', Icon: Loader2 },
  delivered: { label: 'Afgeleverd', variant: 'success', Icon: CheckCircle2 },
  failed: { label: 'Mislukt', variant: 'destructive', Icon: XCircle },
  rejected: { label: 'Geweigerd', variant: 'destructive', Icon: XCircle },
};

export function InvoiceStatusBadge({ status }: InvoiceStatusBadgeProps) {
  const cfg = invoiceStatusConfig[status];
  const isAnimating = status === 'processing';
  return (
    <Badge variant={cfg.variant} className="font-medium">
      <cfg.Icon
        className={
          'h-3 w-3 ' + (isAnimating ? 'animate-spin' : '')
        }
      />
      {cfg.label}
    </Badge>
  );
}

export function PeppolStatusBadge({ status }: PeppolStatusBadgeProps) {
  const cfg = peppolStatusConfig[status];
  const isAnimating = status === 'sending';
  return (
    <Badge variant={cfg.variant} className="font-medium">
      <cfg.Icon
        className={
          'h-3 w-3 ' + (isAnimating ? 'animate-spin' : '')
        }
      />
      {cfg.label}
    </Badge>
  );
}
