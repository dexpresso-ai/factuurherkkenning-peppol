import type { AppSettings } from '@/types';

export const mockSettings: AppSettings = {
  mailbox: {
    mailboxAddress: 'facturen@acme-holding.nl',
    tenantId: '00000000-1111-2222-3333-444444444444',
    clientId: '11111111-2222-3333-4444-555555555555',
    acceptedMimeTypes: ['application/pdf'],
    pollIntervalSeconds: 60,
  },
  peppol: {
    accessPointUrl: 'https://api.storecove.com/api/v2',
    senderParticipantId: '0106:78451236',
    defaultReceiverParticipantId: undefined,
    retryCount: 3,
    retryBackoffSeconds: 30,
  },
  storage: {
    storageAccount: 'acmeholdingpeppol',
    container: 'invoices',
    region: 'westeurope',
    usedBytes: 814_372_109,
    quotaBytes: 5_368_709_120,
  },
  processing: {
    autoProcessEnabled: true,
    minConfidenceForAutoSend: 0.92,
    manualApprovalRequired: false,
    processedFolder: 'Verwerkt',
    exceptionFolder: 'Uitval',
  },
};
