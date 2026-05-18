import type { ComponentType } from 'react';
import {
  AlertCircle,
  ArrowRight,
  Bot,
  CircleDashed,
  FileInput,
  Loader2,
  Mail,
  Send,
  ShieldCheck,
  XCircle,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { PageHeader } from '@/components/PageHeader';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { StatTile } from '@/features/dashboard/StatTile';
import { SystemStatus } from '@/features/dashboard/SystemStatus';
import { RecentActivity } from '@/features/dashboard/RecentActivity';
import { VolumeChart } from '@/features/dashboard/VolumeChart';
import { useDashboardSummary } from '@/hooks/useFeatures';
import { useAuthStore } from '@/store/authStore';

export function DashboardPage() {
  const { data, isLoading, isError, error, refetch } = useDashboardSummary();
  const userName = useAuthStore((s) => s.user?.displayName?.split(' ')[0] ?? '');

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Dashboard' }]} />

      <PageHeader
        title={userName ? `Welkom terug, ${userName}` : 'Dashboard'}
        description="Realtime overzicht van mailbox-intake, AI-herkenning, controle en Peppol-verzending. Minder ruis, meer snelheid."
      />

      {isLoading && <DashboardSkeleton />}

      {isError && (
        <div className="rounded-3xl border border-destructive/30 bg-destructive/5 p-6 text-sm">
          <div className="font-medium text-destructive">
            Dashboard kon niet worden geladen
          </div>
          <div className="mt-1 text-muted-foreground">
            {error instanceof Error ? error.message : 'Onbekende fout'}
          </div>
          <button
            onClick={() => refetch()}
            className="mt-3 text-sm font-medium text-primary hover:underline"
          >
            Opnieuw proberen
          </button>
        </div>
      )}

      {data && (
        <>
          <PeppolAccessAgentHero automationRate={data.automationRate} queue={data.counters.readyForPeppol} />

          {/* KPI tiles */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            <StatTile
              label="Nieuwe facturen"
              value={data.counters.newInvoices}
              icon={FileInput}
              tone="info"
              to="/invoices?status=new"
              hint="Nog niet verwerkt"
            />
            <StatTile
              label="In verwerking"
              value={data.counters.processing}
              icon={Loader2}
              tone="default"
              to="/invoices?status=processing"
              hint="OCR / extractie loopt"
            />
            <StatTile
              label="Te controleren"
              value={data.counters.reviewRequired}
              icon={AlertCircle}
              tone="warning"
              to="/exceptions"
              hint="Handmatige review nodig"
            />
            <StatTile
              label="Klaar voor Peppol"
              value={data.counters.readyForPeppol}
              icon={CircleDashed}
              tone="info"
              to="/invoices?status=ready_for_peppol"
              hint="Goedgekeurd, in wachtrij"
            />
            <StatTile
              label="Verzonden"
              value={data.counters.sent}
              icon={Send}
              tone="success"
              to="/invoices?status=delivered"
              hint="Succesvol bij ontvanger"
            />
            <StatTile
              label="Fouten"
              value={data.counters.errors}
              icon={XCircle}
              tone="destructive"
              to="/invoices?status=error"
              hint="UBL of Peppol mislukt"
            />
          </div>

          {/* System status */}
          <SystemStatus summary={data} />

          {/* Bottom row */}
          <div className="grid gap-6 lg:grid-cols-5">
            <div className="lg:col-span-3">
              <VolumeChart data={data.trend7d} />
            </div>
            <div className="lg:col-span-2">
              <RecentActivity items={data.recentActivity} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function PeppolAccessAgentHero({ automationRate, queue }: { automationRate: number; queue: number }) {
  return (
    <section className="glass-panel relative overflow-hidden rounded-[2rem] p-5 sm:p-7 lg:p-8">
      <div className="pointer-events-none absolute -right-28 -top-32 h-80 w-80 rounded-full bg-primary/20 blur-3xl" />
      <div className="relative grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div>
          <div className="dx-eyebrow mb-4">Signature shot</div>
          <h2 className="max-w-3xl text-3xl font-extrabold leading-[1.02] tracking-[-0.055em] text-foreground sm:text-4xl lg:text-5xl">
            Facturen die zichzelf klaarzetten voor controle.
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Van mailbox-chaos naar een gecontroleerde finance-flow: PDF&apos;s worden gelezen, gevalideerd, verrijkt en klaargezet voor Peppol. In de Peppol Access Agent-stijl: donker, strak, scherp en met één duidelijke gouden flow.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <span className="dx-pill">Mailbox + PDF&apos;s</span>
            <span className="dx-pill">AI-herkenning</span>
            <span className="dx-pill">UBL + Peppol</span>
            <span className="dx-pill">Audit trail</span>
          </div>
          <div className="mt-7 flex flex-wrap gap-3">
            <Button asChild>
              <Link to="/invoices">
                Bekijk facturen <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/exceptions">Controleer uitval</Link>
            </Button>
          </div>
        </div>

        <div className="relative min-h-[320px] rounded-[1.7rem] border border-white/10 bg-black/30 p-4 shadow-card sm:p-5">
          <div className="absolute inset-0 rounded-[1.7rem] bg-[radial-gradient(circle_at_50%_20%,hsl(var(--primary)/0.16),transparent_56%)]" />
          <div className="relative grid h-full gap-4 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
            <div className="space-y-3">
              <FlowCard icon={Mail} label="Mailbox" value="12 facturen" detail="PDF · XML · scan" />
              <FlowCard icon={FileInput} label="Herkenning" value="INV-2026-041" detail="BTW · IBAN · KVK" />
              <FlowCard icon={ShieldCheck} label="Validatie" value="Controle klaar" detail="Business rules" />
            </div>

            <div className="relative mx-auto grid h-28 w-28 place-items-center rounded-full border border-primary/30 bg-primary/10 shadow-glow sm:h-36 sm:w-36">
              <span className="absolute inset-3 rounded-full border border-primary/20" />
              <span className="absolute inset-0 rounded-full border border-dashed border-primary/20 animate-spin [animation-duration:14s]" />
              <div className="text-center">
                <Bot className="mx-auto mb-1 h-6 w-6 text-primary" />
                <strong className="block text-lg text-primary">AI</strong>
                <small className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">validate</small>
              </div>
            </div>

            <div className="space-y-3">
              <OutputCard label="Goedgekeurd" value={`${automationRate}% auto`} />
              <OutputCard label="Wachtrij" value={`${queue} Peppol`} />
              <OutputCard label="Dashboard" value="Realtime inzicht" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FlowCard({
  icon: Icon,
  label,
  value,
  detail,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.045] p-4 shadow-inner backdrop-blur transition hover:border-primary/35 hover:bg-primary/[0.06]">
      <div className="flex items-center gap-3">
        <span className="grid h-9 w-9 place-items-center rounded-2xl border border-primary/25 bg-primary/10 text-primary">
          <Icon className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">{label}</div>
          <div className="truncate text-sm font-bold text-foreground">{value}</div>
          <div className="text-xs text-muted-foreground">{detail}</div>
        </div>
      </div>
    </div>
  );
}

function OutputCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-primary/20 bg-primary/10 p-4 shadow-inner">
      <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">{label}</div>
      <div className="mt-1 text-sm font-bold text-foreground">{value}</div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <>
      <Skeleton className="h-80 rounded-[2rem]" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-xl" />
        ))}
      </div>
      <Skeleton className="mt-6 h-56 rounded-xl" />
      <div className="mt-6 grid gap-6 lg:grid-cols-5">
        <Skeleton className="h-72 rounded-xl lg:col-span-3" />
        <Skeleton className="h-72 rounded-xl lg:col-span-2" />
      </div>
    </>
  );
}
