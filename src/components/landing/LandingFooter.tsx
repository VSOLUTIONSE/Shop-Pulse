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
                Have a question, need a hand, or just want to say hi? Reach out and we will get back to you within 
the same business day.{" "}
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
          <p className="text-[120px] font-bold leading-none text-[var(--lp-primary)] opacity-10 
sm:text-[200px]">/SalesPulse</p>
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
