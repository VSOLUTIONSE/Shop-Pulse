const testimonials = [
  {
    company: "Maelowe & Co",
    industry: "Inventory management - Retail",
    metric: "₦11M",
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
    metric: "₦2.8M",
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
    metric: "₦9.4M",
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
