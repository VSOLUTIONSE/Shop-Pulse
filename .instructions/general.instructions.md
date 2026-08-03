# general.instructions.md

## Reading files
Read files in full before editing. If a file is long, read it in chunks of
1000 lines minimum — never guess at content you haven't seen.

## Repository structure
```
src/
  app/                Next.js App Router — pages and route handlers only.
                       No business logic here. A page imports from lib/,
                       never the reverse.
  lib/
    auth/              SOT for authentication. See auth.instructions.md.
    design-system/      SOT for tokens (color, spacing, radius, type scale).
    api-client.ts       SOT for all outbound fetch calls. Never call fetch()
                        directly from a component.
    utils/              Small, pure, framework-agnostic helpers only.
  components/
    ui/                 SOT for primitives (Button, Input, Card, etc).
                        See ui.instructions.md before adding anything here.
scripts/                Guardrail check scripts. Run before every commit.
.github/workflows/      CI — mirrors the local checks. Do not weaken it to
                        make a broken change merge.
```

## Development workflow
- `pnpm dev` — local dev server
- `pnpm typecheck` — must pass before any PR
- `pnpm lint` — must pass before any PR
- `pnpm format -w` — run before committing, don't hand-format
- `./scripts/check-consistency.sh` — SOT/pattern-reuse checks

## Environment variables
Every package/app validates its own env at startup via `src/lib/env.ts`
(zod schema, fails fast on boot if a required var is missing or malformed).
Never read `process.env.X` directly outside that file — import the parsed,
typed `env` object instead.

## Cross-boundary changes
If your change touches more than one of `app/`, `lib/`, or `components/`,
run `pnpm typecheck` before continuing to the next file, not just at the end.
