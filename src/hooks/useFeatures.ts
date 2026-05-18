import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  AppSettings,
  AuditLogEntry,
  DashboardSummary,
  Supplier,
  UpdateSettingsDto,
  MailboxStatus,
  MailboxMessage,
  MailboxMessageActionResult,
  MailboxMessageListFilters,
  PagedResult,
} from '@/types';
import { dashboardService } from '@/services/dashboardService';
import { supplierService } from '@/services/supplierService';
import { settingsService } from '@/services/settingsService';
import { auditService } from '@/services/auditService';
import {
  mailboxService,
  type ConnectMailboxDto,
  type MailboxManualActionDto,
  type SyncMailboxResult,
} from '@/services/mailboxService';
import { queryKeys } from '@/services/api/queryKeys';

/* -------- Dashboard -------- */
export function useDashboardSummary() {
  return useQuery<DashboardSummary>({
    queryKey: queryKeys.dashboard,
    queryFn: () => dashboardService.getSummary(),
    refetchInterval: 30_000,
  });
}

/* -------- Suppliers -------- */
export function useSuppliers() {
  return useQuery<Supplier[]>({
    queryKey: queryKeys.suppliers.all,
    queryFn: () => supplierService.list(),
  });
}

/* -------- Settings -------- */
export function useSettings() {
  return useQuery<AppSettings>({
    queryKey: queryKeys.settings,
    queryFn: () => settingsService.get(),
  });
}

export function useUpdateSettings() {
  const qc = useQueryClient();
  return useMutation<AppSettings, Error, UpdateSettingsDto>({
    mutationFn: (dto) => settingsService.update(dto),
    onSuccess: (data) => {
      qc.setQueryData(queryKeys.settings, data);
    },
  });
}


/* -------- Mailbox -------- */
export function useMailboxStatus() {
  return useQuery<MailboxStatus>({
    queryKey: queryKeys.mailbox.status,
    queryFn: () => mailboxService.getStatus(),
    refetchInterval: 30_000,
  });
}


export function useMailboxMessages(filters: MailboxMessageListFilters = {}) {
  return useQuery<PagedResult<MailboxMessage>>({
    queryKey: queryKeys.mailbox.messages(filters),
    queryFn: () => mailboxService.listMessages(filters),
    refetchInterval: 30_000,
  });
}

export function useMailboxMessage(id: string | undefined) {
  return useQuery<MailboxMessage>({
    queryKey: queryKeys.mailbox.message(id ?? ''),
    queryFn: () => mailboxService.getMessage(id!),
    enabled: Boolean(id),
  });
}

function invalidateMailboxViews(qc: ReturnType<typeof useQueryClient>, message?: MailboxMessage) {
  qc.invalidateQueries({ queryKey: queryKeys.mailbox.all });
  qc.invalidateQueries({ queryKey: queryKeys.dashboard });
  qc.invalidateQueries({ queryKey: queryKeys.invoices.all });
  if (message) {
    qc.setQueryData(queryKeys.mailbox.message(message.id), message);
  }
}

export function usePrevalidateMailboxMessage() {
  const qc = useQueryClient();
  return useMutation<MailboxMessageActionResult, Error, string>({
    mutationFn: (id) => mailboxService.prevalidateMessage(id),
    onSuccess: (data) => invalidateMailboxViews(qc, data.message),
  });
}

export function useIgnoreMailboxMessage() {
  const qc = useQueryClient();
  return useMutation<MailboxMessageActionResult, Error, string>({
    mutationFn: (id) => mailboxService.ignoreMessage(id),
    onSuccess: (data) => invalidateMailboxViews(qc, data.message),
  });
}

export function useManualRejectMailboxMessage() {
  const qc = useQueryClient();
  return useMutation<MailboxMessageActionResult, Error, { id: string; dto: MailboxManualActionDto }>({
    mutationFn: ({ id, dto }) => mailboxService.manualRejectMessage(id, dto),
    onSuccess: (data) => invalidateMailboxViews(qc, data.message),
  });
}

export function useOverrideMailboxMessage() {
  const qc = useQueryClient();
  return useMutation<MailboxMessageActionResult, Error, { id: string; dto: MailboxManualActionDto }>({
    mutationFn: ({ id, dto }) => mailboxService.overrideMessage(id, dto),
    onSuccess: (data) => invalidateMailboxViews(qc, data.message),
  });
}

export function useProcessMailboxMessage() {
  const qc = useQueryClient();
  return useMutation<MailboxMessageActionResult, Error, string>({
    mutationFn: (id) => mailboxService.processMessage(id),
    onSuccess: (data) => invalidateMailboxViews(qc, data.message),
  });
}

export function useConnectMailbox() {
  const qc = useQueryClient();
  return useMutation<MailboxStatus, Error, ConnectMailboxDto>({
    mutationFn: (dto) => mailboxService.connect(dto),
    onSuccess: (data) => {
      qc.setQueryData(queryKeys.mailbox.status, data);
      qc.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
  });
}

export function useSyncMailboxNow() {
  const qc = useQueryClient();
  return useMutation<SyncMailboxResult, Error, void>({
    mutationFn: () => mailboxService.syncNow(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.mailbox.status });
      qc.invalidateQueries({ queryKey: queryKeys.dashboard });
      qc.invalidateQueries({ queryKey: queryKeys.invoices.all });
      qc.invalidateQueries({ queryKey: queryKeys.mailbox.all });
    },
  });
}

/* -------- Audit -------- */
export function useInvoiceAudit(invoiceId: string | undefined) {
  return useQuery<AuditLogEntry[]>({
    queryKey: queryKeys.invoices.audit(invoiceId ?? ''),
    queryFn: () => auditService.getForInvoice(invoiceId!),
    enabled: Boolean(invoiceId),
  });
}
