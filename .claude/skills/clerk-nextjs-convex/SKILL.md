# Clerk Auth Integration: Next.js + Convex + Role-Based Access

Reference implementation from SalesPulse. Use this when adding Clerk authentication to a Next.js app with Convex backend and role-based access control.

---

## 1. Clerk Dashboard Setup

Create an app at https://dashboard.clerk.com and configure:

### Required
- **Application name** — e.g. "SalesPulse"
- **Sign-in methods** — Enable Email + Password (at minimum)

### JWT Template (required for Convex)
1. Go to **JWT Templates** → **New template**
2. Name: `convex` (this exact name)
3. Issuer: The Clerk Application URL (ends in `.clerk.accounts.dev`)
4. Claims:
```json
{
  "aud": "convex",
  "azp": "",
  "exp": {{exp}},
  "iat": {{iat}},
  "iss": "{{iss}}",
  "nbf": {{nbf}},
  "sub": "{{user.id}}",
  "email": "{{user.primary_email_address}}",
  "name": "{{user.full_name}}",
  "picture": "{{user.profile_image_url}}"
}
```

### User Metadata (for roles)
Set `publicMetadata.role` per user:
1. Go to **Users** → Select user → **Metadata**
2. Set `role` to `"owner"` or `"staff"`

### Session & Verification
- Enable **Email verification** for sign-up
- Keep CAPTCHA enabled (handled via `<div id="clerk-captcha">`)
- Enable **Multi-factor authentication** (optional, email code)

---

## 2. Environment Variables

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
CLERK_JWT_ISSUER_DOMAIN=https://<your-app>.clerk.accounts.dev
```

| Variable | Where to get |
|---|---|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk Dashboard → API Keys |
| `CLERK_SECRET_KEY` | Clerk Dashboard → API Keys |
| `CLERK_JWT_ISSUER_DOMAIN` | Clerk Dashboard → JWT Templates → "convex" template → Issuer |

---

## 3. Installation

```bash
npm install @clerk/nextjs
```

If using Convex:
```bash
npm install convex
```

---

## 4. Files to Create

### 4a. Convex Auth Config — `convex/auth.config.ts`

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

### 4b. Type Definitions — `src/types/globals.d.ts`

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

### 4c. Middleware — `src/middleware.ts`

```ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isPublicRoute = createRouteMatcher(['/sign-in(.*)', '/sign-up(.*)']);

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    const signInUrl = new URL('/sign-in', req.url).toString();
    await auth.protect({ unauthenticatedUrl: signInUrl });
  }
});

export const config = {
  matcher: [
    '/((?!_next|.*\\..*).*)',
  ],
};
```

**Important:** Next.js 16+ requires absolute URLs in `auth.protect()`. Always use `new URL('/path', req.url).toString()`.

### 4d. Provider Wrapper — `src/components/convex-provider.tsx`

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

### 4e. Role Hook — `src/hooks/use-role.ts`

```ts
import { useUser } from '@clerk/nextjs';

export function useRole() {
  const { user, isLoaded, isSignedIn } = useUser();

  const role = (user?.publicMetadata?.role ?? 'staff') as 'owner' | 'staff';
  const isOwner = role === 'owner';

  return { role, isOwner, isLoaded, isSignedIn };
}
```

Default role is `'staff'` if no metadata set. Use `isOwner` to gate UI elements.

---

## 5. Custom Sign-In Page

### Flow
1. User enters email + password → `signIn.password()`
2. If password is correct and status is `complete` → `signIn.finalize()` → redirect to `/`
3. If password is correct and status is `needs_client_trust` or `needs_second_factor` → `signIn.mfa.sendEmailCode()` → show code input
4. User enters code → `signIn.mfa.verifyEmailCode()` → `signIn.finalize()` → redirect to `/`

### State Guards
- Use `submitted` boolean to prevent stale `needs_client_trust` from showing verify form on fresh page load
- `fetchStatus !== 'fetching'` for `isLoaded` instead of `signIn.isLoaded` (Clerk v7 signal API)
- `const { signIn, errors, fetchStatus } = useSignIn()`
- `const { signUp, errors, fetchStatus } = useSignUp()`

### Error Handling
- `errors.fields` for field-specific errors
- `errors.fields.emailAddress?.message` / `errors.fields.password?.message`
- `errors.fields.identifier?.message` for sign-in email
- `errors.fields.code?.message` for verification code
- All `signIn.*()` and `signUp.*()` calls return `{ error }` — check `error?.message`

### Navigation on Success
```ts
await signIn.finalize({
  navigate: ({ session, decorateUrl }) => {
    if (session?.currentTask) return;
    const url = decorateUrl('/');
    if (url.startsWith('http')) {
      window.location.href = url;
    } else {
      router.push(url);
    }
  },
});
```
Same pattern for `signUp.finalize()`.

### CAPTCHA
Add `<div id="clerk-captcha"></div>` inside the form to give Clerk's Smart CAPTCHA a mount point. Required for custom flows that call `signIn.password()` or `signUp.password()`.

---

## 6. Custom Sign-Up Flow

### Steps
1. User enters email, password, confirm password → `signUp.password({ emailAddress, password })`
2. If successful → `signUp.verifications.sendEmailCode()` → show code input
3. User enters code → `signUp.verifications.verifyEmailCode({ code })`
4. If `signUp.status === 'complete'` → `signUp.finalize()` → redirect to `/`

### Verification Check
```ts
const needsVerification =
  !!signUp &&
  signUp.status === 'missing_requirements' &&
  signUp.unverifiedFields.includes('email_address');
```

---

## 7. Sign Out

```tsx
import { useClerk } from '@clerk/nextjs';

const { signOut } = useClerk();
signOut({ redirectUrl: '/sign-in' });
```

---

## 8. User Display in Layout/Sidebar

```tsx
import { useUser, useClerk } from '@clerk/nextjs';
import { useRole } from '@/hooks/use-role';

const { user } = useUser();
const { signOut } = useClerk();
const { role, isOwner, isLoaded } = useRole();

// User initials
const initial = (user?.firstName?.[0] ?? user?.emailAddresses[0]?.emailAddress?.[0] ?? '?').toUpperCase();

// Display name
const displayName = user?.fullName || user?.emailAddresses[0]?.emailAddress || 'User';
```

---

## 9. Clerk API Signals (Clerk v7)

| Hook | Return | Key fields |
|---|---|---|
| `useSignIn()` | `{ signIn, errors, fetchStatus }` | `signIn.password()`, `signIn.mfa.sendEmailCode()`, `signIn.mfa.verifyEmailCode()`, `signIn.finalize()` |
| `useSignUp()` | `{ signUp, errors, fetchStatus }` | `signUp.password()`, `signUp.verifications.sendEmailCode()`, `signUp.verifications.verifyEmailCode()`, `signUp.finalize()` |
| `useUser()` | `{ user, isLoaded, isSignedIn }` | `user.publicMetadata`, `user.emailAddresses`, `user.fullName` |
| `useAuth()` | `{ isLoaded, isSignedIn, userId }` | Basic auth state |
| `useClerk()` | `{ signOut, setActive }` | `signOut({ redirectUrl })` |

**Key differences from Clerk v6:**
- No `isLoaded` on `useSignIn()` / `useSignUp()` — use `fetchStatus !== 'fetching'`
- No `setActive` after sign-in — use `signIn.finalize()` / `signUp.finalize()` with `navigate`
- No `isLoaded` for methods — signals return `{ error }` objects

---

## 10. Role-Based Gating Pattern

### Convex Backend
```ts
// convex/schema.ts
operatorRole: v.union(v.literal("owner"), v.literal("staff")),
```

### Frontend (UI gating)
```tsx
const { isOwner, isLoaded } = useRole();

if (!isLoaded) return null;
if (!isOwner) return <p>Access denied</p>;
```

### Dashboard Setup
Set `publicMetadata.role` per user in Clerk Dashboard:
- **Owner users**: `{ "role": "owner" }`
- **Staff users**: `{ "role": "staff" }` (default if unset)

---

## 11. Key Gotchas

| Issue | Fix |
|---|---|
| `URL is malformed "/sign-in"` | Use absolute URL: `new URL('/sign-in', req.url).toString()` |
| `Cannot initialize Smart CAPTCHA` | Add `<div id="clerk-captcha"></div>` inside the form |
| `422` on sign-up | Usually CAPTCHA blocking — add the div or disable bot protection in dev |
| Keyless mode warning | Restart dev server without `?token=` param; keys in `.env.local` will be picked up |
| `useSignIn().isLoaded` undefined | Use `fetchStatus !== 'fetching'` instead (Clerk v7 signal API) |
| Clerk CLI doesn't work on Windows | Create JWT template "convex" manually in Clerk Dashboard |
| Role not showing after sign-in | Set `publicMetadata.role` in Clerk Dashboard → Users → User → Metadata |
