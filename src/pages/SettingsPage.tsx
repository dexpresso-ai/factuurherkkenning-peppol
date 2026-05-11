import * as React from 'react';
import { useState } from 'react';
import {
  Mailbox,
  Network,
  HardDrive,
  Sparkles,
  CheckCheck,
  FolderInput,
  FolderX,
  Save,
} from 'lucide-react';
import type { AppSettings, UpdateSettingsDto } from '@/types';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useSettings, useUpdateSettings } from '@/hooks/useFeatures';
import { formatBytes } from '@/utils/formatters';

export function SettingsPage() {
  const { data, isLoading } = useSettings();
  const updateMutation = useUpdateSettings();
  const [draft, setDraft] = useState<UpdateSettingsDto>({});

  const isDirty = Object.keys(draft).length > 0;

  const handleSave = async () => {
    await updateMutation.mutateAsync(draft);
    setDraft({});
  };

  if (isLoading || !data) {
    return (
      <div className="space-y-6">
        <Breadcrumbs items={[{ label: 'Dashboard', to: '/' }, { label: 'Instellingen' }]} />
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-5 lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-72 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Dashboard', to: '/' }, { label: 'Instellingen' }]} />

      <PageHeader
        title="Instellingen"
        description="Beheer mailbox, Peppol Access Point, opslag en automatische verwerking."
      />

      <div className="grid gap-5 lg:grid-cols-2">
        <MailboxSettingsCard settings={data} draft={draft} setDraft={setDraft} />
        <PeppolSettingsCard settings={data} draft={draft} setDraft={setDraft} />
        <StorageStatusCard settings={data} />
        <ProcessingSettingsCard settings={data} draft={draft} setDraft={setDraft} />
      </div>

      {/* Save bar */}
      {isDirty && (
        <div className="sticky bottom-6 left-0 right-0 z-30 mx-auto flex max-w-3xl items-center justify-between gap-3 rounded-xl border border-border bg-card px-5 py-3 shadow-elevated">
          <span className="text-sm">
            <span className="font-medium text-foreground">
              Niet-opgeslagen wijzigingen
            </span>{' '}
            <span className="text-muted-foreground">
              · {Object.keys(draft).length} sectie(s) aangepast
            </span>
          </span>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setDraft({})}>
              Annuleren
            </Button>
            <Button size="sm" onClick={handleSave} disabled={updateMutation.isPending}>
              <Save className="h-3.5 w-3.5" />
              {updateMutation.isPending ? 'Opslaan…' : 'Opslaan'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

interface SectionProps {
  settings: AppSettings;
  draft: UpdateSettingsDto;
  setDraft: React.Dispatch<React.SetStateAction<UpdateSettingsDto>>;
}

function MailboxSettingsCard({ settings, setDraft }: SectionProps) {
  const m = settings.mailbox;
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-3 pb-3 space-y-0">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Mailbox className="h-4 w-4" />
        </div>
        <div>
          <CardTitle>Mailbox</CardTitle>
          <p className="text-xs text-muted-foreground">
            Microsoft 365 / Graph API verbinding
          </p>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <Field label="Mailbox-adres">
          <Input
            defaultValue={m.mailboxAddress}
            onChange={(e) =>
              setDraft((d) => ({
                ...d,
                mailbox: { ...(d.mailbox ?? {}), mailboxAddress: e.target.value },
              }))
            }
          />
        </Field>
        <Field label="Tenant ID">
          <Input className="font-mono text-xs" defaultValue={m.tenantId} readOnly />
        </Field>
        <Field label="Client ID">
          <Input className="font-mono text-xs" defaultValue={m.clientId} readOnly />
        </Field>
        <Field label="Poll-interval (sec)">
          <Input
            type="number"
            min={10}
            defaultValue={m.pollIntervalSeconds}
            onChange={(e) =>
              setDraft((d) => ({
                ...d,
                mailbox: {
                  ...(d.mailbox ?? {}),
                  pollIntervalSeconds: Number(e.target.value),
                },
              }))
            }
          />
        </Field>
      </CardContent>
    </Card>
  );
}

function PeppolSettingsCard({ settings, setDraft }: SectionProps) {
  const p = settings.peppol;
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-3 pb-3 space-y-0">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Network className="h-4 w-4" />
        </div>
        <div>
          <CardTitle>Peppol</CardTitle>
          <p className="text-xs text-muted-foreground">
            Access Point en verzendinstellingen
          </p>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <Field label="Access Point URL">
          <Input
            className="font-mono text-xs"
            defaultValue={p.accessPointUrl}
            onChange={(e) =>
              setDraft((d) => ({
                ...d,
                peppol: {
                  ...(d.peppol ?? {}),
                  accessPointUrl: e.target.value,
                },
              }))
            }
          />
        </Field>
        <Field label="Verzender Participant ID">
          <Input
            className="font-mono text-xs"
            defaultValue={p.senderParticipantId}
            onChange={(e) =>
              setDraft((d) => ({
                ...d,
                peppol: {
                  ...(d.peppol ?? {}),
                  senderParticipantId: e.target.value,
                },
              }))
            }
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Aantal retries">
            <Input
              type="number"
              min={0}
              max={10}
              defaultValue={p.retryCount}
              onChange={(e) =>
                setDraft((d) => ({
                  ...d,
                  peppol: { ...(d.peppol ?? {}), retryCount: Number(e.target.value) },
                }))
              }
            />
          </Field>
          <Field label="Backoff (sec)">
            <Input
              type="number"
              min={5}
              defaultValue={p.retryBackoffSeconds}
              onChange={(e) =>
                setDraft((d) => ({
                  ...d,
                  peppol: {
                    ...(d.peppol ?? {}),
                    retryBackoffSeconds: Number(e.target.value),
                  },
                }))
              }
            />
          </Field>
        </div>
      </CardContent>
    </Card>
  );
}

function StorageStatusCard({ settings }: { settings: AppSettings }) {
  const s = settings.storage;
  const pct = (s.usedBytes / s.quotaBytes) * 100;
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-3 pb-3 space-y-0">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <HardDrive className="h-4 w-4" />
        </div>
        <div>
          <CardTitle>Azure opslag</CardTitle>
          <p className="text-xs text-muted-foreground">
            Blob storage in eigen tenant
          </p>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <dl className="grid grid-cols-2 gap-3 text-sm">
          <DetailKv label="Storage account" value={s.storageAccount} />
          <DetailKv label="Container" value={s.container} />
          <DetailKv label="Regio" value={s.region} />
          <DetailKv label="Tier" value="Hot · GRS" />
        </dl>
        <Separator />
        <div>
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Gebruikt</span>
            <span className="tabular-nums font-medium text-foreground">
              {formatBytes(s.usedBytes)} / {formatBytes(s.quotaBytes)}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary"
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="mt-1 text-[11px] text-muted-foreground">
            {pct.toFixed(1)}% van quota
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ProcessingSettingsCard({ settings, setDraft }: SectionProps) {
  const p = settings.processing;
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-3 pb-3 space-y-0">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Sparkles className="h-4 w-4" />
        </div>
        <div>
          <CardTitle>Verwerking</CardTitle>
          <p className="text-xs text-muted-foreground">
            Automatische verwerking en mappen
          </p>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <ToggleRow
          icon={Sparkles}
          title="Automatische verwerking"
          description="Verwerk binnenkomende facturen direct na ontvangst"
          checked={p.autoProcessEnabled}
          onChange={(v) =>
            setDraft((d) => ({
              ...d,
              processing: { ...(d.processing ?? {}), autoProcessEnabled: v },
            }))
          }
        />
        <ToggleRow
          icon={CheckCheck}
          title="Handmatige goedkeuring"
          description="Vereis altijd handmatige goedkeuring vóór Peppol-verzending"
          checked={p.manualApprovalRequired}
          onChange={(v) =>
            setDraft((d) => ({
              ...d,
              processing: { ...(d.processing ?? {}), manualApprovalRequired: v },
            }))
          }
        />
        <Separator />
        <Field label="Min. confidence voor auto-verzending">
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={0.5}
              max={1}
              step={0.01}
              defaultValue={p.minConfidenceForAutoSend}
              onChange={(e) =>
                setDraft((d) => ({
                  ...d,
                  processing: {
                    ...(d.processing ?? {}),
                    minConfidenceForAutoSend: Number(e.target.value),
                  },
                }))
              }
              className="flex-1 accent-primary"
            />
            <span className="w-12 text-right tabular-nums text-sm font-medium">
              {Math.round(p.minConfidenceForAutoSend * 100)}%
            </span>
          </div>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field
            label={
              <span className="flex items-center gap-1.5">
                <FolderInput className="h-3 w-3" /> Verwerkte mailmap
              </span>
            }
          >
            <Input
              defaultValue={p.processedFolder}
              onChange={(e) =>
                setDraft((d) => ({
                  ...d,
                  processing: {
                    ...(d.processing ?? {}),
                    processedFolder: e.target.value,
                  },
                }))
              }
            />
          </Field>
          <Field
            label={
              <span className="flex items-center gap-1.5">
                <FolderX className="h-3 w-3" /> Uitvalmap
              </span>
            }
          >
            <Input
              defaultValue={p.exceptionFolder}
              onChange={(e) =>
                setDraft((d) => ({
                  ...d,
                  processing: {
                    ...(d.processing ?? {}),
                    exceptionFolder: e.target.value,
                  },
                }))
              }
            />
          </Field>
        </div>
      </CardContent>
    </Card>
  );
}

/* ------------ small helpers ------------ */

function Field({
  label,
  children,
}: {
  label: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </Label>
      {children}
    </div>
  );
}

function DetailKv({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-0.5 truncate font-mono text-xs text-foreground">{value}</dd>
    </div>
  );
}

function ToggleRow({
  icon: Icon,
  title,
  description,
  checked,
  onChange,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 h-4 w-4 text-muted-foreground" />
      <div className="flex-1">
        <div className="text-sm font-medium text-foreground">{title}</div>
        <div className="text-xs text-muted-foreground">{description}</div>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
