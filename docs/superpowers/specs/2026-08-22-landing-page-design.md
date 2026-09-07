# Landing Page Design Spec

## Overview

Add a production-ready landing page to the SalesPulse app at the root route (`/`). Convert the Figma/MagicPath export (~3000 lines of inline styles) into modular, responsive Tailwind components that leverage the existing design system.

## Decisions

- **Font:** Add Satoshi to Google Fonts (display font for headings), keep Inter and Plus Jakarta Sans for UI/CTA
- **Images:** Download all 8 external images to `/public/landing/`, use Next.js `<Image>` for optimization
- **Routing:** Landing page at `/` with no auth redirects for now
- **Styling:** Full Tailwind conversion — no inline styles, no CSS modules
- **Architecture:** 10 modular section components, Server Components by default, `"use client"` only for FAQ accordion

## Design Tokens

New tokens to add to `src/index.css`:

```css
/* Landing Page Tokens */
--lp-primary: #4030e8;          /* Matches --primary (245 80% 55%) */
--lp-dark: #0d0a2e;             /* Dark gradient background */
--lp-dark-surface: #121215;     /* Card backgrounds on dark */
--lp-dark-card: #1a1a1a;        /* Inner card surfaces */
--lp-text-muted: #87899f;       /* Secondary text */
--lp-text-light: #cdcde4;       /* Light text on dark backgrounds */
--lp-border-glass: rgba(255, 255, 255, 0.08);  /* Glass card borders */
--lp-border-glass-strong: rgba(255, 255, 255, 0.1); /* Top border on glass */
```

Font additions:
- Add `family=Satoshi:wght@400;500;700;900` to Google Fonts import in `layout.tsx`
- Add `--app-font-display: 'Satoshi', system-ui, sans-serif` to CSS variables

## Component Architecture

```
src/components/landing/
├── index.ts              # Barrel exports
├── LandingNavbar.tsx     # Fixed top nav: logo, links (Home, How it Works, Features, Inventory, Learn, Contact Us), Login text, "Book A Demo" CTA button
├── LandingHero.tsx       # Hero: "Built for the business behind the counter" headline, gradient text highlight, "Get Started" + "Watch a Demo" buttons, background blur effect
├── OfferSection.tsx      # Dark section: "What you get with SalesPulse" heading, 3x2 grid of feature cards (O1-F6) with numbered headings
├── HowItWorks.tsx        # "Get Your Business Running in Minutes" with 4-step grid, "Try the Web APP" CTA, laptop + phone mockup
├── FeatureShowcase.tsx   # 3 alternating text+image rows: Customer Credit & Debt Management, Inventory Management, Financial Dashboard
├── TestimonialGrid.tsx   # "See how Businesses run on SalesPulse" — 6 dark cards in masonry-style grid with company names, metrics, quotes
├── FAQSection.tsx        # "Frequently asked question" — 7 expandable items using Radix Accordion (already installed)
├── FooterCTA.tsx         # Full-width CTA with video/device preview, "Get Started" + "Watch a Demo" buttons, gradient blur background
├── LandingFooter.tsx     # 4-column footer (Product, Business, Company, Resources), logo, copyright, social links placeholder
└── landing-tokens.css    # Landing-specific CSS custom properties and gradient utilities
```

## Section Details

### LandingNavbar
- Fixed position, white background, subtle shadow
- Left: SalesPulse logo (downloaded to `/public/landing/logo.png`)
- Center: Navigation links (scroll to sections via anchor IDs)
- Right: "Login" text link + "Book A Demo" indigo button
- Mobile: Hamburger menu using existing Sheet component

### LandingHero
- Full-width section with background blur gradient
- Left column: Uppercase label "Built for the business behind the counter", main headline "Turn every sales into a number you can trust" with gradient "business" text, subtitle, two CTA buttons
- Right column: Device mockup image with layered shadows
- Background: Radial gradient blur effect

### OfferSection
- Dark background (`--lp-dark`) with radial gradient
- Centered heading "Our offer to you" + "What you get with SalesPulse?"
- 3x2 CSS Grid of dark glass cards, each with:
  - Numbered heading (O1-O6 in indigo)
  - Feature title (Satoshi 20px bold)
  - Description text (Satoshi 16px)

### HowItWorks
- White background, two-column layout
- Left: "How it works" label, heading, description, 2x2 grid of white cards with numbered steps, "Try the Web APP" CTA
- Right: Laptop mockup with glass border effect, phone mockup overlapping

### FeatureShowcase
- Three alternating rows (text left/image right, then reversed)
- Each row: Feature title (Satoshi 32px bold), description, screenshot in glass-framed device mockup
- Features: Customer Credit & Debt Management, Inventory Management, Financial Dashboard
- "Book A Demo Now" CTA button at bottom

### TestimonialGrid
- Dark background with radial gradient
- "Built for REAL-WORLD SCALE" label, heading, subtitle
- 6 testimonial cards in a responsive grid (3 columns desktop, 2 tablet, 1 mobile)
- Each card: Company name, industry tag, metric headline, description, "Read more" link

### FAQSection
- White background, centered layout
- "Frequently asked question" heading
- 7 FAQ items using Radix Accordion (already in dependencies)
- Each item: Question text with chevron icon, expandable answer

### FooterCTA
- Full-width section with device mockup preview
- "Get Started" indigo button + "Watch a Demo" outline button
- Gradient blur background decoration

### LandingFooter
- White background with top border
- Left: SalesPulse logo + "We're here to help" contact block with social icon placeholders
- Center: 4-column link grid (Product, Business, Company, Resources)
- Bottom: Large faded "/SalesPulse" text, Terms of Use, Privacy Policy, copyright

## Responsive Breakpoints

| Breakpoint | Layout Changes |
|---|---|
| `< 640px` (mobile) | Single column, stacked sections, hide decorative blurs, reduce font sizes, hamburger nav |
| `640px-1024px` (tablet) | 2-column grids, reduced spacing, side-by-side feature rows |
| `> 1024px` (desktop) | Full layout as designed, 3-column grids, max-width container |

## Image Assets

Download to `/public/landing/`:

| File | Source | Usage |
|---|---|---|
| `hero-device.png` | `ad21227c-019e-4cb4-87de-1afde3f893ee.png` | Hero section device mockup |
| `laptop-mockup.png` | `08d25933-fd23-40e0-ab45-08008148dca2.png` | HowItWorks + FooterCTA laptop |
| `phone-mockup.png` | `14984914-6a99-4aca-9311-799642c8c479.png` | HowItWorks phone overlap |
| `feature-credit.png` | `78c4df86-c6b2-4162-b0cf-a6f7362c9a8d.png` | Credit & Debt feature screenshot |
| `feature-inventory.png` | `9e8e00fc-ec8a-4c39-8e99-3c6d1d013e1e.png` | Inventory feature screenshot |
| `feature-dashboard.png` | `0951b2b5-a45e-47ef-806d-f37dd2164a72.png` | Dashboard feature screenshot |
| `logo.png` | `f754cfd2-84c9-45e9-81c5-198ce949b907.png` | SalesPulse logo |
| `hero-bg.jpg` | `d7f79d62-58bb-42b5-9fbb-1c515d8e40af.jpg` | Hero background (optional, for blur effect) |

## Performance Budget

| Metric | Target |
|---|---|
| First Contentful Paint | < 1.5s |
| Largest Contentful Paint | < 2.5s |
| Cumulative Layout Shift | < 0.1 |
| Total Blocking Time | < 200ms |
| JavaScript (landing only) | < 5KB (FAQ accordion only) |
| Images total | < 3MB (compressed WebP where possible) |

## File Changes Summary

1. **New files:** 10 component files + 1 CSS file + 8 images in `/public/landing/`
2. **Modified files:**
   - `src/app/layout.tsx` — Add Satoshi font to Google Fonts import
   - `src/index.css` — Add landing page tokens
   - `src/app/page.tsx` — Create root page that renders `<LandingPage />`
3. **No changes to:** Dashboard layout, auth, Convex backend, existing components
