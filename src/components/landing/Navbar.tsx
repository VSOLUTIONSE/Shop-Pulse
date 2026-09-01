import Image from "next/image";
import Link from "next/link";

const NAV_LINKS = [
  { label: "Home", href: "#home" },
  { label: "How it Works", href: "#how-it-works" },
  { label: "Features", href: "#features" },
  { label: "Inventory", href: "#offer" },
  { label: "Learn", href: "#faq" },
  { label: "Contact Us", href: "#footer" },
];

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 bg-white shadow-[0px_3px_2px_rgba(196,196,202,0.25)]">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
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
        </Link>

        <div className="hidden items-center gap-6 md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="font-display text-sm font-medium text-gray-900 transition-colors hover:text-[var(--lp-primary)]"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-4">
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
