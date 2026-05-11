import type { Supplier } from '@/types';
import { mockSuppliers } from '@/mocks/suppliers';
import { apiCall } from './api/apiClient';

export const supplierService = {
  async list(): Promise<Supplier[]> {
    return apiCall(
      '/api/suppliers',
      () => mockSuppliers.map((s) => ({ ...s })),
      { method: 'GET' },
    );
  },

  async getById(id: string): Promise<Supplier> {
    return apiCall(
      `/api/suppliers/${id}`,
      () => {
        const found = mockSuppliers.find((s) => s.id === id);
        if (!found) throw new Error('Leverancier niet gevonden');
        return { ...found };
      },
      { method: 'GET' },
    );
  },
};
