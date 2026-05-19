import type { ComponentType } from 'react';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  CircleDashed,
  FileInput,
  Loader2,
  Mail,
  Network,
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
    <div className="space-y-5">
      <Breadcrumbs items={[{ label: 'Dashboard' }]} />

      <PageHeader
        title={userName ? `Welkom terug, ${userName}` : 'Dashboard'}
        description="Realtime overzicht van mailbox-intake, AI-herkenning, controle en Peppol-verzending. Minder ruis, meer snelheid."
      />

      {isLoading && <DashboardSkeleton />}

      {isError && (
        <div className="brand-panel rounded-[26px] border-destructive/30 bg-destructive/5 p-6 text-sm">
          <div className="relative z-10 font-medium text-destructive">
            Dashboard kon niet worden geladen
          </div>
          <div className="relative z-10 mt-1 text-muted-foreground">
            {error instanceof Error ? error.message : 'Onbekende fout'}
          </div>
          <button
            onClick={() => refetch()}
            className="relative z-10 mt-3 text-sm font-medium text-primary hover:underline"
          >
            Opnieuw proberen
          </button>
        </div>
      )}

      {data && (
        <>
          <PeppolAccessAgentHero automationRate={data.automationRate} queue={data.counters.readyForPeppol} />

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

          <SystemStatus summary={data} />

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
    <section className="brand-panel relative overflow-hidden rounded-[28px] p-4 sm:p-5 lg:p-6">
      <span className="brand-orbit right-[-7rem] top-[-7rem] h-[22rem] w-[22rem] opacity-70" />
      <span className="brand-orbit brand-orbit--dashed right-8 top-10 hidden h-[13rem] w-[13rem] opacity-70 lg:block" />

      <div className="relative z-10 grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(420px,0.48fr)] xl:items-center">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <div className="dx-eyebrow">Finance cockpit</div>
            <span className="rounded-full border border-white/10 bg-white/[0.045] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
              Mailbox · AI · Peppol
            </span>
          </div>

          <div className="mt-3 grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
            <div className="min-w-0">
              <h2 className="gradient-text max-w-3xl text-[clamp(1.9rem,3.8vw,3.55rem)] font-extrabold leading-[0.96] tracking-[-0.07em]">
                Mailbox naar Peppol. Compact onder controle.
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-[15px]">
                Binnenkomende PDF&apos;s worden gelezen, gevalideerd en klaargezet voor Peppol. Minder homepage-gevoel, meer operationele cockpit: snel zien wat aandacht vraagt en direct doorpakken.
              </p>
            </div>

            <div className="flex shrink-0 flex-wrap gap-3 lg:justify-end">
              <Button asChild size="lg">
                <Link to="/mailbox">
                  Bekijk mailbox <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/invoices">Bekijk facturen</Link>
              </Button>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <span className="dx-pill">Mailbox + PDF&apos;s</span>
            <span className="dx-pill">Azure AI-herkenning</span>
            <span className="dx-pill">UBL + Peppol</span>
            <span className="dx-pill">Audit trail</span>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
          <CompactMetric
            icon={CheckCircle2}
            label="Automatisch verwerkt"
            value={`${automationRate}%`}
            detail="AI-confidence + validatie"
          />
          <CompactMetric
            icon={Network}
            label="Peppol queue"
            value={queue.toString()}
            detail="Goedgekeurd voor verzending"
          />
          <CompactMetric
            icon={ShieldCheck}
            label="Controle"
            value="Realtime"
            detail="Handmatig overrulen mogelijk"
          />
        </div>
      </div>

      <div className="relative z-10 mt-5 grid gap-3 md:grid-cols-3">
        <FlowStep icon={Mail} label="Mailbox" value="12 facturen" detail="PDF · XML · scan" />
        <FlowStep icon={FileInput} label="Herkenning" value="INV-2026-041" detail="BTW · IBAN · KVK" />
        <FlowStep icon={ShieldCheck} label="Validatie" value="Business rules" detail="Controle + confidence" />
      </div>
    </section>
  );
}

function CompactMetric({
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
    <div className="rounded-[22px] border border-white/10 bg-white/[0.045] p-4 shadow-inner backdrop-blur transition hover:-translate-y-0.5 hover:border-primary/35 hover:bg-primary/[0.06]">
      <div className="flex items-center gap-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-primary/25 bg-primary/10 text-primary shadow-soft">
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <div className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-primary">{label}</div>
          <div className="mt-0.5 truncate text-2xl font-extrabold tracking-[-0.06em] text-foreground">{value}</div>
          <div className="truncate text-xs text-muted-foreground">{detail}</div>
        </div>
      </div>
    </div>
  );
}

function FlowStep({
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
    <div className="rounded-[20px] border border-white/10 bg-black/20 p-3.5 shadow-inner backdrop-blur transition hover:-translate-y-0.5 hover:border-primary/35 hover:bg-primary/[0.06]">
      <div className="flex items-center gap-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-2xl border border-primary/25 bg-primary/10 text-primary">
          <Icon className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <div className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-primary">{label}</div>
          <div className="truncate text-sm font-bold text-foreground">{value}</div>
          <div className="truncate text-xs text-muted-foreground">{detail}</div>
        </div>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <>
      <Skeleton className="h-64 rounded-[28px]" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-40 rounded-[26px]" />
        ))}
      </div>
      <Skeleton className="mt-6 h-56 rounded-[26px]" />
      <div className="mt-6 grid gap-6 lg:grid-cols-5">
        <Skeleton className="h-72 rounded-[26px] lg:col-span-3" />
        <Skeleton className="h-72 rounded-[26px] lg:col-span-2" />
      </div>
    </>
  );
}
