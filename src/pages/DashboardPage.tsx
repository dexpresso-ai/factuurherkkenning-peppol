import type { ComponentType } from 'react';
import {
  AlertCircle,
  ArrowRight,
  Bot,
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
    <div className="space-y-6">
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
    <section className="brand-panel relative overflow-hidden rounded-[32px] p-5 sm:p-7 lg:p-9">
      <span className="brand-orbit right-[-8rem] top-8 h-[34rem] w-[34rem]" />
      <span className="brand-orbit brand-orbit--dashed right-2 top-28 h-[20rem] w-[20rem]" />

      <div className="relative z-10 grid gap-10 lg:grid-cols-[minmax(0,1.03fr)_minmax(320px,0.82fr)] lg:items-center">
        <div>
          <div className="dx-eyebrow mb-4">Signature finance cockpit</div>
          <h2 className="gradient-text max-w-4xl text-[clamp(2.4rem,5.2vw,5.15rem)] font-extrabold leading-[0.93] tracking-[-0.07em]">
            Facturen die zichzelf klaarzetten voor controle.
          </h2>
          <p className="mt-5 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base lg:text-lg">
            Van mailbox-chaos naar een gecontroleerde finance-flow: PDF&apos;s worden gelezen, gevalideerd, verrijkt en klaargezet voor Peppol. De interface voelt nu meer als de hoofdwebsite: zwart, premium glas, scherpe typografie en één gouden actielijn.
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            <span className="dx-pill">Mailbox + PDF&apos;s</span>
            <span className="dx-pill">Azure AI-herkenning</span>
            <span className="dx-pill">UBL + Peppol</span>
            <span className="dx-pill">Audit trail</span>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
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

        <div className="relative min-h-[430px]">
          <div className="brand-panel absolute right-0 top-4 w-[min(430px,96%)] rounded-[26px] p-6">
            <div className="relative z-10 flex items-start justify-between gap-5">
              <div>
                <div className="dx-eyebrow text-[10px]">Agent status</div>
                <div className="mt-4 text-5xl font-extrabold tracking-[-0.07em] text-primary">
                  {automationRate}%
                </div>
                <div className="mt-1 text-sm text-muted-foreground">automatisch verwerkt</div>
              </div>
              <div className="relative grid h-28 w-28 place-items-center rounded-full border border-primary/30 bg-primary/10 shadow-glow">
                <span className="absolute inset-3 rounded-full border border-primary/20" />
                <span className="absolute inset-0 rounded-full border border-dashed border-primary/20 animate-spin [animation-duration:14s]" />
                <div className="text-center">
                  <Bot className="mx-auto mb-1 h-7 w-7 text-primary" />
                  <small className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">validate</small>
                </div>
              </div>
            </div>

            <div className="relative z-10 mt-7 grid gap-3">
              <FlowCard icon={Mail} label="Mailbox" value="12 facturen" detail="PDF · XML · scan" />
              <FlowCard icon={FileInput} label="Herkenning" value="INV-2026-041" detail="BTW · IBAN · KVK" />
              <FlowCard icon={ShieldCheck} label="Validatie" value="Business rules" detail="Controle + confidence" />
            </div>
          </div>

          <div className="brand-panel absolute bottom-3 left-0 max-w-[270px] rounded-[22px] p-5">
            <div className="relative z-10 flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-2xl border border-primary/25 bg-primary/10 text-primary">
                <Network className="h-5 w-5" />
              </span>
              <span>
                <span className="block text-[11px] font-extrabold uppercase tracking-[0.18em] text-primary">Peppol queue</span>
                <span className="block text-2xl font-extrabold tracking-[-0.05em] text-foreground">{queue}</span>
              </span>
            </div>
            <p className="relative z-10 mt-3 text-xs leading-relaxed text-muted-foreground">
              Goedgekeurd en klaar om via het Access Point aangeboden te worden.
            </p>
          </div>

          <div className="brand-panel absolute bottom-14 right-4 w-48 rounded-[22px] p-5">
            <div className="relative z-10">
              <CheckCircle2 className="mb-3 h-5 w-5 text-primary" />
              <small className="text-muted-foreground">Controle</small>
              <strong className="mt-1 block text-xl tracking-[-0.05em] text-foreground">Realtime</strong>
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
    <div className="rounded-[20px] border border-white/10 bg-white/[0.045] p-4 shadow-inner backdrop-blur transition hover:-translate-y-0.5 hover:border-primary/35 hover:bg-primary/[0.06]">
      <div className="flex items-center gap-3">
        <span className="grid h-9 w-9 place-items-center rounded-2xl border border-primary/25 bg-primary/10 text-primary">
          <Icon className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <div className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-primary">{label}</div>
          <div className="truncate text-sm font-bold text-foreground">{value}</div>
          <div className="text-xs text-muted-foreground">{detail}</div>
        </div>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <>
      <Skeleton className="h-96 rounded-[32px]" />
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
