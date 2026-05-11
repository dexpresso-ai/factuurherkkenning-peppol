import type { DashboardSummary } from '@/types';
import { mockInvoices } from './invoices';

function buildCounters() {
  return mockInvoices.reduce(
    (acc, inv) => {
      switch (inv.status) {
        case 'new':
          acc.newInvoices += 1;
          break;
        case 'processing':
          acc.processing += 1;
          break;
        case 'review_required':
          acc.reviewRequired += 1;
          break;
        case 'ready_for_peppol':
          acc.readyForPeppol += 1;
          break;
        case 'sent':
        case 'delivered':
          acc.sent += 1;
          break;
        case 'error':
        case 'rejected':
          acc.errors += 1;
          break;
      }
      return acc;
    },
    {
      newInvoices: 0,
      processing: 0,
      reviewRequired: 0,
      readyForPeppol: 0,
      sent: 0,
      errors: 0,
    },
  );
}

export const mockDashboardSummary: DashboardSummary = {
  counters: buildCounters(),
  mailbox: {
    mailbox: 'facturen@acme-holding.nl',
    state: 'connected',
    lastSyncAt: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
    unreadCount: 2,
    graphSubscriptionExpiresAt: new Date(
      Date.now() + 1000 * 60 * 60 * 24 * 2,
    ).toISOString(),
  },
  peppol: {
    accessPointName: 'Storecove (NL-AP-0034)',
    state: 'online',
    outboundQueue: 1,
    lastDeliveryAt: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
  },
  autoProcessEnabled: true,
  automationRate: 87,
  trend7d: [
    { date: '2026-05-04', processed: 14, failed: 0 },
    { date: '2026-05-05', processed: 11, failed: 1 },
    { date: '2026-05-06', processed: 18, failed: 0 },
    { date: '2026-05-07', processed: 22, failed: 1 },
    { date: '2026-05-08', processed: 17, failed: 1 },
    { date: '2026-05-09', processed: 9, failed: 2 },
    { date: '2026-05-10', processed: 4, failed: 0 },
  ],
  recentActivity: [
    {
      id: 'act-1',
      invoiceId: 'inv-1003',
      invoiceNumber: 'CB-2026-13371',
      supplierName: 'Coolblue B.V.',
      message: 'UBL gegenereerd en in Peppol-wachtrij geplaatst',
      severity: 'info',
      timestamp: new Date(Date.now() - 1000 * 60 * 4).toISOString(),
    },
    {
      id: 'act-2',
      invoiceId: 'inv-1008',
      invoiceNumber: 'CB-2026-13402',
      supplierName: 'Coolblue B.V.',
      message: 'Peppol verzending afgewezen: ontvanger niet geregistreerd',
      severity: 'error',
      timestamp: new Date(Date.now() - 1000 * 60 * 22).toISOString(),
    },
    {
      id: 'act-3',
      invoiceId: 'inv-1002',
      invoiceNumber: 'V-90238412',
      supplierName: 'Vattenfall Sales Nederland N.V.',
      message: 'Peppol aflevering bevestigd door ontvanger',
      severity: 'success',
      timestamp: new Date(Date.now() - 1000 * 60 * 51).toISOString(),
    },
    {
      id: 'act-4',
      invoiceId: 'inv-1006',
      invoiceNumber: '?',
      supplierName: 'Onbekende Leverancier',
      message: 'Factuur gemarkeerd voor handmatige review (lage OCR-kwaliteit)',
      severity: 'warning',
      timestamp: new Date(Date.now() - 1000 * 60 * 73).toISOString(),
    },
    {
      id: 'act-5',
      invoiceId: 'inv-1010',
      invoiceNumber: 'KPN-2026-0492',
      supplierName: 'KPN B.V.',
      message: 'Nieuwe factuur ontvangen vanuit mailbox',
      severity: 'info',
      timestamp: new Date(Date.now() - 1000 * 60 * 88).toISOString(),
    },
  ],
};
