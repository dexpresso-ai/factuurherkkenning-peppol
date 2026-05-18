import type { Money } from './invoice';

export type MailboxConnectionState =
  | 'connected'
  | 'disconnected'
  | 'reconnecting'
  | 'error';

export interface MailboxStatus {
  /** Microsoft 365 mailbox / shared mailbox adres */
  mailbox: string;
  state: MailboxConnectionState;
  lastSyncAt?: string;
  unreadCount: number;
  errorMessage?: string;
  graphSubscriptionExpiresAt?: string;
}

export type MailboxAttachmentKind = 'pdf' | 'xml' | 'image' | 'other';

export interface MailboxAttachmentSummary {
  id: string;
  fileName: string;
  contentType: string;
  sizeBytes: number;
  kind: MailboxAttachmentKind;
  isInvoiceCandidate: boolean;
}

export type MailboxMessageStatus =
  | 'new'
  | 'accepted'
  | 'manual_review'
  | 'rejected'
  | 'queued'
  | 'processing'
  | 'invoice_created'
  | 'ignored'
  | 'failed';

export type MailboxPrevalidationOutcome = 'accepted' | 'manual_review' | 'rejected';

export type MailboxPrevalidationRuleCode =
  | 'HAS_ATTACHMENTS'
  | 'HAS_INVOICE_ATTACHMENT'
  | 'NO_ATTACHMENTS'
  | 'NO_INVOICE_ATTACHMENT'
  | 'TOTAL_AMOUNT_ABOVE_5000'
  | 'SENDER_BLOCKED'
  | 'DUPLICATE_MESSAGE'
  | 'UNKNOWN_AMOUNT';

export interface MailboxPrevalidationRuleResult {
  code: MailboxPrevalidationRuleCode;
  passed: boolean;
  severity: 'success' | 'info' | 'warning' | 'error';
  message: string;
}

export interface MailboxPrevalidationDecision {
  outcome: MailboxPrevalidationOutcome;
  decidedAt: string;
  summary: string;
  rules: MailboxPrevalidationRuleResult[];
  /** Voor bedragen boven de drempel tonen we bewust géén route-/goedkeuringsnaam in de UI. */
  routeDisclosure: 'visible' | 'hidden_due_threshold' | 'not_applicable';
}

export interface MailboxMessage {
  id: string;
  graphMessageId: string;
  /** Stabiele Graph ID uit backend als Prefer: IdType="ImmutableId" wordt gebruikt. */
  graphImmutableMessageId?: string;
  /** Exchange changeKey/folder-id kunnen door backend worden gebruikt voor idempotente synchronisatie. */
  graphChangeKey?: string;
  graphFolderId?: string;
  internetMessageId?: string;
  conversationId?: string;
  mailboxAddress: string;
  subject: string;
  fromName?: string;
  fromAddress: string;
  receivedAt: string;
  bodyPreview?: string;
  isRead: boolean;
  hasAttachments: boolean;
  attachmentCount: number;
  pdfAttachmentCount: number;
  xmlAttachmentCount: number;
  attachments: MailboxAttachmentSummary[];
  status: MailboxMessageStatus;
  estimatedTotalAmount?: Money;
  linkedInvoiceId?: string;
  linkedInvoiceNumber?: string;
  prevalidation?: MailboxPrevalidationDecision;
  lastActionAt?: string;
  lastError?: string;
}

export interface MailboxMessageListFilters {
  search?: string;
  status?: MailboxMessageStatus | 'all';
  outcome?: MailboxPrevalidationOutcome | 'all';
  page?: number;
  pageSize?: number;
}

export interface MailboxMessageActionResult {
  message: MailboxMessage;
  resultMessage: string;
  correlationId: string;
}

export type PeppolApState = 'online' | 'degraded' | 'offline';

export interface PeppolStatusInfo {
  accessPointName: string;
  state: PeppolApState;
  outboundQueue: number;
  lastDeliveryAt?: string;
}

export interface PeppolSubmission {
  id: string;
  invoiceId: string;
  submittedAt: string;
  status: 'queued' | 'sending' | 'delivered' | 'failed' | 'rejected';
  receiverParticipantId: string;
  responseMessage?: string;
  retryCount: number;
}
