# Peppol Invoice Agent — Frontend

Production-grade demo frontend voor een Azure-based Peppol Invoice Agent.
Een organisatie kan automatisch een Microsoft 365-mailbox laten uitlezen,
PDF-facturen verwerken, factuurdata controleren, en UBL + originele PDF
via Peppol versturen.

> **Demo-modus:** alle data komt uit `src/mocks/`. De architectuur is volledig
> API-ready — services, hooks en types staan klaar voor 1-op-1 koppeling
> aan een echte .NET backend.

---

## Tech stack

| Laag             | Keuze                                                  |
| ---------------- | ------------------------------------------------------ |
| Framework        | **React 18** + **TypeScript 5** (strict)              |
| Build            | **Vite 5**                                             |
| Styling          | **Tailwind CSS 3** + design tokens (Microsoft/Azure)   |
| UI primitives    | **shadcn/ui-style** componenten op Radix UI            |
| Iconen           | **lucide-react**                                       |
| Routing          | **React Router 6**                                     |
| Server state     | **TanStack Query 5**                                   |
| Auth/UI state    | **Zustand** (met persist middleware)                   |
| Font             | **Poppins** (300-700, via Google Fonts)                |

## Lokaal draaien

```bash
# Vereist: Node 18+
npm install
npm run dev
```

Open http://localhost:5173. Klik op **Inloggen met Microsoft** — de mock-auth
levert direct een sessie en navigeert naar het dashboard.

### Beschikbare scripts

```bash
npm run dev       # development server (HMR)
npm run build     # type-check + productiebuild naar /dist
npm run preview   # preview de productiebuild
npm run lint      # ESLint
```

### Environment-variabelen

Maak een `.env.local` (zie `.env.example`):

```dotenv
VITE_USE_MOCK=true                 # false = gebruik echte backend
VITE_API_BASE_URL=https://localhost:5001
```

---

## Folder-architectuur

```
src/
├─ app/              # (gereserveerd voor app-providers)
├─ components/       # gedeelde UI-componenten
│  ├─ ui/            # shadcn/ui primitives (Button, Card, …)
│  ├─ Breadcrumbs.tsx
│  ├─ EmptyState.tsx
│  ├─ PageHeader.tsx
│  └─ StatusBadge.tsx
├─ features/         # feature-specifieke componenten
│  ├─ dashboard/     # StatTile, SystemStatus, RecentActivity, VolumeChart
│  ├─ invoices/      # InvoiceTable, InvoiceFilters, PdfPreview, ExtractionFields, …
│  └─ audit/         # AuditTimeline
├─ layouts/          # AppLayout, Sidebar, Topbar
├─ pages/            # 1 file per route
├─ routes/           # AppRoutes + ProtectedRoute
├─ services/         # API-laag (mock + real)
│  ├─ api/
│  │  ├─ apiClient.ts      # ❶ centrale apiCall() — switch hier mock ↔ real
│  │  └─ queryKeys.ts      # centrale registry voor React-Query keys
│  ├─ invoiceService.ts
│  ├─ supplierService.ts
│  ├─ settingsService.ts
│  ├─ auditService.ts
│  ├─ dashboardService.ts
│  └─ authService.ts
├─ hooks/            # React Query-hooks per feature
├─ store/            # Zustand stores (authStore)
├─ types/            # DTO's — staan 1-op-1 klaar voor .NET-mapping
├─ mocks/            # mock data
├─ utils/            # formatters
└─ lib/              # utils.ts (cn helper)
```

---

## API-ready architectuur

### De centrale `apiCall()`

Iedere service-functie roept exact dezelfde wrapper aan:

```ts
// src/services/invoiceService.ts
async list(filters) {
  return apiCall(
    '/api/invoices',                            // logische endpoint
    () => /* mock-implementatie */,             // ← in mock-modus
    { method: 'GET' },                          // ← in real-modus
  );
}
```

Wanneer `VITE_USE_MOCK=false`, gaat `apiCall` rechtstreeks naar `httpRequest()`
in `apiClient.ts`. Geen enkele andere file hoeft te veranderen.

### Endpoints die de UI verwacht

| Method | Endpoint                          | DTO uit / DTO in                        |
| ------ | --------------------------------- | --------------------------------------- |
| GET    | `/api/dashboard/summary`          | `DashboardSummary`                      |
| GET    | `/api/invoices`                   | `PagedResult<Invoice>` (query: filters) |
| GET    | `/api/invoices/:id`               | `Invoice`                               |
| PATCH  | `/api/invoices/:id`               | body: `UpdateInvoiceDto` → `Invoice`    |
| POST   | `/api/invoices/:id/reprocess`     | `Invoice`                               |
| POST   | `/api/invoices/:id/approve`       | `Invoice`                               |
| POST   | `/api/invoices/:id/send`          | `SendPeppolResult`                      |
| GET    | `/api/invoices/:id/audit`         | `AuditLogEntry[]`                       |
| GET    | `/api/audit/recent?limit=`        | `AuditLogEntry[]`                       |
| GET    | `/api/suppliers`                  | `Supplier[]`                            |
| GET    | `/api/suppliers/:id`              | `Supplier`                              |
| GET    | `/api/settings`                   | `AppSettings`                           |
| PATCH  | `/api/settings`                   | body: `UpdateSettingsDto` → `AppSettings` |
| POST   | `/api/auth/microsoft`             | `AuthSession` (vervangen door MSAL)     |

Alle DTO's staan in `src/types/`. Ze zijn gemodelleerd alsof ze direct uit een
.NET-controller komen — gebruik C# records met dezelfde shape voor 1-op-1 mapping.

---

## Schermen

| Pagina             | Route                  | Beschrijving                                       |
| ------------------ | ---------------------- | -------------------------------------------------- |
| **Login**          | `/login`               | Microsoft/Entra-ID stijl loginpagina               |
| **Dashboard**      | `/`                    | KPI-tegels, systeemstatus, trend, recente activity |
| **Facturenlijst**  | `/invoices`            | Tabel met filtering, zoeken, status badges        |
| **Factuurdetail**  | `/invoices/:id`        | PDF-preview links, velden + audit rechts (tabs)   |
| **Uitval**         | `/exceptions`          | Gegroepeerd per fout-type (KVK, BTW, UBL, …)      |
| **Leveranciers**   | `/suppliers`           | Bekende leveranciers + verificatiestatus           |
| **Auditlog**       | `/audit`               | Volledige audit trail                              |
| **Instellingen**   | `/settings`            | Mailbox, Peppol, Azure storage, verwerking         |

---

## TODO — backend integratie

Wanneer de echte .NET backend klaar is, lopen alle wijzigingen via deze
duidelijk gemarkeerde plekken:

1. **`src/services/api/apiClient.ts`**
   - Vul `httpRequest()` aan met je auth-header pickup uit MSAL.
   - Zet `VITE_USE_MOCK=false` in `.env.local`.
2. **`src/store/authStore.ts`**
   - Vervang `authService.signInWithMicrosoft()` door MSAL.js
     (`@azure/msal-react` + `@azure/msal-browser`).
   - Hydrate `accessToken`/`expiresAt` uit MSAL session.
3. **`src/services/authService.ts`**
   - Volledig vervangen door MSAL-flow.
4. **`vite.config.ts`**
   - Dev-proxy uitcommentariëren als je localhost:5001 gebruikt
     (anders CORS instellen op de .NET API).
5. **PDF-rendering** in `src/features/invoices/PdfPreview.tsx`
   - Vervang de mock A4-render door een `<iframe>` of `pdf.js`-viewer
     met de SAS-URL uit `invoice.pdfUrl`.

Zoek in de codebase op `TODO` voor alle markers.

---

## Demo-mock specifics

- **Latency**: elke `apiCall()` wacht 180–480 ms (configurable per call)
  zodat loading-states realistisch zichtbaar zijn.
- **Mutaties persistent binnen sessie**: factuur-updates blijven bewaard tot
  page reload. De mock-store is een mutable in-memory copy van `mockInvoices`.
- **Auto-refresh dashboard**: de dashboard summary refresht elke 30 seconden
  via `useDashboardSummary()`.
- **Polling intervallen**: niet actief in mock-modus om de console schoon
  te houden — voeg `refetchInterval` toe in de hook waar gewenst.

---

## Design-keuzes

- **Microsoft/Azure-blauw** (`hsl(210 88% 40%)`) als primary; rustig wit
  oppervlak; subtiele schaduwen (`shadow-card`, `shadow-elevated`).
- **Poppins** als sans-serif voor moderne, leesbare UI.
- **Sidebar-first layout**: vaste 256px sidebar + topbar met search/user.
- **Skeleton loaders** op elk scherm (`<Skeleton />`).
- **Status-badges** centraal in `components/StatusBadge.tsx` — kleur
  consistent over hele app.
- **Tabular-nums** voor alle bedragen en getallen.

---

## Licentie

Intern gebruik / demo.

## Azure API-ready herkenningsvelden

De extra factuurherkenningsvelden zijn voorbereid op een Azure/.NET backendkoppeling. De frontend gebruikt intern het bestaande `Invoice`-model, maar richting API wordt dit gemapt naar een stabiel `recognition`-blok.

Belangrijkste bestanden:

- `src/types/invoiceApi.ts` — API DTO's voor factuurherkenning.
- `src/services/api/invoiceApiMapper.ts` — mapping tussen UI-model en API-contract.
- `src/services/api/apiClient.ts` — echte fetch-client met Bearer token, timeout, `X-Correlation-ID` en optionele `X-Tenant-ID`.
- `docs/AZURE_API_CONTRACT.md` — voorbeeldpayloads en endpoint-afspraken.

Voor echte backend:

```env
VITE_USE_MOCK=false
VITE_API_BASE_URL=https://<jouw-azure-api>
VITE_API_TIMEOUT_MS=30000
VITE_API_TENANT_ID=<optioneel>
```

De herkenningsvelden worden naar de backend gestuurd als:

```json
{
  "recognition": {
    "summaryDescription": "Abonnement Mei",
    "amountExcludingVat": { "amount": 289.0, "currency": "EUR" },
    "vatAmount": { "amount": 60.69, "currency": "EUR" },
    "amountIncludingVat": { "amount": 349.69, "currency": "EUR" },
    "gAccountAmount": { "amount": 0, "currency": "EUR" },
    "paymentReference": "F-2026-0481",
    "debtorNumber": "123456",
    "period": "mei",
    "periodYear": 2026,
    "paymentMethod": "Bankoverschrijving"
  }
}
```
