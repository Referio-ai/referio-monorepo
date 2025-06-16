'use client';

import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const CTASection = () => (
  <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
    <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
      <h2 className="text-4xl font-bold text-white mb-6">
        Ready to Transform Your Referral Process?
      </h2>
      <p className="text-xl text-blue-100 mb-8">
        Join thousands of healthcare professionals who have already streamlined their workflow with Referio
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button size="lg" variant="secondary" className="group">
          Start Your Free Trial
          <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </Button>
        <Button size="lg" variant="ghost" className="text-white border-white hover:bg-white/10">
          Schedule Demo
        </Button>
      </div>
      <p className="text-blue-100 text-sm mt-4">
        30-day free trial • No credit card required • Setup in 5 minutes
      </p>
    </div>
  </section>
); 