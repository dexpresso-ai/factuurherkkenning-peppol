import type {
  MailboxAttachmentSummary,
  MailboxMessage,
  MailboxPrevalidationDecision,
  MailboxPrevalidationRuleResult,
} from '@/types';

const eur = (amount: number) => ({ amount, currency: 'EUR' as const });

const pdf = (id: string, fileName: string, sizeBytes: number): MailboxAttachmentSummary => ({
  id,
  fileName,
  sizeBytes,
  contentType: 'application/pdf',
  kind: 'pdf',
  isInvoiceCandidate: true,
});

const xml = (id: string, fileName: string, sizeBytes: number): MailboxAttachmentSummary => ({
  id,
  fileName,
  sizeBytes,
  contentType: 'application/xml',
  kind: 'xml',
  isInvoiceCandidate: true,
});

const image = (id: string, fileName: string, sizeBytes: number): MailboxAttachmentSummary => ({
  id,
  fileName,
  sizeBytes,
  contentType: 'image/jpeg',
  kind: 'image',
  isInvoiceCandidate: false,
});

const other = (id: string, fileName: string, sizeBytes: number): MailboxAttachmentSummary => ({
  id,
  fileName,
  sizeBytes,
  contentType: 'text/plain',
  kind: 'other',
  isInvoiceCandidate: false,
});

function createRules(message: Omit<MailboxMessage, 'prevalidation'>): MailboxPrevalidationRuleResult[] {
  const hasAttachments = message.attachmentCount > 0;
  const hasInvoiceAttachment = message.attachments.some((attachment) => attachment.isInvoiceCandidate);
  const amount = message.estimatedTotalAmount?.amount;
  const aboveThreshold = typeof amount === 'number' && amount > 5000;

  const rules: MailboxPrevalidationRuleResult[] = [];

  rules.push(
    hasAttachments
      ? {
          code: 'HAS_ATTACHMENTS',
          passed: true,
          severity: 'success',
          message: 'Mail bevat één of meer bijlagen.',
        }
      : {
          code: 'NO_ATTACHMENTS',
          passed: false,
          severity: 'error',
          message: 'Mail afgekeurd: er is geen bijlage aangetroffen.',
        },
  );

  if (hasAttachments) {
    rules.push(
      hasInvoiceAttachment
        ? {
            code: 'HAS_INVOICE_ATTACHMENT',
            passed: true,
            severity: 'success',
            message: 'Er is minimaal één PDF/XML-bijlage gevonden die als factuurkandidaat geldt.',
          }
        : {
            code: 'NO_INVOICE_ATTACHMENT',
            passed: false,
            severity: 'error',
            message: 'Mail afgekeurd: er is wel een bijlage, maar geen factuurkandidaat.',
          },
    );
  }

  if (amount === undefined) {
    rules.push({
      code: 'UNKNOWN_AMOUNT',
      passed: true,
      severity: 'info',
      message: 'Totaalbedrag is in mailboxfase nog niet betrouwbaar bekend.',
    });
  } else if (aboveThreshold) {
    rules.push({
      code: 'TOTAL_AMOUNT_ABOVE_5000',
      passed: false,
      severity: 'warning',
      message: 'Totaalbedrag is hoger dan € 5.000. Route-/goedkeuringsnaam wordt niet getoond; handmatige controle vereist.',
    });
  } else {
    rules.push({
      code: 'TOTAL_AMOUNT_ABOVE_5000',
      passed: true,
      severity: 'success',
      message: 'Totaalbedrag valt binnen de automatische intakegrens.',
    });
  }

  return rules;
}

export function prevalidateMailboxMessage(
  message: Omit<MailboxMessage, 'prevalidation'>,
  decidedAt = new Date().toISOString(),
): MailboxPrevalidationDecision {
  const rules = createRules(message);
  const hasBlockingError = rules.some((rule) => rule.severity === 'error' && !rule.passed);
  const highAmount = rules.some((rule) => rule.code === 'TOTAL_AMOUNT_ABOVE_5000' && !rule.passed);

  if (hasBlockingError) {
    return {
      outcome: 'rejected',
      decidedAt,
      summary: 'Vooraf afgekeurd. Deze mail wordt niet doorgestuurd naar factuurherkenning.',
      rules,
      routeDisclosure: 'not_applicable',
    };
  }

  if (highAmount) {
    return {
      outcome: 'manual_review',
      decidedAt,
      summary: 'Extra controle nodig door bedrag boven € 5.000. Route-informatie blijft afgeschermd.',
      rules,
      routeDisclosure: 'hidden_due_threshold',
    };
  }

  return {
    outcome: 'accepted',
    decidedAt,
    summary: 'Goedgekeurd voor verdere verwerking richting factuurherkenning.',
    rules,
    routeDisclosure: 'visible',
  };
}

function withPrevalidation(message: Omit<MailboxMessage, 'prevalidation'>): MailboxMessage {
  const prevalidation = prevalidateMailboxMessage(message, message.lastActionAt ?? message.receivedAt);
  return {
    ...message,
    status:
      prevalidation.outcome === 'rejected'
        ? 'rejected'
        : prevalidation.outcome === 'manual_review'
          ? 'manual_review'
          : message.status,
    prevalidation,
  };
}

export const mockMailboxMessages: MailboxMessage[] = [
  withPrevalidation({
    id: 'mail-1001',
    graphMessageId: 'AAMkAGI2T-mail-1001',
    internetMessageId: '<kpn-0481@example.com>',
    conversationId: 'conv-1001',
    mailboxAddress: 'facturen@gemeente.nl',
    subject: 'Factuur F-2026-0481 - KPN Zakelijk',
    fromName: 'KPN Facturatie',
    fromAddress: 'facturen@kpn.nl',
    receivedAt: '2026-05-18T07:42:00Z',
    bodyPreview: 'Beste klant, bijgaand ontvangt u de factuur voor zakelijk internet en mobiel internet.',
    isRead: false,
    hasAttachments: true,
    attachmentCount: 1,
    pdfAttachmentCount: 1,
    xmlAttachmentCount: 0,
    attachments: [pdf('att-1001', 'F-2026-0481.pdf', 348_120)],
    status: 'accepted',
    estimatedTotalAmount: eur(349.69),
    linkedInvoiceId: 'inv-1001',
    linkedInvoiceNumber: 'F-2026-0481',
    lastActionAt: '2026-05-18T07:42:10Z',
  }),
  withPrevalidation({
    id: 'mail-1002',
    graphMessageId: 'AAMkAGI2T-mail-1002',
    internetMessageId: '<coolblue-13371@example.com>',
    conversationId: 'conv-1002',
    mailboxAddress: 'facturen@gemeente.nl',
    subject: 'Factuur Coolblue voor Acme - CB-2026-13371',
    fromName: 'Coolblue Zakelijk',
    fromAddress: 'facturen@coolblue.nl',
    receivedAt: '2026-05-18T08:13:00Z',
    bodyPreview: 'In de bijlage vindt u de factuur voor de geleverde hardware.',
    isRead: false,
    hasAttachments: true,
    attachmentCount: 2,
    pdfAttachmentCount: 1,
    xmlAttachmentCount: 1,
    attachments: [pdf('att-1002-pdf', 'CB-2026-13371.pdf', 428_902), xml('att-1002-xml', 'CB-2026-13371.xml', 21_840)],
    status: 'manual_review',
    estimatedTotalAmount: eur(5804.33),
    linkedInvoiceId: 'inv-1003',
    linkedInvoiceNumber: 'CB-2026-13371',
    lastActionAt: '2026-05-18T08:13:16Z',
  }),
  withPrevalidation({
    id: 'mail-1003',
    graphMessageId: 'AAMkAGI2T-mail-1003',
    internetMessageId: '<vraag-leverancier@example.com>',
    conversationId: 'conv-1003',
    mailboxAddress: 'facturen@gemeente.nl',
    subject: 'Vraag over openstaande betaling',
    fromName: 'Leverancier Support',
    fromAddress: 'support@leverancier.nl',
    receivedAt: '2026-05-18T08:25:00Z',
    bodyPreview: 'Kunnen jullie aangeven wanneer de betaling wordt uitgevoerd?',
    isRead: true,
    hasAttachments: false,
    attachmentCount: 0,
    pdfAttachmentCount: 0,
    xmlAttachmentCount: 0,
    attachments: [],
    status: 'rejected',
    lastActionAt: '2026-05-18T08:25:03Z',
  }),
  withPrevalidation({
    id: 'mail-1004',
    graphMessageId: 'AAMkAGI2T-mail-1004',
    internetMessageId: '<vattenfall-90238412@example.com>',
    conversationId: 'conv-1004',
    mailboxAddress: 'facturen@gemeente.nl',
    subject: 'Uw factuur Vattenfall',
    fromName: 'Vattenfall',
    fromAddress: 'facturatie@vattenfall.nl',
    receivedAt: '2026-05-18T09:04:00Z',
    bodyPreview: 'Uw energiefactuur over april staat klaar in de bijlage.',
    isRead: false,
    hasAttachments: true,
    attachmentCount: 1,
    pdfAttachmentCount: 1,
    xmlAttachmentCount: 0,
    attachments: [pdf('att-1004', 'V-90238412.pdf', 282_110)],
    status: 'accepted',
    estimatedTotalAmount: eur(2748.35),
    linkedInvoiceId: 'inv-1002',
    linkedInvoiceNumber: 'V-90238412',
    lastActionAt: '2026-05-18T09:04:08Z',
  }),
  withPrevalidation({
    id: 'mail-1005',
    graphMessageId: 'AAMkAGI2T-mail-1005',
    internetMessageId: '<nieuwsbrief@example.com>',
    conversationId: 'conv-1005',
    mailboxAddress: 'facturen@gemeente.nl',
    subject: 'Nieuwsbrief mei',
    fromName: 'Nieuwsbrief Platform',
    fromAddress: 'nieuwsbrief@example.nl',
    receivedAt: '2026-05-18T09:18:00Z',
    bodyPreview: 'Lees de laatste updates in onze maandelijkse nieuwsbrief.',
    isRead: true,
    hasAttachments: true,
    attachmentCount: 1,
    pdfAttachmentCount: 0,
    xmlAttachmentCount: 0,
    attachments: [image('att-1005', 'banner-mei.jpg', 118_420)],
    status: 'rejected',
    lastActionAt: '2026-05-18T09:18:04Z',
  }),
  withPrevalidation({
    id: 'mail-1006',
    graphMessageId: 'AAMkAGI2T-mail-1006',
    internetMessageId: '<bouwbedrijf-termijnstaat@example.com>',
    conversationId: 'conv-1006',
    mailboxAddress: 'facturen@gemeente.nl',
    subject: 'Termijnfactuur renovatie gemeentehuis',
    fromName: 'Bouwbedrijf De Brug',
    fromAddress: 'administratie@debrugbouw.nl',
    receivedAt: '2026-05-18T09:41:00Z',
    bodyPreview: 'Bijgaand de termijnfactuur. Het totaalbedrag overschrijdt de controlegrens.',
    isRead: false,
    hasAttachments: true,
    attachmentCount: 2,
    pdfAttachmentCount: 1,
    xmlAttachmentCount: 0,
    attachments: [pdf('att-1006-pdf', 'TERM-2026-018.pdf', 512_773), other('att-1006-txt', 'lees-mij.txt', 2_418)],
    status: 'manual_review',
    estimatedTotalAmount: eur(12_450.0),
    lastActionAt: '2026-05-18T09:41:12Z',
  }),
];
