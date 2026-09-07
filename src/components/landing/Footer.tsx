import Image from "next/image";

const FOOTER_SECTIONS = [
  {
    title: "Product",
    links: ["Book a demo", "Features", "FAQ", "Inventory"],
  },
  {
    title: "Business",
    links: ["Book a demo", "Features", "FAQ", "Inventory"],
  },
  {
    title: "Company",
    links: ["About SalesPulse", "Contact Us", "Our Process", "Privacy Policy", "Terms & Conditions"],
  },
  {
    title: "Resources",
    links: ["Help Center", "FAQ", "Book a demo", "Email", "Support"],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2">
              <div className="relative h-[42px] w-[42px] overflow-hidden">
                <Image
                  src="https://storage.googleapis.com/storage.magicpath.ai/user/436083585921990656/figma-assets/f754cfd2-84c9-45e9-81c5-198ce949b907.png"
                  alt="SalesPulse"
                  fill
                  className="object-contain"
                  sizes="42px"
                />
              </div>
              <span className="font-display text-lg font-bold text-[var(--lp-primary)]">
                SalesPulse
              </span>
            </div>
            <p className="mt-4 text-sm text-[var(--lp-text-muted)]">
              We&apos;re here to help
            </p>
            <p className="mt-2 text-sm text-[var(--lp-text-muted)]">
              Have a question, need a hand, or just want to say hi? Reach out and we&apos;ll get back
              to you within the same business day.{" "}
              <a href="#contact" className="text-[var(--lp-primary)] hover:underline">
                contact us here.
              </a>
            </p>
          </div>

          {FOOTER_SECTIONS.map((section) => (
            <div key={section.title}>
              <h3 className="font-display text-sm font-bold uppercase tracking-wider text-gray-900">
                {section.title}
              </h3>
              <ul className="mt-4 space-y-2">
                {section.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm text-[var(--lp-text-muted)] hover:text-[var(--lp-primary)]"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 border-t border-gray-200 pt-8 text-center text-sm text-[var(--lp-text-muted)]">
          <p>@2026 SalesPulse. Terms of Use | Privacy Policy</p>
        </div>
      </div>
    </footer>
  );
}
