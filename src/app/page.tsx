'use client';

import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import Image from 'next/image';

// Mock data for featured campaigns
const featuredCampaigns = [
  {
    id: '1',
    title: 'Emergency Heart Surgery',
    description: 'Help John receive life-saving heart surgery at Central Hospital.',
    goal: 50000,
    raised: 35000,
    category: 'Surgery',
    urgency: 'High',
  },
  {
    id: '2',
    title: 'Cancer Treatment Support',
    description: 'Support Sarah battle against breast cancer with needed medical care.',
    goal: 75000,
    raised: 45000,
    category: 'Treatment',
    urgency: 'High',
  },
  {
    id: '3',
    title: 'Pediatric Care Fund',
    description: 'Help provide essential medical care for children in rural communities.',
    goal: 25000,
    raised: 15000,
    category: 'Pediatric',
    urgency: 'Medium',
  },
];

export default function Home() {
  const { isSignedIn, user } = useUser();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-600 to-indigo-800 text-white overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-20">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#grid)" />
          </svg>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Transparent Medical Fundraising on the Blockchain
              </h1>
              <p className="text-xl mb-8 text-blue-100">
                MedFund empowers patients and healthcare providers with secure, transparent fundraising powered by Cardano blockchain technology.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/campaigns" className="bg-white text-blue-700 hover:bg-blue-50 px-6 py-3 rounded-lg font-medium text-center">
                  Browse Campaigns
                </Link>
                <Link href="/create-campaign" className="bg-blue-500 bg-opacity-30 hover:bg-opacity-40 backdrop-blur-sm text-white border border-blue-400 px-6 py-3 rounded-lg font-medium text-center">
                  Start a Campaign
                </Link>
              </div>
            </div>
            <div className="hidden md:block relative">
              <div className="absolute -right-20 -top-20 w-64 h-64 bg-blue-400 rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-blob"></div>
              <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-purple-400 rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-blob animation-delay-2000"></div>
              <div className="absolute inset-0 bg-blue-200 bg-opacity-10 backdrop-filter backdrop-blur-sm rounded-2xl p-8 border border-blue-200 border-opacity-30">
                <div className="bg-white bg-opacity-95 p-6 rounded-xl shadow-lg">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-gray-800">Emergency Heart Surgery</h3>
                    <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">Urgent</span>
                  </div>
                  <div className="mb-4">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '70%' }}></div>
                    </div>
                    <div className="flex justify-between mt-1 text-sm">
                      <span className="text-gray-500">₳35,000 raised</span>
                      <span className="font-medium text-gray-700">₳50,000 goal</span>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm mb-4">
                    Help John receive his life-saving heart surgery. Your contribution makes a difference!
                  </p>
                  <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium">
                    Donate Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* How It Works Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">How MedFund Works</h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              Our blockchain-powered platform ensures transparency and security at every step
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-10">
            <div className="flex flex-col items-center text-center">
              <div className="bg-blue-100 rounded-full p-5 mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Create a Campaign</h3>
              <p className="text-gray-600">
                Medical professionals and patients can create verified campaigns with necessary documentation.
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="bg-blue-100 rounded-full p-5 mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Contribute Securely</h3>
              <p className="text-gray-600">
                Donate using Cardano cryptocurrency with full transparency and minimal fees.
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="bg-blue-100 rounded-full p-5 mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Track Progress</h3>
              <p className="text-gray-600">
                Follow campaign progress and fund utilization through our transparent blockchain records.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Featured Campaigns Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Featured Campaigns</h2>
            <p className="mt-4 text-lg text-gray-600">
              Support these verified healthcare campaigns and make a real impact
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredCampaigns.map((campaign) => (
              <div key={campaign.id} className="bg-white rounded-xl overflow-hidden shadow-md transition-all hover:shadow-lg">
                <div className="h-48 bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center">
                  <span className="text-white text-5xl opacity-30">MF</span>
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-gray-900">{campaign.title}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      campaign.urgency === 'High' 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {campaign.urgency}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-4">{campaign.description}</p>
                  
                  <div className="mb-4">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-blue-600 h-2.5 rounded-full" 
                        style={{ width: `${(campaign.raised / campaign.goal) * 100}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between mt-1 text-sm">
                      <span className="text-gray-500">₳{campaign.raised.toLocaleString()} raised</span>
                      <span className="font-medium text-gray-700">₳{campaign.goal.toLocaleString()} goal</span>
                    </div>
                  </div>
                  
                  <Link 
                    href={`/campaigns/${campaign.id}`}
                    className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center py-2 rounded-lg font-medium"
                  >
                    View Campaign
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link
              href="/campaigns"
              className="inline-flex items-center px-6 py-3 border border-blue-600 text-base font-medium rounded-md text-blue-600 hover:bg-blue-50"
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

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-indigo-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Make a Difference?
          </h2>
          <p className="mt-4 text-xl text-blue-100 max-w-2xl mx-auto mb-8">
            Start a campaign or support those in need today on our secure blockchain platform.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/create-campaign"
              className="bg-white text-blue-700 hover:bg-blue-50 px-6 py-3 rounded-lg font-medium"
            >
              Start a Campaign
            </Link>
            <Link
              href="/campaigns"
              className="bg-blue-500 bg-opacity-30 hover:bg-opacity-40 backdrop-blur-sm text-white border border-blue-400 px-6 py-3 rounded-lg font-medium"
            >
              Browse Campaigns
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
