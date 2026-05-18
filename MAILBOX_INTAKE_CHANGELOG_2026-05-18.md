# Mailbox Intake-module toegevoegd

## Toegevoegd

- Nieuw menu-item **Mailbox**.
- Nieuwe route `/mailbox`.
- Nieuwe pagina `src/pages/MailboxPage.tsx` met tabelweergave voor ingekomen mails.
- Nieuwe mailbox DTO's in `src/types/mailbox.ts`.
- Nieuwe mockdata en pre-validatieregels in `src/mocks/mailbox.ts`.
- Nieuwe service-acties in `src/services/mailboxService.ts`.
- Nieuwe React Query-hooks voor mailboxberichten, pre-validatie, verwerken en negeren.
- API-contractdocumentatie in `docs/MAILBOX_INTAKE_API_CONTRACT.md`.

## Business rules

- Mail zonder bijlage wordt vooraf afgekeurd.
- Mail met bijlage, maar zonder PDF/XML-factuurkandidaat wordt vooraf afgekeurd.
- Mail met geschat totaalbedrag boven € 5.000 gaat naar handmatige controle.
- Bij bedragen boven € 5.000 worden geen route-/goedkeuringsnamen getoond.
- Alleen vrijgegeven mails kunnen automatisch worden verwerkt.

## Validatie

- `npm run lint` succesvol.
- `npm run build` succesvol.
