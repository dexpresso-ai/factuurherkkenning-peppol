import { Download, ExternalLink, FileText, Maximize2 } from 'lucide-react';
import type { Invoice } from '@/types';
import { Button } from '@/components/ui/button';
import { formatDate, formatMoney } from '@/utils/formatters';

interface PdfPreviewProps {
  invoice: Invoice;
}

/**
 * Mock PDF preview.
 *
 * In productie wordt hier een echte iframe / pdf.js viewer gerenderd
 * met `invoice.pdfUrl`. Voor de demo tonen we een gestileerde mock-pagina
 * met de daadwerkelijke factuurdata zodat de UI realistisch oogt.
 */
export function PdfPreview({ invoice }: PdfPreviewProps) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border bg-muted/40 px-4 py-2">
        <div className="flex items-center gap-2 min-w-0">
          <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
          <span className="truncate font-mono text-xs text-muted-foreground">
            {invoice.source.attachmentName}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" title="Vergroot">
            <Maximize2 className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" title="Open in nieuw tabblad">
            <ExternalLink className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" title="Download">
            <Download className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Mock A4 page */}
      <div className="flex-1 overflow-y-auto bg-slate-100 p-6">
        <div
          className="mx-auto bg-white shadow-elevated"
          style={{ width: '100%', maxWidth: '480px', aspectRatio: '1 / 1.4142' }}
        >
          <div className="flex h-full flex-col p-7 text-[11px] leading-relaxed text-slate-700">
            {/* Letterhead */}
            <div className="flex items-start justify-between border-b border-slate-200 pb-4">
              <div>
                <div className="text-[15px] font-bold text-slate-900">
                  {invoice.supplierName}
                </div>
                <div className="mt-1 text-[10px] text-slate-500">
                  {invoice.supplierKvk && <>KVK {invoice.supplierKvk} · </>}
                  {invoice.supplierVatNumber && <>BTW {invoice.supplierVatNumber}</>}
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] uppercase tracking-wider text-slate-400">
                  Factuur
                </div>
                <div className="font-mono text-[12px] font-semibold text-slate-900">
                  {invoice.invoiceNumber}
                </div>
              </div>
            </div>

            {/* Meta */}
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div>
                <div className="text-[9px] uppercase text-slate-400">Aan</div>
                <div className="mt-0.5 text-slate-900">
                  {invoice.receiver?.name ?? 'Acme Holding B.V.'}
                </div>
              </div>
              <div className="text-right">
                <div className="text-[9px] uppercase text-slate-400">Datum</div>
                <div className="mt-0.5 text-slate-900">{formatDate(invoice.invoiceDate)}</div>
                {invoice.dueDate && (
                  <>
                    <div className="mt-2 text-[9px] uppercase text-slate-400">Vervaldatum</div>
                    <div className="mt-0.5 text-slate-900">{formatDate(invoice.dueDate)}</div>
                  </>
                )}
              </div>
            </div>

            {/* Lines */}
            <div className="mt-5 flex-1">
              <div className="grid grid-cols-12 gap-2 border-b border-slate-200 pb-1.5 text-[9px] font-semibold uppercase tracking-wider text-slate-500">
                <div className="col-span-7">Omschrijving</div>
                <div className="col-span-2 text-right">Aantal</div>
                <div className="col-span-3 text-right">Bedrag</div>
              </div>
              {invoice.lines.length > 0 ? (
                invoice.lines.map((line) => (
                  <div
                    key={line.id}
                    className="grid grid-cols-12 gap-2 border-b border-slate-100 py-2"
                  >
                    <div className="col-span-7 text-slate-700">{line.description}</div>
                    <div className="col-span-2 text-right tabular-nums">{line.quantity}</div>
                    <div className="col-span-3 text-right tabular-nums">
                      {formatMoney(line.lineTotal)}
                    </div>
                  </div>
                ))
              ) : (
                <div className="mt-6 text-center text-[10px] italic text-slate-400">
                  Regels worden geëxtraheerd…
                </div>
              )}
            </div>

            {/* Totals */}
            <div className="mt-4 ml-auto w-1/2 border-t border-slate-200 pt-2">
              <div className="flex justify-between py-0.5">
                <span className="text-slate-500">Subtotaal</span>
                <span className="tabular-nums text-slate-900">
                  {formatMoney(invoice.subtotal)}
                </span>
              </div>
              <div className="flex justify-between py-0.5">
                <span className="text-slate-500">BTW</span>
                <span className="tabular-nums text-slate-900">
                  {formatMoney(invoice.vatTotal)}
                </span>
              </div>
              <div className="mt-1 flex justify-between border-t border-slate-300 pt-1.5 font-bold">
                <span>Totaal</span>
                <span className="tabular-nums">{formatMoney(invoice.totalAmount)}</span>
              </div>
            </div>

            {invoice.supplierIban && (
              <div className="mt-4 border-t border-slate-200 pt-2 text-[9px] text-slate-500">
                IBAN: {invoice.supplierIban}
              </div>
            )}
          </div>
        </div>

        <div className="mt-3 text-center text-[10px] text-muted-foreground">
          {/* TODO: koppel echte PDF-renderer (pdf.js / iframe naar Azure Blob SAS-url) */}
          Mock-rendering · in productie wordt PDF.js gebruikt
        </div>
      </div>
    </div>
  );
}
