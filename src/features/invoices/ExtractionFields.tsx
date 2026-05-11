import * as React from 'react';
import { useState } from 'react';
import { Save, RefreshCw, CheckCircle2, Send } from 'lucide-react';
import type { Invoice, UpdateInvoiceDto } from '@/types';
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
  useApproveInvoice,
  useReprocessInvoice,
  useSendToPeppol,
  useUpdateInvoice,
} from '@/hooks/useInvoices';

interface ExtractionFieldsProps {
  invoice: Invoice;
}

export function ExtractionFields({ invoice }: ExtractionFieldsProps) {
  const [draft, setDraft] = useState<UpdateInvoiceDto>({});

  const updateMutation = useUpdateInvoice(invoice.id);
  const reprocessMutation = useReprocessInvoice(invoice.id);
  const approveMutation = useApproveInvoice(invoice.id);
  const sendMutation = useSendToPeppol(invoice.id);

  const isDirty = Object.keys(draft).length > 0;

  const set = <K extends keyof UpdateInvoiceDto>(key: K, value: UpdateInvoiceDto[K]) => {
    setDraft((d) => ({ ...d, [key]: value }));
  };

  const handleSave = async () => {
    await updateMutation.mutateAsync(draft);
    setDraft({});
  };

  const canSend =
    invoice.status === 'ready_for_peppol' || invoice.status === 'review_required';
  const canApprove = invoice.status === 'review_required';

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

      {/* ── Leverancier ── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Leverancier</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <Field label="Naam">
            <Input
              defaultValue={invoice.supplierName}
              onChange={(e) => set('supplierName', e.target.value)}
            />
          </Field>
          <Field label="KVK-nummer">
            <Input
              defaultValue={invoice.supplierKvk ?? ''}
              placeholder="12345678"
              onChange={(e) => set('supplierKvk', e.target.value)}
            />
          </Field>
          <Field label="BTW-nummer">
            <Input
              defaultValue={invoice.supplierVatNumber ?? ''}
              placeholder="NL000000000B00"
              onChange={(e) => set('supplierVatNumber', e.target.value)}
            />
          </Field>
          <Field label="IBAN">
            <Input
              defaultValue={invoice.supplierIban ?? ''}
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
              defaultValue={invoice.invoiceNumber}
              onChange={(e) => set('invoiceNumber', e.target.value)}
            />
          </Field>
          <Field label="Factuurdatum">
            <Input
              type="date"
              defaultValue={invoice.invoiceDate.slice(0, 10)}
              onChange={(e) => set('invoiceDate', e.target.value)}
            />
          </Field>
          <Field label="Vervaldatum">
            <Input
              type="date"
              defaultValue={invoice.dueDate?.slice(0, 10) ?? ''}
              onChange={(e) => set('dueDate', e.target.value)}
            />
          </Field>
          <Field label="Peppol ontvanger">
            <Input
              defaultValue={invoice.receiver?.participantId ?? ''}
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
            <TotalRow label="Subtotaal" value={formatMoney(invoice.subtotal)} />
            <TotalRow label="BTW totaal" value={formatMoney(invoice.vatTotal)} />
            <Separator className="my-1.5" />
            <TotalRow
              label="Totaalbedrag"
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
              onClick={() => setDraft({})}
            >
              Annuleren
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={updateMutation.isPending}
            >
              <Save className="h-3.5 w-3.5" />
              Opslaan
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
