import { Link } from 'react-router-dom';
import {
  AlertCircle,
  CheckCircle2,
  Info,
  XCircle,
  Activity,
  ChevronRight,
} from 'lucide-react';
import type { RecentActivityItem } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { relativeFromNow } from '@/utils/formatters';
import { cn } from '@/lib/utils';

const severityIcon = {
  info: { Icon: Info, classes: 'text-primary bg-primary/10 border-primary/20' },
  success: { Icon: CheckCircle2, classes: 'text-success bg-success/10 border-success/20' },
  warning: { Icon: AlertCircle, classes: 'text-warning bg-warning/15 border-warning/25' },
  error: { Icon: XCircle, classes: 'text-destructive bg-destructive/10 border-destructive/20' },
} as const;

interface RecentActivityProps {
  items: RecentActivityItem[];
}

export function RecentActivity({ items }: RecentActivityProps) {
  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-glow">
            <Activity className="h-4 w-4" />
          </span>
          Recente activiteiten
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 p-0">
        <ul className="divide-y divide-white/10">
          {items.map((item) => {
            const cfg = severityIcon[item.severity];
            return (
              <li key={item.id}>
                <Link
                  to={`/invoices/${item.invoiceId}`}
                  className="group flex items-start gap-3 px-6 py-4 transition-all duration-300 hover:bg-primary/[0.045]"
                >
                  <div
                    className={cn(
                      'mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl border shadow-inner transition-transform group-hover:scale-105',
                      cfg.classes,
                    )}
                  >
                    <cfg.Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-sm font-semibold text-foreground">
                        {item.invoiceNumber}
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        {relativeFromNow(item.timestamp)}
                      </span>
                    </div>
                    <div className="mt-0.5 text-sm leading-relaxed text-muted-foreground">
                      <span className="font-semibold text-foreground/85">
                        {item.supplierName}
                      </span>{' '}
                      — {item.message}
                    </div>
                  </div>
                  <ChevronRight className="mt-2 h-4 w-4 shrink-0 text-muted-foreground/40 transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                </Link>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
