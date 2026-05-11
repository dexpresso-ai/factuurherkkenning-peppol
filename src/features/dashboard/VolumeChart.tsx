import { TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface TrendPoint {
  date: string;
  processed: number;
  failed: number;
}

interface VolumeChartProps {
  data: TrendPoint[];
}

export function VolumeChart({ data }: VolumeChartProps) {
  const max = Math.max(1, ...data.map((d) => d.processed + d.failed));

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-glow">
            <TrendingUp className="h-4 w-4" />
          </span>
          Verwerkt — laatste 7 dagen
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex h-48 items-end gap-3">
          {data.map((d, index) => {
            const total = d.processed + d.failed;
            const heightPct = (total / max) * 100;
            const failedPct = total > 0 ? (d.failed / total) * 100 : 0;
            const dateObj = new Date(d.date);
            const label = dateObj.toLocaleDateString('nl-NL', {
              weekday: 'short',
            });
            const dayNum = dateObj.getDate();
            return (
              <div key={d.date} className="group flex flex-1 flex-col items-center gap-2">
                <div className="text-[11px] font-semibold tabular-nums text-foreground/90">
                  {total}
                </div>
                <div className="relative flex w-full flex-1 flex-col-reverse overflow-hidden rounded-xl border border-white/10 bg-white/[0.035] p-1 shadow-inner">
                  <div
                    className="w-full origin-bottom rounded-lg bg-gradient-to-t from-primary via-info to-accent shadow-[0_0_22px_hsl(var(--primary)/0.25)] transition-all duration-500 group-hover:brightness-125 animate-bar-grow"
                    style={{
                      height: `${heightPct - (heightPct * failedPct) / 100}%`,
                      animationDelay: `${index * 70}ms`,
                    }}
                  />
                  {d.failed > 0 && (
                    <div
                      className="w-full rounded-lg bg-destructive/80"
                      style={{ height: `${(heightPct * failedPct) / 100}%` }}
                    />
                  )}
                </div>
                <div className="flex flex-col items-center text-center">
                  <span className="text-[11px] font-semibold uppercase text-muted-foreground">
                    {label}
                  </span>
                  <span className="text-[11px] tabular-nums text-muted-foreground/70">
                    {dayNum}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-4 flex items-center gap-4 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-primary shadow-[0_0_16px_hsl(var(--primary))]" /> Verwerkt
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-destructive/80" /> Mislukt
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
