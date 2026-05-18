import * as React from 'react';
import { useMemo, useState } from 'react';
import { Save, RefreshCw, CheckCircle2, Send } from 'lucide-react';
import type { Invoice, Money, UpdateInvoiceDto } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ConfidenceIndicator } from './ConfidenceIndicator';
import { formatMoney } from '@/utils/formatters';
import {
  getGAccountAmount,
  getInvoicePeriod,
  getInvoicePeriodYear,
  getInvoiceSummaryDescription,
  getPaymentMethod,
} from '@/utils/invoiceRecognition';
import {
  useApproveInvoice,
  useReprocessInvoice,
  useSendToPeppol,
  useUpdateInvoice,
} from '@/hooks/useInvoices';

interface ExtractionFieldsProps {
  invoice: Invoice;
}

type MoneyFieldKey = 'subtotal' | 'vatTotal' | 'totalAmount' | 'gAccountAmount';

interface ExtractionFormState {
  summaryDescription: string;
  paymentReference: string;
  debtorNumber: string;
  paymentMethod: string;
  period: string;
  periodYear: string;
  subtotal: string;
  vatTotal: string;
  totalAmount: string;
  gAccountAmount: string;
  supplierName: string;
  supplierKvk: string;
  supplierVatNumber: string;
  supplierIban: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
}

function toDateInputValue(value?: string): string {
  return value ? value.slice(0, 10) : '';
}

function toMoneyInputValue(money: Money): string {
  return Number.isFinite(money.amount) ? String(money.amount) : '0';
}

function normalizeText(value: string): string {
  return value.trim();
}

function parseMoneyAmount(value: string, fallback = 0): number {
  const normalized = value.trim().replace(',', '.');
  if (normalized === '') return fallback;
  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function parsePeriodYear(value: string, fallback: number): number {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function hasSameAmount(a: number, b: number): boolean {
  return Math.round(a * 100) === Math.round(b * 100);
}

function withAmount(current: Money, amount: number): Money {
  return {
    ...current,
    amount,
  };
}

function buildFormState(invoice: Invoice): ExtractionFormState {
  const gAccountAmount = getGAccountAmount(invoice);

  return {
    summaryDescription: getInvoiceSummaryDescription(invoice),
    paymentReference: invoice.paymentReference ?? '',
    debtorNumber: invoice.debtorNumber ?? '',
    paymentMethod: getPaymentMethod(invoice),
    period: getInvoicePeriod(invoice),
    periodYear: String(getInvoicePeriodYear(invoice)),
    subtotal: toMoneyInputValue(invoice.subtotal),
    vatTotal: toMoneyInputValue(invoice.vatTotal),
    totalAmount: toMoneyInputValue(invoice.totalAmount),
    gAccountAmount: toMoneyInputValue(gAccountAmount),
    supplierName: invoice.supplierName,
    supplierKvk: invoice.supplierKvk ?? '',
    supplierVatNumber: invoice.supplierVatNumber ?? '',
    supplierIban: invoice.supplierIban ?? '',
    invoiceNumber: invoice.invoiceNumber,
    invoiceDate: toDateInputValue(invoice.invoiceDate),
    dueDate: toDateInputValue(invoice.dueDate ?? undefined),
  };
}

function addTextPatch<K extends keyof UpdateInvoiceDto>(
  patch: UpdateInvoiceDto,
  key: K,
  next: string,
  current: string | undefined,
) {
  const nextValue = normalizeText(next);
  const currentValue = current ?? '';
  if (nextValue !== currentValue) {
    patch[key] = nextValue as UpdateInvoiceDto[K];
  }
}

function addMoneyPatch(
  patch: UpdateInvoiceDto,
  key: MoneyFieldKey,
  nextValue: string,
  current: Money,
) {
  const nextAmount = parseMoneyAmount(nextValue, current.amount);
  if (!hasSameAmount(nextAmount, current.amount)) {
    patch[key] = withAmount(current, nextAmount);
  }
}

function buildUpdateDto(invoice: Invoice, form: ExtractionFormState): UpdateInvoiceDto {
  const patch: UpdateInvoiceDto = {};
  const currentGAccountAmount = getGAccountAmount(invoice);
  const currentPeriodYear = getInvoicePeriodYear(invoice);
  const nextPeriodYear = parsePeriodYear(form.periodYear, currentPeriodYear);

  addTextPatch(patch, 'summaryDescription', form.summaryDescription, getInvoiceSummaryDescription(invoice));
  addTextPatch(patch, 'paymentReference', form.paymentReference, invoice.paymentReference ?? '');
  addTextPatch(patch, 'debtorNumber', form.debtorNumber, invoice.debtorNumber ?? '');
  addTextPatch(patch, 'paymentMethod', form.paymentMethod, getPaymentMethod(invoice));
  addTextPatch(patch, 'period', form.period, getInvoicePeriod(invoice));
  addTextPatch(patch, 'supplierName', form.supplierName, invoice.supplierName);
  addTextPatch(patch, 'supplierKvk', form.supplierKvk, invoice.supplierKvk ?? '');
  addTextPatch(patch, 'supplierVatNumber', form.supplierVatNumber, invoice.supplierVatNumber ?? '');
  addTextPatch(patch, 'supplierIban', form.supplierIban, invoice.supplierIban ?? '');
  addTextPatch(patch, 'invoiceNumber', form.invoiceNumber, invoice.invoiceNumber);

  const nextInvoiceDate = normalizeText(form.invoiceDate);
  const currentInvoiceDate = toDateInputValue(invoice.invoiceDate);
  if (nextInvoiceDate && nextInvoiceDate !== currentInvoiceDate) {
    patch.invoiceDate = nextInvoiceDate;
  }

  const nextDueDate = normalizeText(form.dueDate);
  const currentDueDate = toDateInputValue(invoice.dueDate ?? undefined);
  if (nextDueDate !== currentDueDate) {
    patch.dueDate = nextDueDate || null;
  }

  if (nextPeriodYear !== currentPeriodYear) {
    patch.periodYear = nextPeriodYear;
  }

  addMoneyPatch(patch, 'subtotal', form.subtotal, invoice.subtotal);
  addMoneyPatch(patch, 'vatTotal', form.vatTotal, invoice.vatTotal);
  addMoneyPatch(patch, 'totalAmount', form.totalAmount, invoice.totalAmount);
  addMoneyPatch(patch, 'gAccountAmount', form.gAccountAmount, currentGAccountAmount);

  return patch;
}

export function ExtractionFields({ invoice }: ExtractionFieldsProps) {
  const [form, setForm] = useState<ExtractionFormState>(() => buildFormState(invoice));

  const updateMutation = useUpdateInvoice(invoice.id);
  const reprocessMutation = useReprocessInvoice(invoice.id);
  const approveMutation = useApproveInvoice(invoice.id);
  const sendMutation = useSendToPeppol(invoice.id);


  const draft = useMemo(() => buildUpdateDto(invoice, form), [invoice, form]);
  const isDirty = Object.keys(draft).length > 0;

  const set = <K extends keyof ExtractionFormState>(key: K, value: ExtractionFormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSave = async () => {
    if (!isDirty) return;
    await updateMutation.mutateAsync(draft);
  };

  const handleCancel = () => {
    setForm(buildFormState(invoice));
  };

  const canSend =
    invoice.status === 'ready_for_peppol' || invoice.status === 'review_required';
  const canApprove = invoice.status === 'review_required';

  const gAccountAmount = getGAccountAmount(invoice);

  return (
    <div className="flex h-full flex-col gap-4 overflow-y-auto p-6">
      {/* ── Acties bovenaan ── */}
      <div className="flex flex-wrap items-center gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => reprocessMutation.mutate()}
          disabled={reprocessMutation.isPending}
        >
          <RefreshCw
            className={
              'h-3.5 w-3.5 ' + (reprocessMutation.isPending ? 'animate-spin' : '')
            }
          />
          Opnieuw verwerken
        </Button>

        {canApprove && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => approveMutation.mutate()}
            disabled={approveMutation.isPending}
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            Goedkeuren
          </Button>
        )}

        {canSend && (
          <Button
            size="sm"
            onClick={() => sendMutation.mutate()}
            disabled={sendMutation.isPending}
          >
            <Send className="h-3.5 w-3.5" />
            {sendMutation.isPending ? 'Versturen…' : 'Verstuur via Peppol'}
          </Button>
        )}

        <div className="ml-auto">
          <ConfidenceIndicator score={invoice.confidenceScore} showLabel />
        </div>
      </div>

      <Separator />

      {/* ── Herkenning ── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Herkenning & betaling</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <Field label="Algemene omschrijving">
            <Input
              value={form.summaryDescription}
              placeholder="Bijv. Abonnement Mei"
              onChange={(e) => set('summaryDescription', e.target.value)}
            />
          </Field>
          <Field label="Betaalkenmerk">
            <Input
              value={form.paymentReference}
              placeholder="Betalingskenmerk / referentie"
              onChange={(e) => set('paymentReference', e.target.value)}
            />
          </Field>
          <Field label="Debiteurnummer">
            <Input
              value={form.debtorNumber}
              placeholder="Klant- of debiteurnummer"
              onChange={(e) => set('debtorNumber', e.target.value)}
            />
          </Field>
          <Field label="Betaalwijze">
            <Input
              value={form.paymentMethod}
              placeholder="Bankoverschrijving"
              onChange={(e) => set('paymentMethod', e.target.value)}
            />
          </Field>
          <Field label="Periode">
            <Input
              value={form.period}
              placeholder="mei"
              onChange={(e) => set('period', e.target.value)}
            />
          </Field>
          <Field label="Jaar">
            <Input
              type="number"
              min="1900"
              max="2100"
              value={form.periodYear}
              onChange={(e) => set('periodYear', e.target.value)}
            />
          </Field>
          <Field label="Bedrag excl. BTW">
            <Input
              type="number"
              step="0.01"
              value={form.subtotal}
              onChange={(e) => set('subtotal', e.target.value)}
            />
          </Field>
          <Field label="BTW-bedrag">
            <Input
              type="number"
              step="0.01"
              value={form.vatTotal}
              onChange={(e) => set('vatTotal', e.target.value)}
            />
          </Field>
          <Field label="Bedrag incl. BTW">
            <Input
              type="number"
              step="0.01"
              value={form.totalAmount}
              onChange={(e) => set('totalAmount', e.target.value)}
            />
          </Field>
          <Field label="Bedrag G-rekening">
            <Input
              type="number"
              step="0.01"
              value={form.gAccountAmount}
              onChange={(e) => set('gAccountAmount', e.target.value)}
            />
          </Field>
        </CardContent>
      </Card>

      {/* ── Leverancier ── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Leverancier</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <Field label="Naam">
            <Input
              value={form.supplierName}
              onChange={(e) => set('supplierName', e.target.value)}
            />
          </Field>
          <Field label="KVK-nummer">
            <Input
              value={form.supplierKvk}
              placeholder="12345678"
              onChange={(e) => set('supplierKvk', e.target.value)}
            />
          </Field>
          <Field label="BTW-nummer">
            <Input
              value={form.supplierVatNumber}
              placeholder="NL000000000B00"
              onChange={(e) => set('supplierVatNumber', e.target.value)}
            />
          </Field>
          <Field label="IBAN">
            <Input
              value={form.supplierIban}
              placeholder="NL00BANK0000000000"
              onChange={(e) => set('supplierIban', e.target.value)}
            />
          </Field>
        </CardContent>
      </Card>

      {/* ── Factuurgegevens ── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Factuurgegevens</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <Field label="Factuurnummer">
            <Input
              value={form.invoiceNumber}
              onChange={(e) => set('invoiceNumber', e.target.value)}
            />
          </Field>
          <Field label="Factuurdatum">
            <Input
              type="date"
              value={form.invoiceDate}
              required
              onChange={(e) => set('invoiceDate', e.target.value)}
            />
          </Field>
          <Field label="Vervaldatum">
            <Input
              type="date"
              value={form.dueDate}
              onChange={(e) => set('dueDate', e.target.value)}
            />
          </Field>
          <Field label="Peppol ontvanger">
            <Input
              value={invoice.receiver?.participantId ?? ''}
              placeholder="0106:12345678"
              readOnly
            />
          </Field>
        </CardContent>
      </Card>

      {/* ── Regels ── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Factuurregels</CardTitle>
        </CardHeader>
        <CardContent className="px-0">
          {invoice.lines.length === 0 ? (
            <div className="px-6 py-4 text-sm text-muted-foreground">
              Geen regels geëxtraheerd.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Omschrijving</TableHead>
                  <TableHead className="text-right">Aantal</TableHead>
                  <TableHead className="text-right">Stuksprijs</TableHead>
                  <TableHead className="text-right">BTW</TableHead>
                  <TableHead className="text-right">Totaal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoice.lines.map((line) => (
                  <TableRow key={line.id}>
                    <TableCell className="text-sm">{line.description}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {line.quantity}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatMoney(line.unitPrice)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {line.vatRate}%
                    </TableCell>
                    <TableCell className="text-right font-medium tabular-nums">
                      {formatMoney(line.lineTotal)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          <div className="space-y-1 border-t border-border px-6 pt-4">
            <TotalRow label="Bedrag excl. BTW" value={formatMoney(invoice.subtotal)} />
            <TotalRow label="BTW-bedrag" value={formatMoney(invoice.vatTotal)} />
            <TotalRow label="Bedrag G-rekening" value={formatMoney(gAccountAmount)} />
            <Separator className="my-1.5" />
            <TotalRow
              label="Bedrag incl. BTW"
              value={formatMoney(invoice.totalAmount)}
              emphasize
            />
          </div>
        </CardContent>
      </Card>

      {/* Save bar */}
      {isDirty && (
        <div className="sticky bottom-0 -mx-6 -mb-6 flex items-center justify-between gap-3 border-t border-border bg-card/95 px-6 py-3 shadow-elevated backdrop-blur">
          <span className="text-sm text-muted-foreground">
            Wijzigingen niet opgeslagen
          </span>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={handleCancel}
              disabled={updateMutation.isPending}
            >
              Annuleren
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={updateMutation.isPending || !isDirty}
            >
              <Save className="h-3.5 w-3.5" />
              {updateMutation.isPending ? 'Opslaan…' : 'Opslaan'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </Label>
      {children}
    </div>
  );
}

function TotalRow({
  label,
  value,
  emphasize,
}: {
  label: string;
  value: string;
  emphasize?: boolean;
}) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span
        className={
          'tabular-nums ' +
          (emphasize ? 'text-base font-semibold text-foreground' : 'text-foreground')
        }
      >
        {value}
      </span>
    </div>
  );
}
