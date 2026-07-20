# Clerk Auth & RBAC Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Clerk authentication with 2-role RBAC (Owner/Staff) to SalesPulse, replacing the current `activeRole` settings toggle.

**Architecture:** Clerk handles user auth + session management. The user's role is stored in Clerk's `public_metadata` (set via Clerk Dashboard). Client components read the role from Clerk session claims via a `useRole()` hook. Server-side middleware protects routes. Convex auth config bridges Clerk identity to Convex functions. No separate DB users table.

**Tech Stack:** `@clerk/nextjs`, `convex/react-clerk`, Next.js 16 App Router, Convex

---

## File Structure

```
Create:
  convex/auth.config.ts              — Clerk auth provider config for Convex
  src/types/globals.d.ts             — Clerk session claim types
  src/middleware.ts                   — Route protection middleware
  src/app/sign-in/[[...sign-in]]/page.tsx — Sign-in page
  src/hooks/use-role.ts              — Client-side role hook

Modify:
  src/components/convex-provider.tsx — Switch to ConvexProviderWithClerk
  src/app/layout.tsx                — Add ClerkProvider wrapper
  src/app/providers.tsx             — Keep as-is (no change needed)
  src/types/index.ts                — Update Role type (attendant → staff)
  src/components/layout.tsx         — Read role from Clerk instead of settings
  src/components/chat-widget.tsx    — Read role from Clerk instead of settings
  src/app/(dashboard)/page.tsx      — Read role from Clerk instead of settings
  src/app/(dashboard)/inventory/page.tsx — Read role from Clerk instead of settings
  src/app/(dashboard)/sales/page.tsx    — Allow void for all roles
  src/app/(dashboard)/expenses/page.tsx — Add owner-only server redirect
  src/app/(dashboard)/reports/page.tsx  — Add owner-only server redirect
  src/app/(dashboard)/settings/page.tsx — Remove activeRole toggle
  convex/schema.ts                    — Update operatorRole permissible values
  src/lib/hooks.ts                   — Remove activeRole from update mutation type
```

---

### Task 1: Install Clerk & Set Environment Variables

**Files:**
- Modify: `package.json` (dependency added by npm)
- Create: `.env.local` keys (auto-generated via Keyless)

- [ ] **Step 1: Install Clerk packages**

```bash
npm install @clerk/nextjs
```

Expected: Packages added to `package.json` dependencies.

- [ ] **Step 2: Install Convex Clerk integration**

```bash
npm install convex/react-clerk
```

Expected: No errors. Note — this package may be auto-included with `convex` already.

- [ ] **Step 3: Run the dev server to trigger Keyless**

```bash
npm run dev
```

Stop the server after Keyless keys are generated (check for auto-created `.env.local` entries). If Keyless doesn't trigger, get keys from [dashboard.clerk.com](https://dashboard.clerk.com/~/api-keys) and add:

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json .env.local
git commit -m "feat: add @clerk/nextjs dependency"
```

---

### Task 2: Convex Auth Config & Provider Update

**Files:**
- Create: `convex/auth.config.ts`
- Modify: `src/components/convex-provider.tsx`

- [ ] **Step 1: Create convex/auth.config.ts**

```ts
export default {
  providers: [
    {
      domain: process.env.CLERK_JWT_ISSUER_DOMAIN!,
      applicationID: "convex",
    },
  ],
};
```

Note: `CLERK_JWT_ISSUER_DOMAIN` comes from Clerk Dashboard → API Keys → JWT Issuer Domain (e.g., `https://your-clerk-domain.clerk.accounts.dev`). Look it up after Clerk setup and add to `.env.local`:

```
CLERK_JWT_ISSUER_DOMAIN=https://<your-domain>.clerk.accounts.dev
```

- [ ] **Step 2: Create or update convex/auth.config.js if needed**

Check if Convex's codegen requires a `.js` extension. The `.ts` extension should work. If not, create both.

- [ ] **Step 3: Update ConvexClientProvider**

Replace `src/components/convex-provider.tsx` with:

```tsx
"use client";

import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ConvexReactClient } from "convex/react";
import { ClerkProvider, useAuth } from "@clerk/nextjs";
import type { ReactNode } from "react";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider>
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        {children}
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}
```

- [ ] **Step 4: Run Convex codegen**

```bash
npx convex dev
```

Expected: Codegen succeeds, `convex/_generated/` includes auth-related helpers.

- [ ] **Step 5: Commit**

```bash
git add convex/auth.config.ts src/components/convex-provider.tsx convex/auth.config.js convex/_generated/
git commit -m "feat: configure Convex Clerk auth provider"
```

---

### Task 3: Type Definitions

**Files:**
- Create: `src/types/globals.d.ts`

- [ ] **Step 1: Create globals.d.ts**

```ts
export type Roles = 'owner' | 'staff';

declare global {
  interface CustomJwtSessionClaims {
    metadata: {
      role?: Roles;
    };
  }
}
```

- [ ] **Step 2: Update existing Role type**

In `src/types/index.ts`, change:

```ts
export const Role = { owner: 'owner', attendant: 'attendant' } as const;
export type Role = (typeof Role)[keyof typeof Role];
```

To:

```ts
export const Role = { owner: 'owner', staff: 'staff' } as const;
export type Role = (typeof Role)[keyof typeof Role];
```

- [ ] **Step 3: Create client-side useRole hook**

Create `src/hooks/use-role.ts`:

```ts
import { useSession } from '@clerk/nextjs';

export function useRole() {
  const { session, isSignedIn, isLoaded } = useSession();

  const role = (session?.publicMetadata?.role ?? 'staff') as 'owner' | 'staff';
  const isOwner = role === 'owner';

  return { role, isOwner, isLoaded, isSignedIn };
}
```

- [ ] **Step 4: Commit**

```bash
git add src/types/globals.d.ts src/types/index.ts src/hooks/use-role.ts
git commit -m "feat: add Clerk role types and useRole hook"
```

---

### Task 4: Middleware

**Files:**
- Create: `src/middleware.ts`

- [ ] **Step 1: Create middleware.ts**

```ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isPublicRoute = createRouteMatcher(['/sign-in(.*)']);

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    '/((?!_next|.*\\..*).*)',
  ],
};
```

- [ ] **Step 2: Commit**

```bash
git add src/middleware.ts
git commit -m "feat: add Clerk middleware for route protection"
```

---

### Task 5: Sign-In Page

**Files:**
- Create: `src/app/sign-in/[[...sign-in]]/page.tsx`

- [ ] **Step 1: Create sign-in page**

```tsx
import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <SignIn
          appearance={{
            elements: {
              rootBox: 'mx-auto',
              card: 'shadow-lg border border-border/50',
              headerTitle: 'text-foreground',
              headerSubtitle: 'text-muted-foreground',
              socialButtonsBlockButton: 'border-border/50 text-foreground hover:bg-muted/50',
              dividerLine: 'bg-border/50',
              dividerText: 'text-muted-foreground',
              formFieldLabel: 'text-foreground',
              formFieldInput: 'bg-background border-border/50 text-foreground',
              footerActionLink: 'text-primary',
              formButtonPrimary: 'bg-primary hover:bg-primary/90',
            },
          }}
          redirectUrl="/"
        />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/sign-in/
git commit -m "feat: add sign-in page"
```

---

### Task 6: Root Layout — ClerkProvider

**Files:**
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Remove ClerkProvider from convex-provider and add to layout**

Update `src/app/layout.tsx`. Note: ClerkProvider is now inside ConvexClientProvider (we moved it into convex-provider.tsx in Task 2), so the layout stays the same — no changes needed here. Verify the current layout wraps correctly:

```tsx
// Current layout already wraps children with ConvexClientProvider
// which now internally wraps with ClerkProvider → ConvexProviderWithClerk
// No changes needed to layout.tsx
```

(No code changes — this step is a verification check. If the convex-provider now includes ClerkProvider, the layout works as-is.)

- [ ] **Step 2: Commit (if no changes, skip)**

---

### Task 7: Sidebar — Switch to Clerk Role

**Files:**
- Modify: `src/components/layout.tsx`

- [ ] **Step 1: Update sidebar imports and role logic**

Change the sidebar to read role from `useRole()` instead of `useGetSettings()`:

```tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRole } from '@/hooks/use-role';
import { useGetSettings } from '@/lib/hooks';
import {
  LayoutDashboard,
  ShoppingCart,
  Receipt,
  Package,
  Users,
  Wallet,
  LineChart,
  Settings,
  Store,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

function SidebarNav() {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();
  const { isOwner, isLoaded } = useRole();
  const { data: settings } = useGetSettings();

  const navItems = [
    { label: 'Overview', href: '/', icon: LayoutDashboard, exact: true },
    { label: 'POS Terminal', href: '/pos', icon: ShoppingCart },
    { label: 'Sales Logs', href: '/sales', icon: Receipt },
    { label: 'Inventory', href: '/inventory', icon: Package },
    { label: 'Customers', href: '/customers', icon: Users },
    { label: 'Expenses', href: '/expenses', icon: Wallet },
    ...(isOwner ? [{ label: 'AI Reports', href: '/reports', icon: LineChart }] : []),
    { label: 'Settings', href: '/settings', icon: Settings },
  ];

  // Remove the Settings link for non-owners
  const filteredNavItems = isOwner
    ? navItems
    : navItems.filter(item => item.href !== '/settings' && item.href !== '/expenses');

  return (
    <>
      <SidebarHeader className="border-b border-border/50 py-4 px-4">
        <div className="flex items-center gap-2 font-bold text-xl tracking-tight text-primary">
          <Store className="h-6 w-6" />
          <span className="truncate group-data-[collapsible=icon]:hidden">
            {settings?.shopName || 'SalesPulse'}
          </span>
        </div>
      </SidebarHeader>
      <SidebarContent className="px-2 py-4">
        <SidebarMenu>
          {filteredNavItems.map((item) => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);

            return (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton asChild isActive={isActive} tooltip={item.label}>
                  <Link href={item.href} onClick={() => setOpenMobile(false)} className="flex items-center gap-3">
                    <item.icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="border-t border-border/50 p-4">
        <div className="flex items-center gap-3 group-data-[collapsible=icon]:justify-center">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0">
            {isLoaded ? (isOwner ? 'O' : 'S') : '?'}
          </div>
          <div className="flex flex-col overflow-hidden group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-semibold truncate capitalize">
              {isLoaded ? (isOwner ? 'Owner' : 'Staff') : '...'}
            </span>
            <span className="text-xs text-muted-foreground truncate">Signed In</span>
          </div>
        </div>
      </SidebarFooter>
    </>
  );
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { isOwner, isLoaded } = useRole();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <Sidebar variant="inset" collapsible="icon">
          <SidebarNav />
        </Sidebar>

        <SidebarInset>
          <header className="h-16 flex items-center gap-4 border-b border-border/40 bg-card/50 px-6 shrink-0 sticky top-0 z-10 backdrop-blur-sm">
            <SidebarTrigger />
            <div className="flex-1" />
            {isLoaded && (
              <Badge variant="secondary" className="px-3 py-1 text-xs font-semibold capitalize tracking-wide">
                {isOwner ? 'Owner View' : 'Staff View'}
              </Badge>
            )}
          </header>
          <div className="flex-1 p-6 lg:p-8 overflow-auto">
            {children}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/layout.tsx
git commit -m "feat: update sidebar to use Clerk role"
```

---

### Task 8: ChatWidget — Owner Only

**Files:**
- Modify: `src/components/chat-widget.tsx`

- [ ] **Step 1: Replace settings-based role check with Clerk hook**

Change the imports and role check:

```tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import {
  useListAiChatMessages,
  useSendAiChatMessage,
} from '@/lib/hooks';
import { useRole } from '@/hooks/use-role';
```

Remove the `useGetSettings` import. Replace the role check:

```tsx
export function ChatWidget() {
  const { isOwner, isLoaded } = useRole();
  const [open, setOpen] = useState(false);

  if (!isLoaded) return null;
  if (!isOwner) return null;
```

Remove the `const { data: settings } = useGetSettings();` and `const isOwner = settings?.activeRole === 'owner';` lines.

And remove the `import { useGetSettings } from '@/lib/hooks';` from the import block.

- [ ] **Step 2: Commit**

```bash
git add src/components/chat-widget.tsx
git commit -m "feat: gate chat widget on Clerk owner role"
```

---

### Task 9: Overview Page — Hide Profit for Staff

**Files:**
- Modify: `src/app/(dashboard)/page.tsx`

- [ ] **Step 1: Replace settings-based role with Clerk hook**

Add import:

```tsx
import { useRole } from '@/hooks/use-role';
```

Replace:

```tsx
const { data: settings } = useGetSettings();
const isOwner = settings?.activeRole === 'owner';
```

With:

```tsx
const { isOwner } = useRole();
```

Remove unused `useGetSettings` import if it's no longer needed (check if `settings` is referenced elsewhere — in this page it's only used for the role check, so yes, remove it).

Remove `useGetSettings` from the hooks import line.

- [ ] **Step 2: Commit**

```bash
git add src/app/\(dashboard\)/page.tsx
git commit -m "feat: switch overview role check to Clerk"
```

---

### Task 10: Inventory Page — Hide Cost Prices for Staff

**Files:**
- Modify: `src/app/(dashboard)/inventory/page.tsx`

- [ ] **Step 1: Replace settings-based role with Clerk hook**

Add import:

```tsx
import { useRole } from '@/hooks/use-role';
```

Replace:

```tsx
const { data: settings } = useGetSettings();
const isOwner = settings?.activeRole === 'owner';
```

With:

```tsx
const { isOwner } = useRole();
```

And remove `useGetSettings` from the hooks import only if it's not used for anything else. Check — the settings data is used in the form default `lowStockThreshold`:

```tsx
settings?.lowStockThreshold?.toString() || '5'
```

So keep the `useGetSettings` import. Just change the `isOwner` assignment.

- [ ] **Step 2: Commit**

```bash
git add src/app/\(dashboard\)/inventory/page.tsx
git commit -m "feat: switch inventory role check to Clerk"
```

---

### Task 11: Sales Page — Allow Void for All Roles

**Files:**
- Modify: `src/app/(dashboard)/sales/page.tsx`

- [ ] **Step 1: Remove settings import and allow void for all**

Remove `useGetSettings` from the imports. Remove the `isOwner` variable entirely. Delete the lines:

```tsx
const { data: settings } = useGetSettings();
const isOwner = settings?.activeRole === 'owner';
```

Change the void button condition from:

```tsx
{isOwner && sale.status === 'completed' && (
```

To:

```tsx
{sale.status === 'completed' && (
```

- [ ] **Step 2: Commit**

```bash
git add src/app/\(dashboard\)/sales/page.tsx
git commit -m "feat: allow all roles to void sales"
```

---

### Task 12: Owner-Only Route Guards

**Files:**
- Modify: `src/app/(dashboard)/expenses/page.tsx`
- Modify: `src/app/(dashboard)/reports/page.tsx`

- [ ] **Step 1: Read and update expenses page**

Check current expenses page — if it has no client-side guard, add one. Read the file first, then add a guard at the top of the component:

```tsx
'use client';

import { useRole } from '@/hooks/use-role';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
```

Then inside the component:

```tsx
export default function Expenses() {
  const { isOwner, isLoaded } = useRole();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && !isOwner) {
      router.push('/');
    }
  }, [isLoaded, isOwner, router]);

  if (!isLoaded) return <div className="p-8">Loading...</div>;
  if (!isOwner) return null;
```

- [ ] **Step 2: Read and update reports page**

The reports page already has a client-side guard using `isOwner`. Replace the settings-based check with the Clerk hook.

Remove `useGetSettings` import. Add:

```tsx
import { useRole } from '@/hooks/use-role';
```

Replace:

```tsx
const { data: settings } = useGetSettings();
const isOwner = settings?.activeRole === 'owner';
```

With:

```tsx
const { isOwner, isLoaded } = useRole();
```

Update the not-allowed UI since the old text said "Switch roles in Settings" — change to:

```tsx
if (!isLoaded) {
  return <div className="p-8">Loading...</div>;
}

if (!isOwner) {
  return (
    <div className="h-[60vh] flex flex-col items-center justify-center text-center max-w-md mx-auto">
      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-6">
        <Lock className="w-8 h-8 text-muted-foreground" />
      </div>
      <h2 className="text-2xl font-bold mb-2">Access Restricted</h2>
      <p className="text-muted-foreground">
        AI Business Reports are only available to the Owner.
      </p>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/\(dashboard\)/expenses/page.tsx src/app/\(dashboard\)/reports/page.tsx
git commit -m "feat: add owner-only route guards"
```

---

### Task 13: Settings Page — Remove activeRole Toggle

**Files:**
- Modify: `src/app/(dashboard)/settings/page.tsx`

- [ ] **Step 1: Read and simplify settings page**

Remove the active role toggle card (lines ~132-162 in the original). Keep the business details and backup/restore sections. Remove the `useGetSettings` and `useUpdateSettings` if they're still needed for shop name — keep them. Remove `Switch` import if no longer used.

Remove `Switch` and `Separator` from imports.

Remove the role toggle section leaving the business details and backup/restore cards.

Also remove `ownerLabel` and `attendantLabel` from the form since we no longer use them (they were for the sidebar footer which now uses Clerk role).

- [ ] **Step 2: Commit**

```bash
git add src/app/\(dashboard\)/settings/page.tsx
git commit -m "feat: remove activeRole toggle from settings"
```

---

### Task 14: Schema & Hook Cleanup

**Files:**
- Modify: `convex/schema.ts`
- Modify: `src/lib/hooks.ts`

- [ ] **Step 1: Update schema operatorRole field**

In `convex/schema.ts`, change:

```ts
operatorRole: v.union(v.literal("owner"), v.literal("attendant")),
```

To:

```ts
operatorRole: v.union(v.literal("owner"), v.literal("staff")),
```

- [ ] **Step 2: Update settings type in hooks**

In `src/lib/hooks.ts`, change:

```ts
mutate: (d: { shopName?: string; ownerLabel?: string; attendantLabel?: string; activeRole?: 'owner' | 'attendant'; lowStockThreshold?: number }) => mutate(d),
```

To:

```ts
mutate: (d: { shopName?: string; lowStockThreshold?: number }) => mutate(d),
```

- [ ] **Step 3: Commit**

```bash
git add convex/schema.ts src/lib/hooks.ts
git commit -m "chore: update schema and hooks to use staff role"
```

---

### Task 15: Seed Production Users

**Files:**
- N/A (Clerk Dashboard)

- [ ] **Step 1: Create owner user in Clerk Dashboard**

Go to Clerk Dashboard → Users → Add User.
Set email/password.
After creation, go to the user → Public Metadata → `{ "role": "owner" }`.

- [ ] **Step 2: Create staff user in Clerk Dashboard**

Same flow, with public metadata `{ "role": "staff" }`.

---

## Spec Self-Review

- ✅ Owner role with full access (sidebar: all nav items, reports, settings, expenses)
- ✅ Staff role with limited access (no expenses, no reports, no settings, no cost/profit)
- ✅ Staff sees sales (void is allowed), inventory (no cost prices), customers, POS
- ✅ Overview hides profit for staff, shows only sales chart
- ✅ ChatWidget only for owner
- ✅ Clerk session metadata for role (no DB table)
- ✅ Route protection via middleware
- ✅ Sign-in page with shadcn-styled appearance
- ✅ No self-sign-up — users managed in Clerk Dashboard
- ✅ Shared database — all users see same data, only what's visible differs by role
