import { Navbar } from "./Navbar";
import { Hero } from "./Hero";
import { HowToGetStarted } from "./HowToGetStarted";
import { WhatYouGet } from "./WhatYouGet";
import { HowItWorks } from "./HowItWorks";
import { FeatureShowcase } from "./FeatureShowcase";
import { Testimonials } from "./Testimonials";
import { FAQ } from "./FAQ";
import { Footer } from "./Footer";

export function LandingPage() {
  return (
    <div className="min-h-screen overflow-x-hidden">
      <Navbar />
      <main>
        <Hero />
        <HowToGetStarted />
        <WhatYouGet />
        <HowItWorks />
        <FeatureShowcase />
        <Testimonials />
        <FAQ />
      </main>
      <Footer />
    </div>
  );
}
