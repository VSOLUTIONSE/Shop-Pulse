import { COLORS } from "./tokens";

const OFFERS = [
  {
    number: "O1",
    title: "Faster stock counts",
    description:
      "Replace a paper ledger with live inventory tracking, catching low stock before it turns into missed sale",
  },
  {
    number: "O2",
    title: "Real-time sales tracking",
    description:
      "Monitor every transaction as it happens, no more end-of-day guesswork",
  },
  {
    number: "O3",
    title: "Customer credit management",
    description:
      "Track who owes you, send reminders, and never lose sight of outstanding balances",
  },
  {
    number: "O4",
    title: "AI-powered insights",
    description:
      "Get automated reports and recommendations based on your actual business data",
  },
  {
    number: "O5",
    title: "Multi-branch support",
    description:
      "Manage multiple locations from one dashboard with consolidated reporting",
  },
  {
    number: "O6",
    title: "Staff accountability",
    description:
      "Track who sold what, when, and at what price — complete transparency",
  },
];

export function WhatYouGet() {
  return (
    <section
      id="offer"
      className="relative overflow-hidden bg-[var(--lp-dark)] px-4 py-20 sm:px-6 lg:px-8 lg:py-[120px]"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(260%_260%_at_50%_-200%,#0d0a2e_67%,#09090b_100%)]" />

      <div className="relative z-10 mx-auto max-w-6xl">
        <div className="mb-12 text-center lg:mb-16">
          <p className="mb-4 font-sans text-sm font-bold uppercase tracking-wider text-[var(--lp-primary)]">
            Our offer to you
          </p>
          <h2 className="font-display text-3xl font-bold text-white sm:text-4xl lg:text-[42px]">
            What you get with SalesPulse?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm text-[var(--lp-text-light)]">
            Every small, medium and big business trust us to manage their assets - track record and
            manage sales wherever they are
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {OFFERS.map((offer) => (
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
