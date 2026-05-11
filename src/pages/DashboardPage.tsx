import {
  AlertCircle,
  CircleDashed,
  FileInput,
  Loader2,
  Send,
  XCircle,
} from 'lucide-react';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { PageHeader } from '@/components/PageHeader';
import { Skeleton } from '@/components/ui/skeleton';
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
        description="Realtime overzicht van inkomende facturen en Peppol-verzendingen."
      />

      {isLoading && <DashboardSkeleton />}

      {isError && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-sm">
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

function DashboardSkeleton() {
  return (
    <>
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
