import type {
  MailboxMessage,
  MailboxMessageActionResult,
  MailboxMessageListFilters,
  MailboxStatus,
  PagedResult,
} from '@/types';
import { mockDashboardSummary } from '@/mocks/dashboard';
import { mockMailboxMessages, prevalidateMailboxMessage } from '@/mocks/mailbox';
import { apiCall } from './api/apiClient';
import {
  canManualRejectMailboxMessage,
  canOverrideMailboxMessage,
  canProcessMailboxMessage,
  getManualDecisionBlockReason,
  getMailboxProcessBlockReason,
  getOverrideBlockReason,
  hasHardTechnicalBlock,
  isMailboxInFlightOrTerminal,
  isManuallyReleased,
  isManuallyRejected,
} from '@/utils/mailboxWorkflow';
import {
  fromMailboxActionResultApiDto,
  fromMailboxMessageApiDto,
  fromMailboxMessageListApiDto,
  toMailboxMessageQueryParams,
  type MailboxMessageActionResultApiDto,
  type MailboxMessageApiDto,
  type MailboxMessageListApiResponse,
} from './api/mailboxApiMapper';

export interface ConnectMailboxDto {
  mailboxAddress: string;
  tenantId?: string;
}

export interface SyncMailboxResult {
  started: boolean;
  message: string;
  correlationId: string;
}

export interface MailboxManualActionDto {
  reason: string;
  decidedBy?: string;
  decidedByName?: string;
}

const mailboxStore: MailboxMessage[] = structuredClone(mockMailboxMessages);

function applyMessageFilters(
  messages: MailboxMessage[],
  filters: MailboxMessageListFilters = {},
): MailboxMessage[] {
  let out = messages;

  if (filters.status && filters.status !== 'all') {
    out = out.filter((message) => message.status === filters.status);
  }

  if (filters.outcome && filters.outcome !== 'all') {
    out = out.filter((message) => message.prevalidation?.outcome === filters.outcome);
  }

  if (filters.search) {
    const q = filters.search.toLowerCase().trim();
    out = out.filter((message) =>
      [
        message.subject,
        message.fromName,
        message.fromAddress,
        message.bodyPreview,
        message.linkedInvoiceNumber,
        ...message.attachments.map((attachment) => attachment.fileName),
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(q)),
    );
  }

  return [...out].sort((a, b) => new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime());
}

function findMessageOrThrow(id: string): MailboxMessage {
  const found = mailboxStore.find((message) => message.id === id);
  if (!found) throw new Error('Mailbericht niet gevonden');
  return found;
}

function replaceMessage(id: string, next: MailboxMessage): MailboxMessage {
  const idx = mailboxStore.findIndex((message) => message.id === id);
  if (idx === -1) throw new Error('Mailbericht niet gevonden');
  mailboxStore[idx] = next;
  return next;
}

function normalizeManualReason(reason: string): string {
  const clean = reason.trim();
  if (clean.length < 6) {
    throw new Error('Geef een korte reden mee voor auditlogging.');
  }
  return clean;
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

  /** GET /api/mailbox/messages */
  async listMessages(
    filters: MailboxMessageListFilters = {},
  ): Promise<PagedResult<MailboxMessage>> {
    const result = await apiCall<MailboxMessageListApiResponse>(
      '/api/mailbox/messages',
      () => {
        const filtered = applyMessageFilters(mailboxStore, filters);
        const page = filters.page ?? 1;
        const pageSize = filters.pageSize ?? 50;
        const start = (page - 1) * pageSize;
        return {
          items: structuredClone(filtered.slice(start, start + pageSize)),
          total: filtered.length,
          page,
          pageSize,
        };
      },
      { method: 'GET', params: toMailboxMessageQueryParams(filters) },
    );

    return fromMailboxMessageListApiDto(result, filters);
  },

  /** GET /api/mailbox/messages/:id */
  async getMessage(id: string): Promise<MailboxMessage> {
    const result = await apiCall<MailboxMessageApiDto>(
      `/api/mailbox/messages/${id}`,
      () => structuredClone(findMessageOrThrow(id)),
      { method: 'GET' },
    );

    return fromMailboxMessageApiDto(result);
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

  /** POST /api/mailbox/messages/:id/prevalidate */
  async prevalidateMessage(id: string): Promise<MailboxMessageActionResult> {
    const result = await apiCall<MailboxMessageActionResultApiDto>(
      `/api/mailbox/messages/${id}/prevalidate`,
      () => {
        const current = findMessageOrThrow(id);
        const now = new Date().toISOString();
        const { prevalidation: _previousPrevalidation, ...messageForValidation } = current;
        const prevalidation = prevalidateMailboxMessage(messageForValidation, now);
        const messageWithPrevalidation = { ...current, prevalidation };
        const nextStatus = isMailboxInFlightOrTerminal(current)
          ? current.status
          : isManuallyRejected(current)
            ? 'rejected'
            : isManuallyReleased(current) && !hasHardTechnicalBlock(messageWithPrevalidation)
              ? 'accepted'
              : prevalidation.outcome === 'rejected'
                ? 'rejected'
                : prevalidation.outcome === 'manual_review'
                  ? 'manual_review'
                  : current.status === 'new'
                    ? 'accepted'
                    : current.status;
        const message = replaceMessage(id, {
          ...current,
          status: nextStatus,
          prevalidation,
          lastActionAt: now,
          lastError: undefined,
        });
        return {
          message: structuredClone(message),
          resultMessage: prevalidation.summary,
          correlationId: `mail-preval-${Date.now()}`,
        };
      },
      { method: 'POST' },
      { delay: [250, 550] },
    );

    return fromMailboxActionResultApiDto(result);
  },

  /** POST /api/mailbox/messages/:id/ignore */
  async ignoreMessage(id: string): Promise<MailboxMessageActionResult> {
    const result = await apiCall<MailboxMessageActionResultApiDto>(
      `/api/mailbox/messages/${id}/ignore`,
      () => {
        const current = findMessageOrThrow(id);
        const now = new Date().toISOString();
        const message = replaceMessage(id, {
          ...current,
          status: 'ignored',
          lastActionAt: now,
        });
        return {
          message: structuredClone(message),
          resultMessage: 'Mail gemarkeerd als genegeerd.',
          correlationId: `mail-ignore-${Date.now()}`,
        };
      },
      { method: 'POST' },
    );

    return fromMailboxActionResultApiDto(result);
  },

  /** POST /api/mailbox/messages/:id/manual-reject */
  async manualRejectMessage(id: string, dto: MailboxManualActionDto): Promise<MailboxMessageActionResult> {
    const result = await apiCall<MailboxMessageActionResultApiDto>(
      `/api/mailbox/messages/${id}/manual-reject`,
      () => {
        const current = findMessageOrThrow(id);
        const now = new Date().toISOString();
        const reason = normalizeManualReason(dto.reason);
        if (!canManualRejectMailboxMessage(current)) {
          throw new Error(getManualDecisionBlockReason(current) ?? 'Deze mail kan niet handmatig worden afgekeurd.');
        }
        const prevalidation = current.prevalidation ?? prevalidateMailboxMessage(current, now);
        const message = replaceMessage(id, {
          ...current,
          status: 'rejected',
          prevalidation,
          manualDecision: {
            action: 'manual_reject',
            decidedAt: now,
            decidedBy: dto.decidedBy ?? 'current-user',
            decidedByName: dto.decidedByName ?? 'Gebruiker',
            reason,
            previousOutcome: prevalidation.outcome,
            previousStatus: current.status,
          },
          lastActionAt: now,
          lastError: undefined,
        });
        return {
          message: structuredClone(message),
          resultMessage: 'Mail handmatig afgekeurd en geblokkeerd voor verwerking.',
          correlationId: `mail-manual-reject-${Date.now()}`,
        };
      },
      { method: 'POST', body: dto },
      { delay: [250, 550] },
    );

    return fromMailboxActionResultApiDto(result);
  },

  /** POST /api/mailbox/messages/:id/override-accept */
  async overrideMessage(id: string, dto: MailboxManualActionDto): Promise<MailboxMessageActionResult> {
    const result = await apiCall<MailboxMessageActionResultApiDto>(
      `/api/mailbox/messages/${id}/override-accept`,
      () => {
        const current = findMessageOrThrow(id);
        const now = new Date().toISOString();
        const reason = normalizeManualReason(dto.reason);
        if (!canOverrideMailboxMessage(current)) {
          throw new Error(getOverrideBlockReason(current) ?? 'Deze mail kan niet veilig worden vrijgegeven.');
        }
        const prevalidation = current.prevalidation ?? prevalidateMailboxMessage(current, now);
        const message = replaceMessage(id, {
          ...current,
          status: 'accepted',
          prevalidation,
          manualDecision: {
            action: 'override_accept',
            decidedAt: now,
            decidedBy: dto.decidedBy ?? 'current-user',
            decidedByName: dto.decidedByName ?? 'Gebruiker',
            reason,
            previousOutcome: prevalidation.outcome,
            previousStatus: current.status,
          },
          lastActionAt: now,
          lastError: undefined,
        });
        return {
          message: structuredClone(message),
          resultMessage: 'Automatisch intakebesluit overruled; mail is handmatig vrijgegeven.',
          correlationId: `mail-override-${Date.now()}`,
        };
      },
      { method: 'POST', body: dto },
      { delay: [250, 550] },
    );

    return fromMailboxActionResultApiDto(result);
  },

  /** POST /api/mailbox/messages/:id/process */
  async processMessage(id: string): Promise<MailboxMessageActionResult> {
    const result = await apiCall<MailboxMessageActionResultApiDto>(
      `/api/mailbox/messages/${id}/process`,
      () => {
        const current = findMessageOrThrow(id);
        const prevalidation = current.prevalidation ?? prevalidateMailboxMessage(current);
        const messageForDecision = { ...current, prevalidation };
        if (!canProcessMailboxMessage(messageForDecision)) {
          const blockReason = getMailboxProcessBlockReason(messageForDecision);
          const blockedStatus =
            current.status === 'ignored' ||
            current.status === 'queued' ||
            current.status === 'processing' ||
            current.status === 'invoice_created'
              ? current.status
              : isManuallyRejected(current) || prevalidation.outcome === 'rejected'
                ? 'rejected'
                : 'manual_review';
          const message = replaceMessage(id, {
            ...current,
            prevalidation,
            status: blockedStatus,
            lastError: blockReason,
            lastActionAt: new Date().toISOString(),
          });
          return {
            message: structuredClone(message),
            resultMessage: `Niet verwerkt: ${blockReason}`,
            correlationId: `mail-process-blocked-${Date.now()}`,
          };
        }

        const now = new Date().toISOString();
        const message = replaceMessage(id, {
          ...current,
          status: current.linkedInvoiceId ? 'invoice_created' : 'queued',
          prevalidation,
          lastActionAt: now,
          lastError: undefined,
        });
        return {
          message: structuredClone(message),
          resultMessage: current.linkedInvoiceId
            ? 'Mail is gekoppeld aan een bestaande factuur.'
            : 'Mail staat in de wachtrij voor factuurherkenning.',
          correlationId: `mail-process-${Date.now()}`,
        };
      },
      { method: 'POST' },
      { delay: [350, 800] },
    );

    return fromMailboxActionResultApiDto(result);
  },
};
