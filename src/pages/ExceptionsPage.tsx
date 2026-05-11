import * as React from 'react';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  Building2,
  FileWarning,
  Network,
  ShieldX,
  ChevronRight,
} from 'lucide-react';
import type { Invoice, ValidationIssue } from '@/types';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/EmptyState';
import { InvoiceStatusBadge } from '@/components/StatusBadge';
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
      ) ||
      issues.some((i) => i.code.includes('VAT_MISMATCH')),
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

export function ExceptionsPage() {
  const { data, isLoading } = useInvoices({ hasIssues: true });

  const grouped = useMemo(() => {
    const items = data?.items ?? [];
    return groups.map((g) => ({
      ...g,
      invoices: items.filter((inv) => g.match(inv.validationIssues)),
    }));
  }, [data]);

  const totalExceptions = grouped.reduce((sum, g) => sum + g.invoices.length, 0);

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Dashboard', to: '/' }, { label: 'Uitval' }]} />

      <PageHeader
        title="Uitval & uitzonderingen"
        description="Facturen die handmatige aandacht nodig hebben, gegroepeerd op reden."
      />

      {isLoading && (
        <div className="grid gap-4 lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-xl" />
          ))}
        </div>
      )}

      {!isLoading && totalExceptions === 0 && (
        <EmptyState
          icon={AlertTriangle}
          title="Geen uitval"
          description="Alle facturen zijn succesvol verwerkt — geen handmatige aandacht nodig."
        />
      )}

      {!isLoading && totalExceptions > 0 && (
        <div className="grid gap-5 lg:grid-cols-2">
          {grouped
            .filter((g) => g.invoices.length > 0)
            .map((g) => (
              <ExceptionGroupCard key={g.key} group={g} />
            ))}
        </div>
      )}
    </div>
  );
}

function ExceptionGroupCard({
  group,
}: {
  group: ExceptionGroup & { invoices: Invoice[] };
}) {
  const navigate = useNavigate();
  const { Icon } = group;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
              <Icon className="h-4 w-4" />
            </div>
            <div>
              <div className="text-sm font-semibold">{group.title}</div>
              <div className="text-xs font-normal text-muted-foreground">
                {group.description}
              </div>
            </div>
          </div>
          <span className="rounded-full bg-destructive/10 px-2.5 py-0.5 text-xs font-semibold text-destructive">
            {group.invoices.length}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="px-0">
        <ul className="divide-y divide-border">
          {group.invoices.map((inv) => (
            <li key={inv.id}>
              <button
                onClick={() => navigate(`/invoices/${inv.id}`)}
                className="flex w-full items-center gap-3 px-6 py-3 text-left transition-colors hover:bg-muted/50"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate font-medium text-foreground">
                      {inv.supplierName}
                    </span>
                    <InvoiceStatusBadge status={inv.status} />
                  </div>
                  <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="font-mono">{inv.invoiceNumber}</span>
                    <span>·</span>
                    <span>{formatDate(inv.invoiceDate)}</span>
                    {inv.totalAmount.amount > 0 && (
                      <>
                        <span>·</span>
                        <span className="tabular-nums">
                          {formatMoney(inv.totalAmount)}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <ConfidenceIndicator score={inv.confidenceScore} />
                <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
              </button>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
