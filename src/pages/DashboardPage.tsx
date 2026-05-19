import {
  AlertCircle,
  ArrowRight,
  CircleDashed,
  FileInput,
  Loader2,
  Mail,
  Send,
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
        description="Operationeel overzicht van mailbox-intake, AI-herkenning, controle en Peppol-verzending. Direct zien wat aandacht vraagt."
        actions={
          <>
            <Button asChild variant="outline" className="h-10 px-4">
              <Link to="/mailbox">
                <Mail className="h-4 w-4" />
                Bekijk mailbox
              </Link>
            </Button>
            <Button asChild className="h-10 px-4">
              <Link to="/invoices">
                Bekijk facturen
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </>
        }
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

function DashboardSkeleton() {
  return (
    <>
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
