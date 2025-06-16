'use client';
import React from 'react';
import { Navigation } from './components/navigations';
import { HeroSection } from './components/hero';
import { FeaturesSection } from './components/features';
import { HowItWorksSection } from './components/how-it-works';
import { TestimonialsSection } from './components/testimonials';
import { PricingSection } from './components/pricing';
import { CTASection } from './components/cta';
import { Footer } from './components/footer';

export const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <TestimonialsSection />
      <PricingSection />
      <CTASection />
      <Footer />
    </div>
  );
};
