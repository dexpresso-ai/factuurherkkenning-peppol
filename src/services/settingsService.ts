import type { AppSettings, UpdateSettingsDto } from '@/types';
import { mockSettings } from '@/mocks/settings';
import { apiCall } from './api/apiClient';

let settingsStore: AppSettings = JSON.parse(JSON.stringify(mockSettings));

export const settingsService = {
  async get(): Promise<AppSettings> {
    return apiCall('/api/settings', () => structuredClone(settingsStore), {
      method: 'GET',
    });
  },

  async update(dto: UpdateSettingsDto): Promise<AppSettings> {
    return apiCall(
      '/api/settings',
      () => {
        settingsStore = {
          ...settingsStore,
          mailbox: { ...settingsStore.mailbox, ...(dto.mailbox ?? {}) },
          peppol: { ...settingsStore.peppol, ...(dto.peppol ?? {}) },
          processing: { ...settingsStore.processing, ...(dto.processing ?? {}) },
        };
        return structuredClone(settingsStore);
      },
      { method: 'PATCH', body: dto },
    );
  },
};
