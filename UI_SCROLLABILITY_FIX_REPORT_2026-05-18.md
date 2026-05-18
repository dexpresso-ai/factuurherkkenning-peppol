# UI scrollability fix — factuurdetail

## Probleem
De detailkaart gebruikte een vaste paneelhoogte in combinatie met ruime headers, nested cards en een scrollcontainer die visueel te laag begon. Daardoor voelden de velden opgesloten en waren ze niet prettig scanbaar of scrollbaar.

## Aangepakt
- Detailpagina omgebouwd naar een echte viewport-workbench met `min-h-0` en vaste beschikbare hoogte op desktop.
- Succes-validatieblok bovenaan verborgen wanneer er geen issues zijn, zodat de velden hoger starten.
- Rechterpaneel opgesplitst in:
  - compacte tabs-header;
  - vaste actiebar;
  - eigen scrollbare veldencontent;
  - vaste savebar onderaan wanneer er wijzigingen zijn.
- Nested grote cards vervangen door compacte `FieldSection`-blokken.
- Inputs compacter gemaakt (`h-9`) en labels beter scanbaar.
- Factuurregels responsive gemaakt met horizontale overflow.
- PDF- en veldenpaneel krijgen nu dezelfde beschikbare hoogte en blijven zelfstandig bruikbaar.

## Technische keuzes
- Gebruik van `min-h-0` op flex/grid parents zodat nested scrollcontainers betrouwbaar werken.
- Geen wijziging in API-contracten, services of businesslogica.
- PATCH/diff-functionaliteit uit de vorige ronde is intact gebleven.

## Validatie
- `npm run lint` succesvol.
- `npm run build` succesvol.
