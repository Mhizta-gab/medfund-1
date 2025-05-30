'use client';

import { useState } from 'react';
import Link from 'next/link';
import { cn } from '@/utils';

interface CampaignCardProps {
  id: string;
  title: string;
  description: string;
  goalAmount: number;
  raisedAmount: number;
  imageUrl: string;
  daysLeft: number;
  verified: boolean;
}

const CampaignCard = ({
  id,
  title,
  description,
  goalAmount,
  raisedAmount,
  imageUrl,
  daysLeft,
  verified
}: CampaignCardProps) => {
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const progress = goalAmount > 0 ? (raisedAmount / goalAmount) * 100 : 0;
  
  const urgency = daysLeft <= 7 ? 'High' : daysLeft <= 15 ? 'Medium' : 'Low';
  const urgencyColor = 
    urgency === 'High' ? 'bg-red-100 text-red-800 border-red-300' : 
    urgency === 'Medium' ? 'bg-yellow-100 text-yellow-800 border-yellow-300' : 
    'bg-green-100 text-green-800 border-green-300';

  return (
    <div 
      className={cn(
        "bg-white dark:bg-zinc-900 rounded-xl overflow-hidden transition-all duration-300",
        "border border-gray-200 dark:border-zinc-800",
        "hover:shadow-xl hover:border-blue-200 dark:hover:border-blue-900",
        "transform hover:-translate-y-1",
        isHovered ? "ring-2 ring-blue-400 dark:ring-blue-700" : ""
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative h-48 overflow-hidden">
        {imageError ? (
          <div className="w-full h-full bg-gray-200 dark:bg-zinc-800 flex items-center justify-center">
            <span className="text-gray-500 dark:text-gray-400">Image not available</span>
          </div>
        ) : (
          <div className="w-full h-full overflow-hidden">
          <img
              src={imageUrl || '/images/default-campaign.jpg'}
              alt={title || 'Campaign'}
              className={cn(
                "w-full h-full object-cover transition-transform duration-500",
                isHovered ? "scale-110" : "scale-100"
              )}
            onError={() => setImageError(true)}
          />
            <div className={cn(
              "absolute inset-0 bg-gradient-to-t from-black/60 to-transparent",
              "opacity-70",
              "transition-opacity duration-300",
              isHovered ? "opacity-80" : "opacity-70"
            )} />
          </div>
        )}
        
        <div className="absolute top-3 right-3 flex gap-2">
          {verified && (
            <span className="bg-blue-100 text-blue-800 border border-blue-300 px-2 py-1 text-xs font-semibold rounded-full">
              Verified
            </span>
          )}
          <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${urgencyColor}`}>
            {daysLeft <= 0 ? 'Ended' : `${daysLeft} days left`}
          </span>
        </div>
      </div>
      
      <div className="p-5">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-1">
          {title || 'Untitled Campaign'}
          </h3>
        
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2 h-10">
          {description || 'No description available'}
        </p>
        
        <div className="mb-5">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-700 dark:text-gray-300 font-medium">
              {raisedAmount?.toLocaleString() || '0'} ADA
            </span>
            <span className="text-gray-500 dark:text-gray-400">
              of {goalAmount?.toLocaleString() || '0'} ADA
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-700",
                progress >= 100 
                  ? "bg-green-500 dark:bg-green-600" 
                  : progress >= 75
                  ? "bg-blue-500 dark:bg-blue-600"
                  : progress >= 50
                  ? "bg-indigo-500 dark:bg-indigo-600"
                  : progress >= 25
                  ? "bg-violet-500 dark:bg-violet-600"
                  : "bg-purple-500 dark:bg-purple-600"
              )}
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
          <div className="mt-1 text-right">
            <span className="text-xs text-gray-500 dark:text-gray-400">{Math.round(progress)}% funded</span>
          </div>
        </div>
        
        <Link
          href={`/campaigns/${id}`}
          className={cn(
            "block w-full text-center py-2.5 px-4 rounded-lg font-medium text-white",
            "bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700",
            "shadow-md hover:shadow-lg transition-all duration-300",
            "transform hover:scale-[1.02] active:scale-[0.98]"
          )}
        >
          View Campaign
        </Link>
      </div>
    </div>
  );
};

export default CampaignCard; 