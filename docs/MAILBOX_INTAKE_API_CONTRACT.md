# Mailbox Intake API-contract

Deze frontend-module is voorbereid op een Azure/.NET backend die Microsoft Graph uitleest en mailmetadata opslaat in Azure SQL.

## Doel

De mailbox staat los van de factuurherkenning. De gebruiker kan eerst zien welke mails zijn binnengekomen, welke bijlagen aanwezig zijn en welk pre-validatiebesluit de intake-agent heeft genomen.

## Endpoints

```http
GET /api/mailbox/status
GET /api/mailbox/messages?search=&status=&outcome=&page=1&pageSize=50
GET /api/mailbox/messages/{id}
POST /api/mailbox/messages/{id}/prevalidate
POST /api/mailbox/messages/{id}/process
POST /api/mailbox/messages/{id}/ignore
POST /api/mailbox/sync-now
```

## Kernregels pre-validatie

1. **Geen bijlage** → `outcome: rejected`, `status: rejected`.
2. **Wel bijlage, maar geen PDF/XML-factuurkandidaat** → `outcome: rejected`, `status: rejected`.
3. **Totaalbedrag > € 5.000** → `outcome: manual_review`, `status: manual_review`.
4. Bij bedragen boven € 5.000 wordt geen route-/goedkeuringsnaam getoond in de frontend. Het API-veld `routeDisclosure` staat dan op `hidden_due_threshold`.
5. Alleen mails met `outcome: accepted` mogen automatisch worden doorgestuurd naar factuurherkenning.

## DTO: MailboxMessage

```ts
interface MailboxMessage {
  id: string;
  graphMessageId: string;
  internetMessageId?: string;
  conversationId?: string;
  mailboxAddress: string;
  subject: string;
  fromName?: string;
  fromAddress: string;
  receivedAt: string;
  bodyPreview?: string;
  isRead: boolean;
  hasAttachments: boolean;
  attachmentCount: number;
  pdfAttachmentCount: number;
  xmlAttachmentCount: number;
  attachments: MailboxAttachmentSummary[];
  status: MailboxMessageStatus;
  estimatedTotalAmount?: Money;
  linkedInvoiceId?: string;
  linkedInvoiceNumber?: string;
  prevalidation?: MailboxPrevalidationDecision;
  lastActionAt?: string;
  lastError?: string;
}
```


## Frontend normalisatie

De frontend bevat een mapperlaag in `src/services/api/mailboxApiMapper.ts`. Daardoor hoeft de Azure backend niet exact dezelfde interne UI-shape terug te geven, zolang de kernvelden aanwezig zijn. De mapper ondersteunt onder andere:

- lijstresponse als `{ items, total, page, pageSize }`, `{ data }` of een array;
- action response als `{ message }`, `{ item }` of direct als message;
- afzender als vlakke velden of Graph-achtige `from.emailAddress` shape;
- attachments met expliciete `kind` of afleiding via `contentType`/bestandsnaam;
- optionele Graph sync-velden zoals `graphImmutableMessageId`, `graphChangeKey` en `graphFolderId`.

## Architectuurnotitie

De frontend praat niet rechtstreeks met Microsoft Graph. De juiste productieroute is:

```text
Microsoft 365 shared mailbox
→ Azure backend / worker
→ Microsoft Graph
→ Azure SQL + Blob Storage
→ Frontend /mailbox
→ Factuurherkenning
```

Hiermee blijven tokens, Graph-permissies, retry/idempotency, auditlogging en mailbox-scoping server-side onder controle.
