# Technical review — Peppol Invoice Agent frontend

## Samenvatting
De frontend is goed opgezet als API-ready React/Vite applicatie. De app bouwt succesvol, heeft een duidelijke service-laag, typed DTO's en mockservices die relatief makkelijk vervangen kunnen worden door echte .NET/Azure endpoints.

## Uitgevoerde controles
- `npm install` uitgevoerd
- TypeScript production build uitgevoerd
- ESLint toegevoegd en succesvol uitgevoerd
- `npm audit` uitgevoerd
- Centrale API-laag gecontroleerd
- Auth-flow gecontroleerd
- Mockdata-isolatie gecontroleerd
- Backend-koppelbaarheid gecontroleerd
- Microsoft Graph-koppelbaarheid gecontroleerd

## Testresultaten
- `npm run build`: geslaagd
- `npm run lint`: geslaagd
- `npm audit`: 0 vulnerabilities

## Aangebrachte verbeteringen
1. ESLint dependencies en `eslint.config.js` toegevoegd, zodat linting daadwerkelijk werkt.
2. Ongebruikte imports / lint issues opgelost.
3. Vite en React plugin geüpdatet naar actuele versie, waardoor audit-vulnerabilities zijn opgelost.
4. `authToken.ts` toegevoegd als centrale plek voor backend API bearer-token handling.
5. `apiClient.ts` aangepast zodat echte backend-calls automatisch een Authorization header kunnen meesturen zodra `VITE_USE_MOCK=false` staat.
6. `mailboxService.ts` toegevoegd met backend-ready endpoints:
   - `GET /api/mailbox/status`
   - `POST /api/mailbox/connect`
   - `POST /api/mailbox/sync-now`
7. React Query hooks toegevoegd voor mailboxstatus, mailbox koppelen en direct synchroniseren.

## Backend readiness
De app is goed voorbereid op de backend. De frontend communiceert via services en hooks, niet direct vanuit UI-componenten. Hierdoor kan de mocklaag vervangen worden door echte API-calls.

Belangrijke echte backendroutes:
- `GET /api/dashboard/summary`
- `GET /api/invoices`
- `GET /api/invoices/{id}`
- `PATCH /api/invoices/{id}`
- `POST /api/invoices/{id}/reprocess`
- `POST /api/invoices/{id}/approve`
- `POST /api/invoices/{id}/send`
- `GET /api/invoices/{id}/audit`
- `GET /api/suppliers`
- `GET /api/settings`
- `PATCH /api/settings`
- `GET /api/mailbox/status`
- `POST /api/mailbox/connect`
- `POST /api/mailbox/sync-now`

## Microsoft Graph readiness
De frontend moet niet rechtstreeks Microsoft Graph aanroepen. De juiste architectuur blijft:

Frontend → .NET API → Worker → Microsoft Graph → Azure Blob/Azure SQL → Frontend statusupdate

De frontend is nu voorbereid op deze flow via mailboxstatus- en sync-endpoints. De echte Graph-logica hoort in de backend/worker.

## Nog nodig voor productie
1. MSAL/Entra ID echt implementeren.
2. `authToken.ts` vervangen door MSAL `acquireTokenSilent()` voor de API-scope.
3. .NET API bouwen met exact dezelfde DTO-contracten.
4. Backend JWT-validatie toevoegen.
5. Blob PDF/UBL streaming endpoints toevoegen.
6. Backend queue/worker bouwen voor Graph mailbox polling.
7. Peppol Access Point API koppelen.
8. E2E-tests toevoegen zodra backend bestaat.

## Conclusie
Frontend is technisch gezond als demo/MVP-frontend en goed koppelbaar aan de beoogde backend. De app is nog geen volledige productieapp, maar de architectuur is juist gekozen en de belangrijkste frontend-risico's zijn opgelost.
