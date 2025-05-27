'use client';

import Testimonials from '@/components/Testimonials';

export default function TestimonialsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Success Stories
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Read inspiring stories from beneficiaries who have successfully raised funds for their medical needs through MedFund.
          </p>
        </div>
        <Testimonials />
      </div>
    </div>
  );
} 