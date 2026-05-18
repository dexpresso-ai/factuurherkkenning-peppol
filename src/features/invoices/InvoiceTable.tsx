import { useNavigate } from 'react-router-dom';
import { ChevronRight, FileText } from 'lucide-react';
import type { Invoice } from '@/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/EmptyState';
import { InvoiceStatusBadge, PeppolStatusBadge } from '@/components/StatusBadge';
import { ConfidenceIndicator } from './ConfidenceIndicator';
import { formatDate, formatMoney } from '@/utils/formatters';
import { getInvoiceSummaryDescription } from '@/utils/invoiceRecognition';

interface InvoiceTableProps {
  invoices: Invoice[];
  isLoading?: boolean;
}

export function InvoiceTable({ invoices, isLoading }: InvoiceTableProps) {
  const navigate = useNavigate();

  if (isLoading) {
    return <InvoiceTableSkeleton />;
  }

  if (!invoices.length) {
    return (
      <EmptyState
        icon={FileText}
        title="Geen facturen gevonden"
        description="Er zijn nog geen facturen die voldoen aan deze filters. Probeer de filters aan te passen of wacht tot nieuwe facturen binnenkomen."
      />
    );
  }

  return (
    <div className="glass-panel overflow-hidden rounded-3xl">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Leverancier</TableHead>
            <TableHead>Omschrijving</TableHead>
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
          {invoices.map((inv) => (
            <TableRow
              key={inv.id}
              className="group cursor-pointer"
              onClick={() => navigate(`/invoices/${inv.id}`)}
            >
              <TableCell>
                <div className="font-semibold text-foreground">{inv.supplierName}</div>
                {inv.supplierKvk && (
                  <div className="mt-0.5 text-xs text-muted-foreground">
                    KVK {inv.supplierKvk}
                  </div>
                )}
              </TableCell>
              <TableCell className="max-w-[220px]">
                <div className="line-clamp-2 text-sm text-foreground">
                  {getInvoiceSummaryDescription(inv)}
                </div>
              </TableCell>
              <TableCell>
                <span className="rounded-lg border border-white/10 bg-white/[0.035] px-2 py-1 font-mono text-xs text-foreground/90">
                  {inv.invoiceNumber}
                </span>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {formatDate(inv.invoiceDate)}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {inv.totalAmount.amount > 0 ? (
                  <span className="font-semibold text-foreground">
                    {formatMoney(inv.totalAmount)}
                  </span>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </TableCell>
              <TableCell>
                <InvoiceStatusBadge status={inv.status} />
              </TableCell>
              <TableCell>
                <ConfidenceIndicator score={inv.confidenceScore} />
              </TableCell>
              <TableCell>
                <PeppolStatusBadge status={inv.peppolStatus} />
              </TableCell>
              <TableCell>
                <ChevronRight className="h-4 w-4 text-muted-foreground/50 transition-transform group-hover:translate-x-1 group-hover:text-primary" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function InvoiceTableSkeleton() {
  return (
    <div className="glass-panel overflow-hidden rounded-3xl">
      <div className="border-b border-white/10 bg-white/[0.035] px-4 py-3">
        <Skeleton className="h-4 w-40" />
      </div>
      <div className="divide-y divide-white/10">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="grid grid-cols-8 items-center gap-4 px-4 py-4">
            <Skeleton className="h-4 w-32" />
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
