# Compact header update — 2026-05-19

## Doel
De dashboardkop voelde te veel als een marketing/website-hero. Deze wijziging maakt de bovenkant compacter en meer app-achtig, zonder de snelle acties kwijt te raken.

## Aangepast
- `src/pages/DashboardPage.tsx`
  - Grote hero vervangen door een compacte operationele cockpit.
  - CTA-knoppen `Bekijk mailbox` en `Bekijk facturen` behouden.
  - Statusinformatie teruggebracht naar compacte metric cards.
  - Flow-cards onderin compacter gemaakt.
  - Skeletonhoogte aangepast op het nieuwe compacte ontwerp.

- `src/components/PageHeader.tsx`
  - Algemene paginaheader compacter gemaakt.
  - Titel en beschrijving visueel rustiger en minder website-achtig gemaakt.

- `src/layouts/Topbar.tsx`
  - Topbarhoogte teruggebracht van 80px naar 64px.
  - Zoekveld, avatar en user-pill compacter gemaakt.

- `src/layouts/AppLayout.tsx`
  - Content padding iets compacter gemaakt zodat de cockpit directer aanvoelt.

## Validatie
- `npm run build` succesvol uitgevoerd.
- `npm run lint` succesvol uitgevoerd.

## Build note
Vite geeft nog een bestaande waarschuwing dat de JS-bundle iets groter is dan 500 kB. Dit blokkeert de build niet. Voor productie kan later code splitting worden toegevoegd.
