import type { AuditLogEntry } from '@/types';

/**
 * Audit log entries — gegroepeerd per factuur, gesorteerd oud → nieuw.
 * Zo kan de UI per factuur een complete tijdlijn renderen.
 */
export const mockAuditLog: AuditLogEntry[] = [
  /* inv-1001 KPN — happy path */
  {
    id: 'a-1001-1',
    invoiceId: 'inv-1001',
    type: 'mail_received',
    severity: 'info',
    actor: 'system',
    message: 'E-mail ontvangen van facturen@kpn.nl met bijlage F-2026-0481.pdf',
    timestamp: '2026-05-01T08:14:00Z',
  },
  {
    id: 'a-1001-2',
    invoiceId: 'inv-1001',
    type: 'pdf_stored',
    severity: 'info',
    actor: 'system',
    message: 'PDF opgeslagen in Azure Blob (container: invoices-raw)',
    timestamp: '2026-05-01T08:14:03Z',
  },
  {
    id: 'a-1001-3',
    invoiceId: 'inv-1001',
    type: 'extraction_started',
    severity: 'info',
    actor: 'system',
    message: 'Extractie gestart (Document Intelligence prebuilt-invoice)',
    timestamp: '2026-05-01T08:14:05Z',
  },
  {
    id: 'a-1001-4',
    invoiceId: 'inv-1001',
    type: 'extraction_completed',
    severity: 'success',
    actor: 'system',
    message: 'Extractie voltooid met confidence 0.98',
    timestamp: '2026-05-01T08:14:32Z',
  },
  {
    id: 'a-1001-5',
    invoiceId: 'inv-1001',
    type: 'validation',
    severity: 'success',
    actor: 'system',
    message: 'Alle validaties geslaagd (KVK, BTW, IBAN, totalen)',
    timestamp: '2026-05-01T08:14:36Z',
  },
  {
    id: 'a-1001-6',
    invoiceId: 'inv-1001',
    type: 'ubl_generated',
    severity: 'success',
    actor: 'system',
    message: 'UBL 2.1 gegenereerd en gevalideerd tegen Peppol BIS Billing 3.0',
    timestamp: '2026-05-01T08:14:41Z',
  },
  {
    id: 'a-1001-7',
    invoiceId: 'inv-1001',
    type: 'peppol_submitted',
    severity: 'info',
    actor: 'system',
    message: 'Verzonden naar Peppol Access Point (Storecove)',
    timestamp: '2026-05-01T08:15:02Z',
  },
  {
    id: 'a-1001-8',
    invoiceId: 'inv-1001',
    type: 'peppol_delivered',
    severity: 'success',
    actor: 'system',
    message: 'Aflevering bevestigd door ontvangende AP',
    timestamp: '2026-05-01T08:18:42Z',
  },

  /* inv-1007 Office Supplies — UBL fout */
  {
    id: 'a-1007-1',
    invoiceId: 'inv-1007',
    type: 'mail_received',
    severity: 'info',
    actor: 'system',
    message: 'E-mail ontvangen met bijlage OFC-552412.pdf',
    timestamp: '2026-05-08T11:02:00Z',
  },
  {
    id: 'a-1007-2',
    invoiceId: 'inv-1007',
    type: 'extraction_completed',
    severity: 'success',
    actor: 'system',
    message: 'Extractie voltooid met confidence 0.94',
    timestamp: '2026-05-08T11:02:38Z',
  },
  {
    id: 'a-1007-3',
    invoiceId: 'inv-1007',
    type: 'ubl_generated',
    severity: 'error',
    actor: 'system',
    message: 'UBL-validatie mislukt: BR-CO-26 — cbc:CompanyID ontbreekt voor ontvanger',
    timestamp: '2026-05-08T11:09:33Z',
  },

  /* inv-1006 onbekende leverancier */
  {
    id: 'a-1006-1',
    invoiceId: 'inv-1006',
    type: 'mail_received',
    severity: 'info',
    actor: 'system',
    message: 'E-mail ontvangen van noreply@unknown-domain.com',
    timestamp: '2026-05-09T16:12:00Z',
  },
  {
    id: 'a-1006-2',
    invoiceId: 'inv-1006',
    type: 'extraction_completed',
    severity: 'warning',
    actor: 'system',
    message: 'Extractie voltooid met lage confidence (0.38) — handmatige review nodig',
    timestamp: '2026-05-09T16:12:48Z',
  },
];
