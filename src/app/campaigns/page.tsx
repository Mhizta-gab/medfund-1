"use client"
import { useState, useEffect } from 'react';
import CampaignCard from '@/components/CampaignCard';
import { cn } from '@/utils';
import { useIPFS } from '@/hooks/useIPFS';
import { CampaignMetadata } from '@/utils/ipfs/schemas/CampaignMetadata';
import { ScaleLoader } from 'react-spinners';

// Campaign interface for UI display
interface UICampaign {
  id: string;
  title: string;
  description: string; // We'll use story from CampaignMetadata
  goalAmount: number;
  raisedAmount: number;
  imageUrl: string;
  daysLeft: number;
  verified: boolean;
}

export default function CampaignsPage() {
  const { 
    isLoading: ipfsLoading, 
    error: ipfsError, 
    getAllCampaigns, 
    getCampaignImageUrl 
  } = useIPFS();
  
  const [campaigns, setCampaigns] = useState<UICampaign[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all'); // all, verified, urgent
  const [isLoaded, setIsLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Calculate days left based on campaign timestamps
  const calculateDaysLeft = (campaign: CampaignMetadata) => {
    if (!campaign.endDate) {
      // If no end date, assume 30 days from creation
      const endTimestamp = campaign.created + (30 * 24 * 60 * 60 * 1000);
      return Math.max(0, Math.ceil((endTimestamp - Date.now()) / (24 * 60 * 60 * 1000)));
    }
    
    return Math.max(0, Math.ceil((campaign.endDate - Date.now()) / (24 * 60 * 60 * 1000)));
  };

  // Load campaigns from IPFS
  useEffect(() => {
    const fetchCampaigns = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Get all campaigns from IPFS
        const ipfsCampaigns = getAllCampaigns();
        
        // Map to UI format
        const uiCampaigns: UICampaign[] = ipfsCampaigns
          .filter(campaign => campaign.status === 'active')
          .map(campaign => ({
            id: campaign.id,
            title: campaign.title,
            description: campaign.story.substring(0, 150) + (campaign.story.length > 150 ? '...' : ''),
            goalAmount: campaign.goalAmount,
            raisedAmount: campaign.raisedAmount,
            imageUrl: getCampaignImageUrl(campaign, 'campaignImage'),
            daysLeft: calculateDaysLeft(campaign),
            verified: campaign.status === 'active' // We'll consider active campaigns as verified for now
          }));
        
        setCampaigns(uiCampaigns);
      } catch (err: any) {
        console.error('Error fetching campaigns:', err);
        setError(`Failed to load campaigns: ${err.message}`);
      } finally {
        setLoading(false);
    setIsLoaded(true);
      }
    };
    
    if (!ipfsLoading) {
      fetchCampaigns();
    }
  }, [ipfsLoading, getAllCampaigns, getCampaignImageUrl]);

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

  // Show loading state
  if (loading || ipfsLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
        <div className="text-center">
          <ScaleLoader color="#3B82F6" height={35} width={4} radius={2} margin={2} />
          <p className="mt-4 text-gray-600 dark:text-gray-300 text-lg">Loading campaigns...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error || ipfsError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
        <div className="text-center max-w-md mx-auto">
          <div className="text-red-500 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">Failed to Load Campaigns</h2>
          <p className="text-gray-600 dark:text-gray-400">
            {error || ipfsError}
          </p>
          <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
            This could be due to a network issue or missing IPFS configuration. Please try again later.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900",
      "transition-opacity duration-500",
      !isLoaded ? "opacity-0" : "opacity-100"
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12 max-w-3xl mx-auto">
          <h1 className={cn(
            "text-4xl md:text-5xl font-extrabold mb-4",
            "bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400",
            "transition-all duration-700 transform",
            isLoaded ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          )}>
            Medical Campaigns
          </h1>
          <p className={cn(
            "text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto",
            "transition-all duration-700 delay-100",
            isLoaded ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          )}>
            Browse and support verified healthcare campaigns on our secure blockchain platform. 
            Your contribution can save lives and make healthcare accessible to those in need.
        </p>
      </div>

        <div className={cn(
          "flex flex-col md:flex-row gap-4 mb-10 max-w-4xl mx-auto",
          "transition-all duration-700 delay-200",
          isLoaded ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
        )}>
        <div className="flex-1">
            <div className="relative">
          <input
            type="text"
            placeholder="Search campaigns..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
                className={cn(
                  "w-full px-5 py-3 rounded-xl",
                  "bg-white dark:bg-gray-800 shadow-sm",
                  "border border-gray-200 dark:border-gray-700",
                  "focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600",
                  "focus:border-transparent outline-none",
                  "transition duration-200"
                )}
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
        </div>
          <div className="flex gap-2 overflow-x-auto md:overflow-visible py-1">
            <FilterButton 
              active={filter === 'all'} 
            onClick={() => setFilter('all')}
          >
            All
            </FilterButton>
            <FilterButton 
              active={filter === 'verified'} 
            onClick={() => setFilter('verified')}
          >
            Verified
            </FilterButton>
            <FilterButton 
              active={filter === 'urgent'} 
            onClick={() => setFilter('urgent')}
          >
            Urgent
            </FilterButton>
        </div>
      </div>

      {filteredCampaigns.length === 0 ? (
          <div className={cn(
            "text-center py-16 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700",
            "transition-all duration-700 delay-300",
            isLoaded ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          )}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 dark:text-gray-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">No campaigns found</h3>
            <p className="text-gray-600 dark:text-gray-400">Try adjusting your search or filter criteria</p>
        </div>
      ) : (
          <div className={cn(
            "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8",
            "transition-all duration-700 delay-300",
            isLoaded ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          )}>
            {filteredCampaigns.map((campaign, index) => (
              <div 
                key={campaign.id}
                className={cn(
                  "transition-all duration-500",
                  isLoaded ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
                  `delay-[${300 + index * 100}ms]`
                )}
              >
                <CampaignCard {...campaign} />
              </div>
          ))}
        </div>
      )}
    </div>
    </div>
  );
}

interface FilterButtonProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

function FilterButton({ active, onClick, children }: FilterButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-5 py-3 rounded-xl font-medium whitespace-nowrap transition-all duration-200",
        active
          ? "bg-blue-600 text-white shadow-md dark:bg-blue-700"
          : "bg-white text-gray-700 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700"
      )}
    >
      {children}
    </button>
  );
} 