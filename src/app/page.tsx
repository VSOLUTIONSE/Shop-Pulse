import {
  LandingNavbar,
  LandingHero,
  OfferSection,
  HowItWorks,
  FeatureShowcase,
  TestimonialGrid,
  FAQSection,
  FooterCTA,
  LandingFooter,
} from "@/components/landing";

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <LandingNavbar />
      <main>
        <LandingHero />
        <OfferSection />
        <HowItWorks />
        <FeatureShowcase />
        <TestimonialGrid />
        <FAQSection />
        <FooterCTA />
      </main>
      <LandingFooter />
    </div>
  );
}
