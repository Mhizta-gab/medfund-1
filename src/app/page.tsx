'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import Testimonials from '@/components/Testimonials';
import Hero from '@/components/Hero';
import CampaignCard from '@/components/CampaignCard';
import FeaturedCampaigns from '@/components/FeaturedCampaigns';

// Mock data for featured campaigns
const featuredCampaigns = [
  {
    id: '1',
    title: 'Emergency Heart Surgery',
    description: 'Help John receive life-saving heart surgery at Central Hospital. Your contribution can make a difference in saving a life.',
    goal: 50000,
    raised: 35000,
    imageUrl: '/images/campaign1.jpeg',
    category: 'Surgery',
    urgency: 'High',
  },
  {
    id: '2',
    title: 'Cancer Treatment Support',
    description: 'Support Sarah battle against breast cancer. The funds will help cover chemotherapy and related medical expenses.',
    goal: 75000,
    raised: 45000,
    imageUrl: '/images/campaign2.jpg',
    category: 'Treatment',
    urgency: 'High',
  },
  {
    id: '3',
    title: 'Pediatric Care Fund',
    description: 'Help provide essential medical care for children in rural communities. Every contribution helps save young lives.',
    goal: 25000,
    raised: 15000,
    imageUrl: '/images/campaign3.jpg',
    category: 'Pediatric',
    urgency: 'Medium',
  },
];

export default function Home() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null; // or a loading spinner
  }

  return (
    <div className="min-h-screen">
      <Hero />
      
      {/* Featured Campaigns Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Featured Campaigns</h2>
            <p className="mt-4 text-lg text-gray-600">
              Support these verified healthcare campaigns and make a real impact
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredCampaigns.map((campaign) => (
              <CampaignCard key={campaign.id} campaign={campaign} />
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link
              href="/campaigns"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              View All Campaigns
              <svg
                className="ml-2 -mr-1 w-5 h-5"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Testimonials */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900">
              Success Stories
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Read inspiring stories from our beneficiaries
            </p>
          </div>
          <Testimonials isFeatured={true} />
          <div className="text-center mt-8">
            <Link
              href="/testimonials"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              View All Testimonials →
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">
            Ready to Make a Difference?
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Start a campaign or support those in need today.
          </p>
          <div className="mt-8 flex justify-center space-x-4">
            <Link
              href="/create-campaign"
              className="inline-block bg-blue-600 text-white px-8 py-3 rounded-md text-lg font-medium hover:bg-blue-700"
            >
              Start a Campaign
            </Link>
            <Link
              href="/campaigns"
              className="inline-block bg-gray-200 text-gray-800 px-8 py-3 rounded-md text-lg font-medium hover:bg-gray-300"
            >
              Browse Campaigns
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
