import type { MailboxStatus } from '@/types';
import { mockDashboardSummary } from '@/mocks/dashboard';
import { apiCall } from './api/apiClient';

export interface ConnectMailboxDto {
  mailboxAddress: string;
  tenantId?: string;
}

export interface SyncMailboxResult {
  started: boolean;
  message: string;
  correlationId: string;
}

export const mailboxService = {
  /** GET /api/mailbox/status */
  async getStatus(): Promise<MailboxStatus> {
    return apiCall(
      '/api/mailbox/status',
      () => structuredClone(mockDashboardSummary.mailbox),
      { method: 'GET' },
    );
  },

  /** POST /api/mailbox/connect */
  async connect(dto: ConnectMailboxDto): Promise<MailboxStatus> {
    return apiCall(
      '/api/mailbox/connect',
      () => ({
        ...structuredClone(mockDashboardSummary.mailbox),
        mailbox: dto.mailboxAddress,
        state: 'connected',
        lastSyncAt: new Date().toISOString(),
      }),
      { method: 'POST', body: dto },
    );
  },

  /** POST /api/mailbox/sync-now */
  async syncNow(): Promise<SyncMailboxResult> {
    return apiCall(
      '/api/mailbox/sync-now',
      () => ({
        started: true,
        message: 'Mailbox synchronisatie gestart.',
        correlationId: `sync-${Date.now()}`,
      }),
      { method: 'POST' },
      { delay: [350, 700] },
    );
  },
};
