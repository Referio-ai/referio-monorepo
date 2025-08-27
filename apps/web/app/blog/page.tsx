import React from 'react';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">Referio Blog</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Latest Insights & Updates
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Stay up to date with the latest developments in referral management, 
            healthcare technology, and industry best practices.
          </p>
        </div>

        {/* Blog Posts Grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {/* Sample Blog Post 1 */}
          <article className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="text-sm text-blue-600 mb-2">Healthcare Technology</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                The Future of Referral Management
              </h3>
              <p className="text-gray-600 mb-4">
                Discover how AI-powered referral management is transforming healthcare 
                workflows and improving patient outcomes.
              </p>
              <Button variant="outline" size="sm">
                Read More
              </Button>
            </div>
          </article>

          {/* Sample Blog Post 2 */}
          <article className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="text-sm text-green-600 mb-2">Best Practices</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Streamlining Patient Referrals
              </h3>
              <p className="text-gray-600 mb-4">
                Learn the essential strategies for creating efficient referral processes 
                that benefit both healthcare providers and patients.
              </p>
              <Button variant="outline" size="sm">
                Read More
              </Button>
            </div>
          </article>

          {/* Sample Blog Post 3 */}
          <article className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="text-sm text-purple-600 mb-2">Industry News</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Healthcare Integration Trends
              </h3>
              <p className="text-gray-600 mb-4">
                Explore the latest trends in healthcare system integration and 
                how they're reshaping referral management.
              </p>
              <Button variant="outline" size="sm">
                Read More
              </Button>
            </div>
          </article>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16 p-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Ready to Transform Your Referral Process?
          </h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Join thousands of healthcare providers who are already using Referio 
            to streamline their referral management.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg">
              Get Started Free
            </Button>
            <Button variant="outline" size="lg">
              Schedule Demo
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
