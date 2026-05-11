import { useQuery } from '@tanstack/react-query';
import { ClipboardList } from 'lucide-react';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/EmptyState';
import { AuditTimeline } from '@/features/audit/AuditTimeline';
import { auditService } from '@/services/auditService';

export function AuditPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['audit', 'recent'],
    queryFn: () => auditService.getRecent(100),
  });

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Dashboard', to: '/' }, { label: 'Auditlog' }]} />
      <PageHeader
        title="Auditlog"
        description="Volledige audit trail — gegroepeerd per factuur, op aflopende tijdstempel."
      />

      {isLoading && (
        <Card>
          <CardContent className="space-y-4 py-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex gap-4">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {!isLoading && (!data || data.length === 0) && (
        <EmptyState icon={ClipboardList} title="Geen audit-events" />
      )}

      {!isLoading && data && data.length > 0 && (
        <Card>
          <CardContent className="py-6">
            <AuditTimeline entries={data} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
