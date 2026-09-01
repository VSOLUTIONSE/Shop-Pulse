import Image from "next/image";
import { COLORS } from "./tokens";

const STEPS = [
  {
    number: "01",
    title: "Book a Demo or Register:",
    description: "Getting started is simple. Fill out a quick registration form or book a demo.",
  },
  {
    number: "02",
    title: "Business Discovery Meeting:",
    description: "Our team will contact you immediately, We will tailor the platform to fit your workflow",
  },
  {
    number: "03",
    title: "Go Live Instantly:",
    description: "Start managing your business without delay",
  },
];

export function HowToGetStarted() {
  return (
    <section id="how-to-start" className="bg-white px-4 py-16 sm:px-6 lg:px-8 lg:py-[120px]">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-12 lg:flex-row lg:items-center lg:gap-20">
        <div className="flex-1 space-y-8">
          <div className="space-y-4">
            <p className="font-sans text-sm font-semibold uppercase tracking-wider text-[var(--lp-primary)]">
              How to Get Started
            </p>
            <h2 className="font-display text-3xl font-bold leading-tight tracking-tight text-gray-900 sm:text-4xl lg:text-[40px]">
              Start with your Phone or Desktop, Sign up and Scale up
            </h2>
            <p className="max-w-lg text-base text-[var(--lp-text-muted)]">
              SalesPulse is a powerful business management web app that works seamlessly on your
              phone, tablet or desktop browser.
            </p>
          </div>

          <div className="space-y-3">
            {STEPS.map((step) => (
              <div
                key={step.number}
                className="flex items-start gap-3 rounded-lg border border-gray-100 bg-white p-4 shadow-sm"
              >
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-[var(--lp-primary)]">
                  <span className="text-xs font-bold text-white">{step.number}</span>
                </div>
                <div>
                  <span className="font-sans text-sm font-bold text-gray-900">{step.title} </span>
                  <span className="font-sans text-sm text-[var(--lp-text-muted)]">
                    {step.description}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <a
            href="#cta"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--lp-primary)] px-6 py-3.5 text-sm font-bold text-white transition-opacity hover:opacity-90"
          >
            Get it on Web Now
          </a>
        </div>

        <div className="relative flex-1">
          <div className="relative mx-auto w-full max-w-md lg:max-w-lg">
            <Image
              src="https://storage.googleapis.com/storage.magicpath.ai/user/436083585921990656/figma-assets/14984914-6a99-4aca-9311-799642c8c479.png"
              alt="SalesPulse on phone"
              width={190}
              height={227}
              className="h-auto w-full drop-shadow-xl"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
