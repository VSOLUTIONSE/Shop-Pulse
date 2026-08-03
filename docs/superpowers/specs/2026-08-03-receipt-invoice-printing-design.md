# Design: Receipt & Invoice Printing

**Date:** 2026-08-03
**Status:** Approved

## Overview

Add receipt and invoice printing to SalesPulse (Next.js 16 + Convex POS app for Nigerian retail shops). A completed sale produces a 58mm thermal receipt; any completed sale can be reprinted or printed as a fuller A4 invoice. Printing uses the browser print dialog against system-installed printers via the `react-to-print` library.

## Goals / Non-Goals

**Goals**
- Show a preview dialog with the document before every print (both auto-flow after checkout and reprint from Sales Logs); printing only happens after the user clicks Print in the preview.
- Auto-open the 58mm thermal receipt preview after every successful checkout in the POS terminal.
- Reprint a receipt or print an A4 invoice for any completed sale from the Sales Logs page.
- Include the SalesPulse logo and shop identity (name, phone, address, TIN/VAT) on both documents.
- Never block a sale if printing fails.

**Non-Goals**
- Direct USB/ESC-POS communication (WebUSB). Printer is a system-installed printer selected through the browser print dialog.
- Cash-tendered / change calculation on receipts (the POS flow has no cash-received input today). Payment method and total are shown.
- Void receipts or duplicate printing controls beyond the above.

## Settings & Data

### Schema changes (`convex/schema.ts`, `convex/settings.ts`)
Add optional fields to the `settings` table:
- `phone: v.optional(v.string())`
- `address: v.optional(v.string())`
- `tinVat: v.optional(v.string())`

`settings.update` accepts the new optional fields. `settings.get` returns them. `Settings`/`SettingsUpdate` types in `src/types/index.ts` updated accordingly.

### Logo
The user provides the logo file at `public/logo.png`. Both documents reference it as an `<img src="/logo.png" />`. Until the file exists, the document renders the shop name in its place (graceful fallback, no broken image).

### PrintData shape
A shared normalized shape used by both documents, derived either from a DB `Sale` or built from the POS cart:

```ts
interface PrintData {
  saleId: number;
  date: string;              // ISO string
  operatorRole: 'owner' | 'staff';
  shop: { name: string; phone?: string; address?: string; tinVat?: string };
  items: { productName: string; quantity: number; unitPriceCents: number; lineTotalCents: number }[];
  subtotalCents: number;
  discountCents: number;
  totalCents: number;
  payments: { method: 'cash' | 'transfer' | 'card' | 'credit'; amountCents: number }[];
  customerName?: string;
}
```

## Components

New directory `src/components/print/`:

- **`ReceiptDocument.tsx`** — 58mm thermal receipt. Compact monospace layout: logo/name header, shop contact + TIN/VAT, sale id + date + operator, itemized lines (name, qty × unit, line total), subtotal/discount/total, payment summary, thank-you footer. Accepts `PrintData`, `forwardRef` for react-to-print.
- **`InvoiceDocument.tsx`** — A4 invoice. Header with logo + shop identity, INVOICE title with invoice number/sale id + date, customer block, itemized table with columns (item, qty, unit price, amount), subtotal/discount/total, payment summary, notes/signature area. Accepts `PrintData`, `forwardRef`.
- **`PrintPreviewDialog.tsx`** — reusable preview dialog. Renders a document (receipt or invoice) at its target paper size in a modal, with **Print** and **Cancel** buttons. Print is wired to the document's react-to-print `handlePrint`; Cancel just closes. Used by both POS and Sales Logs.
- **`print-data.ts`** — helpers:
  - `saleToPrintData(sale: Sale, shop): PrintData`
  - `cartToPrintData({ saleId, cart, discountCents, totalCents, paymentMethod, customerName }, shop): PrintData`

### Dependency
Add `react-to-print` (v3+, React 19 compatible).

## Wiring

### POS (`src/app/(dashboard)/pos/page.tsx`)
- Add `lastSale: PrintData | null` state.
- On `createSale` resolve: build print data from the local cart (already in memory) + returned `{ id }` + settings, set `lastSale` → this opens the receipt preview dialog. The user clicks **Print** to print, or **Cancel**/closes to skip.
- The `ReceiptDocument` is rendered inside the preview dialog (which stays mounted while `lastSale` is set), so the print iframe is created within the user-gesture window and popup blocking is avoided.
- Receipt print failure shows a toast; the sale is already complete and checkout continues normally.

### Sales Logs (`src/app/(dashboard)/sales/page.tsx`)
- For each completed sale row, add **Receipt** and **Invoice** action buttons.
- Clicking a button opens a preview dialog showing the document (receipt at 58mm, invoice at A4) for that sale, populated via `useGetSale(id)` → `saleToPrintData`. Printing happens only when the user clicks **Print** in the preview.
- Two `useReactToPrint` instances (receipt + invoice), each mounted inside the preview dialog and populated from the selected sale.
- A sale is still voidable as today; the buttons render only for `status === 'completed'`.

## Paper Sizing (CSS)

- Receipt: `@page { size: 58mm auto; margin: 0 }`, content width 58mm — matches the 58×210mm thermal roll.
- Invoice: `@page { size: A4; margin: 12mm }`.
- Print CSS injected via react-to-print `pageStyle`. Global styles (Tailwind) are copied into the print iframe, so existing utility classes apply.

## Error Handling

- `createSale` errors continue to surface via the existing destructive toast; no print is attempted.
- Print errors surface via `onPrintError` → non-blocking toast.
- Missing logo file → shop name fallback (no broken-image icon).
- Empty optional fields (phone/address/TIN/VAT) → those lines simply omitted from the documents.

## Testing & Verification

- No test framework exists in the repo. Verification:
  - `npm run lint`
  - `tsc --noEmit`
  - Manual browser testing: complete a checkout → auto print preview (58mm); Sales Logs → reprint receipt + print A4 invoice; verify content, logo, paper size in print preview; confirm voiding still works.

## Files Touched

- `convex/schema.ts` — add settings fields
- `convex/settings.ts` — get/update the new fields
- `src/types/index.ts` — `Settings`, `SettingsUpdate`
- `src/lib/hooks.ts` — settings hooks (if shape requires)
- `src/app/(dashboard)/settings/page.tsx` — form fields for phone/address/TIN/VAT
- `src/app/(dashboard)/pos/page.tsx` — auto-print wiring
- `src/app/(dashboard)/sales/page.tsx` — reprint + invoice buttons
- `src/components/print/` — new: `ReceiptDocument.tsx`, `InvoiceDocument.tsx`, `PrintPreviewDialog.tsx`, `print-data.ts`
- `public/logo.png` — user-provided logo (fallback until present)
- `package.json` — add `react-to-print`
