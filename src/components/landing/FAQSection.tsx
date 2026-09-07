"use client";

import { useState } from "react";
import * as Accordion from "@radix-ui/react-accordion";

const faqs = [
  {
    question: "How do I get started with SalesPulse?",
    answer: "Getting started is simple. Fill out a quick registration form or book a demo. Our team will contact you immediately and tailor the platform to fit your workflow.",
  },
  {
    question: "What can I manage with SalesPulse?",
    answer: "SalesPulse lets you manage inventory, track sales in real-time, handle customer credit and debt, monitor financial performance, manage staff, and generate AI-powered reports.",
  },
  {
    question: "What does the AI assistant do?",
    answer: "The AI assistant analyzes your business data to provide actionable insights, automated reports, restock predictions, and performance recommendations.",
  },
  {
    question: "Can I export my business data?",
    answer: "Yes. You can export your sales reports, inventory lists, customer data, and financial summaries in standard formats.",
  },
  {
    question: "Do I need to install anything?",
    answer: "No. SalesPulse is a web application that runs entirely in your browser. Nothing to install.",
  },
  {
    question: "Can I use SalesPulse on my phone?",
    answer: "Yes. SalesPulse is fully responsive and works on any device with a web browser.",
  },
  {
    question: "How safe are my assets in SalesPulse?",
    answer: "SalesPulse uses industry-standard encryption and security practices. Your data is backed up regularly.",
  },
];

export function FAQSection() {
  const [openItem, setOpenItem] = useState<string | null>(null);

  return (
    <section id="faq" className="bg-white px-4 py-20 sm:px-6 lg:px-8 lg:py-[120px]">
      <div className="mx-auto max-w-3xl">
        <div className="mb-12 text-center">
          <h2 className="font-inter text-3xl font-semibold text-gray-900 sm:text-4xl lg:text-[42px]">
            Frequently asked question
          </h2>
          <p className="mt-4 text-base text-[var(--lp-text-muted)]">
            Everything you need to know about getting started with SalesPulse
          </p>
        </div>

        <Accordion.Root
          type="single"
          collapsible
          value={openItem ?? undefined}
          onValueChange={(v) => setOpenItem(v || null)}
          className="space-y-3"
        >
          {faqs.map((faq, i) => (
            <Accordion.Item
              key={i}
              value={`faq-${i}`}
              className="overflow-hidden rounded-xl border border-gray-200 bg-white"
            >
              <Accordion.Header>
                <Accordion.Trigger className="flex w-full items-center justify-between px-6 py-5 text-left text-sm font-semibold text-gray-900 transition-colors hover:bg-gray-50 [&[data-state=open]>svg]:rotate-180">
                  {faq.question}
                  <svg className="h-5 w-5 shrink-0 text-gray-500 transition-transform duration-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </Accordion.Trigger>
              </Accordion.Header>
              <Accordion.Content className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
                <div className="px-6 pb-5 text-sm leading-relaxed text-[var(--lp-text-muted)]">
                  {faq.answer}
                </div>
              </Accordion.Content>
            </Accordion.Item>
          ))}
        </Accordion.Root>
      </div>
    </section>
  );
}
