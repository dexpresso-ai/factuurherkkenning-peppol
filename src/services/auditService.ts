import type { AuditLogEntry } from '@/types';
import { mockAuditLog } from '@/mocks/audit';
import { apiCall } from './api/apiClient';

export const auditService = {
  /**
   * GET /api/invoices/:id/audit
   */
  async getForInvoice(invoiceId: string): Promise<AuditLogEntry[]> {
    return apiCall(
      `/api/invoices/${invoiceId}/audit`,
      () =>
        mockAuditLog
          .filter((e) => e.invoiceId === invoiceId)
          .sort((a, b) => a.timestamp.localeCompare(b.timestamp))
          .map((e) => ({ ...e })),
      { method: 'GET' },
    );
  },

  async getRecent(limit = 50): Promise<AuditLogEntry[]> {
    return apiCall(
      '/api/audit/recent',
      () =>
        [...mockAuditLog]
          .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
          .slice(0, limit)
          .map((e) => ({ ...e })),
      { method: 'GET' },
    );
  },
};
