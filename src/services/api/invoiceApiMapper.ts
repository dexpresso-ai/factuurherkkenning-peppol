import type {
  Currency,
  Invoice,
  InvoiceApiDto,
  InvoiceApiResponse,
  InvoicePatchApiDto,
  InvoiceRecognitionDto,
  InvoiceRecognitionPatchApiDto,
  Money,
  UpdateInvoiceApiInput,
  ValidationIssue,
} from '@/types';
import {
  getGAccountAmount,
  getInvoicePeriod,
  getInvoicePeriodYear,
  getInvoiceSummaryDescription,
  getPaymentMethod,
  normalizeInvoiceRecognitionFields,
} from '@/utils/invoiceRecognition';

const DEFAULT_CURRENCY: Currency = 'EUR';

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function getFiniteNumber(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function cloneMoney(money: Money | undefined, fallback: Money): Money {
  return {
    amount: getFiniteNumber(money?.amount, fallback.amount),
    currency: money?.currency ?? fallback.currency,
  };
}

function normalizeMoney(value: unknown, fallback: Money): Money {
  if (!isRecord(value)) return fallback;
  return {
    amount: getFiniteNumber(value.amount, fallback.amount),
    currency:
      typeof value.currency === 'string' && value.currency.length > 0
        ? (value.currency as Currency)
        : fallback.currency,
  };
}

function emptyValidationIssues(value: unknown): ValidationIssue[] {
  return Array.isArray(value) ? (value as ValidationIssue[]) : [];
}

function getRecognitionCurrency(recognition: unknown): Currency {
  if (!isRecord(recognition)) return DEFAULT_CURRENCY;

  const moneyFields = [
    recognition.amountIncludingVat,
    recognition.amountExcludingVat,
    recognition.vatAmount,
    recognition.gAccountAmount,
  ];

  for (const field of moneyFields) {
    if (isRecord(field) && typeof field.currency === 'string' && field.currency.length > 0) {
      return field.currency as Currency;
    }
  }

  return DEFAULT_CURRENCY;
}

function normalizeApiRecognition(recognition: unknown): InvoiceRecognitionDto {
  const dto = isRecord(recognition) ? recognition : {};
  const currency = getRecognitionCurrency(dto);
  const zero = { amount: 0, currency } satisfies Money;
  const amountIncludingVat = normalizeMoney(dto.amountIncludingVat, zero);
  const amountExcludingVat = normalizeMoney(dto.amountExcludingVat, amountIncludingVat);
  const vatAmount = normalizeMoney(dto.vatAmount, zero);
  const gAccountAmount = normalizeMoney(dto.gAccountAmount, zero);

  return {
    summaryDescription:
      typeof dto.summaryDescription === 'string' ? dto.summaryDescription : 'Factuur',
    amountExcludingVat,
    vatAmount,
    amountIncludingVat,
    gAccountAmount,
    paymentReference:
      typeof dto.paymentReference === 'string' ? dto.paymentReference : undefined,
    debtorNumber: typeof dto.debtorNumber === 'string' ? dto.debtorNumber : undefined,
    period: typeof dto.period === 'string' ? dto.period : '',
    periodYear: getFiniteNumber(dto.periodYear, new Date().getFullYear()),
    paymentMethod:
      typeof dto.paymentMethod === 'string' && dto.paymentMethod.trim() !== ''
        ? dto.paymentMethod
        : 'Bankoverschrijving',
    confidenceScore: getFiniteNumber(dto.confidenceScore, 0),
    fieldConfidences: Array.isArray(dto.fieldConfidences)
      ? (dto.fieldConfidences as InvoiceRecognitionDto['fieldConfidences'])
      : undefined,
  };
}

export function toInvoiceRecognitionDto(invoice: Invoice): InvoiceRecognitionDto {
  const normalized = normalizeInvoiceRecognitionFields(invoice);
  const hadGAccountAmount = Boolean(invoice.gAccountAmount);
  const hadPaymentMethod = Boolean(invoice.paymentMethod);

  return {
    summaryDescription: getInvoiceSummaryDescription(normalized),
    amountExcludingVat: cloneMoney(normalized.subtotal, normalized.totalAmount),
    vatAmount: cloneMoney(normalized.vatTotal, normalized.totalAmount),
    amountIncludingVat: cloneMoney(normalized.totalAmount, normalized.subtotal),
    gAccountAmount: getGAccountAmount(normalized),
    paymentReference: normalized.paymentReference,
    debtorNumber: normalized.debtorNumber,
    period: getInvoicePeriod(normalized),
    periodYear: getInvoicePeriodYear(normalized),
    paymentMethod: getPaymentMethod(normalized),
    confidenceScore: normalized.confidenceScore,
    fieldConfidences: [
      { field: 'summaryDescription', score: normalized.confidenceScore, source: 'rules_engine' },
      { field: 'amountExcludingVat', score: normalized.confidenceScore, source: 'azure_document_intelligence' },
      { field: 'vatAmount', score: normalized.confidenceScore, source: 'azure_document_intelligence' },
      { field: 'amountIncludingVat', score: normalized.confidenceScore, source: 'azure_document_intelligence' },
      { field: 'gAccountAmount', score: 1, source: hadGAccountAmount ? 'azure_document_intelligence' : 'default' },
      { field: 'paymentMethod', score: 1, source: hadPaymentMethod ? 'manual_correction' : 'default' },
    ],
  };
}

export function toInvoiceApiDto(invoice: Invoice): InvoiceApiDto {
  const normalized = normalizeInvoiceRecognitionFields(invoice);

  return {
    id: normalized.id,
    invoiceNumber: normalized.invoiceNumber,
    status: normalized.status,
    peppolStatus: normalized.peppolStatus,
    supplierId: normalized.supplierId,
    supplierName: normalized.supplierName,
    supplierKvk: normalized.supplierKvk,
    supplierVatNumber: normalized.supplierVatNumber,
    supplierIban: normalized.supplierIban,
    invoiceDate: normalized.invoiceDate,
    dueDate: normalized.dueDate,
    recognition: toInvoiceRecognitionDto(normalized),
    lines: normalized.lines,
    receiver: normalized.receiver,
    validationIssues: normalized.validationIssues,
    pdfUrl: normalized.pdfUrl,
    ublUrl: normalized.ublUrl,
    source: normalized.source,
    createdAt: normalized.createdAt,
    updatedAt: normalized.updatedAt,
  };
}

export function fromInvoiceApiDto(dto: InvoiceApiResponse): Invoice {
  if ('recognition' in dto && dto.recognition) {
    const recognition = normalizeApiRecognition(dto.recognition);
    return normalizeInvoiceRecognitionFields({
      id: dto.id,
      invoiceNumber: dto.invoiceNumber,
      status: dto.status,
      peppolStatus: dto.peppolStatus,
      supplierId: dto.supplierId,
      supplierName: dto.supplierName,
      supplierKvk: dto.supplierKvk,
      supplierVatNumber: dto.supplierVatNumber,
      supplierIban: dto.supplierIban,
      invoiceDate: dto.invoiceDate,
      dueDate: dto.dueDate,
      summaryDescription: recognition.summaryDescription,
      paymentReference: recognition.paymentReference,
      debtorNumber: recognition.debtorNumber,
      period: recognition.period,
      periodYear: recognition.periodYear,
      paymentMethod: recognition.paymentMethod,
      gAccountAmount: recognition.gAccountAmount,
      lines: dto.lines ?? [],
      subtotal: recognition.amountExcludingVat,
      vatTotal: recognition.vatAmount,
      totalAmount: recognition.amountIncludingVat,
      receiver: dto.receiver,
      confidenceScore: recognition.confidenceScore,
      validationIssues: emptyValidationIssues(dto.validationIssues),
      pdfUrl: dto.pdfUrl,
      ublUrl: dto.ublUrl,
      source: dto.source,
      createdAt: dto.createdAt,
      updatedAt: dto.updatedAt,
    });
  }

  return normalizeInvoiceRecognitionFields(dto as Invoice);
}

export function toInvoicePatchApiDto(dto: UpdateInvoiceApiInput): InvoicePatchApiDto {
  const recognition: Partial<InvoiceRecognitionDto> = {};
  const patch: InvoicePatchApiDto = {};

  if (dto.supplierName !== undefined) patch.supplierName = dto.supplierName;
  if (dto.supplierKvk !== undefined) patch.supplierKvk = dto.supplierKvk;
  if (dto.supplierVatNumber !== undefined) patch.supplierVatNumber = dto.supplierVatNumber;
  if (dto.supplierIban !== undefined) patch.supplierIban = dto.supplierIban;
  if (dto.invoiceNumber !== undefined) patch.invoiceNumber = dto.invoiceNumber;
  if (dto.invoiceDate !== undefined) patch.invoiceDate = dto.invoiceDate;
  if (dto.dueDate !== undefined) patch.dueDate = dto.dueDate;
  if (dto.lines !== undefined) patch.lines = dto.lines;
  if (dto.receiver !== undefined) patch.receiver = dto.receiver;

  if (dto.summaryDescription !== undefined) recognition.summaryDescription = dto.summaryDescription;
  if (dto.subtotal !== undefined) recognition.amountExcludingVat = dto.subtotal;
  if (dto.vatTotal !== undefined) recognition.vatAmount = dto.vatTotal;
  if (dto.totalAmount !== undefined) recognition.amountIncludingVat = dto.totalAmount;
  if (dto.gAccountAmount !== undefined) recognition.gAccountAmount = dto.gAccountAmount;
  if (dto.paymentReference !== undefined) recognition.paymentReference = dto.paymentReference;
  if (dto.debtorNumber !== undefined) recognition.debtorNumber = dto.debtorNumber;
  if (dto.period !== undefined) recognition.period = dto.period;
  if (dto.periodYear !== undefined) recognition.periodYear = dto.periodYear;
  if (dto.paymentMethod !== undefined) recognition.paymentMethod = dto.paymentMethod;

  if (Object.keys(recognition).length > 0) {
    patch.recognition = recognition;
  }

  return patch;
}

export function toInvoiceRecognitionPatchApiDto(
  dto: UpdateInvoiceApiInput,
): InvoiceRecognitionPatchApiDto {
  return {
    recognition: toInvoicePatchApiDto(dto).recognition ?? {},
  };
}
