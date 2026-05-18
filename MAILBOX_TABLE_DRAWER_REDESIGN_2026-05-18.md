# Mailbox table redesign + detaildrawer — 2026-05-18

## Doel
De mailboxweergave is teruggebracht van een brede operationele tabel naar een compacte inboxweergave. De tabel toont alleen de primaire beslisinformatie, terwijl alle detailinformatie pas na selectie in een rechter zijpaneel wordt geopend.

## Aangepast

### `src/pages/MailboxPage.tsx`
- Brede tabel vervangen door compacte 4-kolomsweergave:
  - Ontvangen
  - Afzender
  - Status
  - Factuur koppeling
- Onderwerp, body preview, bijlagen, bedragen, intake-uitleg, technische Graph metadata en acties verplaatst naar een detaildrawer.
- Tabelrijen zijn klikbaar en keyboard-toegankelijk via Enter/Spatie.
- Geselecteerde rij krijgt visuele status.
- Factuurlink blijft klikbaar zonder per ongeluk de drawer te openen.
- Acties `Check`, `Verwerk` en `Negeer` staan nu in de drawer, dichter bij de detailcontext.
- Route-/goedkeuringsinformatie blijft afgeschermd bij bedragen boven € 5.000.

### `src/components/ui/sheet.tsx`
- Nieuwe herbruikbare rechter drawer-component toegevoegd op basis van Radix Dialog.
- Inclusief overlay, focus management, ESC sluiten en slide-in animatie.

## Technisch
- Geen wijzigingen aan API-contracten of backend-endpoints.
- Geen wijzigingen aan mailbox businesslogica.
- Geen wijzigingen aan prevalidatieregels.
- Alleen presentatie/UX en componentstructuur aangepast.

## Validatie
- `npm run lint` succesvol.
- `npm run build` succesvol.
