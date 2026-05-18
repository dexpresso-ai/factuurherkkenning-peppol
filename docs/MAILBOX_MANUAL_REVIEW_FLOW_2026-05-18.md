# Mailbox Manual Review Flow — 2026-05-18

## Doel

De mailboxpagina is uitgebreid van een passieve inboxweergave naar een gecontroleerde intake-reviewflow. De automatische intake-agent blijft leidend voor de eerste beoordeling, maar een gebruiker kan het besluit auditbaar corrigeren.

## Nieuwe frontend-flow

1. De mailboxlijst toont alleen de operationeel noodzakelijke kolommen:
   - Ontvangen
   - Afzender
   - Status
   - Factuur koppeling
2. Bij klikken op een mail opent een centrale reviewkaart in plaats van een rechter drawer.
3. De reviewkaart bevat:
   - mailgegevens
   - bijlagen
   - automatische intakebeslissing
   - prevalidatieregels
   - menselijke beslissing
   - factuurkoppeling
   - technische Graph-metadata
4. De gebruiker kan:
   - opnieuw prevalideren
   - handmatig afkeuren
   - de agent overrulen en alsnog vrijgeven
   - verwerken
   - negeren

## API-contract uitbreiding

Nieuwe voorgestelde endpoints richting Azure backend:

```http
POST /api/mailbox/messages/{id}/manual-reject
Content-Type: application/json

{
  "reason": "Geen factuur; leverancier vraagt alleen om betaalstatus."
}
```

```http
POST /api/mailbox/messages/{id}/override-accept
Content-Type: application/json

{
  "reason": "PDF handmatig gecontroleerd; leverancier is bekend en mag door naar herkenning."
}
```

Beide endpoints retourneren bij voorkeur hetzelfde action-resultaat als de bestaande mailboxacties:

```json
{
  "message": { },
  "resultMessage": "Actie uitgevoerd.",
  "correlationId": "mail-override-..."
}
```

## Nieuwe domeinvelden

```ts
manualDecision?: {
  action: 'manual_reject' | 'override_accept';
  decidedAt: string;
  decidedBy?: string;
  decidedByName?: string;
  reason: string;
  previousOutcome?: 'accepted' | 'manual_review' | 'rejected';
  previousStatus?: MailboxMessageStatus;
}
```

## Backend-afspraken

De backend moet deze beslissingen server-side afdwingen. De frontend is alleen een UX-laag.

Minimale regels:

- `manual_reject` blokkeert verwerking, ook als de automatische intake later positief zou worden.
- `override_accept` maakt verwerking mogelijk, maar moet auditbaar blijven.
- Bij bedragen boven € 5.000 blijft route-/goedkeuringsinformatie verborgen in de UI.
- Elke handmatige beslissing vereist een reden.
- Elke beslissing moet gekoppeld worden aan gebruiker, timestamp, tenant en correlation-id.

## Bestanden geraakt

- `src/pages/MailboxPage.tsx`
- `src/types/mailbox.ts`
- `src/services/mailboxService.ts`
- `src/hooks/useFeatures.ts`
- `src/services/api/mailboxApiMapper.ts`

## Checks

Uitgevoerd:

```bash
npm run lint
npm run build
```

Beide succesvol.
