import type { Currency, ValidationIssue } from './common';

/**
 * Verwerkingsstatussen voor facturen.
 * Komt 1-op-1 overeen met de domain enum in de .NET backend.
 */
export type InvoiceStatus =
  | 'new' //              Net binnengekomen vanuit mailbox
  | 'processing' //       OCR / extractie loopt
  | 'review_required' //  Lage confidence / validatiewaarschuwing
  | 'ready_for_peppol' // Goedgekeurd, klaar voor verzending
  | 'sent' //             Verzonden via Peppol
  | 'delivered' //        Aflevering bevestigd door Peppol AP
  | 'error' //            Verwerkingsfout (UBL-validatie, Peppol)
  | 'rejected'; //        Afgewezen door ontvangende AP

export type PeppolStatus =
  | 'not_sent'
  | 'queued'
  | 'sending'
  | 'delivered'
  | 'failed'
  | 'rejected';

export interface Money {
  amount: number;
  currency: Currency;
}

export interface InvoiceLine {
  id: string;
  description: string;
  quantity: number;
  unitPrice: Money;
  vatRate: number; // percentage, e.g. 21
  lineTotal: Money;
  vatAmount: Money;
}

export interface PeppolReceiver {
  name: string;
  /** Peppol Participant Identifier, bijv. "0106:12345678" */
  participantId?: string;
  endpointId?: string;
  scheme?: string;
}

export interface InvoiceSourceMail {
  messageId: string;
  fromAddress: string;
  subject: string;
  receivedAt: string;
  attachmentName: string;
}

/** Hoofd-DTO. Komt overeen met een .NET InvoiceDto. */
export interface Invoice {
  id: string;
  invoiceNumber: string;
  status: InvoiceStatus;
  peppolStatus: PeppolStatus;

  supplierId: string;
  supplierName: string;
  supplierKvk?: string;
  supplierVatNumber?: string;
  supplierIban?: string;

  invoiceDate: string; // ISO date
  dueDate?: string;

  lines: InvoiceLine[];

  subtotal: Money;
  vatTotal: Money;
  totalAmount: Money;

  receiver?: PeppolReceiver;

  /** 0..1 — confidence van de extractie */
  confidenceScore: number;

  validationIssues: ValidationIssue[];

  pdfUrl: string;
  ublUrl?: string;

  source: InvoiceSourceMail;

  createdAt: string;
  updatedAt: string;
}

/* ---------- DTO's voor mutaties ---------- */

export interface UpdateInvoiceDto {
  supplierName?: string;
  supplierKvk?: string;
  supplierVatNumber?: string;
  supplierIban?: string;
  invoiceNumber?: string;
  invoiceDate?: string;
  dueDate?: string;
  lines?: InvoiceLine[];
  receiver?: PeppolReceiver;
}

export interface InvoiceListFilters {
  search?: string;
  status?: InvoiceStatus | 'all';
  supplierId?: string;
  hasIssues?: boolean;
  page?: number;
  pageSize?: number;
}

export interface SendPeppolResult {
  invoiceId: string;
  peppolStatus: PeppolStatus;
  submissionId: string;
}
