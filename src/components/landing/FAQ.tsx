"use client";

import { useState } from "react";

const FAQ_ITEMS = [
  {
    question: "How do I get started with SalesPulse?",
    answer:
      "Getting started is simple. Fill out a quick registration form or book a demo. Our team will contact you immediately to tailor the platform to your workflow.",
  },
  {
    question: "What can I manage with SalesPulse",
    answer:
      "You can manage sales tracking, inventory, customer credit/debt, staff accountability, multi-branch operations, and generate AI-powered insights — all from one dashboard.",
  },
  {
    question: "What does the AI assistant do?",
    answer:
      "The AI assistant provides automated reports, identifies trends, predicts stock needs, and gives you actionable recommendations based on your actual business data.",
  },
  {
    question: "Can I export my Business data?",
    answer:
      "Yes, you can export all your business data including sales reports, inventory logs, customer records, and financial summaries in various formats.",
  },
  {
    question: "Do I need to install anything?",
    answer:
      "No installation required. SalesPulse works entirely in your web browser on any device — phone, tablet, or desktop.",
  },
  {
    question: "Can I use SalesPulse on my phone?",
    answer:
      "Absolutely. SalesPulse is fully responsive and works seamlessly on any device with a browser, including smartphones and tablets.",
  },
  {
    question: "How safe are my assets in SalesPulse?",
    answer:
      "Your data is encrypted and securely stored. We use industry-standard security practices including role-based access control, regular backups, and secure authentication.",
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="bg-white px-4 py-20 sm:px-6 lg:px-8 lg:py-[120px]">
      <div className="mx-auto max-w-3xl">
        <div className="mb-12 text-center">
          <h2 className="font-inter text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl lg:text-[42px]">
            Frequently asked question
          </h2>
          <p className="mt-4 text-base text-[var(--lp-text-muted)]">
            Everything you need to know about getting started with SalesPulse
          </p>
        </div>

        <div className="space-y-3">
          {FAQ_ITEMS.map((item, index) => (
            <div
              key={item.question}
              className="overflow-hidden rounded-lg border border-gray-100 bg-white shadow-sm"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="flex w-full items-center justify-between px-6 py-4 text-left"
              >
                <span className="font-display text-sm font-medium text-gray-900">
                  {item.question}
                </span>
                <svg
                  className={`h-5 w-5 shrink-0 text-gray-500 transition-transform ${
                    openIndex === index ? "rotate-180" : ""
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              {openIndex === index && (
                <div className="px-6 pb-4">
                  <p className="text-sm text-[var(--lp-text-muted)]">{item.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
