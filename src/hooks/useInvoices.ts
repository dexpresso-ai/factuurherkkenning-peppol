import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
} from '@tanstack/react-query';
import type {
  Invoice,
  InvoiceListFilters,
  PagedResult,
  SendPeppolResult,
  UpdateInvoiceDto,
} from '@/types';
import { invoiceService } from '@/services/invoiceService';
import { queryKeys } from '@/services/api/queryKeys';

export function useInvoices(filters: InvoiceListFilters = {}) {
  return useQuery<PagedResult<Invoice>>({
    queryKey: queryKeys.invoices.list(filters),
    queryFn: () => invoiceService.list(filters),
  });
}

export function useInvoice(id: string | undefined) {
  return useQuery<Invoice>({
    queryKey: queryKeys.invoices.detail(id ?? ''),
    queryFn: () => invoiceService.getById(id!),
    enabled: Boolean(id),
  });
}

export function useUpdateInvoice(
  id: string,
  options?: UseMutationOptions<Invoice, Error, UpdateInvoiceDto>,
) {
  const qc = useQueryClient();
  return useMutation<Invoice, Error, UpdateInvoiceDto>({
    ...options,
    mutationFn: (dto) => invoiceService.update(id, dto),
    onSuccess: (data, variables, context, mutation) => {
      qc.setQueryData(queryKeys.invoices.detail(id), data);
      qc.invalidateQueries({ queryKey: queryKeys.invoices.all });
      options?.onSuccess?.(data, variables, context, mutation);
    },
  });
}

export function useReprocessInvoice(id: string) {
  const qc = useQueryClient();
  return useMutation<Invoice, Error, void>({
    mutationFn: () => invoiceService.reprocess(id),
    onSuccess: (data) => {
      qc.setQueryData(queryKeys.invoices.detail(id), data);
      qc.invalidateQueries({ queryKey: queryKeys.invoices.all });
      qc.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
  });
}

export function useApproveInvoice(id: string) {
  const qc = useQueryClient();
  return useMutation<Invoice, Error, void>({
    mutationFn: () => invoiceService.approve(id),
    onSuccess: (data) => {
      qc.setQueryData(queryKeys.invoices.detail(id), data);
      qc.invalidateQueries({ queryKey: queryKeys.invoices.all });
      qc.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
  });
}

export function useSendToPeppol(id: string) {
  const qc = useQueryClient();
  return useMutation<SendPeppolResult, Error, void>({
    mutationFn: () => invoiceService.sendToPeppol(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.invoices.detail(id) });
      qc.invalidateQueries({ queryKey: queryKeys.invoices.all });
      qc.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
  });
}
