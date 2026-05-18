import type { MailboxMessage, MailboxMessageStatus } from '@/types';

const TERMINAL_OR_IN_FLIGHT_STATUSES = new Set<MailboxMessageStatus>([
  'queued',
  'processing',
  'invoice_created',
  'ignored',
]);

const MANUAL_DECISION_BLOCKED_STATUSES = new Set<MailboxMessageStatus>([
  'queued',
  'processing',
  'invoice_created',
  'ignored',
]);

const HARD_TECHNICAL_RULE_CODES = new Set(['NO_ATTACHMENTS', 'NO_INVOICE_ATTACHMENT']);

export function isManuallyReleased(message: MailboxMessage): boolean {
  return message.manualDecision?.action === 'override_accept';
}

export function isManuallyRejected(message: MailboxMessage): boolean {
  return message.manualDecision?.action === 'manual_reject';
}

export function hasInvoiceCandidateAttachment(message: MailboxMessage): boolean {
  if (message.pdfAttachmentCount > 0 || message.xmlAttachmentCount > 0) return true;
  return message.attachments.some((attachment) => attachment.isInvoiceCandidate);
}

export function hasHardTechnicalBlock(message: MailboxMessage): boolean {
  const hasFailedTechnicalRule = message.prevalidation?.rules.some(
    (rule) => !rule.passed && HARD_TECHNICAL_RULE_CODES.has(rule.code),
  );

  if (hasFailedTechnicalRule) return true;
  if (!message.hasAttachments || message.attachmentCount <= 0) return true;
  return !hasInvoiceCandidateAttachment(message);
}

export function isMailboxInFlightOrTerminal(message: MailboxMessage): boolean {
  return TERMINAL_OR_IN_FLIGHT_STATUSES.has(message.status);
}

export function canManuallyDecideMailboxMessage(message: MailboxMessage): boolean {
  return !MANUAL_DECISION_BLOCKED_STATUSES.has(message.status);
}

export function canOverrideMailboxMessage(message: MailboxMessage): boolean {
  return canManuallyDecideMailboxMessage(message) && !isManuallyReleased(message) && !hasHardTechnicalBlock(message);
}

export function canManualRejectMailboxMessage(message: MailboxMessage): boolean {
  return canManuallyDecideMailboxMessage(message) && !isManuallyRejected(message);
}

export function canProcessMailboxMessage(message: MailboxMessage): boolean {
  if (TERMINAL_OR_IN_FLIGHT_STATUSES.has(message.status)) return false;
  if (isManuallyRejected(message)) return false;
  if (hasHardTechnicalBlock(message)) return false;

  return message.prevalidation?.outcome === 'accepted' || isManuallyReleased(message);
}

export function getMailboxProcessBlockReason(message: MailboxMessage): string {
  if (message.status === 'ignored') return 'Mail is genegeerd en mag niet worden verwerkt.';
  if (message.status === 'queued') return 'Mail staat al in de wachtrij voor verwerking.';
  if (message.status === 'processing') return 'Mail wordt al verwerkt.';
  if (message.status === 'invoice_created') return 'Voor deze mail is al een factuur aangemaakt.';
  if (isManuallyRejected(message)) return 'Mail is handmatig afgekeurd en mag niet worden verwerkt.';
  if (hasHardTechnicalBlock(message)) {
    return 'Mail heeft geen verwerkbare factuurbijlage. Handmatige override mag technische blokkades niet overslaan.';
  }
  return 'Mail is niet vrijgegeven voor automatische verwerking.';
}

export function getManualDecisionBlockReason(message: MailboxMessage): string | undefined {
  if (message.status === 'ignored') return 'Deze mail is genegeerd. Heractiveer hem eerst server-side voordat een reviewbesluit wordt aangepast.';
  if (message.status === 'queued') return 'Deze mail staat al in de verwerkingswachtrij.';
  if (message.status === 'processing') return 'Deze mail wordt momenteel verwerkt.';
  if (message.status === 'invoice_created') return 'Deze mail is al gekoppeld aan een factuur.';
  return undefined;
}

export function getOverrideBlockReason(message: MailboxMessage): string | undefined {
  const manualBlock = getManualDecisionBlockReason(message);
  if (manualBlock) return manualBlock;
  if (isManuallyReleased(message)) return 'Deze mail is al handmatig vrijgegeven.';
  if (hasHardTechnicalBlock(message)) {
    return 'Deze mail mist een PDF/XML-factuurbijlage. Dit is een harde technische blokkade en geen routebesluit dat je veilig kunt overrulen.';
  }
  return undefined;
}
