'use client';

import React from 'react';
import { Brain, CheckCircle, FileText, Zap } from 'lucide-react';

export const HowItWorksSection = () => {
  const steps = [
    {
      step: "01",
      title: "Scan or Upload",
      description: "Simply scan the referral form with your phone or upload it to our secure platform.",
      icon: <FileText className="w-8 h-8" />
    },
    {
      step: "02", 
      title: "AI Processing",
      description: "Our AI instantly extracts patient data, diagnosis codes, and referral requirements.",
      icon: <Brain className="w-8 h-8" />
    },
    {
      step: "03",
      title: "Smart Routing",
      description: "The system automatically routes to the appropriate facility based on specialty and location.",
      icon: <Zap className="w-8 h-8" />
    },
    {
      step: "04",
      title: "Instant Delivery",
      description: "Referral is delivered instantly with real-time notifications to all parties.",
      icon: <CheckCircle className="w-8 h-8" />
    }
  ];

  return (
    <section id="how-it-works" className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            How Referio Works
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            From scan to delivery in under 30 seconds
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="text-center group">
              <div className="relative mb-6">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white mx-auto group-hover:scale-110 transition-transform duration-300">
                  {step.icon}
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">{step.title}</h3>
              <p className="text-gray-600">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}; 