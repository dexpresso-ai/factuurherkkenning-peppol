import type {
  MailboxAttachmentKind,
  MailboxAttachmentSummary,
  MailboxMessage,
  MailboxMessageActionResult,
  MailboxMessageListFilters,
  MailboxMessageStatus,
  MailboxPrevalidationDecision,
  MailboxPrevalidationOutcome,
  MailboxPrevalidationRuleCode,
  MailboxPrevalidationRuleResult,
  Money,
  PagedResult,
} from '@/types';

export type MailboxMessageApiDto = Partial<MailboxMessage> & {
  mailboxMessageId?: string;
  provider?: 'microsoft_graph' | string;
  providerMessageId?: string;
  graphId?: string;
  graphImmutableMessageId?: string;
  graphChangeKey?: string;
  graphFolderId?: string;
  immutableId?: string;
  changeKey?: string;
  folderId?: string;
  from?: {
    emailAddress?: {
      name?: string;
      address?: string;
    };
  };
  fromEmailAddress?: string;
  fromDisplayName?: string;
  receivedDateTime?: string;
  preview?: string;
  estimatedAmount?: Money;
  totalAmount?: Money;
  invoiceId?: string;
  invoiceNumber?: string;
};

export type MailboxMessageListApiResponse =
  | PagedResult<MailboxMessageApiDto>
  | MailboxMessageApiDto[]
  | {
      data?: MailboxMessageApiDto[];
      items?: MailboxMessageApiDto[];
      total?: number;
      page?: number;
      pageSize?: number;
    };

export type MailboxMessageActionResultApiDto =
  | MailboxMessageActionResult
  | MailboxMessageApiDto
  | {
      message?: MailboxMessageApiDto;
      item?: MailboxMessageApiDto;
      resultMessage?: string;
      messageText?: string;
      correlationId?: string;
      traceId?: string;
    };

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' && value.trim() !== '' ? value : fallback;
}

function asOptionalString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() !== '' ? value : undefined;
}

function asBoolean(value: unknown, fallback = false): boolean {
  return typeof value === 'boolean' ? value : fallback;
}

function asNumber(value: unknown, fallback = 0): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function normalizeMoney(value: unknown): Money | undefined {
  if (!isRecord(value)) return undefined;
  const amount = value.amount;
  const currency = value.currency;
  if (typeof amount !== 'number' || !Number.isFinite(amount)) return undefined;
  return {
    amount,
    currency: typeof currency === 'string' && currency.length > 0 ? (currency as Money['currency']) : 'EUR',
  };
}

function inferAttachmentKind(dto: Record<string, unknown>): MailboxAttachmentKind {
  const explicitKind = asOptionalString(dto.kind)?.toLowerCase();
  if (explicitKind === 'pdf' || explicitKind === 'xml' || explicitKind === 'image' || explicitKind === 'other') {
    return explicitKind;
  }

  const contentType = asOptionalString(dto.contentType)?.toLowerCase() ?? '';
  const fileName = asOptionalString(dto.fileName)?.toLowerCase() ?? '';

  if (contentType.includes('pdf') || fileName.endsWith('.pdf')) return 'pdf';
  if (contentType.includes('xml') || fileName.endsWith('.xml') || fileName.endsWith('.ubl')) return 'xml';
  if (contentType.startsWith('image/')) return 'image';
  return 'other';
}

function normalizeAttachment(value: unknown, index: number): MailboxAttachmentSummary {
  const dto = isRecord(value) ? value : {};
  const kind = inferAttachmentKind(dto);

  return {
    id: asString(dto.id, `attachment-${index + 1}`),
    fileName: asString(dto.fileName, 'Onbekende bijlage'),
    contentType: asString(dto.contentType, kind === 'pdf' ? 'application/pdf' : kind === 'xml' ? 'application/xml' : 'application/octet-stream'),
    sizeBytes: asNumber(dto.sizeBytes, 0),
    kind,
    isInvoiceCandidate: asBoolean(dto.isInvoiceCandidate, kind === 'pdf' || kind === 'xml'),
  };
}

function normalizeStatus(value: unknown, fallback: MailboxMessageStatus = 'new'): MailboxMessageStatus {
  const status = asOptionalString(value);
  const allowed: MailboxMessageStatus[] = [
    'new',
    'accepted',
    'manual_review',
    'rejected',
    'queued',
    'processing',
    'invoice_created',
    'ignored',
    'failed',
  ];
  return status && allowed.includes(status as MailboxMessageStatus) ? (status as MailboxMessageStatus) : fallback;
}

function normalizeOutcome(value: unknown): MailboxPrevalidationOutcome | undefined {
  const outcome = asOptionalString(value);
  return outcome === 'accepted' || outcome === 'manual_review' || outcome === 'rejected'
    ? outcome
    : undefined;
}

function normalizeRule(value: unknown): MailboxPrevalidationRuleResult | undefined {
  if (!isRecord(value)) return undefined;
  const code = asOptionalString(value.code) ?? 'UNKNOWN_AMOUNT';
  const severity = asOptionalString(value.severity) ?? 'info';

  return {
    code: code as MailboxPrevalidationRuleCode,
    passed: asBoolean(value.passed, false),
    severity:
      severity === 'success' || severity === 'info' || severity === 'warning' || severity === 'error'
        ? severity
        : 'info',
    message: asString(value.message, 'Geen toelichting ontvangen.'),
  };
}

function normalizePrevalidation(value: unknown, status: MailboxMessageStatus): MailboxPrevalidationDecision | undefined {
  if (!isRecord(value)) {
    if (status === 'accepted' || status === 'manual_review' || status === 'rejected') {
      return {
        outcome: status,
        decidedAt: new Date().toISOString(),
        summary:
          status === 'accepted'
            ? 'Goedgekeurd voor verdere verwerking.'
            : status === 'manual_review'
              ? 'Handmatige controle vereist.'
              : 'Vooraf afgekeurd.',
        rules: [],
        routeDisclosure: status === 'manual_review' ? 'hidden_due_threshold' : 'not_applicable',
      };
    }
    return undefined;
  }

  const outcome = normalizeOutcome(value.outcome);
  if (!outcome) return undefined;

  const rules = Array.isArray(value.rules)
    ? value.rules.map(normalizeRule).filter((rule): rule is MailboxPrevalidationRuleResult => Boolean(rule))
    : [];
  const routeDisclosure = asOptionalString(value.routeDisclosure);

  return {
    outcome,
    decidedAt: asString(value.decidedAt, new Date().toISOString()),
    summary: asString(value.summary, 'Prevalidatie uitgevoerd.'),
    rules,
    routeDisclosure:
      routeDisclosure === 'visible' || routeDisclosure === 'hidden_due_threshold' || routeDisclosure === 'not_applicable'
        ? routeDisclosure
        : outcome === 'manual_review'
          ? 'hidden_due_threshold'
          : outcome === 'accepted'
            ? 'visible'
            : 'not_applicable',
  };
}

function getFromAddress(dto: MailboxMessageApiDto): string {
  const from = isRecord(dto.from) ? dto.from : undefined;
  const emailAddress = from && isRecord(from.emailAddress) ? from.emailAddress : undefined;
  return (
    asOptionalString(dto.fromAddress) ??
    asOptionalString(dto.fromEmailAddress) ??
    asOptionalString(emailAddress?.address) ??
    'onbekend@example.invalid'
  );
}

function getFromName(dto: MailboxMessageApiDto): string | undefined {
  const from = isRecord(dto.from) ? dto.from : undefined;
  const emailAddress = from && isRecord(from.emailAddress) ? from.emailAddress : undefined;
  return asOptionalString(dto.fromName) ?? asOptionalString(dto.fromDisplayName) ?? asOptionalString(emailAddress?.name);
}

export function fromMailboxMessageApiDto(dto: MailboxMessageApiDto): MailboxMessage {
  const attachments = Array.isArray(dto.attachments)
    ? dto.attachments.map(normalizeAttachment)
    : [];
  const pdfAttachmentCount = asNumber(dto.pdfAttachmentCount, attachments.filter((a) => a.kind === 'pdf').length);
  const xmlAttachmentCount = asNumber(dto.xmlAttachmentCount, attachments.filter((a) => a.kind === 'xml').length);
  const attachmentCount = asNumber(dto.attachmentCount, attachments.length);
  const hasAttachments = asBoolean(dto.hasAttachments, attachmentCount > 0 || attachments.length > 0);
  const status = normalizeStatus(dto.status);
  const prevalidation = normalizePrevalidation(dto.prevalidation, status);

  return {
    id: asString(dto.id ?? dto.mailboxMessageId ?? dto.graphMessageId ?? dto.providerMessageId, `mail-${Date.now()}`),
    graphMessageId: asString(dto.graphMessageId ?? dto.providerMessageId ?? dto.graphId ?? dto.id, ''),
    graphImmutableMessageId: asOptionalString(dto.graphImmutableMessageId ?? dto.immutableId),
    graphChangeKey: asOptionalString(dto.graphChangeKey ?? dto.changeKey),
    graphFolderId: asOptionalString(dto.graphFolderId ?? dto.folderId),
    internetMessageId: asOptionalString(dto.internetMessageId),
    conversationId: asOptionalString(dto.conversationId),
    mailboxAddress: asString(dto.mailboxAddress, 'facturen@gemeente.nl'),
    subject: asString(dto.subject, '(geen onderwerp)'),
    fromName: getFromName(dto),
    fromAddress: getFromAddress(dto),
    receivedAt: asString(dto.receivedAt ?? dto.receivedDateTime, new Date().toISOString()),
    bodyPreview: asOptionalString(dto.bodyPreview ?? dto.preview),
    isRead: asBoolean(dto.isRead, false),
    hasAttachments,
    attachmentCount,
    pdfAttachmentCount,
    xmlAttachmentCount,
    attachments,
    status: prevalidation?.outcome === 'manual_review' && status === 'new' ? 'manual_review' : status,
    estimatedTotalAmount: normalizeMoney(dto.estimatedTotalAmount ?? dto.estimatedAmount ?? dto.totalAmount),
    linkedInvoiceId: asOptionalString(dto.linkedInvoiceId ?? dto.invoiceId),
    linkedInvoiceNumber: asOptionalString(dto.linkedInvoiceNumber ?? dto.invoiceNumber),
    prevalidation,
    lastActionAt: asOptionalString(dto.lastActionAt),
    lastError: asOptionalString(dto.lastError),
  };
}

export function fromMailboxMessageListApiDto(
  response: MailboxMessageListApiResponse,
  filters: MailboxMessageListFilters = {},
): PagedResult<MailboxMessage> {
  if (Array.isArray(response)) {
    return {
      items: response.map(fromMailboxMessageApiDto),
      total: response.length,
      page: filters.page ?? 1,
      pageSize: filters.pageSize ?? response.length,
    };
  }

  const record = response as Record<string, unknown>;
  const items = Array.isArray(record.items)
    ? (record.items as MailboxMessageApiDto[])
    : Array.isArray(record.data)
      ? (record.data as MailboxMessageApiDto[])
      : [];

  return {
    items: items.map(fromMailboxMessageApiDto),
    total: asNumber(record.total, items.length),
    page: asNumber(record.page, filters.page ?? 1),
    pageSize: asNumber(record.pageSize, filters.pageSize ?? items.length),
  };
}

export function fromMailboxActionResultApiDto(
  response: MailboxMessageActionResultApiDto,
): MailboxMessageActionResult {
  const record: Record<string, unknown> = isRecord(response) ? (response as Record<string, unknown>) : {};

  if (isRecord(record.message)) {
    return {
      message: fromMailboxMessageApiDto(record.message as MailboxMessageApiDto),
      resultMessage: asString(record.resultMessage ?? record.messageText, 'Actie uitgevoerd.'),
      correlationId: asString(record.correlationId ?? record.traceId, `mail-action-${Date.now()}`),
    };
  }

  if (isRecord(record.item)) {
    return {
      message: fromMailboxMessageApiDto(record.item as MailboxMessageApiDto),
      resultMessage: asString(record.resultMessage ?? record.messageText, 'Actie uitgevoerd.'),
      correlationId: asString(record.correlationId ?? record.traceId, `mail-action-${Date.now()}`),
    };
  }

  return {
    message: fromMailboxMessageApiDto(response as MailboxMessageApiDto),
    resultMessage: 'Actie uitgevoerd.',
    correlationId: `mail-action-${Date.now()}`,
  };
}

export function toMailboxMessageQueryParams(
  filters: MailboxMessageListFilters = {},
): Record<string, string | number | boolean | null | undefined> {
  return {
    search: filters.search,
    status: filters.status && filters.status !== 'all' ? filters.status : undefined,
    outcome: filters.outcome && filters.outcome !== 'all' ? filters.outcome : undefined,
    page: filters.page ?? 1,
    pageSize: filters.pageSize ?? 50,
  };
}
