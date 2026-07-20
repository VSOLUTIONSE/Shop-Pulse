# Clerk Authentication & RBAC Design

## Overview

Add Clerk authentication with role-based access control (RBAC) to SalesPulse. Two roles: **Owner** (full access) and **Staff** (POS + inventory + customers only). Uses Clerk session token claims for role data — no external database needed.

## Auth Setup

- **Package**: `@clerk/nextjs`
- **Root layout**: `<ClerkProvider>` inside `<body>` with shadcn theme
- **Environment variables**: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` + `CLERK_SECRET_KEY` via Keyless or Clerk Dashboard
- **Middleware**: Protected-first — all routes protected by default, only `/sign-in` is public
- **Sign-in page**: `src/app/sign-in/page.tsx` with Clerk's `<SignIn />` component, centered card layout, shadcn-styled; redirects to `/` after sign-in

## Session Token Customization

In Clerk Dashboard → Sessions → Customize session token:

```json
{ "metadata": "{{user.public_metadata}}" }
```

## Type Definitions

Create `types/globals.d.ts`:

```ts
export type Roles = 'owner' | 'staff'

declare global {
  interface CustomJwtSessionClaims {
    metadata: {
      role?: Roles
    }
  }
}
```

## Permissions Matrix

| Feature | Owner | Staff |
|---------|-------|-------|
| POS Terminal | ✅ | ✅ |
| Sales Logs | ✅ (sees cost/profit) | ✅ (no cost/profit) |
| Inventory | ✅ (sees cost prices) | ✅ (view + edit stock, no cost prices) |
| Customers | ✅ | ✅ |
| Expenses | ✅ | ❌ |
| AI Reports | ✅ | ❌ |
| Settings | ✅ | ❌ |
| Overview | ✅ (full data) | ✅ (no expenses, no profit/cost data) |
| Void Sales | ✅ | ✅ |

## Role-Based UI

**Sidebar** (`src/components/layout.tsx`): read `auth().sessionClaims.metadata.role` and hide Expenses, Reports, Settings items + ChatWidget for staff users.

**Route protection** — redirect staff from:
- `/expenses` → `/`
- `/reports` → `/`
- `/settings` → `/`

**Open routes** for both roles:
- `/pos` — POS terminal
- `/inventory` — product listing (view + edit stock, cost prices hidden for staff)
- `/customers` — customer lookup
- `/sales` — sale history (cost/profit columns hidden for staff)

**Overview page** (`/`): staff sees today's sales, top products, recent sales. Chart shows sales history (not profit). Expenses section and profit margin data hidden.

**ChatWidget**: only renders for owner.

## Account Management

Accounts created and roles assigned via Clerk Dashboard (Users → public metadata → `{ "role": "owner" | "staff" }`). No self sign-up. No in-app user management.
