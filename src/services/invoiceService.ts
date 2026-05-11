import type {
  Invoice,
  InvoiceListFilters,
  PagedResult,
  SendPeppolResult,
  UpdateInvoiceDto,
} from '@/types';
import { mockInvoices } from '@/mocks/invoices';
import { apiCall } from './api/apiClient';

/**
 * Mutable in-memory copy zodat updates persistent voelen tijdens demo-sessie.
 * Bij echte backend wordt dit irrelevant — alle data komt van de server.
 */
const invoicesStore: Invoice[] = mockInvoices.map((i) => ({ ...i }));

function applyFilters(items: Invoice[], filters: InvoiceListFilters): Invoice[] {
  let out = items;

  if (filters.status && filters.status !== 'all') {
    out = out.filter((i) => i.status === filters.status);
  }
  if (filters.supplierId) {
    out = out.filter((i) => i.supplierId === filters.supplierId);
  }
  if (filters.hasIssues) {
    out = out.filter((i) =>
      i.validationIssues.some((iss) => iss.severity === 'warning' || iss.severity === 'error'),
    );
  }
  if (filters.search) {
    const q = filters.search.toLowerCase();
    out = out.filter(
      (i) =>
        i.invoiceNumber.toLowerCase().includes(q) ||
        i.supplierName.toLowerCase().includes(q) ||
        (i.supplierKvk ?? '').toLowerCase().includes(q),
    );
  }

  return out;
}

export const invoiceService = {
  /**
   * GET /api/invoices
   */
  async list(filters: InvoiceListFilters = {}): Promise<PagedResult<Invoice>> {
    return apiCall(
      '/api/invoices',
      () => {
        const filtered = applyFilters(invoicesStore, filters);
        const page = filters.page ?? 1;
        const pageSize = filters.pageSize ?? 50;
        const start = (page - 1) * pageSize;
        return {
          items: filtered.slice(start, start + pageSize),
          total: filtered.length,
          page,
          pageSize,
        };
      },
      { method: 'GET', params: { ...filters } },
    );
  },

  /**
   * GET /api/invoices/:id
   */
  async getById(id: string): Promise<Invoice> {
    return apiCall(
      `/api/invoices/${id}`,
      () => {
        const found = invoicesStore.find((i) => i.id === id);
        if (!found) throw new Error('Factuur niet gevonden');
        return { ...found };
      },
      { method: 'GET' },
    );
  },

  /**
   * PATCH /api/invoices/:id
   */
  async update(id: string, dto: UpdateInvoiceDto): Promise<Invoice> {
    return apiCall(
      `/api/invoices/${id}`,
      () => {
        const idx = invoicesStore.findIndex((i) => i.id === id);
        if (idx === -1) throw new Error('Factuur niet gevonden');
        const merged: Invoice = {
          ...invoicesStore[idx],
          ...dto,
          updatedAt: new Date().toISOString(),
        } as Invoice;
        invoicesStore[idx] = merged;
        return { ...merged };
      },
      { method: 'PATCH', body: dto },
    );
  },

  /**
   * POST /api/invoices/:id/reprocess
   */
  async reprocess(id: string): Promise<Invoice> {
    return apiCall(
      `/api/invoices/${id}/reprocess`,
      () => {
        const idx = invoicesStore.findIndex((i) => i.id === id);
        if (idx === -1) throw new Error('Factuur niet gevonden');
        invoicesStore[idx] = {
          ...invoicesStore[idx],
          status: 'processing',
          validationIssues: [],
          updatedAt: new Date().toISOString(),
        };
        return { ...invoicesStore[idx] };
      },
      { method: 'POST' },
      { delay: [400, 900] },
    );
  },

  /**
   * POST /api/invoices/:id/approve  (custom — markeert klaar voor Peppol)
   */
  async approve(id: string): Promise<Invoice> {
    return apiCall(
      `/api/invoices/${id}/approve`,
      () => {
        const idx = invoicesStore.findIndex((i) => i.id === id);
        if (idx === -1) throw new Error('Factuur niet gevonden');
        invoicesStore[idx] = {
          ...invoicesStore[idx],
          status: 'ready_for_peppol',
          updatedAt: new Date().toISOString(),
        };
        return { ...invoicesStore[idx] };
      },
      { method: 'POST' },
    );
  },

  /**
   * POST /api/invoices/:id/send
   */
  async sendToPeppol(id: string): Promise<SendPeppolResult> {
    return apiCall(
      `/api/invoices/${id}/send`,
      () => {
        const idx = invoicesStore.findIndex((i) => i.id === id);
        if (idx === -1) throw new Error('Factuur niet gevonden');
        invoicesStore[idx] = {
          ...invoicesStore[idx],
          status: 'sent',
          peppolStatus: 'sending',
          updatedAt: new Date().toISOString(),
        };
        return {
          invoiceId: id,
          peppolStatus: 'sending',
          submissionId: `sub-${Date.now()}`,
        };
      },
      { method: 'POST' },
      { delay: [600, 1100] },
    );
  },
};
