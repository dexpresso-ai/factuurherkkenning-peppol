import type {
  Invoice,
  InvoiceApiResponse,
  InvoiceListFilters,
  InvoiceRecognitionResultApiDto,
  PagedResult,
  SendPeppolResult,
  UpdateInvoiceDto,
} from '@/types';
import { mockInvoices } from '@/mocks/invoices';
import { apiCall } from './api/apiClient';
import { normalizeInvoiceRecognitionFields } from '@/utils/invoiceRecognition';
import {
  fromInvoiceApiDto,
  toInvoicePatchApiDto,
  toInvoiceRecognitionDto,
  toInvoiceRecognitionPatchApiDto,
} from './api/invoiceApiMapper';

/**
 * Mutable in-memory copy zodat updates persistent voelen tijdens demo-sessie.
 * Bij echte backend wordt dit irrelevant — alle data komt van de server.
 */
const invoicesStore: Invoice[] = mockInvoices.map((i) =>
  normalizeInvoiceRecognitionFields({ ...i }),
);

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
        (i.summaryDescription ?? '').toLowerCase().includes(q) ||
        (i.paymentReference ?? '').toLowerCase().includes(q) ||
        (i.debtorNumber ?? '').toLowerCase().includes(q) ||
        (i.supplierKvk ?? '').toLowerCase().includes(q),
    );
  }

  return out;
}

function findInvoiceOrThrow(id: string): Invoice {
  const found = invoicesStore.find((i) => i.id === id);
  if (!found) throw new Error('Factuur niet gevonden');
  return found;
}

export const invoiceService = {
  /**
   * GET /api/invoices
   */
  async list(filters: InvoiceListFilters = {}): Promise<PagedResult<Invoice>> {
    const result = await apiCall<PagedResult<InvoiceApiResponse>>(
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

    return {
      ...result,
      items: result.items.map(fromInvoiceApiDto),
    };
  },

  /**
   * GET /api/invoices/:id
   */
  async getById(id: string): Promise<Invoice> {
    const result = await apiCall<InvoiceApiResponse>(
      `/api/invoices/${id}`,
      () => ({ ...findInvoiceOrThrow(id) }),
      { method: 'GET' },
    );

    return fromInvoiceApiDto(result);
  },

  /**
   * GET /api/invoices/:id/recognition
   *
   * Los herkenningscontract voor Azure Document Intelligence / validatie.
   * Handig voor backend-tests zonder volledige factuurpayload.
   */
  async getRecognition(id: string): Promise<InvoiceRecognitionResultApiDto> {
    return apiCall(
      `/api/invoices/${id}/recognition`,
      () => {
        const invoice = findInvoiceOrThrow(id);
        return {
          invoiceId: invoice.id,
          status: invoice.status,
          recognition: toInvoiceRecognitionDto(invoice),
          validationIssues: invoice.validationIssues,
          updatedAt: invoice.updatedAt,
        };
      },
      { method: 'GET' },
    );
  },

  /**
   * PATCH /api/invoices/:id
   *
   * UI DTO wordt gemapt naar API DTO:
   * - platte UI-velden blijven intern makkelijk;
   * - backend ontvangt `recognition.amountExcludingVat`, `recognition.vatAmount`, etc.
   */
  async update(id: string, dto: UpdateInvoiceDto): Promise<Invoice> {
    const result = await apiCall<InvoiceApiResponse>(
      `/api/invoices/${id}`,
      () => {
        const idx = invoicesStore.findIndex((i) => i.id === id);
        if (idx === -1) throw new Error('Factuur niet gevonden');
        const merged: Invoice = normalizeInvoiceRecognitionFields({
          ...invoicesStore[idx],
          ...dto,
          updatedAt: new Date().toISOString(),
        } as Invoice);
        invoicesStore[idx] = merged;
        return { ...merged };
      },
      { method: 'PATCH', body: toInvoicePatchApiDto(dto) },
    );

    return fromInvoiceApiDto(result);
  },

  /**
   * PATCH /api/invoices/:id/recognition
   *
   * Specifieke endpoint voor correcties van herkenningsvelden.
   * Kan straks 1-op-1 naar een Azure/.NET controller of Minimal API.
   */
  async updateRecognition(id: string, dto: UpdateInvoiceDto): Promise<InvoiceRecognitionResultApiDto> {
    return apiCall(
      `/api/invoices/${id}/recognition`,
      () => {
        const idx = invoicesStore.findIndex((i) => i.id === id);
        if (idx === -1) throw new Error('Factuur niet gevonden');
        invoicesStore[idx] = normalizeInvoiceRecognitionFields({
          ...invoicesStore[idx],
          ...dto,
          updatedAt: new Date().toISOString(),
        } as Invoice);
        return {
          invoiceId: id,
          status: invoicesStore[idx].status,
          recognition: toInvoiceRecognitionDto(invoicesStore[idx]),
          validationIssues: invoicesStore[idx].validationIssues,
          updatedAt: invoicesStore[idx].updatedAt,
        };
      },
      { method: 'PATCH', body: toInvoiceRecognitionPatchApiDto(dto) },
    );
  },

  /**
   * POST /api/invoices/:id/reprocess
   */
  async reprocess(id: string): Promise<Invoice> {
    const result = await apiCall<InvoiceApiResponse>(
      `/api/invoices/${id}/reprocess`,
      () => {
        const idx = invoicesStore.findIndex((i) => i.id === id);
        if (idx === -1) throw new Error('Factuur niet gevonden');
        invoicesStore[idx] = normalizeInvoiceRecognitionFields({
          ...invoicesStore[idx],
          status: 'processing',
          validationIssues: [],
          updatedAt: new Date().toISOString(),
        });
        return { ...invoicesStore[idx] };
      },
      { method: 'POST' },
      { delay: [400, 900] },
    );

    return fromInvoiceApiDto(result);
  },

  /**
   * POST /api/invoices/:id/approve  (custom — markeert klaar voor Peppol)
   */
  async approve(id: string): Promise<Invoice> {
    const result = await apiCall<InvoiceApiResponse>(
      `/api/invoices/${id}/approve`,
      () => {
        const idx = invoicesStore.findIndex((i) => i.id === id);
        if (idx === -1) throw new Error('Factuur niet gevonden');
        invoicesStore[idx] = normalizeInvoiceRecognitionFields({
          ...invoicesStore[idx],
          status: 'ready_for_peppol',
          updatedAt: new Date().toISOString(),
        });
        return { ...invoicesStore[idx] };
      },
      { method: 'POST' },
    );

    return fromInvoiceApiDto(result);
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
        invoicesStore[idx] = normalizeInvoiceRecognitionFields({
          ...invoicesStore[idx],
          status: 'sent',
          peppolStatus: 'sending',
          updatedAt: new Date().toISOString(),
        });
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
