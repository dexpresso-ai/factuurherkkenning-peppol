# Senior Codecheck Report — Peppol Invoice Agent

Datum: 2026-05-10

## Testresultaten

- `npm install`: geslaagd
- `npm run build`: geslaagd
- `npm run lint`: geslaagd
- `npm audit --audit-level=moderate`: 0 vulnerabilities
- Production preview smoke test via `vite preview`: HTML entrypoint bereikbaar met HTTP 200

## Conclusie

De frontend is technisch gezond en goed voorbereid op backend-integratie. De app heeft een duidelijke scheiding tussen UI, hooks, services, API-client, types en mockdata. Daardoor kan de mocklaag straks relatief eenvoudig worden vervangen door echte .NET/Azure endpoints.

## Uitgevoerde extra fixes in deze check

1. `apiClient.ts` uitgebreid met `params` support voor echte GET-querystrings.
2. `invoiceService.list()` stuurt filters nu ook naar echte backendcalls via query params.
3. Centrale query key toegevoegd voor mailboxstatus: `queryKeys.mailbox.status`.
4. Mailbox hooks gebruiken nu de centrale query key in plaats van losse string arrays.
5. `useUpdateInvoice()` aangepast zodat interne cache invalidation niet overschreven wordt door externe mutation options.
6. Peppol Access Point URL in instellingen is nu daadwerkelijk wijzigbaar en wordt meegenomen in het settings-draft object.

## Backend-koppelbaarheid

De frontend is klaar voor dit backend-contract:

- `GET /api/dashboard/summary`
- `GET /api/invoices?search=&status=&supplierId=&hasIssues=&page=&pageSize=`
- `GET /api/invoices/{id}`
- `PATCH /api/invoices/{id}`
- `POST /api/invoices/{id}/reprocess`
- `POST /api/invoices/{id}/approve`
- `POST /api/invoices/{id}/send`
- `GET /api/suppliers`
- `GET /api/suppliers/{id}`
- `GET /api/settings`
- `PATCH /api/settings`
- `GET /api/mailbox/status`
- `POST /api/mailbox/connect`
- `POST /api/mailbox/sync-now`
- `GET /api/invoices/{id}/audit`
- `GET /api/audit/recent`

## Microsoft Graph readiness

De frontend hoort Microsoft Graph niet direct aan te roepen. De juiste productieflow blijft:

Frontend → .NET API → Worker → Microsoft Graph → Azure Blob/Azure SQL → frontend statusupdate

De frontend is hiervoor voorbereid via:

- mailbox status endpoint
- mailbox connect endpoint
- sync-now endpoint
- dashboard polling
- invoice list refresh/invalidation

## Nog te bouwen voor productie

1. MSAL/Entra ID echte login in plaats van mock-auth.
2. `getAccessToken()` vervangen door `acquireTokenSilent()` voor de backend API scope.
3. .NET API met JWT-validatie tegen Entra ID.
4. Worker voor Microsoft Graph mailbox polling.
5. Blob Storage endpoints voor PDF/UBL streaming of short-lived SAS URLs.
6. Server-side validatie op alle mutatie-endpoints.
7. E2E-tests met Playwright zodra echte API of stabiele mocked API beschikbaar is.

## Eindoordeel

Status: groen voor frontend-demo en backend-ready basis.

Niet production-complete als eindproduct, maar wel een solide frontendfundament om aan de geplande Azure/.NET/Microsoft Graph/Peppol backend te koppelen.
