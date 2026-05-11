import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Download, RefreshCw } from 'lucide-react';
import type { InvoiceListFilters, InvoiceStatus } from '@/types';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { InvoiceFilters } from '@/features/invoices/InvoiceFilters';
import { InvoiceTable } from '@/features/invoices/InvoiceTable';
import { useInvoices } from '@/hooks/useInvoices';

export function InvoicesPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const initialFilters = useMemo<InvoiceListFilters>(
    () => ({
      status: (searchParams.get('status') as InvoiceStatus | null) ?? undefined,
    }),
    // Eslint dep — alleen bij eerste render
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const [filters, setFilters] = useState<InvoiceListFilters>(initialFilters);

  const { data, isLoading, isFetching, refetch } = useInvoices(filters);

  const handleFiltersChange = (next: InvoiceListFilters) => {
    setFilters(next);
    // Reflect status in URL
    const params = new URLSearchParams();
    if (next.status && next.status !== 'all') params.set('status', next.status);
    setSearchParams(params, { replace: true });
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[{ label: 'Dashboard', to: '/' }, { label: 'Facturen' }]}
      />

      <PageHeader
        title="Facturen"
        description={
          data
            ? `${data.total} ${data.total === 1 ? 'factuur' : 'facturen'} gevonden`
            : 'Inkomende facturen vanuit de mailbox'
        }
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isFetching}
            >
              <RefreshCw
                className={
                  'h-3.5 w-3.5 ' + (isFetching ? 'animate-spin' : '')
                }
              />
              Vernieuwen
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-3.5 w-3.5" />
              Exporteren
            </Button>
          </>
        }
      />

      <InvoiceFilters value={filters} onChange={handleFiltersChange} />

      <InvoiceTable invoices={data?.items ?? []} isLoading={isLoading} />
    </div>
  );
}
