'use client';

import { useState } from 'react';
import Link from 'next/link';

interface Campaign {
  id: string;
  title: string;
  description: string;
  goal: number;
  raised: number;
  imageUrl: string;
  category: string;
  urgency: string;
}

interface CampaignCardProps {
  campaign: Campaign;
}

const CampaignCard = ({ campaign }: CampaignCardProps) => {
  const [imageError, setImageError] = useState(false);

  // Add null checks and default values
  const progress = campaign?.raised && campaign?.goal 
    ? (campaign.raised / campaign.goal) * 100 
    : 0;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="relative h-48">
        {imageError ? (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-500">Image not available</span>
          </div>
        ) : (
          <img
            src={campaign?.imageUrl || '/images/default-campaign.jpg'}
            alt={campaign?.title || 'Campaign'}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        )}
        <div className="absolute top-2 right-2">
          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
            campaign?.urgency === 'High' 
              ? 'bg-red-100 text-red-800' 
              : campaign?.urgency === 'Medium'
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-green-100 text-green-800'
          }`}>
            {campaign?.urgency || 'Normal'}
          </span>
        </div>
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-gray-900">
            {campaign?.title || 'Untitled Campaign'}
          </h3>
          <span className="text-sm text-gray-500">
            {campaign?.category || 'Uncategorized'}
          </span>
        </div>
        <p className="text-gray-600 text-sm mb-4">
          {campaign?.description || 'No description available'}
        </p>
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600">
              Raised: {campaign?.raised?.toLocaleString() || '0'} ADA
            </span>
            <span className="text-gray-600">
              Goal: {campaign?.goal?.toLocaleString() || '0'} ADA
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        </div>
        <Link
          href={`/campaigns/${campaign?.id || ''}`}
          className="block w-full text-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          View Details
        </Link>
      </div>
    </div>
  );
};

export default CampaignCard; 