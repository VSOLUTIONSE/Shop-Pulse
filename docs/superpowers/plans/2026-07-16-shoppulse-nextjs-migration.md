# SalesPulse → Next.js 16 Migration Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extract SalesPulse from the Replit pnpm monorepo into a standalone Next.js 16 App Router app with mock data.

**Architecture:** Single Next.js 16 app using App Router. All pages become route groups under `app/(dashboard)/`. Mock async API service replaces Express + TanStack Query calls. shadcn/ui components and CSS theme kept 1:1.

**Tech Stack:** Next.js 16, TypeScript 5, Tailwind CSS v4, shadcn/ui, TanStack Query, recharts, lucide-react, framer-motion

---

### Task 1: Scaffold Next.js 16 app

**Files:**
- Create: `shop-pulse-next/` directory (temp location for scaffold)

- [ ] **Step 1: Scaffold Next.js 16**

```bash
npx create-next-app@latest shop-pulse-next --yes
```

- [ ] **Step 2: Verify scaffold works**

```bash
cd shop-pulse-next
npm run build
```

Expected: Build succeeds, output in `build/` or `.next/`

---

### Task 2: Set up directory structure and copy shared files

**Files:**
- Create: `shop-pulse-next/src/components/ui/`
- Create: `shop-pulse-next/src/hooks/`
- Create: `shop-pulse-next/src/lib/`
- Create: `shop-pulse-next/src/types/`
- Copy: from original repo

- [ ] **Step 1: Create directory structure**

```bash
mkdir -p shop-pulse-next/src/components/ui
mkdir -p shop-pulse-next/src/hooks
mkdir -p shop-pulse-next/src/lib
mkdir -p shop-pulse-next/src/types
mkdir -p shop-pulse-next/public
```

- [ ] **Step 2: Copy shadcn/ui components**

Copy all files from `artifacts/shoppulse/src/components/ui/` to `shop-pulse-next/src/components/ui/`

- [ ] **Step 3: Copy hooks**

Copy `use-toast.ts` and `use-mobile.tsx` from `artifacts/shoppulse/src/hooks/`

- [ ] **Step 4: Copy utils**

Copy `artifacts/shoppulse/src/lib/utils.ts` to `shop-pulse-next/src/lib/utils.ts`

- [ ] **Step 5: Copy types from lib/api-zod**

Copy all files from `lib/api-zod/src/generated/types/` to `shop-pulse-next/src/types/`
Copy `lib/api-zod/src/generated/api.ts` to `shop-pulse-next/src/types/api-schemas.ts`

---

### Task 3: Install additional dependencies

**Files:**
- Modify: `shop-pulse-next/package.json`

- [ ] **Step 1: Install required packages**

```bash
cd shop-pulse-next
npm install @tanstack/react-query recharts lucide-react framer-motion sonner class-variance-authority clsx tailwind-merge
```

- [ ] **Step 2: Install Radix UI deps (list from shadcn components)**

Based on components used: accordion, alert-dialog, avatar, badge, button, card, checkbox, collapsible, command, dialog, dropdown-menu, form, input, label, menubar, popover, progress, radio-group, scroll-area, select, separator, sheet, skeleton, slider, switch, table, tabs, textarea, toast, toggle, tooltip

```bash
npm install @radix-ui/react-accordion @radix-ui/react-alert-dialog @radix-ui/react-avatar @radix-ui/react-checkbox @radix-ui/react-collapsible @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-label @radix-ui/react-menubar @radix-ui/react-popover @radix-ui/react-progress @radix-ui/react-radio-group @radix-ui/react-scroll-area @radix-ui/react-select @radix-ui/react-separator @radix-ui/react-sheet @radix-ui/react-slider @radix-ui/react-switch @radix-ui/react-tabs @radix-ui/react-textarea @radix-ui/react-toast @radix-ui/react-toggle @radix-ui/react-tooltip @radix-ui/react-slot @radix-ui/react-navigation-menu
```

---

### Task 4: Create mock data service

**Files:**
- Create: `shop-pulse-next/src/lib/mock-data.ts`

- [ ] **Step 1: Write mock data file with realistic data for all domains**

This creates mock data for every entity type matching the Zod-generated TypeScript interfaces. Covers: settings, categories, products, customers, sales, expenses, dashboard summary, AI reports.

- [ ] **Step 2: Write types/index.ts barrel**

Re-export all types from the `types/` directory for easy importing.

---

### Task 5: Create API service layer

**Files:**
- Create: `shop-pulse-next/src/lib/api.ts`

- [ ] **Step 1: Write mock API service**

Each function is async with ~100ms artificial delay, returning mock data matching the expected shape. Functions map 1:1 to the current TanStack Query hooks:

- `getSettings()` / `updateSettings()`
- `listCategories()` / `createCategory()` / `deleteCategory()`
- `listProducts()` / `getProduct()` / `createProduct()` / `updateProduct()` / `restockProduct()` / `correctProductStock()` / `listProductMovements()`
- `listCustomers()` / `getCustomer()` / `createCustomer()` / `recordCustomerPayment()`
- `listSales()` / `getSale()` / `createSale()` / `voidSale()`
- `listExpenses()` / `createExpense()` / `deleteExpense()`
- `getDashboardSummary()`
- `listAiReports()` / `generateAiReport()`
- `exportBackup()` / `importBackup()`

---

### Task 6: Create custom hooks (TanStack Query wrappers)

**Files:**
- Create: `shop-pulse-next/src/lib/hooks.ts`

- [ ] **Step 1: Write React Query hooks**

Replace the generated `@workspace/api-client-react` hooks with our own using the mock API service. Each hook uses `useQuery` or `useMutation` calling the corresponding mock API function.

Export hooks with identical names and signatures so page components need minimal changes:
- `useGetSettings`, `useUpdateSettings`
- `useListProducts`, `useCreateProduct`, `useUpdateProduct`, `useRestockProduct`, `useCorrectProductStock`
- `useListCategories`, `useCreateCategory`, `useDeleteCategory`
- `useListCustomers`, `useGetCustomer`, `useCreateCustomer`, `useRecordCustomerPayment`
- `useListSales`, `useGetSale`, `useCreateSale`, `useVoidSale`
- `useListExpenses`, `useCreateExpense`, `useDeleteExpense`
- `useGetDashboardSummary`
- `useListAiReports`, `useGenerateAiReport`
- `useExportBackup`, `useImportBackup`

Also export `getListProductsQueryKey` etc for `invalidateQueries`.

---

### Task 7: Convert App.tsx → app/layout.tsx root layout

**Files:**
- Modify: `shop-pulse-next/src/app/layout.tsx`
- Create: `shop-pulse-next/src/app/providers.tsx` (client component wrapper)

- [ ] **Step 1: Create providers client component**

```tsx
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/sonner';
import { useState } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        {children}
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
```

- [ ] **Step 2: Write root layout.tsx**

Root layout includes fonts (Plus Jakarta Sans, JetBrains Mono via next/font), imports `@/index.css`, wraps children in `<Providers>`, sets html lang.

---

### Task 8: Convert layout sidebar (wouter → next/link)

**Files:**
- Create: `shop-pulse-next/src/components/layout.tsx`
- Create: `shop-pulse-next/src/app/(dashboard)/layout.tsx`

- [ ] **Step 1: Rewrite layout.tsx to use Next.js navigation**

Replace:
- `import { Link, useLocation } from 'wouter'` → `import Link from 'next/link'` + `import { usePathname } from 'next/navigation'`
- `useLocation()` → `usePathname()`
- `<Link href={item.href}>` → `<Link href={item.href}>` (same)
- `useGetSettings()` stays the same (our mock hook)

- [ ] **Step 2: Create app/(dashboard)/layout.tsx**

Import `AppLayout` and wrap children:

```tsx
import { AppLayout } from '@/components/layout';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <AppLayout>{children}</AppLayout>;
}
```

---

### Task 9: Convert pages — Dashboard, POS, Sales

**Files:**
- Create: `shop-pulse-next/src/app/(dashboard)/page.tsx`
- Create: `shop-pulse-next/src/app/(dashboard)/pos/page.tsx`
- Create: `shop-pulse-next/src/app/(dashboard)/sales/page.tsx`
- Create: `shop-pulse-next/src/app/not-found.tsx`

- [ ] **Step 1: Dashboard page**

Copy from `artifacts/shoppulse/src/pages/dashboard.tsx`, change:
- `import { Link } from 'wouter'` → `import Link from 'next/link'`
- All `@workspace/api-client-react` imports → `@/lib/hooks`
- The `Link` component usage stays mostly same

- [ ] **Step 2: POS page**

Copy from `artifacts/shoppulse/src/pages/pos.tsx`, change:
- All hook imports to `@/lib/hooks`
- Add `'use client'` directive at top (POS is interactive)
- Remove the local `Package` SVG fallback (already imported from lucide)

- [ ] **Step 3: Sales page**

Copy from `artifacts/shoppulse/src/pages/sales.tsx`, change:
- All hook imports to `@/lib/hooks`
- Add `'use client'` directive

- [ ] **Step 4: Not-found page**

Copy from `artifacts/shoppulse/src/pages/not-found.tsx` → `app/not-found.tsx`

---

### Task 10: Convert pages — Inventory, Customers, Expenses

**Files:**
- Create: `shop-pulse-next/src/app/(dashboard)/inventory/page.tsx`
- Create: `shop-pulse-next/src/app/(dashboard)/customers/page.tsx`
- Create: `shop-pulse-next/src/app/(dashboard)/expenses/page.tsx`

- [ ] **Step 1: Inventory page**

Copy from `artifacts/shoppulse/src/pages/inventory.tsx`, change:
- All hook imports to `@/lib/hooks`
- Add `'use client'` directive

- [ ] **Step 2: Customers page**

Copy from `artifacts/shoppulse/src/pages/customers.tsx`, change:
- All hook imports to `@/lib/hooks`
- Add `'use client'` directive

- [ ] **Step 3: Expenses page**

Copy from `artifacts/shoppulse/src/pages/expenses.tsx`, change:
- All hook imports to `@/lib/hooks`
- Add `'use client'` directive

---

### Task 11: Convert pages — Reports, Settings

**Files:**
- Create: `shop-pulse-next/src/app/(dashboard)/reports/page.tsx`
- Create: `shop-pulse-next/src/app/(dashboard)/settings/page.tsx`

- [ ] **Step 1: Reports page**

Copy from `artifacts/shoppulse/src/pages/reports.tsx`, change:
- All hook imports to `@/lib/hooks`
- Add `'use client'` directive

- [ ] **Step 2: Settings page**

Copy from `artifacts/shoppulse/src/pages/settings.tsx`, change:
- All hook imports to `@/lib/hooks`
- Add `'use client'` directive

---

### Task 12: Copy CSS and configure Tailwind

**Files:**
- Modify: `shop-pulse-next/src/app/globals.css` (or create `shop-pulse-next/src/index.css`)
- Modify: `shop-pulse-next/postcss.config.mjs`
- Modify: `shop-pulse-next/next.config.ts`

- [ ] **Step 1: Copy index.css**

Copy `artifacts/shoppulse/src/index.css` content into `shop-pulse-next/src/index.css` (replaces default globals.css)

- [ ] **Step 2: Update import in layout.tsx**

Root layout should import `@/index.css` instead of `globals.css`

- [ ] **Step 3: Configure next.config.ts**

Add image config, env vars support, etc.

---

### Task 13: Remove old monorepo files and finalize

**Files:**
- Delete: all old monorepo files and folders not needed

- [ ] **Step 1: Remove old monorepo files**

Remove: `.replit`, `.replitignore`, `replit.md`, `pnpm-workspace.yaml`, `pnpm-lock.yaml`, `.npmrc`, `lib/`, `artifacts/` (everything except what's in `shop-pulse-next/`)

- [ ] **Step 2: Move shop-pulse-next/* to root**

Move all contents of `shop-pulse-next/` up to `C:\Users\user\Desktop\Shop-Pulse\`

- [ ] **Step 3: Build and verify**

```bash
npm run build
```

Expected: Build succeeds with no errors. All pages compile.

- [ ] **Step 4: Run typecheck**

```bash
npx tsc --noEmit
```

Expected: No TypeScript errors.

---

### Task 14: Final smoke test

- [ ] **Step 1: Start dev server**

```bash
npm run dev
```

- [ ] **Step 2: Verify pages load**

Visit `/`, `/pos`, `/sales`, `/inventory`, `/customers`, `/expenses`, `/reports`, `/settings` — all render without errors.

- [ ] **Step 3: Commit**

```bash
git add .
git commit -m "feat: migrate SalesPulse from Vite monorepo to Next.js 16 App Router"
```
