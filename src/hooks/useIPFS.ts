import { useState, useEffect, useCallback } from 'react';
import { PinataService } from '@/utils/ipfs/PinataService';
import { IPFSManager } from '@/utils/ipfs/IPFSManager';
import { CampaignMetadata } from '@/utils/ipfs/schemas/CampaignMetadata';
import { TestimonialMetadata } from '@/utils/ipfs/schemas/TestimonialMetadata';
import { RewardMetadata } from '@/utils/ipfs/schemas/RewardMetadata';
// Import fallback CID value only for initial state
import fallbackCID from '@/utils/ipfs/latest-db-cid.json';

// Define interfaces for the hook return
interface IPFSDatabase {
  campaigns: CampaignMetadata[];
  testimonials: TestimonialMetadata[];
  rewards: RewardMetadata[];
}

interface ImageUploadData {
  key: string;
  base64: string;
  mimeType: string;
}

interface IPFSHookReturn {
  // Service statuses
  isLoading: boolean;
  isConfigured: boolean;
  error: string | null;
  
  // Database management
  database: IPFSDatabase | null;
  databaseCID: string | null;
  loadDatabase: (cid?: string) => Promise<IPFSDatabase>;
  saveDatabase: () => Promise<string>;
  
  // Campaign methods
  uploadCampaignWithImages: (campaign: CampaignMetadata, images: ImageUploadData[]) => Promise<string>;
  getCampaign: (id: string) => CampaignMetadata | null;
  getCampaignImageUrl: (campaign: CampaignMetadata, imageKey: 'campaignImage' | 'coverImage') => string;
  getAllCampaigns: () => CampaignMetadata[];
  
  // Testimonial methods
  uploadTestimonial: (testimonial: TestimonialMetadata, authorImageBase64?: string) => Promise<string>;
  getTestimonialAuthorImageUrl: (testimonial: TestimonialMetadata) => string;
  getTestimonialsByCampaignId: (campaignId: string) => TestimonialMetadata[];
  
  // Reward methods
  uploadReward: (reward: RewardMetadata, rewardImageBase64?: string) => Promise<string>;
  getRewardImageUrl: (reward: RewardMetadata) => string;
  getRewardsByCampaignId: (campaignId: string) => RewardMetadata[];
  
  // Basic IPFS operations
  uploadJSON: (content: any, metadata?: Record<string, any>) => Promise<string>;
  uploadFile: (file: File, metadata?: Record<string, string>) => Promise<string>;
  uploadBase64Image: (
    base64Data: string,
    filename?: string,
    mimeType?: string,
    metadata?: Record<string, string>
  ) => Promise<string>;
  getJSON: (cid: string) => Promise<any>;
  getImageUrl: (cid: string | undefined) => string;
  
  // Gateway URL
  gatewayUrl: string;
}

// Function to fetch the latest CID from API
async function fetchLatestCID(): Promise<string> {
  try {
    const response = await fetch('/api/ipfs/latest-cid');
    
    if (!response.ok) {
      throw new Error(`Failed to fetch latest CID: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.databaseCID;
  } catch (error) {
    console.error('Error fetching latest CID:', error);
    // Return fallback CID if API call fails
    return fallbackCID.databaseCID;
  }
}

export const useIPFS = (): IPFSHookReturn => {
  // Create service instances
  const [ipfsManager] = useState(() => new IPFSManager());
  const { pinata } = ipfsManager;
  
  // State management
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [database, setDatabase] = useState<IPFSDatabase | null>(null);
  const [databaseCID, setDatabaseCID] = useState<string | null>(fallbackCID.databaseCID);

  // Load initial database
  useEffect(() => {
    
    const loadInitialDatabase = async () => {
      
      setIsLoading(true);
      setError(null);
      
      try {
        // Fetch the latest CID from API instead of importing the file
        const latestCid = await fetchLatestCID();
        
        if (latestCid && latestCid !== "QmYourDatabaseCIDHere") {
          console.log(`Loading database from CID: ${latestCid}`);
          const db = await ipfsManager.loadDatabase(latestCid);
          setDatabase(db);
          setDatabaseCID(latestCid);
        } else {
          console.warn('No valid database CID found. Database not loaded.');
          setError('No valid database CID found. Please run the seed script first.');
        }
      } catch (err: any) {
        console.error('Error loading IPFS database:', err);
        setError(`Failed to load IPFS database: ${err.message}`);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadInitialDatabase();
  }, [ipfsManager]);

  // Load database from a specific CID or use the stored one
  const loadDatabase = useCallback(async (cid?: string): Promise<IPFSDatabase> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const cidToUse = cid || databaseCID;
      
      if (!cidToUse) {
        throw new Error('No database CID provided and no stored CID available');
      }
      
      const db = await ipfsManager.loadDatabase(cidToUse);
      setDatabase(db);
      setDatabaseCID(cidToUse);
      return db;
    } catch (err: any) {
      console.error('Error loading database:', err);
      setError(`Failed to load database: ${err.message}`);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [databaseCID, ipfsManager]);

  // Save database to IPFS
  const saveDatabase = useCallback(async (): Promise<string> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const newCid = await ipfsManager.saveDatabase();
      setDatabaseCID(newCid);
      
      // In browser environments, we can't directly write to the JSON file
      // This would need to be handled via a server API endpoint
      console.info(`Database saved with new CID: ${newCid}`);
      
      // Call an API to update the CID file on the server
      try {
        const response = await fetch('/api/ipfs/update-cid', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ databaseCID: newCid })
        });
        
        if (!response.ok) {
          throw new Error(`Failed to update CID file: ${response.statusText}`);
        }
        
        console.info('Successfully updated database CID file on server');
      } catch (updateErr: any) {
        console.warn('Could not update CID file via API:', updateErr.message);
      }
      
      return newCid;
    } catch (err: any) {
      console.error('Error saving database:', err);
      setError(`Failed to save database: ${err.message}`);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [ipfsManager]);

  // Upload a campaign with its images
  const uploadCampaignWithImages = useCallback(async (
    campaign: CampaignMetadata, 
    images: ImageUploadData[]
  ): Promise<string> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const campaignCID = await ipfsManager.uploadCampaign({ campaign, images });
      return campaignCID;
    } catch (err: any) {
      console.error('Error uploading campaign:', err);
      setError(`Failed to upload campaign: ${err.message}`);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [ipfsManager]);

  // Get a campaign by ID
  const getCampaign = useCallback((id: string): CampaignMetadata | null => {
    if (!database) return null;
    return database.campaigns.find(campaign => campaign.id === id) || null;
  }, [database]);

  // Get the URL for a campaign image
  const getCampaignImageUrl = useCallback((campaign: CampaignMetadata, imageKey: 'campaignImage' | 'coverImage'): string => {
    if (!campaign) return '/images/default-campaign.jpg';
    
    const cid = imageKey === 'campaignImage' ? campaign.campaignImageCID : campaign.coverImageCID;
    if (!cid) return '/images/default-campaign.jpg';
    
    return `${pinata.gatewayUrl}${cid}`;
  }, [pinata.gatewayUrl]);

  // Get all campaigns
  const getAllCampaigns = useCallback((): CampaignMetadata[] => {
    return database?.campaigns || [];
  }, [database]);

  // Upload a testimonial
  const uploadTestimonial = useCallback(async (
    testimonial: TestimonialMetadata, 
    authorImageBase64?: string
  ): Promise<string> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const testimonialCID = await ipfsManager.uploadTestimonial(testimonial, authorImageBase64);
      return testimonialCID;
    } catch (err: any) {
      console.error('Error uploading testimonial:', err);
      setError(`Failed to upload testimonial: ${err.message}`);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [ipfsManager]);

  // Get testimonial author image URL
  const getTestimonialAuthorImageUrl = useCallback((testimonial: TestimonialMetadata): string => {
    if (!testimonial || !testimonial.authorImageCID) return '/images/default-avatar.png';
    return `${pinata.gatewayUrl}${testimonial.authorImageCID}`;
  }, [pinata.gatewayUrl]);

  // Get testimonials by campaign ID
  const getTestimonialsByCampaignId = useCallback((campaignId: string): TestimonialMetadata[] => {
    if (!database) return [];
    return database.testimonials.filter(testimonial => testimonial.campaignId === campaignId);
  }, [database]);

  // Upload a reward
  const uploadReward = useCallback(async (
    reward: RewardMetadata, 
    rewardImageBase64?: string
  ): Promise<string> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const rewardCID = await ipfsManager.uploadReward(reward, rewardImageBase64);
      return rewardCID;
    } catch (err: any) {
      console.error('Error uploading reward:', err);
      setError(`Failed to upload reward: ${err.message}`);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [ipfsManager]);

  // Get reward image URL
  const getRewardImageUrl = useCallback((reward: RewardMetadata): string => {
    if (!reward || !reward.imageCID) return '/images/default-reward.png';
    return `${pinata.gatewayUrl}${reward.imageCID}`;
  }, [pinata.gatewayUrl]);

  // Get rewards by campaign ID
  const getRewardsByCampaignId = useCallback((campaignId: string): RewardMetadata[] => {
    if (!database) return [];
    return database.rewards.filter(reward => reward.campaignId === campaignId);
  }, [database]);

  // Helper to construct IPFS URLs
  const getImageUrl = useCallback((cid: string | undefined): string => {
    if (!cid) return '/images/placeholder.png';
    return `${pinata.gatewayUrl}${cid}`;
  }, [pinata.gatewayUrl]);

      return {
    // Service statuses
    isLoading,
    isConfigured: true,
    error,
    
    // Database management
    database,
    databaseCID,
    loadDatabase,
    saveDatabase,
    
    // Campaign methods
    uploadCampaignWithImages,
    getCampaign,
    getCampaignImageUrl,
    getAllCampaigns,
    
    // Testimonial methods
    uploadTestimonial,
    getTestimonialAuthorImageUrl,
    getTestimonialsByCampaignId,
    
    // Reward methods
    uploadReward,
    getRewardImageUrl,
    getRewardsByCampaignId,
    
    // Basic IPFS operations
    uploadJSON: pinata.uploadJSON.bind(pinata),
    uploadFile: pinata.uploadFile.bind(pinata),
    uploadBase64Image: pinata.uploadBase64Image.bind(pinata),
    getJSON: pinata.getJSON.bind(pinata),
    getImageUrl,
    
    // Gateway URL
    gatewayUrl: pinata.gatewayUrl
  };
}; 