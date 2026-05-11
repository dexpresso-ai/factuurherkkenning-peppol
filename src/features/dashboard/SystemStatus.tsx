import * as React from 'react';
import { Mailbox, Network, Sparkles, ShieldCheck } from 'lucide-react';
import type { DashboardSummary } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { relativeFromNow } from '@/utils/formatters';

interface SystemStatusProps {
  summary: DashboardSummary;
}

export function SystemStatus({ summary }: SystemStatusProps) {
  const { mailbox, peppol, autoProcessEnabled, automationRate } = summary;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-glow">
            <ShieldCheck className="h-4 w-4" />
          </span>
          Systeemstatus
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2">
        <StatusRow
          icon={Mailbox}
          title="Microsoft 365 mailbox"
          subtitle={mailbox.mailbox}
          trailing={
            <Badge
              variant={
                mailbox.state === 'connected'
                  ? 'success'
                  : mailbox.state === 'error'
                    ? 'destructive'
                    : 'warning'
              }
            >
              {mailbox.state === 'connected' ? 'Verbonden' : mailbox.state}
            </Badge>
          }
          detail={`Laatste sync ${relativeFromNow(mailbox.lastSyncAt)}`}
        />

        <StatusRow
          icon={Network}
          title="Peppol Access Point"
          subtitle={peppol.accessPointName}
          trailing={
            <Badge
              variant={
                peppol.state === 'online'
                  ? 'success'
                  : peppol.state === 'degraded'
                    ? 'warning'
                    : 'destructive'
              }
            >
              {peppol.state === 'online' ? 'Online' : peppol.state}
            </Badge>
          }
          detail={`${peppol.outboundQueue} in wachtrij · laatste levering ${relativeFromNow(peppol.lastDeliveryAt)}`}
        />

        <StatusRow
          icon={Sparkles}
          title="Automatische verwerking"
          subtitle={autoProcessEnabled ? 'Ingeschakeld' : 'Uitgeschakeld'}
          trailing={
            <Badge variant={autoProcessEnabled ? 'success' : 'muted'}>
              {autoProcessEnabled ? 'Actief' : 'Pauze'}
            </Badge>
          }
          detail="Facturen met confidence ≥ 92% worden automatisch verzonden"
        />

        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.035] p-4 shadow-inner">
          <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-primary/15 blur-2xl" />
          <div className="relative flex items-center justify-between">
            <span className="text-sm font-semibold text-foreground">
              Automatisch verwerkt
            </span>
            <span className="text-sm font-semibold tabular-nums text-primary">
              {automationRate}%
            </span>
          </div>
          <div className="relative mt-3 h-2.5 w-full overflow-hidden rounded-full bg-black/35">
            <div
              className="h-full origin-left rounded-full bg-gradient-to-r from-primary via-info to-accent shadow-[0_0_24px_hsl(var(--primary)/0.32)] transition-all animate-bar-grow"
              style={{ width: `${automationRate}%` }}
            />
          </div>
          <div className="relative mt-3 text-[11px] leading-relaxed text-muted-foreground">
            Laatste 7 dagen — handmatige tussenkomst slechts {100 - automationRate}%
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface StatusRowProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle: string;
  trailing: React.ReactNode;
  detail?: string;
}

function StatusRow({ icon: Icon, title, subtitle, trailing, detail }: StatusRowProps) {
  return (
    <div className="group flex flex-col gap-2 rounded-2xl border border-white/10 bg-white/[0.035] p-4 shadow-inner transition-all duration-300 hover:border-primary/25 hover:bg-primary/[0.04]">
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-muted-foreground transition-colors group-hover:text-primary">
            <Icon className="h-4 w-4" />
          </span>
          <span className="truncate text-sm font-semibold text-foreground">{title}</span>
        </div>
        {trailing}
      </div>
      <div className="truncate text-sm text-muted-foreground">{subtitle}</div>
      {detail && <div className="text-[11px] leading-relaxed text-muted-foreground">{detail}</div>}
    </div>
  );
}
