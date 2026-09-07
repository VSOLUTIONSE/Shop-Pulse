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
