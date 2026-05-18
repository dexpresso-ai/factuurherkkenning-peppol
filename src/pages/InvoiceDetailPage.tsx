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
      <div className="space-y-6">
        <Skeleton className="h-4 w-64" />
        <Skeleton className="h-8 w-96" />
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-[700px] rounded-xl" />
          <Skeleton className="h-[700px] rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <Breadcrumbs
        items={[
          { label: 'Dashboard', to: '/' },
          { label: 'Facturen', to: '/invoices' },
          { label: invoice.invoiceNumber },
        ]}
      />

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link
            to="/invoices"
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3 w-3" /> Terug
          </Link>
          <h1 className="mt-1 flex items-baseline gap-3 text-2xl font-semibold tracking-tight text-foreground">
            <span className="font-mono">{invoice.invoiceNumber}</span>
            <span className="text-base font-normal text-muted-foreground">
              {invoice.supplierName}
            </span>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {getInvoiceSummaryDescription(invoice)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <InvoiceStatusBadge status={invoice.status} />
          <PeppolStatusBadge status={invoice.peppolStatus} />
        </div>
      </div>

      {/* Validation block — always visible at top */}
      <ValidationBlock issues={invoice.validationIssues} />

      {/* Split panel — PDF left, fields/audit right (tabs) */}
      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="overflow-hidden p-0 lg:h-[calc(100vh-320px)] lg:min-h-[600px]">
          <PdfPreview invoice={invoice} />
        </Card>

        <Card className="overflow-hidden p-0 lg:h-[calc(100vh-320px)] lg:min-h-[600px]">
          <Tabs defaultValue="fields" className="flex h-full flex-col">
            <div className="border-b border-border bg-muted/40 px-4 py-2">
              <TabsList>
                <TabsTrigger value="fields">
                  <FileText className="mr-1.5 h-3.5 w-3.5" />
                  Velden
                </TabsTrigger>
                <TabsTrigger value="validation">
                  <ShieldCheck className="mr-1.5 h-3.5 w-3.5" />
                  Validatie
                </TabsTrigger>
                <TabsTrigger value="audit">
                  <ClipboardList className="mr-1.5 h-3.5 w-3.5" />
                  Audit
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent
              value="fields"
              className="m-0 flex-1 overflow-hidden data-[state=inactive]:hidden"
            >
              <ExtractionFields key={`${invoice.id}-${invoice.updatedAt}`} invoice={invoice} />
            </TabsContent>

            <TabsContent
              value="validation"
              className="m-0 flex-1 overflow-y-auto p-6 data-[state=inactive]:hidden"
            >
              <h3 className="mb-3 text-sm font-semibold">Validatie-resultaat</h3>
              <ValidationBlock issues={invoice.validationIssues} />

              <h3 className="mb-3 mt-6 text-sm font-semibold">Bron-mail</h3>
              <dl className="space-y-2 text-sm">
                <DetailRow label="Van" value={invoice.source.fromAddress} mono />
                <DetailRow label="Onderwerp" value={invoice.source.subject} />
                <DetailRow
                  label="Bijlage"
                  value={invoice.source.attachmentName}
                  mono
                />
                <DetailRow
                  label="Message-ID"
                  value={invoice.source.messageId}
                  mono
                />
              </dl>
            </TabsContent>

            <TabsContent
              value="audit"
              className="m-0 flex-1 overflow-y-auto p-6 data-[state=inactive]:hidden"
            >
              <AuditTimeline
                entries={auditEntries ?? []}
                isLoading={auditLoading}
              />
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
