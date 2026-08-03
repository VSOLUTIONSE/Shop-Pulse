# Receipt & Invoice Printing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add 58mm thermal receipt printing (auto-preview after checkout + reprint from Sales Logs) and A4 invoice printing, all behind a preview dialog, with the SalesPulse logo and shop identity.

**Architecture:** Extend the `settings` Convex table with phone/address/TIN-VAT. Add two printable client components (`ReceiptDocument` for 58mm thermal, `InvoiceDocument` for A4) rendered inside a shared `PrintPreviewDialog` that drives `react-to-print`. Wire POS checkout to auto-open the receipt preview and Sales Logs to open receipt/invoice previews per completed sale.

**Tech Stack:** Next.js 16 App Router, React 19, Convex, Tailwind v4, `react-to-print` v3, shadcn/ui `Dialog`.

---

## File Structure

- `convex/schema.ts` — add `phone`, `address`, `tinVat` to `settings` table
- `convex/settings.ts` — pass-through new optional fields in `get`/`update`
- `src/types/index.ts` — extend `Settings`/`SettingsUpdate`
- `src/lib/hooks.ts` — widen `useUpdateSettings` arg type
- `src/app/(dashboard)/settings/page.tsx` — new form fields
- `src/components/print/print-data.ts` — `PrintData` type + mapping helpers
- `src/components/print/ReceiptDocument.tsx` — 58mm receipt
- `src/components/print/InvoiceDocument.tsx` — A4 invoice
- `src/components/print/PrintPreviewDialog.tsx` — shared preview dialog + print
- `src/app/(dashboard)/pos/page.tsx` — auto-open receipt preview after checkout
- `src/app/(dashboard)/sales/page.tsx` — Receipt/Invoice buttons + dialog
- `package.json` — add `react-to-print`

---

### Task 1: Add settings fields (phone, address, tinVat)

**Files:**
- Modify: `convex/schema.ts:5-11`
- Modify: `convex/settings.ts:4-18`, `convex/settings.ts:20-41`
- Modify: `src/types/index.ts:19-26`, `src/types/index.ts:28-34`
- Modify: `src/lib/hooks.ts:23-29`
- Modify: `src/app/(dashboard)/settings/page.tsx:39-42`, `src/app/(dashboard)/settings/page.tsx:53-60`

- [ ] **Step 1: Extend the Convex schema**

In `convex/schema.ts`, change the `settings` table definition to:

```ts
  settings: defineTable({
    shopName: v.string(),
    ownerLabel: v.string(),
    attendantLabel: v.string(),
    activeRole: v.union(v.literal("owner"), v.literal("attendant")),
    lowStockThreshold: v.number(),
    phone: v.optional(v.string()),
    address: v.optional(v.string()),
    tinVat: v.optional(v.string()),
  }),
```

- [ ] **Step 2: Update `settings.get` and `settings.update`**

In `convex/settings.ts`, add the fields to the `get` handler return object:

```ts
    return {
      id: 1,
      shopName: settings.shopName,
      ownerLabel: settings.ownerLabel,
      attendantLabel: settings.attendantLabel,
      activeRole: settings.activeRole,
      lowStockThreshold: settings.lowStockThreshold,
      phone: settings.phone ?? null,
      address: settings.address ?? null,
      tinVat: settings.tinVat ?? null,
    };
```

Add the new optional args to the `update` mutation args:

```ts
    lowStockThreshold: v.optional(v.number()),
    phone: v.optional(v.string()),
    address: v.optional(v.string()),
    tinVat: v.optional(v.string()),
```

- [ ] **Step 3: Update TypeScript types**

In `src/types/index.ts`, update `Settings` and `SettingsUpdate`:

```ts
export interface Settings {
  id: number;
  shopName: string;
  ownerLabel: string;
  attendantLabel: string;
  activeRole: Role;
  lowStockThreshold: number;
  phone: string | null;
  address: string | null;
  tinVat: string | null;
}

export interface SettingsUpdate {
  shopName?: string;
  ownerLabel?: string;
  attendantLabel?: string;
  activeRole?: Role;
  lowStockThreshold?: number;
  phone?: string;
  address?: string;
  tinVat?: string;
}
```

- [ ] **Step 4: Widen the settings hook**

In `src/lib/hooks.ts`, update `useUpdateSettings`:

```ts
export function useUpdateSettings() {
  const mutate = useMutation(api.settings.update);
  return {
    mutate: (d: {
      shopName?: string;
      lowStockThreshold?: number;
      phone?: string;
      address?: string;
      tinVat?: string;
    }) => mutate(d),
    isPending: false,
  };
}
```

- [ ] **Step 5: Add form fields to Settings page**

In `src/app/(dashboard)/settings/page.tsx`:
- Extend `formData` state (line ~39):

```ts
  const [formData, setFormData] = useState({
    shopName: '',
    lowStockThreshold: '',
    phone: '',
    address: '',
    tinVat: '',
  });
```

- Update the `useEffect` that syncs from `settings` (line ~44):

```ts
  useEffect(() => {
    if (settings) {
      setFormData({
        shopName: settings.shopName,
        lowStockThreshold: settings.lowStockThreshold.toString(),
        phone: settings.phone ?? '',
        address: settings.address ?? '',
        tinVat: settings.tinVat ?? '',
      });
    }
  }, [settings]);
```

- Update `handleSaveSettings` (line ~53):

```ts
  const handleSaveSettings = () => {
    updateSettings.mutate({
      shopName: formData.shopName,
      lowStockThreshold: Number(formData.lowStockThreshold),
      phone: formData.phone,
      address: formData.address,
      tinVat: formData.tinVat,
    }).then(() => {
      toast({ title: "Settings saved successfully" });
    });
  };
```

- After the "Default Low Stock Threshold" field's closing `</div>` (around line 141), insert new fields between it and the Save button:

```tsx
            <Separator className="my-4" />
            <div className="space-y-2">
              <Label>Business Phone</Label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">Shown on receipts and invoices.</p>
            </div>
            <div className="space-y-2">
              <Label>Business Address</Label>
              <Input
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>TIN / VAT Number</Label>
              <Input
                value={formData.tinVat}
                onChange={(e) => setFormData({ ...formData, tinVat: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">Tax identification / VAT registration number.</p>
            </div>
```

- [ ] **Step 6: Verify types**

Run: `npx tsc --noEmit`
Expected: No errors. (If Convex `_generated` types lag, run `npx convex dev` in another terminal, then re-run `tsc`.)

- [ ] **Step 7: Commit**

```bash
git add convex/schema.ts convex/settings.ts src/types/index.ts src/lib/hooks.ts "src/app/(dashboard)/settings/page.tsx"
git commit -m "feat: add phone, address, and TIN/VAT to shop settings"
```

---

### Task 2: Install react-to-print

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install the dependency**

Run: `npm install react-to-print`
Expected: `react-to-print@^3.x` added to `dependencies` (peer react `~19` satisfied by installed React 19.2.4).

- [ ] **Step 2: Verify the install**

Run: `npm ls react-to-print`
Expected: `react-to-print@3.x.y` with no missing peer dependencies.

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add react-to-print dependency"
```

---

### Task 3: Create print-data helpers

**Files:**
- Create: `src/components/print/print-data.ts`

- [ ] **Step 1: Write the file**

Create `src/components/print/print-data.ts`:

```ts
import type { Sale, Settings } from '@/types';

export interface PrintShop {
  name: string;
  phone?: string;
  address?: string;
  tinVat?: string;
}

export interface PrintItem {
  productName: string;
  quantity: number;
  unitPriceCents: number;
  lineTotalCents: number;
}

export interface PrintPayment {
  method: 'cash' | 'transfer' | 'card' | 'credit';
  amountCents: number;
}

export interface PrintData {
  saleId: number;
  date: string;
  operatorRole: 'owner' | 'staff';
  shop: PrintShop;
  items: PrintItem[];
  subtotalCents: number;
  discountCents: number;
  totalCents: number;
  payments: PrintPayment[];
  customerName?: string;
}

export interface CartPrintItem {
  productId: number;
  name: string;
  unitPriceCents: number;
  quantity: number;
}

export function shopFromSettings(settings: Pick<Settings, 'shopName' | 'phone' | 'address' | 'tinVat'>): PrintShop {
  return {
    name: settings.shopName || 'SalesPulse',
    phone: settings.phone ?? undefined,
    address: settings.address ?? undefined,
    tinVat: settings.tinVat ?? undefined,
  };
}

export function saleToPrintData(sale: Sale, shop: PrintShop): PrintData {
  return {
    saleId: sale.id,
    date: sale.createdAt,
    operatorRole: sale.operatorRole,
    shop,
    items: sale.items.map((i) => ({
      productName: i.productName,
      quantity: i.quantity,
      unitPriceCents: i.unitPriceCents,
      lineTotalCents: i.lineTotalCents,
    })),
    subtotalCents: sale.subtotalCents,
    discountCents: sale.discountCents,
    totalCents: sale.totalCents,
    payments: sale.payments.map((p) => ({ method: p.method, amountCents: p.amountCents })),
    customerName: sale.customerName ?? undefined,
  };
}

export function cartToPrintData(args: {
  saleId: number;
  items: CartPrintItem[];
  discountCents: number;
  totalCents: number;
  paymentMethod: 'cash' | 'transfer' | 'card' | 'credit';
  customerName?: string;
  operatorRole: 'owner' | 'staff';
  shop: PrintShop;
}): PrintData {
  const subtotalCents = args.items.reduce(
    (acc, i) => acc + i.unitPriceCents * i.quantity,
    0
  );
  return {
    saleId: args.saleId,
    date: new Date().toISOString(),
    operatorRole: args.operatorRole,
    shop: args.shop,
    items: args.items.map((i) => ({
      productName: i.name,
      quantity: i.quantity,
      unitPriceCents: i.unitPriceCents,
      lineTotalCents: i.unitPriceCents * i.quantity,
    })),
    subtotalCents,
    discountCents: args.discountCents,
    totalCents: args.totalCents,
    payments: [{ method: args.paymentMethod, amountCents: args.totalCents }],
    customerName: args.customerName,
  };
}
```

- [ ] **Step 2: Verify types**

Run: `npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/print/print-data.ts
git commit -m "feat: add print data mapping helpers"
```

---

### Task 4: Create ReceiptDocument (58mm thermal)

**Files:**
- Create: `src/components/print/ReceiptDocument.tsx`

- [ ] **Step 1: Write the component**

Create `src/components/print/ReceiptDocument.tsx`:

```tsx
'use client';

import { useState, forwardRef } from 'react';
import type { PrintData } from './print-data';
import { formatMoney } from '@/lib/utils';

const RECEIPT_PAGE_STYLE = `
  @page { size: 58mm 210mm; margin: 0; }
  @media print {
    html, body { height: auto !important; overflow: visible !important; margin: 0 !important; padding: 0 !important; }
  }
`;

const ReceiptDocument = forwardRef<HTMLDivElement, { data: PrintData }>(
  function ReceiptDocument({ data }, ref) {
    const [logoBroken, setLogoBroken] = useState(false);
    const fmt = (cents: number) => formatMoney(cents);

    return (
      <div
        ref={ref}
        style={{
          width: '58mm',
          background: '#fff',
          color: '#000',
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '10px',
          lineHeight: 1.35,
          padding: '3mm 2mm',
          boxSizing: 'border-box',
        }}
      >
        <style>{RECEIPT_PAGE_STYLE}</style>

        <div style={{ textAlign: 'center', marginBottom: '2mm' }}>
          {logoBroken ? (
            <div
              style={{
                width: '14mm',
                height: '14mm',
                margin: '0 auto',
                borderRadius: '50%',
                background: '#4f46e5',
                color: '#fff',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '7mm',
              }}
            >
              {data.shop.name.charAt(0).toUpperCase()}
            </div>
          ) : (
            <img
              src="/logo.png"
              alt={data.shop.name}
              onError={() => setLogoBroken(true)}
              style={{ maxHeight: '12mm', maxWidth: '50mm', objectFit: 'contain' }}
            />
          )}
          <div style={{ fontWeight: 700, fontSize: '11px', marginTop: '1mm' }}>
            {data.shop.name}
          </div>
          {data.shop.address && <div>{data.shop.address}</div>}
          {data.shop.phone && <div>{data.shop.phone}</div>}
          {data.shop.tinVat && <div>TIN: {data.shop.tinVat}</div>}
        </div>

        <div style={{ borderTop: '1px dashed #000', margin: '2mm 0', paddingTop: '1mm' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Receipt: #{String(data.saleId).padStart(4, '0')}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Date:</span>
            <span>{new Date(data.date).toLocaleString('en-NG')}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Cashier:</span>
            <span className="capitalize">{data.operatorRole}</span>
          </div>
          {data.customerName && (
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Customer:</span>
              <span>{data.customerName}</span>
            </div>
          )}
        </div>

        <div style={{ borderTop: '1px dashed #000', borderBottom: '1px dashed #000', padding: '1mm 0', margin: '1mm 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
            <span>Item</span>
            <span>Qty x Price</span>
            <span>Amount</span>
          </div>
          {data.items.map((item, idx) => (
            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', gap: '1mm' }}>
              <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {item.productName}
              </span>
              <span style={{ whiteSpace: 'nowrap' }}>
                {item.quantity} x {fmt(item.unitPriceCents)}
              </span>
              <span style={{ whiteSpace: 'nowrap' }}>{fmt(item.lineTotalCents)}</span>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Subtotal</span>
          <span>{fmt(data.subtotalCents)}</span>
        </div>
        {data.discountCents > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Discount</span>
            <span>-{fmt(data.discountCents)}</span>
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '12px' }}>
          <span>TOTAL</span>
          <span>{fmt(data.totalCents)}</span>
        </div>

        <div style={{ borderTop: '1px dashed #000', margin: '2mm 0', paddingTop: '1mm' }}>
          {data.payments.map((p, idx) => (
            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span className="capitalize">{p.method}</span>
              <span>{fmt(p.amountCents)}</span>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: '3mm' }}>
          <div>Thank you for your patronage!</div>
          <div>Powered by SalesPulse</div>
        </div>
      </div>
    );
  }
);

export default ReceiptDocument;
```

Note: Tailwind `capitalize` works because global styles are copied into the print iframe. All critical layout uses inline styles so the 58mm width is exact.

- [ ] **Step 2: Verify types**

Run: `npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/print/ReceiptDocument.tsx
git commit -m "feat: add 58mm thermal receipt document"
```

---

### Task 5: Create InvoiceDocument (A4)

**Files:**
- Create: `src/components/print/InvoiceDocument.tsx`

- [ ] **Step 1: Write the component**

Create `src/components/print/InvoiceDocument.tsx`:

```tsx
'use client';

import { useState, forwardRef } from 'react';
import type { PrintData } from './print-data';
import { formatMoney } from '@/lib/utils';

const INVOICE_PAGE_STYLE = `
  @page { size: A4; margin: 12mm; }
  @media print {
    html, body { height: auto !important; overflow: visible !important; margin: 0 !important; padding: 0 !important; }
  }
`;

const InvoiceDocument = forwardRef<HTMLDivElement, { data: PrintData }>(
  function InvoiceDocument({ data }, ref) {
    const [logoBroken, setLogoBroken] = useState(false);
    const fmt = (cents: number) => formatMoney(cents);

    return (
      <div
        ref={ref}
        style={{
          width: '210mm',
          minHeight: '297mm',
          background: '#fff',
          color: '#000',
          fontFamily: 'Plus Jakarta Sans, Inter, sans-serif',
          padding: '12mm',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <style>{INVOICE_PAGE_STYLE}</style>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #000', paddingBottom: '6mm' }}>
          <div>
            {logoBroken ? (
              <div
                style={{
                  width: '16mm',
                  height: '16mm',
                  borderRadius: '50%',
                  background: '#4f46e5',
                  color: '#fff',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '8mm',
                  marginBottom: '2mm',
                }}
              >
                {data.shop.name.charAt(0).toUpperCase()}
              </div>
            ) : (
              <img
                src="/logo.png"
                alt={data.shop.name}
                onError={() => setLogoBroken(true)}
                style={{ maxHeight: '18mm', maxWidth: '60mm', objectFit: 'contain', marginBottom: '2mm' }}
              />
            )}
            <div style={{ fontSize: '16px', fontWeight: 700 }}>{data.shop.name}</div>
            {data.shop.address && <div>{data.shop.address}</div>}
            {data.shop.phone && <div>{data.shop.phone}</div>}
            {data.shop.tinVat && <div>TIN: {data.shop.tinVat}</div>}
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '26px', fontWeight: 800, letterSpacing: '2px' }}>INVOICE</div>
            <div style={{ marginTop: '3mm' }}>Invoice No: INV-{String(data.saleId).padStart(4, '0')}</div>
            <div>Date: {new Date(data.date).toLocaleDateString('en-NG')}</div>
            <div>Time: {new Date(data.date).toLocaleTimeString('en-NG')}</div>
            <div className="capitalize">Cashier: {data.operatorRole}</div>
          </div>
        </div>

        {data.customerName && (
          <div style={{ border: '1px solid #000', borderRadius: '3mm', padding: '4mm', marginTop: '6mm' }}>
            <div style={{ fontWeight: 700, marginBottom: '1mm' }}>Bill To:</div>
            <div>{data.customerName}</div>
          </div>
        )}

        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '8mm', fontSize: '11px' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #000', textAlign: 'left' }}>
              <th style={{ padding: '2mm' }}>#</th>
              <th style={{ padding: '2mm' }}>Item</th>
              <th style={{ padding: '2mm', textAlign: 'center' }}>Qty</th>
              <th style={{ padding: '2mm', textAlign: 'right' }}>Unit Price</th>
              <th style={{ padding: '2mm', textAlign: 'right' }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((item, idx) => (
              <tr key={idx} style={{ borderBottom: '1px solid #999' }}>
                <td style={{ padding: '2mm' }}>{idx + 1}</td>
                <td style={{ padding: '2mm' }}>{item.productName}</td>
                <td style={{ padding: '2mm', textAlign: 'center' }}>{item.quantity}</td>
                <td style={{ padding: '2mm', textAlign: 'right' }}>{fmt(item.unitPriceCents)}</td>
                <td style={{ padding: '2mm', textAlign: 'right' }}>{fmt(item.lineTotalCents)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ marginLeft: 'auto', width: '70mm', marginTop: '6mm' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1mm 0' }}>
            <span>Subtotal</span>
            <span>{fmt(data.subtotalCents)}</span>
          </div>
          {data.discountCents > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1mm 0' }}>
              <span>Discount</span>
              <span>-{fmt(data.discountCents)}</span>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, borderTop: '2px solid #000', paddingTop: '2mm' }}>
            <span>Total Due</span>
            <span>{fmt(data.totalCents)}</span>
          </div>
        </div>

        <div style={{ marginTop: '8mm' }}>
          <div style={{ fontWeight: 700, marginBottom: '1mm' }}>Payment:</div>
          {data.payments.map((p, idx) => (
            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', maxWidth: '120mm' }}>
              <span className="capitalize">{p.method}</span>
              <span>{fmt(p.amountCents)}</span>
            </div>
          ))}
        </div>

        <div style={{ flex: 1 }} />

        <div style={{ borderTop: '1px solid #999', marginTop: '10mm', paddingTop: '3mm', fontSize: '10px', display: 'flex', justifyContent: 'space-between' }}>
          <span>Thank you for your business.</span>
          <span>Powered by SalesPulse</span>
        </div>
      </div>
    );
  }
);

export default InvoiceDocument;
```

- [ ] **Step 2: Verify types**

Run: `npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/print/InvoiceDocument.tsx
git commit -m "feat: add A4 invoice document"
```

---

### Task 6: Create PrintPreviewDialog

**Files:**
- Create: `src/components/print/PrintPreviewDialog.tsx`

- [ ] **Step 1: Write the component**

Create `src/components/print/PrintPreviewDialog.tsx`:

```tsx
'use client';

import { useRef, useState, useLayoutEffect, useEffect } from 'react';
import { useReactToPrint } from 'react-to-print';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import ReceiptDocument from './ReceiptDocument';
import InvoiceDocument from './InvoiceDocument';
import type { PrintData } from './print-data';

const PAPER_WIDTH_PX = { receipt: 219, invoice: 794 } as const;

interface PrintPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documentType: 'receipt' | 'invoice';
  data: PrintData | null;
  documentTitle: string;
}

export default function PrintPreviewDialog({
  open,
  onOpenChange,
  documentType,
  data,
  documentTitle,
}: PrintPreviewDialogProps) {
  const { toast } = useToast();
  const paperWidth = PAPER_WIDTH_PX[documentType];

  const containerRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [scale, setScale] = useState(1);
  const [contentHeight, setContentHeight] = useState(0);

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => setScale(Math.min(1, el.clientWidth / paperWidth));
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [paperWidth]);

  useEffect(() => {
    if (!data) return;
    const t = setTimeout(() => {
      if (contentRef.current) setContentHeight(contentRef.current.offsetHeight);
    }, 0);
    return () => clearTimeout(t);
  }, [data, documentType]);

  const handlePrint = useReactToPrint({
    contentRef,
    documentTitle: () => documentTitle,
    onAfterPrint: () => onOpenChange(false),
    onPrintError: (_loc, err) => {
      toast({ title: 'Print failed', description: String(err), variant: 'destructive' });
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{documentType === 'receipt' ? 'Receipt Preview' : 'Invoice Preview'}</DialogTitle>
          <DialogDescription>
            Review the {documentType} before printing.
          </DialogDescription>
        </DialogHeader>

        <div
          ref={containerRef}
          className="flex-1 min-h-0 overflow-hidden rounded-lg bg-muted/40 p-6"
        >
          {data ? (
            <div
              className="mx-auto"
              style={{ width: paperWidth * scale, height: Math.max(contentHeight * scale, 1) }}
            >
              <div
                ref={contentRef}
                className="shadow-md"
                style={{
                  width: paperWidth,
                  transform: `scale(${scale})`,
                  transformOrigin: 'top left',
                }}
              >
                {documentType === 'receipt' ? (
                  <ReceiptDocument data={data} />
                ) : (
                  <InvoiceDocument data={data} />
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
              Loading document...
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={() => handlePrint()} disabled={!data}>
            Print {documentType === 'receipt' ? 'Receipt' : 'Invoice'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

- [ ] **Step 2: Verify types**

Run: `npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/print/PrintPreviewDialog.tsx
git commit -m "feat: add print preview dialog with scale-to-fit"
```

---

### Task 7: Auto-open receipt preview after POS checkout

**Files:**
- Modify: `src/app/(dashboard)/pos/page.tsx:47-55` (add state), `:161-169` (checkout handler), `:438-518` (render dialog)

- [ ] **Step 1: Add imports and state**

In `src/app/(dashboard)/pos/page.tsx`, add imports after the existing type import (line 45):

```tsx
import PrintPreviewDialog from '@/components/print/PrintPreviewDialog';
import { cartToPrintData, shopFromSettings } from '@/components/print/print-data';
import type { PrintData } from '@/components/print/print-data';
```

Add state after `selectedCustomerId` (line 67):

```tsx
  const [lastSale, setLastSale] = useState<{ data: PrintData } | null>(null);
```

- [ ] **Step 2: Update the checkout handler**

Replace `handleCheckout` (lines 146-169) with:

```tsx
  const handleCheckout = () => {
    if (cart.length === 0) return;
    if (paymentMethod === 'credit' && !selectedCustomerId) {
      toast({ title: 'Select a customer for credit sales', variant: 'destructive' });
      return;
    }

    const payload: SaleInput = {
      items: cart.map(i => ({ productId: i.productId, quantity: i.quantity })),
      payments: [{ method: paymentMethod, amountCents: total }],
      discountCents: discountCents || undefined,
      customerId: paymentMethod === 'credit' ? selectedCustomerId || undefined : undefined,
      sessionId: todaySession?.id,
    };

    createSale.mutate(payload).then((res) => {
      toast({ title: 'Sale completed successfully!' });
      const customerName =
        paymentMethod === 'credit'
          ? customers?.find(c => c.id === selectedCustomerId)?.name
          : undefined;
      setLastSale({
        data: cartToPrintData({
          saleId: res.id,
          items: cart,
          discountCents,
          totalCents: total,
          paymentMethod,
          customerName,
          operatorRole: settings?.activeRole === 'attendant' ? 'staff' : 'owner',
          shop: shopFromSettings(settings ?? { shopName: 'SalesPulse' }),
        }),
      });
      setCart([]);
      setDiscountCents(0);
      setCheckoutOpen(false);
    }).catch((err) => {
      toast({ title: 'Failed to complete sale', description: String(err), variant: 'destructive' });
    });
  };
```

To make `shopFromSettings` accept a partial fallback cleanly (no type cast), change its signature in `src/components/print/print-data.ts` (Task 3 output) to accept only the fields it reads:

```ts
export function shopFromSettings(settings: Pick<Settings, 'shopName' | 'phone' | 'address' | 'tinVat'>): PrintShop {
  return {
    name: settings.shopName || 'SalesPulse',
    phone: settings.phone ?? undefined,
    address: settings.address ?? undefined,
    tinVat: settings.tinVat ?? undefined,
  };
}
```

Then `settings ?? { shopName: 'SalesPulse' }` type-checks because the fallback object satisfies the `Pick<...>` shape.

- [ ] **Step 3: Render the preview dialog**

At the end of the returned JSX, after the checkout `Dialog` (after line 518), add:

```tsx
      <PrintPreviewDialog
        open={!!lastSale}
        onOpenChange={(open) => { if (!open) setLastSale(null); }}
        documentType="receipt"
        data={lastSale?.data ?? null}
        documentTitle={`Receipt-${String(lastSale?.data.saleId ?? 0).padStart(4, '0')}`}
      />
```

- [ ] **Step 4: Verify types**

Run: `npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 5: Commit**

```bash
git add "src/app/(dashboard)/pos/page.tsx"
git commit -m "feat: auto-open receipt preview after POS checkout"
```

---

### Task 8: Receipt & Invoice buttons in Sales Logs

**Files:**
- Modify: `src/app/(dashboard)/sales/page.tsx`

- [ ] **Step 1: Add imports and helper component**

In `src/app/(dashboard)/sales/page.tsx`, extend imports (after line 36):

```tsx
import { Printer, FileText } from 'lucide-react';
import PrintPreviewDialog from '@/components/print/PrintPreviewDialog';
import { saleToPrintData, shopFromSettings } from '@/components/print/print-data';
import { useGetSettings } from '@/lib/hooks';
import { useMemo } from 'react';
```

Add a `SalePrintDialog` component after the imports (before the `Sales` component):

```tsx
function SalePrintDialog({
  type,
  saleId,
  onClose,
}: {
  type: 'receipt' | 'invoice';
  saleId: number;
  onClose: () => void;
}) {
  const { data: sale, isLoading } = useGetSale(saleId);
  const { data: settings } = useGetSettings();

  const data = useMemo(() => {
    if (!sale || !settings) return null;
    return saleToPrintData(sale, shopFromSettings(settings));
  }, [sale, settings]);

  return (
    <PrintPreviewDialog
      open
      onOpenChange={(open) => { if (!open) onClose(); }}
      documentType={type}
      data={isLoading ? null : data}
      documentTitle={`${type === 'receipt' ? 'Receipt' : 'Invoice'}-${String(saleId).padStart(4, '0')}`}
    />
  );
}
```

- [ ] **Step 2: Add state in the Sales component**

In the `Sales` function, after `voidReason` state (line 45):

```tsx
  const [printTarget, setPrintTarget] = useState<{ type: 'receipt' | 'invoice'; saleId: number } | null>(null);
```

- [ ] **Step 3: Add action buttons to the table**

In the Actions `TableCell` (lines 170-181), render the new buttons next to the Void button. Replace the Actions cell content with:

```tsx
                    <TableCell className="text-right">
                      {sale.status === 'completed' && (
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setPrintTarget({ type: 'receipt', saleId: sale.id })}
                            className="h-8 px-2"
                          >
                            <Printer className="w-4 h-4 mr-1" /> Receipt
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setPrintTarget({ type: 'invoice', saleId: sale.id })}
                            className="h-8 px-2"
                          >
                            <FileText className="w-4 h-4 mr-1" /> Invoice
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setVoidSaleId(sale.id)}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 px-2"
                          >
                            <Ban className="w-4 h-4 mr-1" /> Void
                          </Button>
                        </div>
                      )}
                    </TableCell>
```

- [ ] **Step 4: Render the print dialog**

After the void `Dialog` (after line 220), add:

```tsx
      {printTarget && (
        <SalePrintDialog
          type={printTarget.type}
          saleId={printTarget.saleId}
          onClose={() => setPrintTarget(null)}
        />
      )}
```

- [ ] **Step 5: Verify types**

Run: `npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 6: Commit**

```bash
git add "src/app/(dashboard)/sales/page.tsx"
git commit -m "feat: add receipt and invoice print buttons to sales logs"
```

---

### Task 9: Logo asset and final verification

**Files:**
- Create: `public/logo.png` (user-provided; optional)

- [ ] **Step 1: Request the logo**

Ask the user to place their SalesPulse logo at `public/logo.png`. Until it exists, both documents render the shop-name initial as a circular fallback (no broken image). If the user provides the logo, add it and commit:

```bash
git add public/logo.png
git commit -m "chore: add SalesPulse logo"
```

- [ ] **Step 2: Run lint**

Run: `npm run lint`
Expected: No errors.

- [ ] **Step 3: Run type check**

Run: `npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 4: Manual smoke test**

Start the dev server (`npm run dev`), then in the browser:

1. Complete a sale in the POS. Confirm the Receipt Preview dialog auto-opens showing the 58mm receipt. Click Print → verify the print preview sizes at 58mm × 210mm. Click Cancel → dialog closes, cart is cleared, sale is recorded.
2. Open Sales Logs. On a completed sale, click **Receipt** → preview shows 58mm document. Click **Invoice** → preview shows A4 document. Print both.
3. Confirm the Void action still works.
4. In Settings, set phone/address/TIN-VAT, save, and confirm they appear on both documents.
5. If `public/logo.png` is present, confirm it renders on both; otherwise confirm the fallback initial shows.

- [ ] **Step 5: Final commit (if anything changed during verification)**

```bash
git add -A
git commit -m "chore: finalize receipt and invoice printing"
```
