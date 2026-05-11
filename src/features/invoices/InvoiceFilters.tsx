import { Search, X } from 'lucide-react';
import type { InvoiceListFilters, InvoiceStatus } from '@/types';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';

interface InvoiceFiltersProps {
  value: InvoiceListFilters;
  onChange: (next: InvoiceListFilters) => void;
}

const statusOptions: { value: InvoiceStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'Alle statussen' },
  { value: 'new', label: 'Nieuw' },
  { value: 'processing', label: 'In verwerking' },
  { value: 'review_required', label: 'Te controleren' },
  { value: 'ready_for_peppol', label: 'Klaar voor Peppol' },
  { value: 'sent', label: 'Verzonden' },
  { value: 'delivered', label: 'Afgeleverd' },
  { value: 'error', label: 'Fout' },
  { value: 'rejected', label: 'Afgewezen' },
];

export function InvoiceFilters({ value, onChange }: InvoiceFiltersProps) {
  const hasFilters =
    Boolean(value.search) ||
    (value.status && value.status !== 'all') ||
    value.hasIssues;

  return (
    <div className="glass-panel flex flex-wrap items-center gap-3 rounded-3xl p-3">
      <div className="relative min-w-[280px] flex-1">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Zoek op factuurnummer, leverancier of KVK"
          className="pl-10"
          value={value.search ?? ''}
          onChange={(e) => onChange({ ...value, search: e.target.value })}
        />
      </div>

      <Select
        value={value.status ?? 'all'}
        onValueChange={(next) =>
          onChange({ ...value, status: next as InvoiceStatus | 'all' })
        }
      >
        <SelectTrigger className="w-[210px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          {statusOptions.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onChange({})}
          className="text-muted-foreground"
        >
          <X className="h-3.5 w-3.5" />
          Wissen
        </Button>
      )}
    </div>
  );
}
