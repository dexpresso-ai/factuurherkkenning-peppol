export type AuditEventType =
  | 'mail_received'
  | 'pdf_stored'
  | 'extraction_started'
  | 'extraction_completed'
  | 'validation'
  | 'manual_correction'
  | 'manual_approval'
  | 'ubl_generated'
  | 'peppol_submitted'
  | 'peppol_delivered'
  | 'peppol_failed'
  | 'reprocessed';

export type AuditSeverity = 'info' | 'success' | 'warning' | 'error';

export interface AuditLogEntry {
  id: string;
  invoiceId: string;
  type: AuditEventType;
  severity: AuditSeverity;
  message: string;
  actor: string; // 'system' or user email
  metadata?: Record<string, string | number | boolean>;
  timestamp: string;
}
