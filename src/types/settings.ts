export interface MailboxSettings {
  mailboxAddress: string;
  tenantId: string;
  clientId: string;
  /** PDF MIME types die verwerkt moeten worden */
  acceptedMimeTypes: string[];
  pollIntervalSeconds: number;
}

export interface PeppolSettings {
  accessPointUrl: string;
  senderParticipantId: string;
  /** Default ontvanger als ontbrekend in factuur */
  defaultReceiverParticipantId?: string;
  retryCount: number;
  retryBackoffSeconds: number;
}

export interface AzureStorageInfo {
  storageAccount: string;
  container: string;
  region: string;
  usedBytes: number;
  quotaBytes: number;
}

export interface ProcessingSettings {
  autoProcessEnabled: boolean;
  /** Minimum confidence voor auto-verzending (0..1) */
  minConfidenceForAutoSend: number;
  manualApprovalRequired: boolean;
  processedFolder: string;
  exceptionFolder: string;
}

export interface AppSettings {
  mailbox: MailboxSettings;
  peppol: PeppolSettings;
  storage: AzureStorageInfo;
  processing: ProcessingSettings;
}

export type UpdateSettingsDto = Partial<{
  mailbox: Partial<MailboxSettings>;
  peppol: Partial<PeppolSettings>;
  processing: Partial<ProcessingSettings>;
}>;
