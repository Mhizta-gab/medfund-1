"use client"
import { useState } from 'react';
import CampaignCard from '@/components/CampaignCard';


// Mock data for campaigns
const campaigns = [
  {
    id: '1',
    title: 'Emergency Heart Surgery',
    description: 'Help John receive life-saving heart surgery at Central Hospital.',
    goalAmount: 50000,
    raisedAmount: 35000,
    imageUrl: '/images/campaign1.jpeg',
    daysLeft: 15,
    verified: true,
  },
  {
    id: '2',
    title: 'Cancer Treatment Support',
    description: 'Support Sarah battle against breast cancer.',
    goalAmount: 75000,
    raisedAmount: 45000,
    imageUrl: '/images/campaign2.jpg',
    daysLeft: 30,
    verified: true,
  },
  {
    id: '3',
    title: 'Pediatric Care Fund',
    description: 'Help provide essential medical care for children in rural communities.',
    goalAmount: 25000,
    raisedAmount: 15000,
    imageUrl: '/images/campaign3.jpg',
    daysLeft: 20,
    verified: true,
  },
  // Add more campaigns as needed
];

export default function CampaignsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all'); // all, verified, urgent

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         campaign.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filter === 'verified') {
      return matchesSearch && campaign.verified;
    } else if (filter === 'urgent') {
      return matchesSearch && campaign.daysLeft <= 15;
    }
    
    return matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Medical Campaigns</h1>
        <p className="text-gray-600">
          Browse and support verified healthcare campaigns. Your contribution can save lives.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search campaigns..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-md ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('verified')}
            className={`px-4 py-2 rounded-md ${
              filter === 'verified'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Verified
          </button>
          <button
            onClick={() => setFilter('urgent')}
            className={`px-4 py-2 rounded-md ${
              filter === 'urgent'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Urgent
          </button>
        </div>
      </div>

      {filteredCampaigns.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No campaigns found</h3>
          <p className="text-gray-600">Try adjusting your search or filter criteria</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCampaigns.map((campaign) => (
            <CampaignCard key={campaign.id} {...campaign} />
          ))}
        </div>
      )}
    </div>
  );
} 