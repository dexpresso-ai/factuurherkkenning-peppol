import type { MailboxStatus, PeppolStatusInfo } from './mailbox';

export interface DashboardCounters {
  newInvoices: number;
  processing: number;
  reviewRequired: number;
  readyForPeppol: number;
  sent: number;
  errors: number;
}

export interface RecentActivityItem {
  id: string;
  invoiceId: string;
  invoiceNumber: string;
  supplierName: string;
  message: string;
  severity: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
}

export interface DashboardSummary {
  counters: DashboardCounters;
  mailbox: MailboxStatus;
  peppol: PeppolStatusInfo;
  autoProcessEnabled: boolean;
  /** Percentage 0..100 */
  automationRate: number;
  /** Volume per dag, laatste 7 dagen */
  trend7d: { date: string; processed: number; failed: number }[];
  recentActivity: RecentActivityItem[];
}
