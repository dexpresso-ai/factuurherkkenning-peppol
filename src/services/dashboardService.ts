import type { DashboardSummary } from '@/types';
import { mockDashboardSummary } from '@/mocks/dashboard';
import { apiCall } from './api/apiClient';

export const dashboardService = {
  /**
   * GET /api/dashboard/summary
   */
  async getSummary(): Promise<DashboardSummary> {
    return apiCall(
      '/api/dashboard/summary',
      () => structuredClone(mockDashboardSummary),
      { method: 'GET' },
    );
  },
};
