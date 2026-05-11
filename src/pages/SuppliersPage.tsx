import { Building2, CheckCircle2, ShieldQuestion } from 'lucide-react';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { PageHeader } from '@/components/PageHeader';
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
import { Badge } from '@/components/ui/badge';
import { useSuppliers } from '@/hooks/useFeatures';
import { formatDate } from '@/utils/formatters';

export function SuppliersPage() {
  const { data, isLoading } = useSuppliers();

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Dashboard', to: '/' }, { label: 'Leveranciers' }]} />
      <PageHeader
        title="Leveranciers"
        description="Bekende leveranciers, herkend via KVK en e-maildomein."
      />

      {isLoading && <Skeleton className="h-96 rounded-xl" />}

      {!isLoading && (!data || data.length === 0) && (
        <EmptyState icon={Building2} title="Nog geen leveranciers" />
      )}

      {!isLoading && data && data.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Naam</TableHead>
                <TableHead>KVK</TableHead>
                <TableHead>BTW-nummer</TableHead>
                <TableHead>Peppol ID</TableHead>
                <TableHead className="text-right">Facturen</TableHead>
                <TableHead>Laatste factuur</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>
                    <div className="font-medium text-foreground">{s.name}</div>
                    {s.emailDomain && (
                      <div className="text-xs text-muted-foreground">
                        @{s.emailDomain}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {s.kvk ?? '—'}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {s.vatNumber ?? '—'}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {s.peppolParticipantId ?? '—'}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {s.invoiceCount}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(s.lastInvoiceAt)}
                  </TableCell>
                  <TableCell>
                    {s.isVerified ? (
                      <Badge variant="success">
                        <CheckCircle2 className="h-3 w-3" /> Geverifieerd
                      </Badge>
                    ) : (
                      <Badge variant="warning">
                        <ShieldQuestion className="h-3 w-3" /> Te verifiëren
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
