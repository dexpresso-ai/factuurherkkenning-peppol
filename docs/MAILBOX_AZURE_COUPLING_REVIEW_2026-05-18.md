# Senior architect review — Mailbox Intake koppeling met Azure backend

## Oordeel

De huidige Mailbox Intake-module kan technisch gekoppeld worden aan een Azure/.NET backend, mits de backend niet probeert om Microsoft Graph direct door de frontend te laten gebruiken. De frontend moet alleen praten met de eigen API-laag:

```text
Frontend /mailbox
→ Azure API
→ Azure SQL / Blob Storage
→ Microsoft Graph worker / background service
→ Microsoft 365 shared mailbox
```

De module is geschikt als intake-overzicht los van factuurherkenning. De echte Graph-sync, bijlageopslag, idempotency en auditlogging moeten server-side blijven.

## Wat goed staat

- Route `/mailbox` en menu-item staan logisch vóór facturen.
- UI toont mailmetadata, bijlagen, intake-uitkomst, status en factuurkoppeling.
- De frontend gebruikt dezelfde centrale API-client als de rest van de app.
- Er zijn endpoints voorbereid voor status, lijst, detail, prevalidate, process, ignore en sync-now.
- De regel `bedrag > 5000` leidt tot `manual_review` en `routeDisclosure: hidden_due_threshold`.
- Alleen `accepted` mails kunnen automatisch worden verwerkt.

## Direct aangescherpt in deze review

- Nieuwe mapperlaag toegevoegd: `src/services/api/mailboxApiMapper.ts`.
- Mailbox service gebruikt nu expliciet DTO-normalisatie in plaats van blind vertrouwen op backend responses.
- Queryparams sturen `status=all` en `outcome=all` niet meer naar de backend.
- Backend mag nu lijstresponses teruggeven als `items`, `data` of array; de frontend normaliseert dit.
- Backend mag action responses teruggeven als `{ message }`, `{ item }` of direct als message.
- Attachments worden robuust genormaliseerd op basis van `kind`, `contentType` en bestandsnaam.
- Afzender kan worden gelezen uit het vlakke DTO-formaat én uit een Graph-achtige `from.emailAddress` shape.
- Graph sync-velden voorbereid op het frontendtype: `graphImmutableMessageId`, `graphChangeKey`, `graphFolderId`.
- Prevalidatieregel `HAS_ATTACHMENTS` toegevoegd voor semantisch correcte rules.

## Belangrijke backend-eisen

### 1. Gebruik een eigen message-id in de database

Gebruik in de frontend/API niet rechtstreeks de Graph message-id als primaire sleutel. Sla minimaal op:

- `id` — interne database-id
- `graphMessageId`
- `graphImmutableMessageId`
- `internetMessageId`
- `conversationId`
- `graphFolderId`
- `graphChangeKey`

### 2. Maak sync idempotent

Leg een unieke constraint op bijvoorbeeld:

```text
organization_id + mailbox_address + graph_immutable_message_id
```

of, als immutable id nog ontbreekt:

```text
organization_id + mailbox_address + internet_message_id
```

### 3. Sla bijlagen server-side op

De frontend mag geen Graph attachment content ophalen. Backend haalt PDF/XML op en slaat deze op in Azure Blob Storage. De frontend krijgt alleen metadata en eventueel een backend-download URL.

### 4. Prevalidatie moet server-side leidend zijn

De frontend toont de beslissing, maar de backend moet afdwingen:

- geen bijlage → reject
- geen PDF/XML → reject
- bedrag > 5000 → manual review
- manual review/rejected → process endpoint mag geen factuurherkenning starten

### 5. Bedrag > 5000 is alleen betrouwbaar na parsing

In mailboxfase is `estimatedTotalAmount` alleen betrouwbaar als:

- er een XML/UBL-bijlage is gelezen; of
- de backend een lichte document scan heeft gedaan; of
- er al een gekoppelde factuur/extractie bestaat.

Zonder betrouwbare bron moet de backend `UNKNOWN_AMOUNT` teruggeven en niet doen alsof het bedrag definitief is.

## Advies voor Azure implementatie

- API: ASP.NET Core Minimal API of Controllers.
- Worker: Azure Container App Job, Azure Function Timer Trigger of BackgroundService.
- Auth: Entra ID / application permission voor Graph.
- Mailbox: shared mailbox zoals `facturen@gemeente.nl`.
- Storage: Azure Blob Storage voor PDF/XML attachments.
- Database: Azure SQL met tabellen `mailbox_messages`, `mailbox_attachments`, `mailbox_prevalidation_results`, `mailbox_sync_runs`.
- Audit: elke user-actie en automatische beslissing loggen.

## Conclusie

Na deze review is de frontend-kant voldoende API-proof om te koppelen. De koppeling staat of valt nu niet meer op React, maar op de backenddiscipline: Graph-sync, mailbox-scoping, idempotency, attachment storage, server-side business rules en auditlogging.
