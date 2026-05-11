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
