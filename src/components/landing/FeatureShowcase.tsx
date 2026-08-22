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
