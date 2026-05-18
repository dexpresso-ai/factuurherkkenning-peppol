# UBL-ready herkenningsvelden: verplichtingenummer en standaardroutenummer

Deze release voegt twee herkenningsvelden toe die nodig zijn voor de latere UBL/Peppol-generatie richting gemeenten.

## Velden

| UI-label | Frontend veld | API recognition veld | UBL mapping |
|---|---|---|---|
| Verplichtingenummer | `obligationNumber` | `orderReference` | `<cac:OrderReference><cbc:ID>...</cbc:ID></cac:OrderReference>` |
| Standaardroutenummer | `buyerReference` | `buyerReference` | `<cbc:BuyerReference>...</cbc:BuyerReference>` |

## PATCH richting backend

De frontend stuurt deze velden mee in het bestaande `recognition`-blok. Alleen gewijzigde velden worden meegestuurd.

```json
{
  "recognition": {
    "orderReference": "VPL-2026-00481",
    "buyerReference": "ROUTE-ICT-ABO"
  }
}
```

## Backendadvies

- Behandel `recognition.orderReference` als de bron voor UBL `cac:OrderReference/cbc:ID`.
- Behandel `recognition.buyerReference` als de bron voor UBL `cbc:BuyerReference`.
- Valideer server-side dat verplichte gemeentelijke routeringsvelden aanwezig zijn vóór UBL-generatie.
- Laat de frontend deze velden corrigeren, maar maak de backend eigenaar van de uiteindelijke UBL-validatie.

## Relevante bestanden

- `src/types/invoice.ts`
- `src/types/invoiceApi.ts`
- `src/services/api/invoiceApiMapper.ts`
- `src/features/invoices/ExtractionFields.tsx`
- `src/features/invoices/PdfPreview.tsx`
