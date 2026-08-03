# auth.instructions.md

## The rule
Auth is a **protected path**. It is implemented once, in `src/lib/auth/`, and
every other part of the app routes through it. Never re-implement session
checking, token verification, or role checks inline in a route or component.

## Two layers, NOT interchangeable (Next.js 16 model)
- `src/proxy.ts` — cheap, edge-adjacent, cookie-EXISTENCE check only. This
  is the file Next.js 16 renamed from `middleware.ts`, specifically to stop
  people putting real auth logic here. It never decodes the session, never
  hits a database, never rewrites cookies. It exists purely so an obviously
  logged-out visitor gets redirected without rendering a page first.
- `src/lib/auth/guard.ts` — `requireAuth()`, `requireAuthApi()`,
  `requireRole()`. This is where the session is ACTUALLY verified. This is
  the authoritative check. If `proxy.ts` were deleted entirely, the app
  would still be secure because of this file; if `guard.ts` were skipped,
  the app would NOT be secure no matter what `proxy.ts` does.

Do not add session decoding, role checks, or database calls to `proxy.ts`.
If you catch yourself importing `@/lib/auth` (the full config) into
`proxy.ts`, stop — that's the old middleware.ts pattern re-appearing under
a new filename, and it's the source of "logout loop" bugs where a
refreshed cookie never makes it back to the browser.

## What already exists (read this before writing anything new)
- `src/lib/auth/index.ts` — the Auth.js (NextAuth v5) config: providers,
  callbacks, session strategy. This is the ONLY file that configures a
  provider.
- `src/lib/auth/guard.ts` — the authoritative check, described above.
- `src/proxy.ts` — the thin cookie-presence check, described above.

## Assume this exists before building it (Red-Green Prompting)
Before adding a new protected route, assume `requireAuth()` already gives you
what you need. Try it. If it's missing something (e.g. a new role check),
extend `guard.ts` — don't build a parallel auth path next to it.

## Adding a new protected route
1. Add the path prefix to the `protectedPaths` array in `src/proxy.ts`
   (this only affects the UX shortcut, not security).
2. In the Server Component or Route Handler, call `const session =
   await requireAuth()` as the first line before any data access. This is
   the step that actually matters.
3. If the route needs a specific role, use `requireRole('admin')` instead.
4. Never trust a client-sent role/user id for authorization decisions —
   only the session from `requireAuth()`.

## What NOT to do
- Do not put session verification, role checks, or DB calls in `proxy.ts`.
- Do not call `fetch('/api/auth/...')` from a client component to "check"
  login state. Use the `useSession()` hook from `src/lib/auth/client.ts`.
- Do not store tokens in `localStorage`. Sessions are httpOnly cookies,
  handled entirely by Auth.js.
- Do not add a new OAuth provider without updating `src/lib/env.ts` first
  (fail-fast validation for the new client id/secret).
- Do not assume `proxy.ts` passing means the user is authenticated — it
  only means a cookie exists. `requireAuth()` is what confirms it's valid.
