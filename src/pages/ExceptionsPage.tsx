import * as React from 'react';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  Building2,
  ChevronRight,
  FileWarning,
  Network,
  ShieldX,
} from 'lucide-react';
import type { Invoice, ValidationIssue } from '@/types';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { PageHeader } from '@/components/PageHeader';
import { EmptyState } from '@/components/EmptyState';
import { InvoiceStatusBadge, PeppolStatusBadge } from '@/components/StatusBadge';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ConfidenceIndicator } from '@/features/invoices/ConfidenceIndicator';
import { useInvoices } from '@/hooks/useInvoices';
import { formatDate, formatMoney } from '@/utils/formatters';

interface ExceptionGroup {
  key: string;
  title: string;
  description: string;
  Icon: React.ComponentType<{ className?: string }>;
  match: (issues: ValidationIssue[]) => boolean;
}

interface ExceptionRow {
  invoice: Invoice;
  reasons: ExceptionGroup[];
}

const groups: ExceptionGroup[] = [
  {
    key: 'kvk_missing',
    title: 'Ontbrekend KVK',
    description: 'Vereist voor NL Peppol-verzending',
    Icon: Building2,
    match: (issues) => issues.some((i) => i.code === 'KVK_MISSING'),
  },
  {
    key: 'vat_mismatch',
    title: 'BTW mismatch',
    description: 'BTW-berekening klopt niet of nummer ongeldig',
    Icon: ShieldX,
    match: (issues) =>
      issues.some(
        (i) => i.code.startsWith('VAT_') && i.code !== 'VAT_FOREIGN',
      ) || issues.some((i) => i.code.includes('VAT_MISMATCH')),
  },
  {
    key: 'supplier_unknown',
    title: 'Onbekende leverancier',
    description: 'Geen match op KVK of e-maildomein',
    Icon: AlertTriangle,
    match: (issues) => issues.some((i) => i.code === 'SUPPLIER_UNKNOWN'),
  },
  {
    key: 'ubl_invalid',
    title: 'UBL validatie mislukt',
    description: 'Genereerde UBL voldoet niet aan Peppol BIS 3.0',
    Icon: FileWarning,
    match: (issues) => issues.some((i) => i.code === 'UBL_INVALID'),
  },
  {
    key: 'peppol_failed',
    title: 'Peppol fout',
    description: 'Verzending afgewezen door Access Point',
    Icon: Network,
    match: (issues) =>
      issues.some(
        (i) => i.code === 'PEPPOL_REJECTED' || i.code === 'PEPPOL_FAILED',
      ),
  },
];

const fallbackGroup: ExceptionGroup = {
  key: 'other',
  title: 'Overige uitval',
  description: 'Handmatige controle vereist',
  Icon: AlertTriangle,
  match: () => true,
};

export function ExceptionsPage() {
  const { data, isLoading } = useInvoices({ hasIssues: true });

  const rows = useMemo<ExceptionRow[]>(() => {
    const items = data?.items ?? [];

    return items
      .map((invoice) => {
        const matchedReasons = groups.filter((group) =>
          group.match(invoice.validationIssues),
        );

        return {
          invoice,
          reasons: matchedReasons.length > 0 ? matchedReasons : [fallbackGroup],
        };
      })
      .filter((row) => row.invoice.validationIssues.length > 0);
  }, [data]);

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Dashboard', to: '/' }, { label: 'Uitval' }]} />

      <PageHeader
        title="Uitval & uitzonderingen"
        description={
          rows.length > 0
            ? `${rows.length} ${rows.length === 1 ? 'factuur heeft' : 'facturen hebben'} handmatige aandacht nodig.`
            : 'Facturen die handmatige aandacht nodig hebben, in één overzichtelijke lijst.'
        }
      />

      {isLoading && <ExceptionTableSkeleton />}

      {!isLoading && rows.length === 0 && (
        <EmptyState
          icon={AlertTriangle}
          title="Geen uitval"
          description="Alle facturen zijn succesvol verwerkt — geen handmatige aandacht nodig."
        />
      )}

      {!isLoading && rows.length > 0 && <ExceptionTable rows={rows} />}
    </div>
  );
}

function ExceptionTable({ rows }: { rows: ExceptionRow[] }) {
  const navigate = useNavigate();

  return (
    <div className="glass-panel overflow-hidden rounded-3xl">
      <Table className="min-w-[1120px]">
        <TableHeader>
          <TableRow>
            <TableHead>Uitvalreden</TableHead>
            <TableHead>Leverancier</TableHead>
            <TableHead>Factuurnr.</TableHead>
            <TableHead>Datum</TableHead>
            <TableHead className="text-right">Bedrag</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Confidence</TableHead>
            <TableHead>Peppol</TableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map(({ invoice, reasons }) => {
            const primaryReason = reasons[0];
            const PrimaryIcon = primaryReason.Icon;

            return (
              <TableRow
                key={invoice.id}
                className="group cursor-pointer"
                onClick={() => navigate(`/invoices/${invoice.id}`)}
              >
                <TableCell className="min-w-[280px]">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-destructive/10 text-destructive ring-1 ring-destructive/15">
                      <PrimaryIcon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        {reasons.map((reason) => (
                          <Badge key={reason.key} variant="destructive">
                            {reason.title}
                          </Badge>
                        ))}
                      </div>
                      <div className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                        {primaryReason.description}
                      </div>
                    </div>
                  </div>
                </TableCell>

                <TableCell>
                  <div className="font-semibold text-foreground">
                    {invoice.supplierName}
                  </div>
                  {invoice.supplierKvk ? (
                    <div className="mt-0.5 text-xs text-muted-foreground">
                      KVK {invoice.supplierKvk}
                    </div>
                  ) : (
                    <div className="mt-0.5 text-xs text-muted-foreground">
                      KVK ontbreekt
                    </div>
                  )}
                </TableCell>

                <TableCell>
                  <span className="rounded-lg border border-white/10 bg-white/[0.035] px-2 py-1 font-mono text-xs text-foreground/90">
                    {invoice.invoiceNumber || '—'}
                  </span>
                </TableCell>

                <TableCell className="text-sm text-muted-foreground">
                  {formatDate(invoice.invoiceDate)}
                </TableCell>

                <TableCell className="text-right tabular-nums">
                  {invoice.totalAmount.amount > 0 ? (
                    <span className="font-semibold text-foreground">
                      {formatMoney(invoice.totalAmount)}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>

                <TableCell>
                  <InvoiceStatusBadge status={invoice.status} />
                </TableCell>

                <TableCell>
                  <ConfidenceIndicator score={invoice.confidenceScore} />
                </TableCell>

                <TableCell>
                  <PeppolStatusBadge status={invoice.peppolStatus} />
                </TableCell>

                <TableCell>
                  <ChevronRight className="h-4 w-4 text-muted-foreground/50 transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

function ExceptionTableSkeleton() {
  return (
    <div className="glass-panel overflow-hidden rounded-3xl">
      <div className="border-b border-white/10 bg-white/[0.035] px-4 py-3">
        <Skeleton className="h-4 w-44" />
      </div>
      <div className="divide-y divide-white/10">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="grid grid-cols-8 items-center gap-4 px-4 py-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-9 w-9 rounded-lg" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-32 rounded-full" />
                <Skeleton className="h-3 w-44" />
              </div>
            </div>
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-16 justify-self-end" />
            <Skeleton className="h-5 w-24 rounded-full" />
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-5 w-24 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
