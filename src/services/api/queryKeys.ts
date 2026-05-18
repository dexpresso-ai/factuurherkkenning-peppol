import type { InvoiceListFilters, MailboxMessageListFilters } from '@/types';

/**
 * Centrale registry van React Query-keys.
 * Voorkomt typo's en maakt invalidatie eenvoudig:
 *   queryClient.invalidateQueries({ queryKey: queryKeys.invoices.all })
 */
export const queryKeys = {
  dashboard: ['dashboard', 'summary'] as const,

  invoices: {
    all: ['invoices'] as const,
    list: (filters: InvoiceListFilters) => ['invoices', 'list', filters] as const,
    detail: (id: string) => ['invoices', 'detail', id] as const,
    audit: (id: string) => ['invoices', 'audit', id] as const,
    recognition: (id: string) => ['invoices', 'recognition', id] as const,
  },

  suppliers: {
    all: ['suppliers'] as const,
    detail: (id: string) => ['suppliers', 'detail', id] as const,
  },

  mailbox: {
    all: ['mailbox'] as const,
    status: ['mailbox', 'status'] as const,
    messages: (filters: MailboxMessageListFilters) => ['mailbox', 'messages', filters] as const,
    message: (id: string) => ['mailbox', 'message', id] as const,
  },

  settings: ['settings'] as const,
} as const;
