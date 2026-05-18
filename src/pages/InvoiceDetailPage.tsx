import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ClipboardList, FileText, ShieldCheck } from 'lucide-react';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { InvoiceStatusBadge, PeppolStatusBadge } from '@/components/StatusBadge';
import { PdfPreview } from '@/features/invoices/PdfPreview';
import { ExtractionFields } from '@/features/invoices/ExtractionFields';
import { ValidationBlock } from '@/features/invoices/ValidationBlock';
import { AuditTimeline } from '@/features/audit/AuditTimeline';
import { useInvoice } from '@/hooks/useInvoices';
import { useInvoiceAudit } from '@/hooks/useFeatures';
import { getInvoiceSummaryDescription } from '@/utils/invoiceRecognition';

export function InvoiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: invoice, isLoading, isError, error } = useInvoice(id);
  const { data: auditEntries, isLoading: auditLoading } = useInvoiceAudit(id);

  if (isError) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/invoices')}>
          <ArrowLeft className="h-3.5 w-3.5" />
          Terug naar overzicht
        </Button>
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6">
          <div className="font-medium text-destructive">Factuur niet gevonden</div>
          <div className="mt-1 text-sm text-muted-foreground">
            {error instanceof Error ? error.message : 'Onbekende fout'}
          </div>
        </div>
      </div>
    );
  }

  if (isLoading || !invoice) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-4 w-64" />
        <Skeleton className="h-8 w-96" />
        <div className="grid gap-5 lg:grid-cols-2">
          <Skeleton className="h-[720px] rounded-xl" />
          <Skeleton className="h-[720px] rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-col gap-3 lg:h-[calc(100dvh-9.5rem)]">
      <div className="shrink-0 space-y-2">
        <Breadcrumbs
          items={[
            { label: 'Dashboard', to: '/' },
            { label: 'Facturen', to: '/invoices' },
            { label: invoice.invoiceNumber },
          ]}
        />

        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="min-w-0">
            <Link
              to="/invoices"
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-3 w-3" /> Terug
            </Link>
            <h1 className="mt-1 flex flex-wrap items-baseline gap-x-3 gap-y-1 text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
              <span className="font-mono">{invoice.invoiceNumber}</span>
              <span className="text-sm font-normal text-muted-foreground sm:text-base">
                {invoice.supplierName}
              </span>
            </h1>
            <p className="mt-0.5 max-w-3xl truncate text-sm text-muted-foreground">
              {getInvoiceSummaryDescription(invoice)}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <InvoiceStatusBadge status={invoice.status} />
            <PeppolStatusBadge status={invoice.peppolStatus} />
          </div>
        </div>

        {invoice.validationIssues.length > 0 && (
          <ValidationBlock issues={invoice.validationIssues} showSuccessWhenEmpty={false} />
        )}
      </div>

      <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[minmax(0,0.96fr)_minmax(480px,1.04fr)]">
        <Card className="min-h-[520px] overflow-hidden p-0 lg:min-h-0">
          <PdfPreview invoice={invoice} />
        </Card>

        <Card className="min-h-[640px] overflow-hidden p-0 lg:min-h-0">
          <Tabs defaultValue="fields" className="flex h-full min-h-0 flex-col">
            <div className="shrink-0 border-b border-white/10 bg-muted/30 px-4 py-3">
              <TabsList className="h-9 max-w-full overflow-x-auto">
                <TabsTrigger value="fields" className="h-7 px-3 text-xs sm:text-sm">
                  <FileText className="mr-1.5 h-3.5 w-3.5" />
                  Velden
                </TabsTrigger>
                <TabsTrigger value="validation" className="h-7 px-3 text-xs sm:text-sm">
                  <ShieldCheck className="mr-1.5 h-3.5 w-3.5" />
                  Validatie
                </TabsTrigger>
                <TabsTrigger value="audit" className="h-7 px-3 text-xs sm:text-sm">
                  <ClipboardList className="mr-1.5 h-3.5 w-3.5" />
                  Audit
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent
              value="fields"
              className="m-0 min-h-0 flex-1 overflow-hidden data-[state=inactive]:hidden"
            >
              <ExtractionFields key={`${invoice.id}-${invoice.updatedAt}`} invoice={invoice} />
            </TabsContent>

            <TabsContent
              value="validation"
              className="m-0 min-h-0 flex-1 overflow-y-auto p-5 data-[state=inactive]:hidden"
            >
              <h3 className="mb-3 text-sm font-semibold">Validatie-resultaat</h3>
              <ValidationBlock issues={invoice.validationIssues} />

              <h3 className="mb-3 mt-6 text-sm font-semibold">Bron-mail</h3>
              <dl className="space-y-2 text-sm">
                <DetailRow label="Van" value={invoice.source.fromAddress} mono />
                <DetailRow label="Onderwerp" value={invoice.source.subject} />
                <DetailRow label="Bijlage" value={invoice.source.attachmentName} mono />
                <DetailRow label="Message-ID" value={invoice.source.messageId} mono />
              </dl>
            </TabsContent>

            <TabsContent
              value="audit"
              className="m-0 min-h-0 flex-1 overflow-y-auto p-5 data-[state=inactive]:hidden"
            >
              <AuditTimeline entries={auditEntries ?? []} isLoading={auditLoading} />
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}

function DetailRow({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="grid grid-cols-[120px_1fr] gap-2">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className={'truncate text-foreground ' + (mono ? 'font-mono text-xs' : '')}>
        {value}
      </dd>
    </div>
  );
}
