import { PinataService } from './PinataService';
import { CampaignMetadata } from './schemas/CampaignMetadata';
import { TestimonialMetadata } from './schemas/TestimonialMetadata';
import { RewardMetadata } from './schemas/RewardMetadata';

interface CampaignData {
  campaign: CampaignMetadata;
  images: {
    key: string;
    base64: string;
    mimeType: string;
  }[];
}

interface CampaignDatabase {
  campaigns: CampaignMetadata[];
  testimonials: TestimonialMetadata[];
  rewards: RewardMetadata[];
}

export class IPFSManager {
  private pinataService: PinataService;
  private database: CampaignDatabase | null = null;
  private databaseCID: string | null = null;
  
  constructor() {
    this.pinataService = new PinataService();
  }
  
  /**
   * Get instance of PinataService
   */
  public get pinata(): PinataService {
    return this.pinataService;
  }
  
  /**
   * Check if service is configured properly
   */
  public get isConfigured(): boolean {
    return this.pinataService.configured;
  }
  
  /**
   * Upload a new campaign with images
   */
  async uploadCampaign(campaignData: CampaignData): Promise<string> {
    if (!this.isConfigured) {
      throw new Error('IPFS service not configured');
    }
    
    // Ensure campaign has an ID, and tracking fields are initialized
    if (!campaignData.campaign.id) {
      throw new Error('Campaign ID is required to upload.'); // Or generate one if preferred
    }
    campaignData.campaign.raisedAmount = campaignData.campaign.raisedAmount ?? 0;
    campaignData.campaign.donatorCount = campaignData.campaign.donatorCount ?? 0;
    campaignData.campaign.donationCount = campaignData.campaign.donationCount ?? 0;
    campaignData.campaign.updated = Date.now(); // Ensure updated timestamp is set
    if (!campaignData.campaign.created) {
        campaignData.campaign.created = Date.now(); // Set created if not present
    }

    try {
      // Upload all images first
      const uploadedImageMap: Record<string, string> = {};
      
      for (const image of campaignData.images) {
        const imageHash = await this.pinataService.uploadBase64Image(
          image.base64,
          `${image.key}.${image.mimeType.split('/')[1] || 'png'}`,
          image.mimeType
        );
        uploadedImageMap[image.key] = imageHash;
      }
      
      // Update campaign with image CIDs
      if (uploadedImageMap['campaignImage']) {
        campaignData.campaign.campaignImageCID = uploadedImageMap['campaignImage'];
      }
      
      if (uploadedImageMap['coverImage']) {
        campaignData.campaign.coverImageCID = uploadedImageMap['coverImage'];
      }
      
      // Upload any additional document files with their CIDs
      const documents = campaignData.campaign.documentsCIDs || {};
      for (const key of Object.keys(uploadedImageMap)) {
        if (key.startsWith('document_')) {
          const docKey = key.replace('document_', '');
          if (!documents.additionalFiles) {
            documents.additionalFiles = [];
          }
          documents.additionalFiles.push({
            name: docKey,
            cid: uploadedImageMap[key]
          });
        }
      }
      
      campaignData.campaign.documentsCIDs = documents;
      
      // Upload campaign metadata
      const campaignCID = await this.pinataService.uploadCampaignMetadata(campaignData.campaign);
      
      // Update the database if available
      await this.updateDatabaseWithCampaign(campaignData.campaign);
      
      return campaignCID;
    } catch (error) {
      console.error('Failed to upload campaign to IPFS:', error);
      throw error;
    }
  }
  
  /**
   * Upload a testimonial
   */
  async uploadTestimonial(testimonial: TestimonialMetadata, authorImageBase64?: string): Promise<string> {
    if (!this.isConfigured) {
      throw new Error('IPFS service not configured');
    }
    
    try {
      // Upload author image if provided
      if (authorImageBase64) {
        const imageHash = await this.pinataService.uploadBase64Image(
          authorImageBase64,
          `author_${testimonial.authorName.replace(/\s+/g, '_')}.png`,
          'image/png'
        );
        testimonial.authorImageCID = imageHash;
      }
      
      // Upload testimonial
      const testimonialCID = await this.pinataService.uploadTestimonial(testimonial);
      
      // Update the database if available
      await this.updateDatabaseWithTestimonial(testimonial);
      
      return testimonialCID;
    } catch (error) {
      console.error('Failed to upload testimonial to IPFS:', error);
      throw error;
    }
  }
  
  /**
   * Upload a reward
   */
  async uploadReward(reward: RewardMetadata, rewardImageBase64?: string): Promise<string> {
    if (!this.isConfigured) {
      throw new Error('IPFS service not configured');
    }
    
    try {
      // Upload reward image if provided
      if (rewardImageBase64) {
        const imageHash = await this.pinataService.uploadBase64Image(
          rewardImageBase64,
          `reward_${reward.title.replace(/\s+/g, '_')}.png`,
          'image/png'
        );
        reward.imageCID = imageHash;
      }
      
      // Upload reward
      const rewardCID = await this.pinataService.uploadReward(reward);
      
      // Update the database if available
      await this.updateDatabaseWithReward(reward);
      
      return rewardCID;
    } catch (error) {
      console.error('Failed to upload reward to IPFS:', error);
      throw error;
    }
  }
  
  /**
   * Load campaign database from IPFS
   */
  async loadDatabase(cid: string): Promise<CampaignDatabase> {
    try {
      const database = await this.pinataService.getJSON(cid) as CampaignDatabase;
      this.database = database;
      this.databaseCID = cid;
      return database;
    } catch (error) {
      console.error('Failed to load database from IPFS:', error);
      throw error;
    }
  }
  
  /**
   * Create a new empty database
   */
  async createEmptyDatabase(): Promise<string> {
    console.log('IPFSManager.createEmptyDatabase: Creating new empty database object.');
    const emptyDatabase: CampaignDatabase = {
      campaigns: [],
      testimonials: [],
      rewards: []
    };
    
    console.log('IPFSManager.createEmptyDatabase: Uploading empty database to Pinata.');
    const cid = await this.pinataService.uploadCampaignDatabase(emptyDatabase);
    console.log(`IPFSManager.createEmptyDatabase: Empty database uploaded. CID: ${cid}`);
    
    this.database = emptyDatabase;
    this.databaseCID = cid;
    return cid;
  }
  
  /**
   * Update the database with a new campaign
   */
  private async updateDatabaseWithCampaign(campaign: CampaignMetadata): Promise<void> {
    if (!this.database) {
      return;
    }
    
    // Check if campaign already exists by ID
    const existingIndex = this.database.campaigns.findIndex(c => c.id === campaign.id);
    
    if (existingIndex !== -1) {
      this.database.campaigns[existingIndex] = campaign;
    } else {
      this.database.campaigns.push(campaign);
    }
    
    await this.saveDatabase();
  }
  
  /**
   * Update the database with a new testimonial
   */
  private async updateDatabaseWithTestimonial(testimonial: TestimonialMetadata): Promise<void> {
    if (!this.database) {
      return;
    }
    
    // Check if testimonial already exists
    const existingIndex = this.database.testimonials.findIndex(t => 
      t.authorName === testimonial.authorName && t.campaignId === testimonial.campaignId
    );
    
    if (existingIndex !== -1) {
      this.database.testimonials[existingIndex] = testimonial;
    } else {
      this.database.testimonials.push(testimonial);
    }
    
    await this.saveDatabase();
  }
  
  /**
   * Update the database with a new reward
   */
  private async updateDatabaseWithReward(reward: RewardMetadata): Promise<void> {
    if (!this.database) {
      return;
    }
    
    // Check if reward already exists (you might want to define a unique key for rewards too)
    const existingIndex = this.database.rewards.findIndex(r => r.title === reward.title && r.campaignId === reward.campaignId); // Example unique key
    
    if (existingIndex !== -1) {
      this.database.rewards[existingIndex] = reward;
    } else {
      this.database.rewards.push(reward);
    }
    
    await this.saveDatabase();
  }
  
  /**
   * Saves the current in-memory database to IPFS via Pinata.
   * Returns the new CID of the database.
   */
  public async saveDatabase(): Promise<string> {
    if (!this.database) {
      console.error('IPFSManager.saveDatabase: Database not loaded or initialized.');
      throw new Error('Database not loaded or initialized.');
    }
    if (!this.isConfigured) {
      console.error('IPFSManager.saveDatabase: IPFS service not configured.');
      throw new Error('IPFS service not configured');
    }
    
    console.log('IPFSManager.saveDatabase: Saving current database to Pinata...');
    try {
    const cid = await this.pinataService.uploadCampaignDatabase(this.database);
    this.databaseCID = cid;
      console.log(`IPFSManager.saveDatabase: Database saved successfully. New CID: ${cid}`);
    return cid;
    } catch (error) {
      console.error('IPFSManager.saveDatabase: Failed to save database to IPFS:', error);
      throw error;
    }
  }
} 