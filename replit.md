# ShopPulse

An offline-first, secure digital ledger and POS (point-of-sale) system for small-to-medium retail shops — sales, inventory, debt/credit tracking, expenses, and AI-powered business reports.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server
- `pnpm --filter @workspace/shoppulse run dev` — run the frontend
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec (`lib/api-spec/openapi.yaml`)
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/db run seed` — seed minimal example data (categories, products, one customer)
- Required env: `DATABASE_URL` (provisioned automatically), `GEMINI_API_KEY` (user-supplied, powers AI Business Reports)

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite + Tailwind + shadcn/ui, `wouter` routing, TanStack Query
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod, `drizzle-zod`
- API codegen: Orval (React Query hooks + Zod schemas generated from `lib/api-spec/openapi.yaml`)
- AI: Google Gemini, called directly from the server with a user-supplied `GEMINI_API_KEY` (see Architecture decisions)

## Where things live

- `lib/api-spec/openapi.yaml` — source of truth for the entire API contract (endpoints, request/response shapes)
- `lib/db/src/schema/` — Drizzle table definitions (settings, categories, products, stock movements, customers, ledger entries, sales, sale items/payments, expenses, ai reports)
- `artifacts/api-server/src/routes/` — one router file per domain, implementing the OpenAPI contract
- `artifacts/api-server/src/lib/` — shared helpers: `settings.ts` (active-role singleton), `roleView.ts` (cost-price hiding), `sales.ts` (sale hydration), `gemini.ts` (direct Gemini API client)
- `artifacts/shoppulse/src/pages/` — one file per app page (dashboard, pos, sales, inventory, customers, expenses, reports, settings)
- `artifacts/shoppulse/src/components/layout.tsx` — sidebar nav shell

## Architecture decisions

- **Original spec asked for Next.js + local SQLite.** This platform's artifact system doesn't support that combo, so the app was built as a react-vite frontend + the monorepo's shared Express API server, with Postgres/Drizzle as the source of truth instead of local SQLite. Backup/restore fulfills the spirit of "local file" via JSON export/import over the API rather than a literal SQLite file.
- **No per-user login.** Owner/Attendant is a single, shared, server-side "active role" switch (`settings.activeRole`), not authentication — this matches the spec's single shared shop device model. Switching role is a Settings action, not a sign-in flow.
- **Role-based field hiding happens server-side, not just in the UI.** When `activeRole` is `attendant`, the API nulls out `costPriceCents` and `todayProfitCents` before the response ever leaves the server (see `roleView.ts` and `dashboard.ts`). The frontend treats a `null` value as "hidden" and omits that UI entirely, per spec ("hidden entirely, not just visually collapsed").
- **All money is integer cents** end-to-end (DB, API, frontend), never floats, to avoid decimal drift.
- **Gemini is called directly with a user-supplied `GEMINI_API_KEY`**, not through Replit's managed AI integration — that integration requires an account upgrade the user declined. `artifacts/api-server/src/lib/gemini.ts` calls the Generative Language API directly server-side; only anonymized, aggregated 7-day telemetry (no customer names/PII) is sent as the prompt.
- **Void of a sale is owner-only and reverses side effects**, not a soft-hide: it restocks inventory, reverses any credit ledger entry, and keeps the sale visible with a `voided` status and required reason — auditable, never destructive.

## Product

- **Overview dashboard** — today's revenue, active debt, monthly expenses, today's profit (owner-only), 7-day revenue chart, low-stock alerts, recent sales.
- **POS Terminal** — searchable product catalog, cart, discounts, split payments (cash/transfer/card/credit), credit sales require picking a customer.
- **Sales Logs** — searchable/filterable history; owner can void with a required reason.
- **Stock & Inventory** — product CRUD, categories, restock deliveries, stock corrections with required reason, per-product movement history.
- **Debt & Credit Ledger** — customer registry, balances, ledger history, record payments.
- **Shop Expenses** — categorized expense tracking (rent/power/staff/transport/logistics/other).
- **AI Business Reports** (owner-only) — Gemini-generated plain-language analysis from anonymized weekly telemetry, with history.
- **Settings** — shop identity, role labels, active-role switch, low-stock threshold, JSON backup export/import.

## User preferences

_None recorded yet._

## Gotchas

- Running any script under `lib/db/src/*.ts` directly with `node` fails on internal extensionless imports (`./schema`, `./index`) — use `tsx` (already a root devDependency) instead of raw `node --experimental-strip-types`.
- `vite build` for `artifacts/shoppulse` requires the `PORT` env var to be set (read at config-load time) — this is expected in production/deployment, not a bug.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
