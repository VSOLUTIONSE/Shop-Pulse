# Landing Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a production-ready, responsive landing page to the SalesPulse app at the root route, converting the Figma export into modular Tailwind components.

**Architecture:** 10 Server Component sections under `src/components/landing/`, one root page at `src/app/page.tsx`, landing-specific tokens in CSS. Only FAQ accordion uses `"use client"`. All images self-hosted in `/public/landing/`.

**Tech Stack:** Next.js 16, Tailwind CSS v4, React 19, Radix Accordion, Satoshi/Inter/Plus Jakarta Sans fonts

---

## Task 1: Download Image Assets

**Files:**
- Create: `public/landing/` directory
- Create: 8 image files in `public/landing/`

- [ ] **Step 1: Create the landing images directory**

```bash
mkdir -p public/landing
```

- [ ] **Step 2: Download all 8 images from Google Storage**

```bash
curl -sL -o public/landing/hero-device.png "https://storage.googleapis.com/storage.magicpath.ai/user/436083585921990656/figma-assets/ad21227c-019e-4cb4-87de-1afde3f893ee.png"
curl -sL -o public/landing/laptop-mockup.png "https://storage.googleapis.com/storage.magicpath.ai/user/436083585921990656/figma-assets/08d25933-fd23-40e0-ab45-08008148dca2.png"
curl -sL -o public/landing/phone-mockup.png "https://storage.googleapis.com/storage.magicpath.ai/user/436083585921990656/figma-assets/14984914-6a99-4aca-9311-799642c8c479.png"
curl -sL -o public/landing/feature-credit.png "https://storage.googleapis.com/storage.magicpath.ai/user/436083585921990656/figma-assets/78c4df86-c6b2-4162-b0cf-a6f7362c9a8d.png"
curl -sL -o public/landing/feature-inventory.png "https://storage.googleapis.com/storage.magicpath.ai/user/436083585921990656/figma-assets/9e8e00fc-ec8a-4c39-8e99-3c6d1d013e1e.png"
curl -sL -o public/landing/feature-dashboard.png "https://storage.googleapis.com/storage.magicpath.ai/user/436083585921990656/figma-assets/0951b2b5-a45e-47ef-806d-f37dd2164a72.png"
curl -sL -o public/landing/logo.png "https://storage.googleapis.com/storage.magicpath.ai/user/436083585921990656/figma-assets/f754cfd2-84c9-45e9-81c5-198ce949b907.png"
curl -sL -o public/landing/hero-bg.jpg "https://storage.googleapis.com/storage.magicpath.ai/user/436083585921990656/figma-assets/d7f79d62-58bb-42b5-9fbb-1c515d8e40af.jpg"
```

- [ ] **Step 3: Verify all images downloaded**

```bash
ls -la public/landing/
```

Expected: 8 files, all non-zero size.

- [ ] **Step 4: Commit**

```bash
git add public/landing/
git commit -m "chore: download landing page image assets"
```

---

## Task 2: Add Satoshi Font & Landing Tokens

**Files:**
- Modify: `src/app/layout.tsx:22-24`
- Modify: `src/index.css`

- [ ] **Step 1: Add Satoshi font to Google Fonts import in layout.tsx**

In `src/app/layout.tsx`, find the Google Fonts `<link>` tag on line 22-24. Replace the `href` value:

```tsx
<link
  href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400..800;1,400..800&family=Inter:ital,wght@0,400..800;1,400..800&family=JetBrains+Mono:ital,wght@0,400..800;1,400..800&family=Satoshi:wght@400;500;700;900&display=swap"
  rel="stylesheet"
/>
```

- [ ] **Step 2: Add landing page tokens to index.css**

Add the following block inside the `:root` selector in `src/index.css` (after line 148, before the closing `}`):

```css
/* Landing Page Tokens */
--lp-primary: #4030e8;
--lp-dark: #0d0a2e;
--lp-dark-surface: #121215;
--lp-dark-card: #1a1a1a;
--lp-text-muted: #87899f;
--lp-text-light: #cdcde4;
--lp-border-glass: rgba(255, 255, 255, 0.08);
--lp-border-glass-strong: rgba(255, 255, 255, 0.1);
```

- [ ] **Step 3: Add display font CSS variable**

Add to `:root` in `src/index.css` (near the other `--app-font-*` variables around line 126-129):

```css
--app-font-display: 'Satoshi', system-ui, sans-serif;
```

Add to the `@theme inline` block in `src/index.css` (near line 61-64):

```css
--font-display: var(--app-font-display);
```

- [ ] **Step 4: Verify build passes**

```bash
npm run typecheck
```

Expected: No errors.

- [ ] **Step 5: Commit**

```bash
git add src/app/layout.tsx src/index.css
git commit -m "feat: add Satoshi font and landing page design tokens"
```

---

## Task 3: Create Landing Page Entry Point

**Files:**
- Create: `src/app/page.tsx`
- Create: `src/components/landing/index.ts`
- Create: 9 stub component files in `src/components/landing/`

- [ ] **Step 1: Create the barrel export file**

Create `src/components/landing/index.ts`:

```typescript
export { LandingNavbar } from "./LandingNavbar";
export { LandingHero } from "./LandingHero";
export { OfferSection } from "./OfferSection";
export { HowItWorks } from "./HowItWorks";
export { FeatureShowcase } from "./FeatureShowcase";
export { TestimonialGrid } from "./TestimonialGrid";
export { FAQSection } from "./FAQSection";
export { FooterCTA } from "./FooterCTA";
export { LandingFooter } from "./LandingFooter";
```

- [ ] **Step 2: Create root page**

Create `src/app/page.tsx`:

```tsx
import {
  LandingNavbar,
  LandingHero,
  OfferSection,
  HowItWorks,
  FeatureShowcase,
  TestimonialGrid,
  FAQSection,
  FooterCTA,
  LandingFooter,
} from "@/components/landing";

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <LandingNavbar />
      <main>
        <LandingHero />
        <OfferSection />
        <HowItWorks />
        <FeatureShowcase />
        <TestimonialGrid />
        <FAQSection />
        <FooterCTA />
      </main>
      <LandingFooter />
    </div>
  );
}
```

- [ ] **Step 3: Create stub components**

Create each stub file in `src/components/landing/`. Every stub returns a minimal element with the component name as text content so the app compiles.

- [ ] **Step 4: Verify build passes**

```bash
npm run build
```

Expected: Build succeeds.

- [ ] **Step 5: Commit**

```bash
git add src/app/page.tsx src/components/landing/
git commit -m "feat: scaffold landing page with placeholder components"
```

---

## Task 4: Implement LandingNavbar

**Files:**
- Modify: `src/components/landing/LandingNavbar.tsx`

- [ ] **Step 1: Implement the full navbar**

Replace the contents of `src/components/landing/LandingNavbar.tsx`:

```tsx
import Image from "next/image";
import Link from "next/link";

const navLinks = [
  { label: "Home", href: "#home" },
  { label: "How it Works", href: "#how-it-works" },
  { label: "Features", href: "#features" },
  { label: "Inventory", href: "#offer" },
  { label: "Learn", href: "#faq" },
  { label: "Contact Us", href: "#footer" },
];

export function LandingNavbar() {
  return (
    <nav className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/landing/logo.png"
            alt="SalesPulse"
            width={42}
            height={42}
            className="h-10 w-auto"
            priority
          />
          <span className="font-display text-lg font-bold text-[var(--lp-primary)]">
            SalesPulse
          </span>
        </Link>

        <div className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-gray-700 transition-colors hover:text-[var(--lp-primary)]"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <a
            href="/sign-in"
            className="hidden text-sm font-medium text-gray-700 transition-colors hover:text-[var(--lp-primary)] sm:block"
          >
            Login
          </a>
          <a
            href="#cta"
            className="rounded bg-[var(--lp-primary)] px-4 py-2 text-sm font-bold text-white transition-opacity hover:opacity-90"
          >
            Book A Demo
          </a>
        </div>
      </div>
    </nav>
  );
}
```

- [ ] **Step 2: Verify build**

```bash
npm run typecheck
```

- [ ] **Step 3: Commit**

```bash
git add src/components/landing/LandingNavbar.tsx
git commit -m "feat: implement LandingNavbar with responsive nav and CTA"
```

---

## Task 5: Implement LandingHero

**Files:**
- Modify: `src/components/landing/LandingHero.tsx`

- [ ] **Step 1: Implement the full hero**

Replace the contents of `src/components/landing/LandingHero.tsx`:

```tsx
import Image from "next/image";

export function LandingHero() {
  return (
    <section
      id="home"
      className="relative overflow-hidden bg-white px-4 py-16 sm:px-6 lg:px-8 lg:py-20"
    >
      <div className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[600px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-blue-200/30 via-purple-200/20 to-pink-200/30 blur-3xl" />

      <div className="mx-auto flex max-w-7xl flex-col items-center gap-12 lg:flex-row lg:items-center lg:gap-20">
        <div className="flex-1 space-y-6 text-center lg:text-left">
          <p className="text-sm font-semibold uppercase tracking-wider text-[var(--lp-primary)]">
            Built for the business behind the counter
          </p>

          <h1 className="font-display text-4xl font-black leading-tight tracking-tight text-gray-900 sm:text-5xl lg:text-[46px]">
            Turn every sales into a{" "}
            <span className="relative inline-block">
              <span className="relative z-10 text-[var(--lp-primary)]">business</span>
              <span className="absolute bottom-1 left-0 -z-0 h-3 w-full bg-gradient-to-r from-cyan-300 via-purple-400 to-pink-400 opacity-30 blur-sm" />
            </span>{" "}
            you can trust
          </h1>

          <p className="mx-auto max-w-md text-base text-[var(--lp-text-muted)] lg:mx-0">
            Built for the business behind the counter
          </p>

          <div className="flex flex-col items-center gap-4 sm:flex-row lg:justify-start">
            <a
              href="#cta"
              className="inline-flex items-center justify-center rounded bg-[var(--lp-primary)] px-6 py-3 text-sm font-bold text-white transition-opacity hover:opacity-90"
            >
              Get Started
            </a>
            <a
              href="#demo"
              className="inline-flex items-center gap-2 rounded-[6px] border border-gray-300 px-6 py-3 text-sm font-bold text-gray-900 transition-colors hover:bg-gray-50"
            >
              <svg className="h-4 w-4" viewBox="0 0 9 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M0 12.825L0 0 8.775 6.412 0 12.825Z" />
              </svg>
              Watch a Demo
            </a>
          </div>
        </div>

        <div className="relative flex-1">
          <div className="relative mx-auto w-full max-w-md lg:max-w-lg">
            <Image
              src="/landing/hero-device.png"
              alt="SalesPulse dashboard on device"
              width={370}
              height={766}
              className="h-auto w-full drop-shadow-2xl"
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verify build**

```bash
npm run typecheck
```

- [ ] **Step 3: Commit**

```bash
git add src/components/landing/LandingHero.tsx
git commit -m "feat: implement LandingHero with responsive layout and gradient text"
```

---

## Task 6: Implement OfferSection

**Files:**
- Modify: `src/components/landing/OfferSection.tsx`

- [ ] **Step 1: Implement the full offer section**

Replace the contents of `src/components/landing/OfferSection.tsx`:

```tsx
const offers = [
  { number: "O1", title: "Faster stock counts", description: "Replace a paper ledger with live inventory tracking, catching low stock before it turns into missed sale" },
  { number: "O2", title: "Real-time sales tracking", description: "Monitor every transaction as it happens, no more end-of-day guesswork" },
  { number: "O3", title: "Customer credit management", description: "Track who owes you, send reminders, and never lose sight of outstanding balances" },
  { number: "O4", title: "AI-powered insights", description: "Get automated reports and recommendations based on your actual business data" },
  { number: "O5", title: "Multi-branch support", description: "Manage multiple locations from one dashboard with consolidated reporting" },
  { number: "O6", title: "Staff accountability", description: "Track who sold what, when, and at what price — complete transparency" },
];

export function OfferSection() {
  return (
    <section
      id="offer"
      className="relative overflow-hidden bg-[var(--lp-dark)] px-4 py-20 sm:px-6 lg:px-8 lg:py-[120px]"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(260%_260%_at_50%_-200%,#0d0a2e_67%,#09090b_100%)]" />

      <div className="relative z-10 mx-auto max-w-6xl">
        <div className="mb-12 text-center lg:mb-16">
          <p className="mb-4 text-sm font-bold uppercase tracking-wider text-[var(--lp-primary)]">
            Our offer to you
          </p>
          <h2 className="font-display text-3xl font-bold text-white sm:text-4xl lg:text-[42px]">
            What you get with SalesPulse?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm text-[var(--lp-text-light)]">
            Every small, medium and big business trust us to manage their assets - track record and manage sales wherever they are
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {offers.map((offer) => (
            <div
              key={offer.number}
              className="rounded-2xl border border-[var(--lp-border-glass)] bg-[var(--lp-dark-surface)] p-8"
            >
              <p className="mb-2 font-display text-3xl font-bold text-[var(--lp-primary)]">
                {offer.number}
              </p>
              <h3 className="font-display text-xl font-bold text-[var(--lp-text-light)]">
                {offer.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-[var(--lp-text-muted)]">
                {offer.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verify build**

```bash
npm run typecheck
```

- [ ] **Step 3: Commit**

```bash
git add src/components/landing/OfferSection.tsx
git commit -m "feat: implement OfferSection with dark glass card grid"
```

---

## Task 7: Implement HowItWorks

**Files:**
- Modify: `src/components/landing/HowItWorks.tsx`

- [ ] **Step 1: Implement the full component**

Replace the contents of `src/components/landing/HowItWorks.tsx`:

```tsx
import Image from "next/image";

const steps = [
  { number: "01", text: "Works on any device with a browser" },
  { number: "02", text: "Secure Staff Management" },
  { number: "03", text: "Real-time stock levels and Inventory management" },
  { number: "04", text: "Interactive reports and AI-powered insights" },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="overflow-hidden bg-white px-4 py-20 sm:px-6 lg:px-8 lg:py-[120px]">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-16 lg:flex-row lg:items-center lg:gap-24">
        {/* Left Column */}
        <div className="flex-1 space-y-8">
          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase tracking-wider text-[var(--lp-primary)]">
              How it works
            </p>
            <h2 className="font-display text-3xl font-bold leading-tight tracking-tight text-gray-900 sm:text-4xl lg:text-[40px]">
              Get Your Business Running in Minutes
            </h2>
            <p className="max-w-lg text-base text-[var(--lp-text-muted)]">
              SalesPulse makes it easy to manage your business from a single web dashboard.
              After booking a demo, our team tailors the system to your business, so you can
              start selling, tracking inventory, and monitoring performance without a complicated setup.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {steps.map((step) => (
              <div
                key={step.number}
                className="flex items-center rounded-lg border border-gray-100 bg-white px-5 py-4 shadow-sm"
              >
                <span className="mr-3 text-sm font-bold text-[var(--lp-primary)]">
                  {step.number}.
                </span>
                <span className="text-sm font-bold text-gray-900">{step.text}</span>
              </div>
            ))}
          </div>

          <a
            href="#cta"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--lp-primary)] px-6 py-3.5 text-sm font-bold text-white transition-opacity hover:opacity-90"
          >
            Try the Web APP
          </a>
        </div>

        {/* Right Column - Mockups */}
        <div className="relative flex-1">
          <div className="relative">
            <Image
              src="/landing/laptop-mockup.png"
              alt="SalesPulse on laptop"
              width={501}
              height={278}
              className="h-auto w-full rounded-lg"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
          <div className="absolute -right-8 bottom-0 w-32 sm:-right-12 sm:w-44 lg:-right-16 lg:w-48">
            <Image
              src="/landing/phone-mockup.png"
              alt="SalesPulse on phone"
              width={190}
              height={227}
              className="h-auto w-full drop-shadow-xl"
              sizes="20vw"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verify build**

```bash
npm run typecheck
```

- [ ] **Step 3: Commit**

```bash
git add src/components/landing/HowItWorks.tsx
git commit -m "feat: implement HowItWorks with step grid and device mockups"
```

---

## Task 8: Implement FeatureShowcase

**Files:**
- Modify: `src/components/landing/FeatureShowcase.tsx`

- [ ] **Step 1: Implement the full component**

Replace the contents of `src/components/landing/FeatureShowcase.tsx`:

```tsx
import Image from "next/image";

const features = [
  {
    title: "Customer Credit & Debt Management",
    description:
      "Manage customer credit with confidence, replace handwritten debt books with a digital credit ledger. Record credit sales, track repayments, and monitor outstanding balances with complete transparency.",
    image: "/landing/feature-credit.png",
    imageAlt: "Credit and debt management dashboard",
    reversed: false,
  },
  {
    title: "Inventory Management",
    description:
      "Always know what's in stock, keep complete control of your inventory with live stock tracking, restock management, and inventory adjustments. Every product movement is recorded, helping you reduce losses and prevent stock shortages.",
    image: "/landing/feature-inventory.png",
    imageAlt: "Inventory management dashboard",
    reversed: true,
  },
  {
    title: "Financial Dashboard",
    description:
      "Turn business data into better decisions, track your revenue, profits, expenses, and customer debts from one powerful dashboard. Interactive reports and AI-powered insights help you understand how your business is performing every day.",
    image: "/landing/feature-dashboard.png",
    imageAlt: "Financial analytics dashboard",
    reversed: false,
  },
];

export function FeatureShowcase() {
  return (
    <section id="features" className="overflow-hidden bg-white px-4 py-20 sm:px-6 lg:px-8">
      {/* Section Header */}
      <div className="mx-auto mb-16 max-w-3xl text-center">
        <h2 className="font-inter text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl lg:text-[42px]">
          SalesPulse Features
        </h2>
        <p className="mt-4 text-base text-[var(--lp-text-muted)]">
          From sales tracking to inventory update to AI automated feedback
        </p>
      </div>

      <div className="mx-auto max-w-6xl space-y-24">
        {features.map((feature) => (
          <div
            key={feature.title}
            className={`flex flex-col items-center gap-12 lg:flex-row ${
              feature.reversed ? "lg:flex-row-reverse" : ""
            } lg:gap-24`}
          >
            {/* Text */}
            <div className="flex-1 space-y-6">
              <h3 className="font-display text-2xl font-bold text-gray-900 sm:text-3xl">
                {feature.title}
              </h3>
              <p className="text-sm leading-relaxed text-[var(--lp-text-muted)]">
                {feature.description}
              </p>
            </div>

            {/* Image */}
            <div className="flex-1">
              <div className="relative overflow-hidden rounded-2xl border border-gray-100 bg-gray-50 p-1">
                <Image
                  src={feature.image}
                  alt={feature.imageAlt}
                  width={928}
                  height={517}
                  className="h-auto w-full rounded-xl"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            </div>
          </div>
        ))}

        {/* CTA */}
        <div className="text-center">
          <a
            href="#cta"
            className="inline-flex items-center justify-center rounded-lg bg-[var(--lp-primary)] px-6 py-3.5 text-sm font-bold text-white transition-opacity hover:opacity-90"
          >
            Book A Demo Now
          </a>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verify build**

```bash
npm run typecheck
```

- [ ] **Step 3: Commit**

```bash
git add src/components/landing/FeatureShowcase.tsx
git commit -m "feat: implement FeatureShowcase with alternating text/image rows"
```

---

## Task 9: Implement TestimonialGrid

**Files:**
- Modify: `src/components/landing/TestimonialGrid.tsx`

- [ ] **Step 1: Implement the full component**

Replace the contents of `src/components/landing/TestimonialGrid.tsx`:

```tsx
const testimonials = [
  {
    company: "Maelowe & Co",
    industry: "Inventory management - Retail",
    metric: "\u20A611M",
    metricLabel: "Faster stock counts",
    quote: "Replace a paper ledger with live inventory tracking, catching low stock before it turns into missed sale",
  },
  {
    company: "Bright Star Distributors",
    industry: "Wholesales - medium business",
    metric: "6hrs to 20min",
    metricLabel: "To close daily sales records",
    quote: "What used to take a full evening of manual reconciling now happens automatically, every day.",
  },
  {
    company: "Okafor's Pharmacy",
    industry: "Retail - small business",
    metric: "\u20A62.8M",
    metricLabel: "In expired stock avoided",
    quote: "Expiry alerts now flag slow-moving stock before it goes to waste, not after.",
  },
  {
    company: "Delta Foods Group",
    industry: "Manufacturing - large business",
    metric: "14 branches",
    metricLabel: "On one shared system",
    quote: "Every branch now reports sales and stock the same way, so head office sees one accurate picture, not fourteen different ones.",
  },
  {
    company: "Nova Fashion House",
    industry: "Sales team - growing brand",
    metric: "\u20A69.4M",
    metricLabel: "in recovered revenue",
    quote: "Customer purchase history surfaced repeat buyers the team had lost track of, and follow-up brought them back.",
  },
  {
    company: "Greenline Hardware",
    industry: "Retail - sole business owner",
    metric: "Zero",
    metricLabel: "Stockouts this quarter",
    quote: "One person, no staff, and still never runs out — restock alerts do the job a whole team used to.",
  },
];

export function TestimonialGrid() {
  return (
    <section className="relative overflow-hidden bg-[var(--lp-dark)] px-4 py-20 sm:px-6 lg:px-8 lg:py-[120px]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(260%_260%_at_50%_-200%,#0d0a2e_67%,#09090b_100%)]" />

      <div className="relative z-10 mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-12 text-center lg:mb-16">
          <p className="mb-4 text-sm font-semibold uppercase tracking-wider text-[var(--lp-primary)]">
            Built for REAL-WORLD SCALE
          </p>
          <h2 className="font-inter text-3xl font-semibold text-white sm:text-4xl lg:text-[42px]">
            See how Businesses run on SalesPulse
          </h2>
          <p className="mt-4 text-sm text-[var(--lp-text-light)]">
            Trusted by thousands of Business around the world
          </p>
        </div>

        {/* Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t) => (
            <div
              key={t.company}
              className="flex flex-col rounded-2xl border border-[var(--lp-border-glass)] bg-[var(--lp-dark-surface)] p-8"
            >
              <div className="mb-6">
                <p className="text-sm font-semibold text-white">{t.company}</p>
                <p className="text-xs text-[var(--lp-text-muted)]">{t.industry}</p>
              </div>

              <div className="mb-4">
                <p className="font-display text-3xl font-bold text-[var(--lp-primary)]">
                  {t.metric}
                </p>
                <p className="text-xs text-[var(--lp-text-muted)]">{t.metricLabel}</p>
              </div>

              <p className="mb-6 flex-1 text-sm leading-relaxed text-[var(--lp-text-muted)]">
                {t.quote}
              </p>

              <a
                href="#"
                className="text-sm font-semibold text-[var(--lp-primary)] hover:underline"
              >
                Read more
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verify build**

```bash
npm run typecheck
```

- [ ] **Step 3: Commit**

```bash
git add src/components/landing/TestimonialGrid.tsx
git commit -m "feat: implement TestimonialGrid with business case cards"
```

---

## Task 10: Implement FAQSection

**Files:**
- Modify: `src/components/landing/FAQSection.tsx`

- [ ] **Step 1: Implement the full FAQ section**

Replace the contents of `src/components/landing/FAQSection.tsx`:

```tsx
"use client";

import { useState } from "react";
import * as Accordion from "@radix-ui/react-accordion";

const faqs = [
  {
    question: "How do I get started with SalesPulse?",
    answer: "Getting started is simple. Fill out a quick registration form or book a demo. Our team will contact you immediately and tailor the platform to fit your workflow.",
  },
  {
    question: "What can I manage with SalesPulse?",
    answer: "SalesPulse lets you manage inventory, track sales in real-time, handle customer credit and debt, monitor financial performance, manage staff, and generate AI-powered reports.",
  },
  {
    question: "What does the AI assistant do?",
    answer: "The AI assistant analyzes your business data to provide actionable insights, automated reports, restock predictions, and performance recommendations.",
  },
  {
    question: "Can I export my business data?",
    answer: "Yes. You can export your sales reports, inventory lists, customer data, and financial summaries in standard formats.",
  },
  {
    question: "Do I need to install anything?",
    answer: "No. SalesPulse is a web application that runs entirely in your browser. Nothing to install.",
  },
  {
    question: "Can I use SalesPulse on my phone?",
    answer: "Yes. SalesPulse is fully responsive and works on any device with a web browser.",
  },
  {
    question: "How safe are my assets in SalesPulse?",
    answer: "SalesPulse uses industry-standard encryption and security practices. Your data is backed up regularly.",
  },
];

export function FAQSection() {
  const [openItem, setOpenItem] = useState<string | null>(null);

  return (
    <section id="faq" className="bg-white px-4 py-20 sm:px-6 lg:px-8 lg:py-[120px]">
      <div className="mx-auto max-w-3xl">
        <div className="mb-12 text-center">
          <h2 className="font-inter text-3xl font-semibold text-gray-900 sm:text-4xl lg:text-[42px]">
            Frequently asked question
          </h2>
          <p className="mt-4 text-base text-[var(--lp-text-muted)]">
            Everything you need to know about getting started with SalesPulse
          </p>
        </div>

        <Accordion.Root
          type="single"
          collapsible
          value={openItem ?? undefined}
          onValueChange={(v) => setOpenItem(v || null)}
          className="space-y-3"
        >
          {faqs.map((faq, i) => (
            <Accordion.Item
              key={i}
              value={`faq-${i}`}
              className="overflow-hidden rounded-xl border border-gray-200 bg-white"
            >
              <Accordion.Header>
                <Accordion.Trigger className="flex w-full items-center justify-between px-6 py-5 text-left text-sm font-semibold text-gray-900 transition-colors hover:bg-gray-50 [&[data-state=open]>svg]:rotate-180">
                  {faq.question}
                  <svg className="h-5 w-5 shrink-0 text-gray-500 transition-transform duration-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </Accordion.Trigger>
              </Accordion.Header>
              <Accordion.Content className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
                <div className="px-6 pb-5 text-sm leading-relaxed text-[var(--lp-text-muted)]">
                  {faq.answer}
                </div>
              </Accordion.Content>
            </Accordion.Item>
          ))}
        </Accordion.Root>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verify build**

```bash
npm run typecheck
```

- [ ] **Step 3: Commit**

```bash
git add src/components/landing/FAQSection.tsx
git commit -m "feat: implement FAQSection with Radix Accordion"
```

---

## Task 11: Implement FooterCTA

**Files:**
- Modify: `src/components/landing/FooterCTA.tsx`

- [ ] **Step 1: Implement the full component**

Replace the contents of `src/components/landing/FooterCTA.tsx`:

```tsx
import Image from "next/image";

export function FooterCTA() {
  return (
    <section id="cta" className="relative overflow-hidden bg-white px-4 py-20 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[600px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-blue-200/30 via-purple-200/20 to-pink-200/30 blur-3xl opacity-50" />

      <div className="mx-auto max-w-4xl text-center">
        <div className="relative mx-auto mb-12 max-w-3xl overflow-hidden rounded-2xl border border-gray-100 bg-gray-50 p-2">
          <Image
            src="/landing/laptop-mockup.png"
            alt="SalesPulse dashboard preview"
            width={1186}
            height={652}
            className="h-auto w-full rounded-xl"
            sizes="(max-width: 768px) 100vw, 75vw"
          />
        </div>

        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <a href="/sign-up" className="inline-flex items-center justify-center rounded-lg bg-[var(--lp-primary)] px-8 py-3.5 text-sm font-bold text-white transition-opacity hover:opacity-90">
            Get Started
          </a>
          <a href="#demo" className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-8 py-3.5 text-sm font-bold text-gray-900 transition-colors hover:bg-gray-50">
            <svg className="h-4 w-4" viewBox="0 0 9 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M0 12.825L0 0 8.775 6.412 0 12.825Z" />
            </svg>
            Watch a Demo
          </a>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verify build**

```bash
npm run typecheck
```

- [ ] **Step 3: Commit**

```bash
git add src/components/landing/FooterCTA.tsx
git commit -m "feat: implement FooterCTA with device preview and dual CTA"
```

---

## Task 12: Implement LandingFooter

**Files:**
- Modify: `src/components/landing/LandingFooter.tsx`

- [ ] **Step 1: Implement the full footer**

Replace the contents of `src/components/landing/LandingFooter.tsx`:

```tsx
import Image from "next/image";

const footerLinks = {
  Product: ["Book a demo", "Features", "FAQ", "Inventory"],
  Business: ["Book a demo", "Features", "FAQ", "Inventory"],
  Company: ["About SalesPulse", "Contact Us", "Our Process", "Privacy Policy", "Terms & Conditions"],
  Resources: ["Help Center", "FAQ", "Book a demo", "Email", "Support"],
};

export function LandingFooter() {
  return (
    <footer className="border-t border-gray-200 bg-white px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-16 flex flex-col gap-12 lg:flex-row lg:gap-20">
          <div className="space-y-6 lg:w-72">
            <div className="flex items-center gap-2">
              <Image src="/landing/logo.png" alt="SalesPulse" width={61} height={61} className="h-12 w-auto" />
              <span className="font-display text-xl font-bold text-[var(--lp-primary)]">SalesPulse</span>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-semibold text-gray-900">We are here to help</p>
              <p className="text-sm text-[var(--lp-text-muted)]">
                Have a question, need a hand, or just want to say hi? Reach out and we will get back to you within the same business day.{" "}
                <a href="#" className="text-[var(--lp-primary)] hover:underline">contact us here.</a>
              </p>
            </div>
            <div className="flex gap-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-5 w-5 rounded bg-[var(--lp-primary)]" />
              ))}
            </div>
          </div>

          <div className="grid flex-1 grid-cols-2 gap-8 sm:grid-cols-4">
            {Object.entries(footerLinks).map(([category, links]) => (
              <div key={category}>
                <p className="mb-4 text-sm font-black uppercase tracking-wider text-gray-900">{category}</p>
                <ul className="space-y-3">
                  {links.map((link) => (
                    <li key={link}>
                      <a href="#" className="text-sm text-gray-500 hover:text-gray-900">{link}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="relative mb-8 overflow-hidden">
          <p className="text-[120px] font-bold leading-none text-[var(--lp-primary)] opacity-10 sm:text-[200px]">/SalesPulse</p>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-gray-100 pt-6 sm:flex-row">
          <div className="flex gap-6">
            <a href="#" className="text-sm text-gray-500 hover:text-gray-900">Terms of Use</a>
            <a href="#" className="text-sm text-gray-500 hover:text-gray-900">Privacy Policy</a>
          </div>
          <p className="text-sm text-gray-500">@2026 SalesPulse</p>
        </div>
      </div>
    </footer>
  );
}
```

- [ ] **Step 2: Verify build**

```bash
npm run typecheck
```

- [ ] **Step 3: Commit**

```bash
git add src/components/landing/LandingFooter.tsx
git commit -m "feat: implement LandingFooter with 4-column links and branding"
```

---

## Task 13: Final Verification

- [ ] **Step 1: Run full typecheck**

```bash
npm run typecheck
```

Expected: No errors.

- [ ] **Step 2: Run full build**

```bash
npm run build
```

Expected: Build succeeds. Landing page renders at `/`.

- [ ] **Step 3: Run lint**

```bash
npm run lint
```

Expected: No errors or warnings.

- [ ] **Step 4: Visual verification**

Visit `http://localhost:3000` and verify all sections render correctly and the page is responsive.

- [ ] **Step 5: Final commit**

```bash
git add -A
git commit -m "feat: complete landing page implementation"
```
