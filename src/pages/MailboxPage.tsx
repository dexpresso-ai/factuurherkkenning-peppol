import * as React from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  Ban,
  CheckCircle2,
  ChevronRight,
  Clock3,
  EyeOff,
  FileCheck2,
  FileText,
  Inbox,
  Loader2,
  MailCheck,
  MailOpen,
  Paperclip,
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
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
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

interface MailboxActionHandlers {
  isMutating: boolean;
  onPrevalidate: (id: string) => void;
  onProcess: (id: string) => void;
  onIgnore: (id: string) => void;
}

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
  const [selectedMessageId, setSelectedMessageId] = React.useState<string | undefined>();

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
  const prevalidateMutation = usePrevalidateMailboxMessage();
  const ignoreMutation = useIgnoreMailboxMessage();
  const processMutation = useProcessMailboxMessage();

  const messages = React.useMemo(() => data?.items ?? [], [data?.items]);
  const selectedMessage = React.useMemo(
    () => messages.find((message) => message.id === selectedMessageId),
    [messages, selectedMessageId],
  );
  const isMutating =
    prevalidateMutation.isPending || ignoreMutation.isPending || processMutation.isPending;

  const actionHandlers = React.useMemo<MailboxActionHandlers>(
    () => ({
      isMutating,
      onPrevalidate: (id) => prevalidateMutation.mutate(id),
      onProcess: (id) => processMutation.mutate(id),
      onIgnore: (id) => ignoreMutation.mutate(id),
    }),
    [ignoreMutation, isMutating, prevalidateMutation, processMutation],
  );

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
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 text-base font-extrabold tracking-[-0.03em] text-foreground">
                <MailCheck className="h-5 w-5 text-primary" />
                Ingekomen mail
              </div>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                Alleen de belangrijkste kolommen staan in beeld. Klik op een mailregel om onderwerp, bijlagen, intake-uitleg en acties rechts te openen.
              </p>
            </div>
            <div className="grid gap-2 md:grid-cols-[minmax(14rem,1fr)_12rem_14rem_auto] xl:min-w-[48rem]">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Zoek op mail…"
                  className="pl-9"
                />
              </div>
              <Select value={status} onValueChange={(value) => setStatus(value as MailboxStatusFilter)}>
                <SelectTrigger>
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
                <SelectTrigger>
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
          <MailboxTable
            messages={messages}
            selectedMessageId={selectedMessageId}
            onSelectMessage={setSelectedMessageId}
          />
        )}
      </section>

      <MailboxDetailsSheet
        message={selectedMessage}
        open={Boolean(selectedMessage)}
        onOpenChange={(open) => {
          if (!open) setSelectedMessageId(undefined);
        }}
        actions={actionHandlers}
      />
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

function MailboxTable({
  messages,
  selectedMessageId,
  onSelectMessage,
}: {
  messages: MailboxMessage[];
  selectedMessageId?: string;
  onSelectMessage: (id: string) => void;
}) {
  const handleKeyDown = (event: React.KeyboardEvent<HTMLTableRowElement>, id: string) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onSelectMessage(id);
    }
  };

  return (
    <Table className="table-fixed">
      <TableHeader>
        <TableRow>
          <TableHead className="w-[11rem]">Ontvangen</TableHead>
          <TableHead>Afzender</TableHead>
          <TableHead className="w-[13rem]">Status</TableHead>
          <TableHead className="w-[15rem]">Factuur koppeling</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {messages.map((message) => (
          <TableRow
            key={message.id}
            role="button"
            tabIndex={0}
            aria-label={`Open details voor mail van ${message.fromName ?? message.fromAddress}`}
            data-state={selectedMessageId === message.id ? 'selected' : undefined}
            className="group cursor-pointer align-middle outline-none focus-visible:bg-primary/[0.075]"
            onClick={() => onSelectMessage(message.id)}
            onKeyDown={(event) => handleKeyDown(event, message.id)}
          >
            <TableCell>
              <div className="font-semibold text-foreground">{formatDateTime(message.receivedAt)}</div>
              <div className="mt-1 text-[11px] text-muted-foreground">{message.mailboxAddress}</div>
            </TableCell>
            <TableCell>
              <div className="flex min-w-0 items-center gap-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl border border-white/10 bg-white/[0.04] text-primary">
                  <MailOpen className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <div className="truncate font-bold text-foreground">{message.fromName ?? 'Onbekend'}</div>
                  <div className="mt-1 truncate text-xs text-muted-foreground">{message.fromAddress}</div>
                </div>
              </div>
            </TableCell>
            <TableCell>
              <div className="flex flex-col items-start gap-2">
                <MailboxStatusBadge status={message.status} />
                {message.prevalidation?.outcome === 'manual_review' && (
                  <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-warning">
                    <EyeOff className="h-3 w-3" />
                    Details afgeschermd
                  </div>
                )}
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center justify-between gap-3">
                <InvoiceLink message={message} />
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function InvoiceLink({ message }: { message: MailboxMessage }) {
  if (!message.linkedInvoiceId) {
    return <span className="text-xs text-muted-foreground">Nog niet gekoppeld</span>;
  }

  return (
    <div onClick={(event) => event.stopPropagation()}>
      <Button asChild variant="link" size="sm" className="h-auto px-0 py-0 text-left">
        <Link to={`/invoices/${message.linkedInvoiceId}`}>
          <FileText className="h-3.5 w-3.5" />
          {message.linkedInvoiceNumber ?? 'Open factuur'}
        </Link>
      </Button>
    </div>
  );
}

function MailboxDetailsSheet({
  message,
  open,
  onOpenChange,
  actions,
}: {
  message?: MailboxMessage;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  actions: MailboxActionHandlers;
}) {
  if (!message) {
    return <Sheet open={open} onOpenChange={onOpenChange} />;
  }

  const canProcess = message.prevalidation?.outcome === 'accepted';
  const routeHidden = message.prevalidation?.routeDisclosure === 'hidden_due_threshold';
  const firstFailedRule = message.prevalidation?.rules.find((rule) => !rule.passed);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[34rem]">
        <div className="border-b border-white/10 p-5 pr-12">
          <SheetHeader>
            <div className="flex flex-wrap items-center gap-2">
              <MailboxStatusBadge status={message.status} />
              <IntakeOutcomeBadge message={message} />
            </div>
            <SheetTitle className="mt-3">{message.subject}</SheetTitle>
            <SheetDescription>
              {message.fromName ?? message.fromAddress} · {formatDateTime(message.receivedAt)}
            </SheetDescription>
          </SheetHeader>
        </div>

        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-5">
          {routeHidden && (
            <div className="rounded-3xl border border-warning/30 bg-warning/10 p-4 text-sm text-warning">
              <div className="flex items-center gap-2 font-extrabold">
                <EyeOff className="h-4 w-4" />
                Route-informatie verborgen
              </div>
              <p className="mt-2 leading-relaxed text-warning/90">
                Het totaalbedrag is hoger dan € 5.000. Route- of goedkeuringsnamen worden daarom niet getoond en deze mail vraagt handmatige controle.
              </p>
            </div>
          )}

          <DrawerSection title="Mailgegevens">
            <DetailRow label="Ontvangen" value={formatDateTime(message.receivedAt)} />
            <DetailRow label="Mailbox" value={message.mailboxAddress} />
            <DetailRow label="Afzender" value={message.fromName ?? 'Onbekend'} />
            <DetailRow label="E-mailadres" value={message.fromAddress} />
            <DetailRow label="Geschat bedrag" value={formatMoney(message.estimatedTotalAmount)} strong />
            {message.bodyPreview && (
              <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
                <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground">Preview</div>
                <p className="mt-2 text-sm leading-relaxed text-foreground/85">{message.bodyPreview}</p>
              </div>
            )}
          </DrawerSection>

          <DrawerSection title="Bijlagen">
            <div className="flex flex-wrap gap-2">
              {message.hasAttachments ? (
                <>
                  {message.pdfAttachmentCount > 0 && <Badge variant="default">PDF {message.pdfAttachmentCount}</Badge>}
                  {message.xmlAttachmentCount > 0 && <Badge variant="info">XML {message.xmlAttachmentCount}</Badge>}
                  {message.attachmentCount - message.pdfAttachmentCount - message.xmlAttachmentCount > 0 && (
                    <Badge variant="muted">Overig {message.attachmentCount - message.pdfAttachmentCount - message.xmlAttachmentCount}</Badge>
                  )}
                </>
              ) : (
                <Badge variant="destructive">
                  <XCircle className="h-3 w-3" />
                  Geen bijlage
                </Badge>
              )}
            </div>
            {message.attachments.length > 0 && (
              <div className="space-y-2">
                {message.attachments.map((attachment) => (
                  <div
                    key={attachment.id}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.035] p-3"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 font-semibold text-foreground">
                        <Paperclip className="h-4 w-4 shrink-0 text-primary" />
                        <span className="truncate">{attachment.fileName}</span>
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        {attachment.contentType} · {formatBytes(attachment.sizeBytes)}
                      </div>
                    </div>
                    <Badge variant={attachment.isInvoiceCandidate ? 'success' : 'muted'}>
                      {attachment.isInvoiceCandidate ? 'Kandidaat' : 'Ruis'}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </DrawerSection>

          <DrawerSection title="Intakebesluit">
            <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
              <div className="flex flex-wrap items-center gap-2">
                <IntakeOutcomeBadge message={message} />
                {firstFailedRule && <Badge variant="warning">Aandachtspunt</Badge>}
              </div>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {message.prevalidation?.summary ?? 'Deze mail is nog niet vooraf beoordeeld.'}
              </p>
            </div>
            {message.prevalidation?.rules && message.prevalidation.rules.length > 0 && (
              <div className="space-y-2">
                {message.prevalidation.rules.map((rule) => (
                  <div
                    key={rule.code}
                    className={cn(
                      'rounded-2xl border p-3 text-sm',
                      rule.passed
                        ? 'border-success/20 bg-success/5 text-foreground/90'
                        : rule.severity === 'warning'
                          ? 'border-warning/30 bg-warning/10 text-warning'
                          : 'border-destructive/25 bg-destructive/10 text-destructive',
                    )}
                  >
                    <div className="flex items-start gap-2">
                      {rule.passed ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /> : <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />}
                      <div className="leading-relaxed">{rule.message}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </DrawerSection>

          <DrawerSection title="Factuurkoppeling">
            <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
              {message.linkedInvoiceId ? (
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground">Gekoppelde factuur</div>
                    <div className="mt-1 font-extrabold text-foreground">{message.linkedInvoiceNumber ?? message.linkedInvoiceId}</div>
                  </div>
                  <Button asChild variant="outline" size="sm">
                    <Link to={`/invoices/${message.linkedInvoiceId}`}>
                      <FileText className="h-3.5 w-3.5" />
                      Open
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">Nog niet gekoppeld aan een factuur.</div>
              )}
            </div>
          </DrawerSection>

          <DrawerSection title="Techniek">
            <DetailRow label="Message ID" value={message.graphMessageId || '—'} mono />
            <DetailRow label="Immutable ID" value={message.graphImmutableMessageId ?? '—'} mono />
            <DetailRow label="Conversation ID" value={message.conversationId ?? '—'} mono />
            <DetailRow label="Laatste actie" value={message.lastActionAt ? formatDateTime(message.lastActionAt) : '—'} />
            {message.lastError && <DetailRow label="Laatste fout" value={message.lastError} />}
          </DrawerSection>
        </div>

        <div className="border-t border-white/10 bg-card/95 p-4">
          <div className="grid gap-2 sm:grid-cols-3">
            <Button
              variant="outline"
              disabled={actions.isMutating}
              onClick={() => actions.onPrevalidate(message.id)}
            >
              <RefreshCw className={cn('h-4 w-4', actions.isMutating && 'animate-spin')} />
              Check
            </Button>
            <Button
              disabled={!canProcess || actions.isMutating}
              onClick={() => actions.onProcess(message.id)}
            >
              Verwerk
            </Button>
            <Button
              variant="ghost"
              disabled={actions.isMutating || message.status === 'ignored'}
              onClick={() => actions.onIgnore(message.id)}
            >
              Negeer
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function DrawerSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <div className="flex items-center gap-3">
        <h3 className="text-sm font-extrabold uppercase tracking-[0.14em] text-muted-foreground">{title}</h3>
        <Separator className="flex-1" />
      </div>
      {children}
    </section>
  );
}

function DetailRow({
  label,
  value,
  strong = false,
  mono = false,
}: {
  label: string;
  value: React.ReactNode;
  strong?: boolean;
  mono?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.025] px-4 py-3">
      <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground">{label}</div>
      <div
        className={cn(
          'max-w-[62%] break-words text-right text-sm text-foreground/90',
          strong && 'font-extrabold text-foreground',
          mono && 'font-mono text-[11px] leading-relaxed text-muted-foreground',
        )}
      >
        {value}
      </div>
    </div>
  );
}

function MailboxTableSkeleton() {
  return (
    <div className="space-y-3 p-5">
      {Array.from({ length: 6 }).map((_, index) => (
        <Skeleton key={index} className="h-16 rounded-2xl" />
      ))}
    </div>
  );
}
