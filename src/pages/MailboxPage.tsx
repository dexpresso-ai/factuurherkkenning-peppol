import * as React from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  Ban,
  CheckCircle2,
  Clock3,
  EyeOff,
  FileCheck2,
  FileText,
  Inbox,
  Loader2,
  MailCheck,
  RefreshCw,
  Search,
  ShieldAlert,
  SlidersHorizontal,
  XCircle,
} from 'lucide-react';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { PageHeader } from '@/components/PageHeader';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useIgnoreMailboxMessage,
  useMailboxMessages,
  usePrevalidateMailboxMessage,
  useProcessMailboxMessage,
  useSyncMailboxNow,
} from '@/hooks/useFeatures';
import type {
  MailboxMessage,
  MailboxMessageListFilters,
  MailboxMessageStatus,
  MailboxPrevalidationOutcome,
} from '@/types';
import { cn } from '@/lib/utils';
import { formatBytes, formatDateTime, formatMoney } from '@/utils/formatters';

type MailboxStatusFilter = MailboxMessageStatus | 'all';
type MailboxOutcomeFilter = MailboxPrevalidationOutcome | 'all';

const statusOptions: { value: MailboxStatusFilter; label: string }[] = [
  { value: 'all', label: 'Alle statussen' },
  { value: 'accepted', label: 'Goedgekeurd' },
  { value: 'manual_review', label: 'Controle nodig' },
  { value: 'rejected', label: 'Afgekeurd' },
  { value: 'queued', label: 'In wachtrij' },
  { value: 'invoice_created', label: 'Factuur aangemaakt' },
  { value: 'ignored', label: 'Genegeerd' },
  { value: 'failed', label: 'Fout' },
];

const outcomeOptions: { value: MailboxOutcomeFilter; label: string }[] = [
  { value: 'all', label: 'Alle intake-uitkomsten' },
  { value: 'accepted', label: 'Vrijgegeven' },
  { value: 'manual_review', label: 'Handmatige controle' },
  { value: 'rejected', label: 'Vooraf afgekeurd' },
];

function getStatusPresentation(status: MailboxMessageStatus) {
  switch (status) {
    case 'accepted':
      return { label: 'Goedgekeurd', variant: 'success' as const, Icon: CheckCircle2 };
    case 'manual_review':
      return { label: 'Controle nodig', variant: 'warning' as const, Icon: ShieldAlert };
    case 'rejected':
      return { label: 'Afgekeurd', variant: 'destructive' as const, Icon: XCircle };
    case 'queued':
      return { label: 'Wachtrij', variant: 'info' as const, Icon: Clock3 };
    case 'processing':
      return { label: 'Verwerken', variant: 'secondary' as const, Icon: Loader2 };
    case 'invoice_created':
      return { label: 'Factuur klaar', variant: 'default' as const, Icon: FileCheck2 };
    case 'ignored':
      return { label: 'Genegeerd', variant: 'muted' as const, Icon: Ban };
    case 'failed':
      return { label: 'Fout', variant: 'destructive' as const, Icon: AlertTriangle };
    case 'new':
    default:
      return { label: 'Nieuw', variant: 'info' as const, Icon: Inbox };
  }
}

function MailboxStatusBadge({ status }: { status: MailboxMessageStatus }) {
  const { label, variant, Icon } = getStatusPresentation(status);
  return (
    <Badge variant={variant}>
      <Icon className={cn('h-3 w-3', status === 'processing' && 'animate-spin')} />
      {label}
    </Badge>
  );
}

function IntakeOutcomeBadge({ message }: { message: MailboxMessage }) {
  const outcome = message.prevalidation?.outcome;
  if (!outcome) return <Badge variant="muted">Nog niet beoordeeld</Badge>;

  if (outcome === 'accepted') {
    return (
      <Badge variant="success">
        <CheckCircle2 className="h-3 w-3" />
        Vrijgegeven
      </Badge>
    );
  }

  if (outcome === 'manual_review') {
    return (
      <Badge variant="warning">
        <ShieldAlert className="h-3 w-3" />
        Handmatige controle
      </Badge>
    );
  }

  return (
    <Badge variant="destructive">
      <XCircle className="h-3 w-3" />
      Vooraf afgekeurd
    </Badge>
  );
}

export function MailboxPage() {
  const [search, setSearch] = React.useState('');
  const [status, setStatus] = React.useState<MailboxStatusFilter>('all');
  const [outcome, setOutcome] = React.useState<MailboxOutcomeFilter>('all');

  const filters = React.useMemo<MailboxMessageListFilters>(
    () => ({
      search: search.trim() || undefined,
      status,
      outcome,
      pageSize: 50,
    }),
    [outcome, search, status],
  );

  const { data, isLoading, isError, error, refetch } = useMailboxMessages(filters);
  const syncMutation = useSyncMailboxNow();

  const messages = React.useMemo(() => data?.items ?? [], [data?.items]);
  const totals = React.useMemo(() => {
    return messages.reduce(
      (acc, message) => {
        acc.total += 1;
        if (message.prevalidation?.outcome === 'accepted') acc.accepted += 1;
        if (message.prevalidation?.outcome === 'manual_review') acc.manual += 1;
        if (message.prevalidation?.outcome === 'rejected') acc.rejected += 1;
        if (message.attachmentCount === 0) acc.withoutAttachment += 1;
        return acc;
      },
      { total: 0, accepted: 0, manual: 0, rejected: 0, withoutAttachment: 0 },
    );
  }, [messages]);

  const clearFilters = () => {
    setSearch('');
    setStatus('all');
    setOutcome('all');
  };

  return (
    <div className="space-y-5">
      <Breadcrumbs items={[{ label: 'Mailbox' }]} />

      <PageHeader
        title="Mailbox Intake"
        description="Bekijk ingekomen mails los van factuurherkenning. De intake-agent keurt vooraf af waar dat kan, blokkeert ruis en zet alleen bruikbare mails door."
        actions={
          <Button
            onClick={() => syncMutation.mutate()}
            disabled={syncMutation.isPending}
          >
            <RefreshCw className={cn('h-4 w-4', syncMutation.isPending && 'animate-spin')} />
            {syncMutation.isPending ? 'Synchroniseren…' : 'Sync mailbox'}
          </Button>
        }
      />

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <MailboxMetric
          label="In beeld"
          value={totals.total}
          detail="na filters"
          icon={Inbox}
        />
        <MailboxMetric
          label="Vrijgegeven"
          value={totals.accepted}
          detail="mag door naar herkenning"
          icon={CheckCircle2}
          tone="success"
        />
        <MailboxMetric
          label="Controle nodig"
          value={totals.manual}
          detail="o.a. bedrag > € 5.000"
          icon={ShieldAlert}
          tone="warning"
        />
        <MailboxMetric
          label="Vooraf afgekeurd"
          value={totals.rejected}
          detail={`${totals.withoutAttachment} zonder bijlage`}
          icon={XCircle}
          tone="destructive"
        />
      </section>

      <section className="glass-panel overflow-hidden rounded-[2rem]">
        <div className="border-b border-white/10 p-4 sm:p-5">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <div className="flex items-center gap-2 text-base font-extrabold tracking-[-0.03em] text-foreground">
                <MailCheck className="h-5 w-5 text-primary" />
                Ingekomen mail
              </div>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                De tabel toont metadata, bijlagen en intakebesluit. Route-/goedkeuringsnamen worden bewust niet getoond bij hoge bedragen.
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="relative min-w-[17rem]">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Zoek op afzender, onderwerp of bijlage…"
                  className="pl-9"
                />
              </div>
              <Select value={status} onValueChange={(value) => setStatus(value as MailboxStatusFilter)}>
                <SelectTrigger className="min-w-[12rem]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={outcome} onValueChange={(value) => setOutcome(value as MailboxOutcomeFilter)}>
                <SelectTrigger className="min-w-[14rem]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {outcomeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={clearFilters}>
                <SlidersHorizontal className="h-4 w-4" />
                Reset
              </Button>
            </div>
          </div>
        </div>

        {isLoading && <MailboxTableSkeleton />}

        {isError && (
          <div className="p-6">
            <div className="rounded-3xl border border-destructive/30 bg-destructive/5 p-5 text-sm">
              <div className="font-bold text-destructive">Mailbox kon niet worden geladen</div>
              <div className="mt-1 text-muted-foreground">
                {error instanceof Error ? error.message : 'Onbekende fout'}
              </div>
              <Button variant="outline" className="mt-4" onClick={() => refetch()}>
                Opnieuw proberen
              </Button>
            </div>
          </div>
        )}

        {!isLoading && !isError && messages.length === 0 && (
          <div className="p-8 text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-white/10 bg-white/[0.04] text-muted-foreground">
              <Inbox className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-lg font-bold text-foreground">Geen mails gevonden</h3>
            <p className="mt-1 text-sm text-muted-foreground">Pas je filters aan of synchroniseer de mailbox opnieuw.</p>
          </div>
        )}

        {!isLoading && !isError && messages.length > 0 && (
          <MailboxTable messages={messages} />
        )}
      </section>
    </div>
  );
}

function MailboxMetric({
  label,
  value,
  detail,
  icon: Icon,
  tone = 'default',
}: {
  label: string;
  value: number;
  detail: string;
  icon: React.ComponentType<{ className?: string }>;
  tone?: 'default' | 'success' | 'warning' | 'destructive';
}) {
  const toneClass = {
    default: 'border-primary/20 bg-primary/10 text-primary',
    success: 'border-success/25 bg-success/10 text-success',
    warning: 'border-warning/30 bg-warning/10 text-warning',
    destructive: 'border-destructive/30 bg-destructive/10 text-destructive',
  }[tone];

  return (
    <div className="glass-panel rounded-3xl p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">{label}</div>
          <div className="mt-1 text-3xl font-extrabold tracking-[-0.06em] text-foreground">{value}</div>
          <div className="mt-1 text-xs text-muted-foreground">{detail}</div>
        </div>
        <div className={cn('grid h-11 w-11 place-items-center rounded-2xl border', toneClass)}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

function MailboxTable({ messages }: { messages: MailboxMessage[] }) {
  const prevalidateMutation = usePrevalidateMailboxMessage();
  const ignoreMutation = useIgnoreMailboxMessage();
  const processMutation = useProcessMailboxMessage();

  const isMutating =
    prevalidateMutation.isPending || ignoreMutation.isPending || processMutation.isPending;

  return (
    <div className="overflow-x-auto">
      <Table className="min-w-[1180px]">
        <TableHeader>
          <TableRow>
            <TableHead className="w-[11rem]">Ontvangen</TableHead>
            <TableHead className="w-[15rem]">Afzender</TableHead>
            <TableHead>Onderwerp</TableHead>
            <TableHead className="w-[11rem]">Bijlagen</TableHead>
            <TableHead className="w-[12rem]">Bedrag</TableHead>
            <TableHead className="w-[13rem]">Intake</TableHead>
            <TableHead className="w-[13rem]">Status</TableHead>
            <TableHead className="w-[12rem]">Factuur</TableHead>
            <TableHead className="w-[16rem] text-right">Acties</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {messages.map((message) => {
            const canProcess = message.prevalidation?.outcome === 'accepted';
            const showRouteGuard = message.prevalidation?.routeDisclosure === 'hidden_due_threshold';
            return (
              <TableRow key={message.id} className="align-top">
                <TableCell>
                  <div className="font-semibold text-foreground">{formatDateTime(message.receivedAt)}</div>
                  <div className="mt-1 text-[11px] text-muted-foreground">{message.mailboxAddress}</div>
                </TableCell>
                <TableCell>
                  <div className="font-bold text-foreground">{message.fromName ?? 'Onbekend'}</div>
                  <div className="mt-1 truncate text-xs text-muted-foreground">{message.fromAddress}</div>
                </TableCell>
                <TableCell>
                  <div className="max-w-[26rem] font-semibold text-foreground">{message.subject}</div>
                  {message.bodyPreview && (
                    <div className="mt-1 line-clamp-2 max-w-[32rem] text-xs leading-relaxed text-muted-foreground">
                      {message.bodyPreview}
                    </div>
                  )}
                  {message.prevalidation?.summary && (
                    <div className="mt-2 max-w-[32rem] text-[11px] leading-relaxed text-muted-foreground">
                      {message.prevalidation.summary}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <AttachmentSummary message={message} />
                </TableCell>
                <TableCell>
                  <div className="font-bold text-foreground">{formatMoney(message.estimatedTotalAmount)}</div>
                  {showRouteGuard && (
                    <div className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-warning/30 bg-warning/10 px-2 py-1 text-[11px] font-semibold text-warning">
                      <EyeOff className="h-3 w-3" />
                      Route verborgen
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <IntakeOutcomeBadge message={message} />
                  {message.prevalidation?.rules?.[0] && (
                    <div className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
                      {message.prevalidation.rules.find((rule) => !rule.passed)?.message ?? message.prevalidation.rules[0].message}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <MailboxStatusBadge status={message.status} />
                  {message.lastError && (
                    <div className="mt-2 text-[11px] text-destructive">{message.lastError}</div>
                  )}
                </TableCell>
                <TableCell>
                  {message.linkedInvoiceId ? (
                    <Button asChild variant="link" size="sm" className="h-auto px-0 py-0">
                      <Link to={`/invoices/${message.linkedInvoiceId}`}>
                        <FileText className="h-3.5 w-3.5" />
                        {message.linkedInvoiceNumber ?? 'Open factuur'}
                      </Link>
                    </Button>
                  ) : (
                    <span className="text-xs text-muted-foreground">Nog niet gekoppeld</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={isMutating}
                      onClick={() => prevalidateMutation.mutate(message.id)}
                    >
                      <RefreshCw className={cn('h-3.5 w-3.5', prevalidateMutation.isPending && 'animate-spin')} />
                      Check
                    </Button>
                    <Button
                      size="sm"
                      disabled={!canProcess || isMutating}
                      onClick={() => processMutation.mutate(message.id)}
                    >
                      Verwerk
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={isMutating || message.status === 'ignored'}
                      onClick={() => ignoreMutation.mutate(message.id)}
                    >
                      Negeer
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

function AttachmentSummary({ message }: { message: MailboxMessage }) {
  if (!message.hasAttachments) {
    return (
      <Badge variant="destructive">
        <XCircle className="h-3 w-3" />
        Geen bijlage
      </Badge>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5">
        {message.pdfAttachmentCount > 0 && <Badge variant="default">PDF {message.pdfAttachmentCount}</Badge>}
        {message.xmlAttachmentCount > 0 && <Badge variant="info">XML {message.xmlAttachmentCount}</Badge>}
        {message.attachmentCount - message.pdfAttachmentCount - message.xmlAttachmentCount > 0 && (
          <Badge variant="muted">Overig {message.attachmentCount - message.pdfAttachmentCount - message.xmlAttachmentCount}</Badge>
        )}
      </div>
      <div className="space-y-1">
        {message.attachments.slice(0, 2).map((attachment) => (
          <div key={attachment.id} className="truncate text-[11px] text-muted-foreground">
            {attachment.fileName} · {formatBytes(attachment.sizeBytes)}
          </div>
        ))}
        {message.attachments.length > 2 && (
          <div className="text-[11px] text-muted-foreground">+{message.attachments.length - 2} extra</div>
        )}
      </div>
    </div>
  );
}

function MailboxTableSkeleton() {
  return (
    <div className="space-y-3 p-5">
      {Array.from({ length: 6 }).map((_, index) => (
        <Skeleton key={index} className="h-20 rounded-2xl" />
      ))}
    </div>
  );
}
