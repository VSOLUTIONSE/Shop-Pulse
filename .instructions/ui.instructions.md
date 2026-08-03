# ui.instructions.md

## The rule
`src/components/ui/` is a closed set. You extend it, you don't grow it
sideways. Before adding any component, run:

```bash
grep -ril "button\|badge\|input" src/components/ui
```

If something close already exists, extend its `cva` variants instead of
creating `ButtonV2.tsx` or `PrimaryButton.tsx`.

## Design tokens
All color, spacing, radius, and type-scale values come from the `@theme`
block in `src/app/globals.css` (Tailwind v4 — there is no `tailwind.config.ts`
in this project). This means:
- No `text-[#111827]` arbitrary values — use `text-foreground`,
  `text-muted-foreground`, etc.
- No new spacing like `mt-[13px]` — use the scale (`mt-3`, `mt-4`).
- Adding a new semantic color (e.g. a "warning" state) means adding it to
  the `@theme` block in `globals.css` first, then using the generated
  Tailwind class everywhere — not hardcoding the hex in the one place you
  needed it. Only touch `src/lib/design-system/tokens.ts` too if a
  genuine JS consumer (chart lib, canvas) also needs that exact value.

## Component pattern
Every primitive in `components/ui` follows the same shape:
- Built with `class-variance-authority` (`cva`) for variants.
- Accepts `className` and merges it last via the `cn()` util so consumers
  can override spacing/layout without fighting specificity.
- Forwards `ref`.
- Exported from `src/components/ui/index.ts` (the barrel) — anything not
  exported there is not part of the public API, even if the file exists.

See `src/components/ui/button.tsx` as the canonical example. A new primitive
copies that shape.
