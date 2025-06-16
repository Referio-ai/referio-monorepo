'use client';

import React from 'react';
import { Brain, Building2, Clock, Shield, Users, Zap } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export const FeaturesSection = () => {
  const features = [
    {
      icon: <Brain className="w-8 h-8" />,
      title: "AI Form Recognition",
      description: "Advanced OCR and AI technology instantly reads and extracts data from any referral form format.",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Instant Processing",
      description: "Process referrals in under 10 seconds. No more manual data entry or waiting for staff availability.",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "HIPAA Secure",
      description: "Bank-level encryption and full HIPAA compliance ensure patient data remains completely protected.",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: <Building2 className="w-8 h-8" />,
      title: "Smart Routing",
      description: "Automatically route referrals to the correct department or facility based on specialty and availability.",
      color: "from-orange-500 to-red-500"
    },
    {
      icon: <Clock className="w-8 h-8" />,
      title: "Real-time Tracking",
      description: "Track referral status in real-time with automatic notifications for all parties involved.",
      color: "from-indigo-500 to-purple-500"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Team Integration",
      description: "Seamlessly integrates with existing EMR systems and workflows. No disruption to current processes.",
      color: "from-teal-500 to-cyan-500"
    }
  ];

  return (
    <section id="features" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Powerful Features for Modern Healthcare
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Everything you need to streamline your referral process and improve patient care
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="hover:shadow-xl transition-all duration-300 group">
              <CardContent className="p-8">
                <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}; 