# UI Refresh Changelog — 2026-05-10

## Doel
De bestaande Peppol Invoice Agent is visueel gemoderniseerd naar een dark-first, premium SaaS-interface met Poppins als basisfont, subtiele animaties, glassmorphism, sterkere dashboardvisuals en een consistentere componentstijl.

## Aangepast

### Globaal design system
- Dark-first kleurensysteem ingesteld in `src/index.css`.
- Poppins expliciet als globale font-stack gebruikt.
- Nieuwe achtergrond met radial gradients en subtiele grid-textuur.
- Nieuwe utility classes toegevoegd voor glass panels, gradient text, page transitions en shimmer loaders.
- Tailwind uitgebreid met moderne shadows, glow-effecten en keyframe-animaties.

### Layout
- `AppLayout` voorzien van donkere achtergrond, aurora-glows en page-enter animatie.
- `Sidebar` opnieuw vormgegeven met glass look, gradient logo, actieve navigatie-indicator en modernere statuskaart.
- `Topbar` vernieuwd met glass searchbar, command-key hint, notification dot en modern accountblok.

### UI-primitives
- `Button`, `Card`, `Input`, `Badge`, `Table`, `Tabs`, `Select`, `Dialog`, `Skeleton`, `Switch`, `Label` en `Separator` vernieuwd.
- Meer afgeronde hoeken, betere focus states, subtiele hover-transforms en donkere contrasten toegevoegd.

### Schermen en features
- Loginpagina volledig omgebouwd naar premium dark onboarding/cockpit-look.
- Page headers voorzien van gradient titels en consistente AI Factuurhub-labels.
- Empty states visueel versterkt.
- Dashboard KPI-tiles, systeemstatus, volumegrafiek en recente activiteiten gemoderniseerd.
- Factuurtabel, filters en confidence indicator aangepast aan de nieuwe stijl.

## Niet aangepast
- Geen backendlogica gewijzigd.
- Geen auth-, service-, mockdata- of API-contracten gewijzigd.
- Geen nieuwe runtime dependency toegevoegd.

## Validatie
- `npm run build` succesvol uitgevoerd.
- `npm run lint` succesvol uitgevoerd nadat de meegeleverde `node_modules/.bin` links lokaal hersteld waren. De codebase zelf is valide; voor overdracht wordt `node_modules` niet meegeleverd.

## Aanbevolen volgende stap
Visuele QA in browser op:
1. Loginpagina
2. Dashboard
3. Facturenlijst
4. Factuurdetail
5. Instellingen
6. Mobiele/responsive breakpoint onder 1024px
