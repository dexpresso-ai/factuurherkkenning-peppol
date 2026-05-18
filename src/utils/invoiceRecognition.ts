import type { Invoice, Money } from '@/types';

export const DEFAULT_PAYMENT_METHOD = 'Bankoverschrijving';

const monthFormatter = new Intl.DateTimeFormat('nl-NL', { month: 'long' });
const monthNames = [
  'januari',
  'februari',
  'maart',
  'april',
  'mei',
  'juni',
  'juli',
  'augustus',
  'september',
  'oktober',
  'november',
  'december',
];

function titleCase(value: string): string {
  if (!value) return value;
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function getInvoiceDate(invoice: Pick<Invoice, 'invoiceDate'>): Date | null {
  const date = new Date(invoice.invoiceDate);
  return Number.isNaN(date.getTime()) ? null : date;
}

function combinedLineText(invoice: { lines?: Array<{ description: string }> }): string {
  return invoice.lines?.map((line) => line.description).join(' ').toLowerCase() ?? '';
}

function inferPeriodFromLines(invoice: { lines?: Array<{ description: string }> }): string | null {
  const text = combinedLineText(invoice);
  return monthNames.find((month) => text.includes(month)) ?? null;
}

function inferYearFromLines(invoice: { lines?: Array<{ description: string }> }): number | null {
  const match = combinedLineText(invoice).match(/\b(20\d{2})\b/);
  if (!match?.[1]) return null;
  const year = Number.parseInt(match[1], 10);
  return Number.isFinite(year) ? year : null;
}

export function inferInvoicePeriod(
  invoice: Pick<Invoice, 'invoiceDate'> & { lines?: Array<{ description: string }> },
): string {
  const periodFromLines = inferPeriodFromLines(invoice);
  if (periodFromLines) return periodFromLines;

  const date = getInvoiceDate(invoice);
  if (!date) return '';
  return monthFormatter.format(date);
}

export function inferInvoicePeriodYear(
  invoice: Pick<Invoice, 'invoiceDate'> & { lines?: Array<{ description: string }> },
): number {
  const yearFromLines = inferYearFromLines(invoice);
  if (yearFromLines) return yearFromLines;

  const date = getInvoiceDate(invoice);
  if (!date) return new Date().getFullYear();
  return date.getFullYear();
}

export function createZeroMoney(invoice: Pick<Invoice, 'totalAmount'>): Money {
  return {
    amount: 0,
    currency: invoice.totalAmount?.currency ?? 'EUR',
  };
}

/**
 * Herleidt een compacte, menselijke omschrijving uit de herkenningsdata.
 * Voorbeeld: KPN-regels met zakelijk internet/mobiel internet worden
 * samengevat tot "Abonnement Mei" i.p.v. losse technische factuurregels.
 */
export function inferInvoiceSummaryDescription(
  invoice: Pick<Invoice, 'supplierName' | 'invoiceDate' | 'lines'> & {
    period?: string;
  },
): string {
  const period = titleCase(invoice.period || inferInvoicePeriod(invoice));
  const supplier = invoice.supplierName.toLowerCase();
  const combinedLines = combinedLineText(invoice);

  if (
    supplier.includes('kpn') ||
    combinedLines.includes('zakelijk internet') ||
    combinedLines.includes('mobiel') ||
    combinedLines.includes('abonnement')
  ) {
    return `Abonnement ${period}`.trim();
  }

  if (combinedLines.includes('elektriciteit') || combinedLines.includes('energie')) {
    return `Energie ${period}`.trim();
  }

  if (combinedLines.includes('hosting') || combinedLines.includes('cloud')) {
    return `Cloud hosting ${period}`.trim();
  }

  if (invoice.lines.length === 1 && invoice.lines[0]?.description) {
    return invoice.lines[0].description;
  }

  if (invoice.lines.length > 1) {
    return `Diverse goederen/diensten ${period}`.trim();
  }

  return `Factuur ${period}`.trim();
}

export function getInvoiceSummaryDescription(invoice: Invoice): string {
  return invoice.summaryDescription || inferInvoiceSummaryDescription(invoice);
}

export function getInvoicePeriod(invoice: Invoice): string {
  return invoice.period || inferInvoicePeriod(invoice);
}

export function getInvoicePeriodYear(invoice: Invoice): number {
  return invoice.periodYear || inferInvoicePeriodYear(invoice);
}

export function getPaymentMethod(invoice: Invoice): string {
  return invoice.paymentMethod || DEFAULT_PAYMENT_METHOD;
}

export function getGAccountAmount(invoice: Invoice): Money {
  return invoice.gAccountAmount || createZeroMoney(invoice);
}

export function getObligationNumber(invoice: Invoice): string | undefined {
  return invoice.obligationNumber?.trim() || undefined;
}

export function getBuyerReference(invoice: Invoice): string | undefined {
  return invoice.buyerReference?.trim() || undefined;
}

export function normalizeInvoiceRecognitionFields(invoice: Invoice): Invoice {
  const period = getInvoicePeriod(invoice);
  const paymentReference =
    invoice.paymentReference || (invoice.invoiceNumber !== '?' ? invoice.invoiceNumber : undefined);

  return {
    ...invoice,
    summaryDescription:
      invoice.summaryDescription || inferInvoiceSummaryDescription({ ...invoice, period }),
    paymentReference,
    period,
    periodYear: getInvoicePeriodYear(invoice),
    paymentMethod: getPaymentMethod(invoice),
    gAccountAmount: getGAccountAmount(invoice),
    obligationNumber: getObligationNumber(invoice),
    buyerReference: getBuyerReference(invoice),
  };
}
