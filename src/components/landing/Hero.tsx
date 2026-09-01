import Image from "next/image";
import { COLORS } from "./tokens";

export function Hero() {
  return (
    <section
      id="home"
      className="relative overflow-hidden bg-white px-4 py-16 sm:px-6 lg:px-8 lg:py-20"
    >
      <div className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[600px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-blue-200/30 via-purple-200/20 to-pink-200/30 blur-3xl" />

      <div className="mx-auto flex max-w-7xl flex-col items-center gap-12 lg:flex-row lg:items-center lg:gap-20">
        <div className="flex-1 space-y-6 text-center lg:text-left">
          <p className="font-sans text-sm font-semibold uppercase tracking-wider text-[var(--lp-primary)]">
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
              <svg
                className="h-4 w-4"
                viewBox="0 0 9 12"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M0 12.825L0 0 8.775 6.412 0 12.825Z" />
              </svg>
              Watch a Demo
            </a>
          </div>
        </div>

        <div className="relative flex-1">
          <div className="relative mx-auto w-full max-w-md lg:max-w-lg">
            <Image
              src="https://storage.googleapis.com/storage.magicpath.ai/user/436083585921990656/figma-assets/ad21227c-019e-4cb4-87de-1afde3f893ee.png"
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
