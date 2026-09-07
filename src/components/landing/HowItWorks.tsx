import Image from "next/image";

const FEATURES = [
  { number: "01", text: "Works on any device with a browser" },
  { number: "02", text: "Secure Staff Management" },
  { number: "03", text: "Real-time stock levels and Inventory management" },
  { number: "04", text: "Interactive reports and AI-powered insights" },
];

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="overflow-hidden bg-white px-4 py-20 sm:px-6 lg:px-8 lg:py-[120px]"
    >
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-16 lg:flex-row lg:items-center lg:gap-24">
        <div className="flex-1 space-y-8">
          <div className="space-y-4">
            <p className="font-sans text-sm font-semibold uppercase tracking-wider text-[var(--lp-primary)]">
              How it works
            </p>
            <h2 className="font-display text-3xl font-bold leading-tight tracking-tight text-gray-900 sm:text-4xl lg:text-[40px]">
              Get Your Business Running in Minutes
            </h2>
            <p className="max-w-lg text-base text-[var(--lp-text-muted)]">
              SalesPulse makes it easy to manage your business from a single web dashboard. After
              booking a demo, our team tailors the system to your business, so you can start selling,
              tracking inventory, and monitoring performance without a complicated setup.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {FEATURES.map((feature) => (
              <div
                key={feature.number}
                className="flex items-center rounded-lg border border-gray-100 bg-white px-5 py-4 shadow-sm"
              >
                <span className="mr-3 text-sm font-bold text-[var(--lp-primary)]">
                  {feature.number}.
                </span>
                <span className="text-sm font-bold text-gray-900">{feature.text}</span>
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

        <div className="relative flex-1">
          <div className="relative">
            <Image
              src="https://storage.googleapis.com/storage.magicpath.ai/user/436083585921990656/figma-assets/08d25933-fd23-40e0-ab45-08008148dca2.png"
              alt="SalesPulse on laptop"
              width={501}
              height={278}
              className="h-auto w-full rounded-lg"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
          <div className="absolute -right-8 bottom-0 w-32 sm:-right-12 sm:w-44 lg:-right-16 lg:w-48">
            <Image
              src="https://storage.googleapis.com/storage.magicpath.ai/user/436083585921990656/figma-assets/14984914-6a99-4aca-9311-799642c8c479.png"
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
