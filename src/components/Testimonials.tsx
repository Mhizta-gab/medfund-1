'use client';

import { useState } from 'react';
import Image from 'next/image';

interface Testimonial {
  id: string;
  name: string;
  role: string;
  image: string;
  content: string;
  campaign: string;
  date: string;
  isFeatured: boolean;
}

const Testimonials = ({ isFeatured = false }: { isFeatured?: boolean }) => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([
    {
      id: '1',
      name: 'Sarah Johnson',
      role: 'Campaign Beneficiary',
      image: '/images/default-avatar.png',
      content: 'MedFund helped me raise funds for my daughter\'s surgery. The platform made it easy to share our story and connect with generous donors. We\'re forever grateful!',
      campaign: 'Pediatric Heart Surgery',
      date: 'March 15, 2024',
      isFeatured: true,
    },
    {
      id: '2',
      name: 'Michael Chen',
      role: 'Campaign Beneficiary',
      image: '/images/default-avatar.png',
      content: 'The verification process was thorough but straightforward. Thanks to MedFund, I received the treatment I needed without worrying about the financial burden.',
      campaign: 'Cancer Treatment',
      date: 'February 28, 2024',
      isFeatured: true,
    },
    {
      id: '3',
      name: 'Emma Rodriguez',
      role: 'Campaign Beneficiary',
      image: '/images/default-avatar.png',
      content: 'The transparency and security of the platform gave donors confidence. We exceeded our funding goal and I\'m now on the road to recovery.',
      campaign: 'Spinal Surgery',
      date: 'January 10, 2024',
      isFeatured: true,
    },
  ]);

  const [newTestimonial, setNewTestimonial] = useState({
    name: '',
    role: '',
    content: '',
    campaign: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    const testimonial: Testimonial = {
      id: Date.now().toString(),
      ...newTestimonial,
      image: '/images/default-avatar.png',
      date: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      isFeatured: false,
    };

    setTestimonials([...testimonials, testimonial]);
    setNewTestimonial({ name: '', role: '', content: '', campaign: '' });
    setIsSubmitting(false);
  };

  const displayedTestimonials = isFeatured
    ? testimonials.filter(t => t.isFeatured)
    : testimonials;

  return (
    <div className="py-12">
      {!isFeatured && (
        <div className="max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Share Your Story</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Your Name
                </label>
                <input
                  type="text"
                  value={newTestimonial.name}
                  onChange={(e) => setNewTestimonial({ ...newTestimonial, name: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Your Role
                </label>
                <input
                  type="text"
                  value={newTestimonial.role}
                  onChange={(e) => setNewTestimonial({ ...newTestimonial, role: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Campaign Name
              </label>
              <input
                type="text"
                value={newTestimonial.campaign}
                onChange={(e) => setNewTestimonial({ ...newTestimonial, campaign: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Your Testimonial
              </label>
              <textarea
                value={newTestimonial.content}
                onChange={(e) => setNewTestimonial({ ...newTestimonial, content: e.target.value })}
                rows={4}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                isSubmitting ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isSubmitting ? 'Submitting...' : 'Share Your Story'}
            </button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {displayedTestimonials.map((testimonial) => (
          <div
            key={testimonial.id}
            className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-300"
          >
            <div className="flex items-center mb-4">
              <div className="relative w-12 h-12 rounded-full overflow-hidden mr-4">
                <Image
                  src={testimonial.image}
                  alt={testimonial.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {testimonial.name}
                </h3>
                <p className="text-sm text-gray-500">{testimonial.role}</p>
              </div>
            </div>
            <p className="text-gray-600 mb-4">{testimonial.content}</p>
            <div className="border-t pt-4">
              <p className="text-sm text-gray-500">
                Campaign: {testimonial.campaign}
              </p>
              <p className="text-sm text-gray-400">{testimonial.date}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Testimonials; 