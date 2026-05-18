import type { Currency, ValidationIssue } from './common';
import type {
  Invoice,
  InvoiceLine,
  InvoiceListFilters,
  InvoiceSourceMail,
  InvoiceStatus,
  PeppolReceiver,
  PeppolStatus,
  UpdateInvoiceDto,
} from './invoice';

/**
 * API-contract voor de Azure/.NET backend.
 *
 * Doel:
 * - De UI mag rijk/gebruiksvriendelijk blijven.
 * - De backend krijgt een stabiel, expliciet JSON-contract.
 * - Herkenningsvelden zitten bij elkaar in `recognition`, zodat Azure Document
 *   Intelligence / validatie / correcties niet door losse UI-velden heen lopen.
 *
 * JSON naming: camelCase, passend bij System.Text.Json defaults in .NET.
 */

export interface ApiMoneyDto {
  amount: number;
  currency: Currency;
}

export type RecognitionFieldKey =
  | 'summaryDescription'
  | 'amountExcludingVat'
  | 'vatAmount'
  | 'amountIncludingVat'
  | 'gAccountAmount'
  | 'paymentReference'
  | 'debtorNumber'
  | 'orderReference'
  | 'buyerReference'
  | 'period'
  | 'periodYear'
  | 'paymentMethod';

export interface RecognitionFieldConfidenceDto {
  field: RecognitionFieldKey;
  score: number;
  source?: 'azure_document_intelligence' | 'rules_engine' | 'manual_correction' | 'default';
}

export interface InvoiceRecognitionDto {
  /** Menselijke, korte omschrijving, bijv. "Abonnement Mei". */
  summaryDescription: string;

  /** Bedrag exclusief BTW. */
  amountExcludingVat: ApiMoneyDto;
  /** Totaal BTW-bedrag. */
  vatAmount: ApiMoneyDto;
  /** Bedrag inclusief BTW. */
  amountIncludingVat: ApiMoneyDto;
  /** Bedrag dat via G-rekening betaald moet worden. Default: 0 EUR. */
  gAccountAmount: ApiMoneyDto;

  /** Betalingskenmerk / factuurreferentie. */
  paymentReference?: string;
  /** Debiteurnummer / klantnummer op de factuur. */
  debtorNumber?: string;
  /**
   * Verplichtingenummer / inkooporderreferentie.
   * UBL mapping: cac:OrderReference/cbc:ID.
   */
  orderReference?: string;
  /**
   * Standaardroutenummer voor gemeentelijke routering.
   * UBL mapping: cbc:BuyerReference.
   */
  buyerReference?: string;
  /** Herkende periode, bijv. "mei", "Q2" of "2026-05". */
  period: string;
  /** Jaar behorend bij de periode. */
  periodYear: number;
  /** Default vanuit frontend/backend: "Bankoverschrijving". */
  paymentMethod: string;

  confidenceScore: number;
  fieldConfidences?: RecognitionFieldConfidenceDto[];
}

export interface InvoiceApiDto {
  id: string;
  invoiceNumber: string;
  status: InvoiceStatus;
  peppolStatus: PeppolStatus;

  supplierId: string;
  supplierName: string;
  supplierKvk?: string;
  supplierVatNumber?: string;
  supplierIban?: string;

  invoiceDate: string;
  dueDate?: string | null;

  /** Nieuw stabiel blok voor herkenning/correctie vanuit Azure backend. */
  recognition: InvoiceRecognitionDto;

  lines: InvoiceLine[];
  receiver?: PeppolReceiver;

  validationIssues: ValidationIssue[];

  pdfUrl: string;
  ublUrl?: string;
  source: InvoiceSourceMail;

  createdAt: string;
  updatedAt: string;
}

export interface InvoicePatchApiDto {
  supplierName?: string;
  supplierKvk?: string;
  supplierVatNumber?: string;
  supplierIban?: string;
  invoiceNumber?: string;
  invoiceDate?: string;
  dueDate?: string | null;
  lines?: InvoiceLine[];
  receiver?: PeppolReceiver;
  recognition?: Partial<InvoiceRecognitionDto>;
}

export interface InvoiceRecognitionPatchApiDto {
  recognition: Partial<InvoiceRecognitionDto>;
}

export interface InvoiceRecognitionResultApiDto {
  invoiceId: string;
  status: InvoiceStatus;
  recognition: InvoiceRecognitionDto;
  validationIssues: ValidationIssue[];
  updatedAt: string;
}

export type InvoiceListApiFilters = InvoiceListFilters;

/**
 * Convenience type voor code die tijdelijk nog het oude platte response-model
 * ontvangt. Dit maakt de frontend tolerant tijdens backend-migratie.
 */
export type InvoiceApiResponse = InvoiceApiDto | Invoice;

export type UpdateInvoiceApiInput = UpdateInvoiceDto;
