# SalesPulse: Vite-to-Next.js 16 Migration Design

## Goal
Extract SalesPulse from the Replit pnpm monorepo (Vite+React+Express+Drizzle) into a standalone Next.js 16 App Router application with a mock data service layer, preserving all visual output and behavior exactly.

## What we keep
- All 9 pages: Dashboard, POS, Sales, Inventory, Customers, Expenses, Reports, Settings, 404
- AppLayout sidebar navigation shell
- All 60+ shadcn/ui components (exact copy)
- All hooks: use-toast, use-mobile
- lib/utils: cn, formatMoney, formatDate, formatShortDate
- CSS theme (Tailwind v4, Plus Jakarta Sans + JetBrains Mono, CSS variables)
- All 42 Zod-generated TypeScript interfaces from lib/api-zod

## What we remove
- mockup-sandbox
- Express API server (artifacts/api-server)
- Drizzle DB schema + connection (lib/db)
- OpenAPI spec + Orval codegen (lib/api-spec, lib/api-client-react)
- Replit config files (.replit, .replitignore, replit.md)
- pnpm workspace config (pnpm-workspace.yaml, pnpm-lock.yaml, .npmrc)
- lib/integrations

## Architecture

```
shop-pulse/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root layout: fonts, html/body, providers
│   ├── (dashboard)/              # Route group — sidebar layout
│   │   ├── layout.tsx            # AppLayout wrapper
│   │   ├── page.tsx              # Dashboard
│   │   ├── pos/page.tsx
│   │   ├── sales/page.tsx
│   │   ├── inventory/page.tsx
│   │   ├── customers/page.tsx
│   │   ├── expenses/page.tsx
│   │   ├── reports/page.tsx
│   │   └── settings/page.tsx
│   └── not-found.tsx
├── components/
│   ├── ui/                       # shadcn/ui (60+ components)
│   └── layout.tsx                # AppLayout sidebar
├── hooks/
│   ├── use-toast.ts
│   └── use-mobile.tsx
├── lib/
│   ├── utils.ts                  # cn, formatMoney, formatDate
│   ├── mock-data.ts              # Realistic mock data for all domains
│   └── api.ts                    # Async mock service layer
├── types/                        # Zod-generated interfaces
│   ├── index.ts
│   └── *.ts (42 files)
├── public/
├── package.json
├── next.config.ts
├── tsconfig.json
├── postcss.config.mjs
└── AGENTS.md
```

## Routing conversion
| wouter (original) | Next.js App Router |
|---|---|
| `<Route path="/" component={Dashboard} />` | `app/(dashboard)/page.tsx` |
| `<Route path="/pos" component={POS} />` | `app/(dashboard)/pos/page.tsx` |
| `<Route path="/sales" ...>` | `app/(dashboard)/sales/page.tsx` |
| `<Route path="/inventory" ...>` | `app/(dashboard)/inventory/page.tsx` |
| `<Route path="/customers" ...>` | `app/(dashboard)/customers/page.tsx` |
| `<Route path="/expenses" ...>` | `app/(dashboard)/expenses/page.tsx` |
| `<Route path="/reports" ...>` | `app/(dashboard)/reports/page.tsx` |
| `<Route path="/settings" ...>` | `app/(dashboard)/settings/page.tsx` |
| `<Route component={NotFound} />` | `app/not-found.tsx` |
| wouter `<Link>` | `next/link` `<Link>` |
| wouter `useLocation()` | `usePathname()` + `useRouter()` from `next/navigation` |

## Mock data service
- Single lib/api.ts file with async functions matching the current TanStack Query hook shapes
- Each function returns realistic mock data with ~100ms simulated delay
- Covers: dashboard summary, products CRUD, sales CRUD, customers, expenses, categories, settings, AI reports, backup
- All data conforms to the Zod-generated TypeScript interfaces
- Easy to swap for Convex later: just replace the function bodies

## Providers
- QueryClientProvider (TanStack React Query) — moved to `app/layout.tsx` as a client component wrapper
- TooltipProvider
- Toaster (sonner)

## Step order
1. Scaffold Next.js 16 app via `create-next-app`
2. Copy all shadcn/ui components and hooks
3. Copy and adapt lib/utils.ts
4. Copy all Zod types
5. Write mock data + API service layer
6. Convert App.tsx → app/layout.tsx + app/(dashboard)/layout.tsx
7. Convert each page from wouter to App Router
8. Convert layout.tsx sidebar (wouter Link → next/link)
9. Remove old monorepo files
10. Build + verify
