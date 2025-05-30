export interface RewardMetadata {
  version: string;
  title: string;
  description: string;
  imageCID?: string;
  minimumDonationAmount: number; // In ADA
  supply: number; // Total available
  claimed: number; // How many have been claimed
  campaignId?: string; // Related campaign ID
  campaignTitle?: string;
  startDate?: number; // Timestamp, when reward becomes available
  endDate?: number; // Timestamp, when reward expires
  created: number; // Timestamp
  tokenId?: string; // If this is an NFT reward, its token ID
  policyId?: string; // If this is an NFT reward, its policy ID
  status: 'active' | 'expired' | 'out_of_stock';
  type: 'digital' | 'physical' | 'nft' | 'special_access';
  shippingDetails?: {
    countries: string[];
    estimatedDelivery: string;
  };
} 