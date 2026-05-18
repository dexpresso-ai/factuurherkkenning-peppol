# Mailbox Manual Review — Senior Code Review 2026-05-18

## Reviewresultaat

De functie is technisch goed opgezet: de mailboxpagina heeft een compacte tabel, een centrale reviewdialog, aparte API-ready acties voor handmatige afkeur en override, en React Query-invalidatie voor mailbox-, dashboard- en factuurviews.

Tijdens de review zijn twee productie-risico's aangescherpt:

1. **Override mocht te veel**  
   Een gebruiker kon in de mock-flow ook mails zonder PDF/XML-factuurbijlage vrijgeven. Dat is functioneel gevaarlijk: een gebruiker mag businessregels overrulen, maar geen technische onmogelijkheden.

2. **Genegeerde of al-verwerkte mails konden nog te makkelijk opnieuw doorgezet worden**  
   De UI keek vooral naar prevalidatie-uitkomst. Daardoor konden terminale statussen zoals `ignored` of `invoice_created` theoretisch nog als verwerkbaar ogen.

## Direct doorgevoerde verbeteringen

- Nieuwe gedeelde workflow-helper toegevoegd: `src/utils/mailboxWorkflow.ts`.
- Eén centrale definitie voor:
  - handmatig vrijgegeven
  - handmatig afgekeurd
  - harde technische blokkade
  - mag handmatig beslissen
  - mag overrulen
  - mag verwerken
- Harde technische blokkades toegevoegd:
  - geen bijlage
  - geen PDF/XML/factuurkandidaat
- Override mag nu alleen soft/business-review beslissingen passeren, zoals bedrag boven € 5.000.
- Process-flow blokkeert nu ook `ignored`, `queued`, `processing` en `invoice_created`.
- UI toont nu expliciet wanneer een mail niet veilig te overrulen is.
- Auditreden wordt na een nieuw of gewijzigd menselijk besluit weer leeggemaakt.

## Architectuurregel

De frontend blijft een UX-laag. De Azure backend moet exact dezelfde regels server-side afdwingen, inclusief gebruiker, tenant, timestamp en correlation-id in auditlogging.

## Checks

Uitgevoerd:

```bash
npm run lint
npm run build
```

Beide succesvol.
