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
