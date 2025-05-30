import { CampaignMetadata } from './schemas/CampaignMetadata';
import { TestimonialMetadata } from './schemas/TestimonialMetadata';
import { RewardMetadata } from './schemas/RewardMetadata';

// Load environment variables
const PINATA_JWT = process.env.PINATA_JWT ?? "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiI1NWQ2NzViMi0xMTE0LTQwM2YtYWY4My1kYWM3NGEwZDhiYWYiLCJlbWFpbCI6ImFidWJha3JqaW1vaDE2NDg4QGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaW5fcG9saWN5Ijp7InJlZ2lvbnMiOlt7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6IkZSQTEifSx7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6Ik5ZQzEifV0sInZlcnNpb24iOjF9LCJtZmFfZW5hYmxlZCI6ZmFsc2UsInN0YXR1cyI6IkFDVElWRSJ9LCJhdXRoZW50aWNhdGlvblR5cGUiOiJzY29wZWRLZXkiLCJzY29wZWRLZXlLZXkiOiI4YjRiMmIwNDViMDY3MGUzNmNjNCIsInNjb3BlZEtleVNlY3JldCI6ImRjZTcxYzc2ZWEyNDBlY2U3ZTk2YjNhOTgxNWU5N2ExMmNkMzFmZmVkNzA5M2NlMzY1ZDVhYzA4YTM0YTE3Y2UiLCJleHAiOjE3ODAxNTA3MzV9.KAoq8hWL6H2Tz1tKj7GueLravuhasKjYucWZgC6Wxt4"
const PINATA_GATEWAY_URL_ENV = process.env.PINATA_GATEWAY_URL ?? "https://gateway.pinata.cloud/ipfs/";

export class PinataService {
  private jwt: string;
  private gateway: string;
  private apiBaseUrl: string = 'https://api.pinata.cloud/v3';
  private uploadBaseUrl: string = 'https://uploads.pinata.cloud/v3'; // Separate base URL for uploads
  private isConfigured: boolean;

  constructor() {
    if (!PINATA_JWT) {
      console.error('CRITICAL: PINATA_JWT environment variable is not set. PinataService will not function.');
      this.jwt = ''; 
      this.isConfigured = false;
    } else {
      this.jwt = PINATA_JWT;
      this.isConfigured = true;
    }
    this.gateway = PINATA_GATEWAY_URL_ENV || 'https://gateway.pinata.cloud/ipfs/';

    if (this.isConfigured) {
        console.log('PinataService configured with JWT from environment variable.');
    }
  }

  public get configured(): boolean {
    return this.isConfigured;
  }

  public get gatewayUrl(): string {
    return this.gateway;
  }

  private async makeApiRequest(baseUrl: string, endpoint: string, options: RequestInit): Promise<any> {
    if (!this.isConfigured) {
      console.error('PinataService.makeApiRequest: Service not configured');
      throw new Error('Pinata service not configured. Missing JWT token.');
    }

    const url = `${baseUrl}${endpoint}`;
    console.log(`PinataService.makeApiRequest: Requesting URL: ${url}, Method: ${options.method}`);
    
    const headers: Record<string, string> = {
      Authorization: `Bearer ${this.jwt}`,
      ...(options.headers as Record<string, string>)
      };

    if (options.body instanceof FormData) {
      delete headers['Content-Type']; 
      console.log('PinataService.makeApiRequest: FormData body detected, Content-Type deleted from headers.');
    } else if (!headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
      console.log('PinataService.makeApiRequest: Defaulted Content-Type to application/json.');
    }

    console.log('PinataService.makeApiRequest: Headers:', JSON.stringify(headers).substring(0, 200) + "...");

    const response = await fetch(url, { ...options, headers });

    console.log(`PinataService.makeApiRequest: Response Status: ${response.status} for URL: ${url}`);

      if (!response.ok) {
      const errorBody = await response.text();
      console.error(`PinataService.makeApiRequest: Pinata API Error (${response.status}) for ${url}: ${errorBody}`);
      throw new Error(`Pinata API request failed: ${response.statusText} - ${errorBody}`);
    }

    if (response.status === 204 || response.headers.get('Content-Length') === '0') {
      console.log(`PinataService.makeApiRequest: Empty response body for URL: ${url}`);
      return null; 
      }

    const responseData = await response.json();
    console.log(`PinataService.makeApiRequest: Response Data for ${url}:`, JSON.stringify(responseData).substring(0,200) + "...");
    return responseData;
  }

  /**
   * Upload JSON content to IPFS via Pinata using V3 /files endpoint
   * This will internally use uploadFile, so it will go to the uploads.pinata.cloud endpoint.
   */
  async uploadJSON(content: any, metadata?: Record<string, any>): Promise<string> {
    console.log(`PinataService.uploadJSON: Preparing to upload JSON data as a file.`);
    if(metadata) console.log(`PinataService.uploadJSON: With metadata:`, metadata);
    const jsonString = JSON.stringify(content);
    // Use metadata.name for filename if provided, otherwise default to 'data.json'
    const fileName = metadata?.name && typeof metadata.name === 'string' ? metadata.name : 'data.json';
    const file = new File([jsonString], fileName, { type: 'application/json' });
    
    const keyvalues = { ...metadata }; 
    if (metadata?.name) delete keyvalues.name; // Remove name from keyvalues as it's used for filename

    return this.uploadFile(file, keyvalues, metadata?.group_id);
  }

  /**
   * Upload a file to IPFS via Pinata using V3 /files endpoint at uploads.pinata.cloud
   */
  async uploadFile(file: File, keyvalues?: Record<string, string>, groupId?: string): Promise<string> {
    console.log(`PinataService.uploadFile: Uploading file: ${file.name}, size: ${file.size}, type: ${file.type}`);
    if (keyvalues) console.log(`PinataService.uploadFile: With keyvalues:`, keyvalues);
    if (groupId) console.log(`PinataService.uploadFile: With groupId: ${groupId}`);

      const formData = new FormData();
    formData.append('file', file); // The file itself
    formData.append('network', 'public'); // As per example, can be parameterized if needed

    // Pinata V3 /files endpoint expects 'name' and 'keyvalues' (as JSON string) in FormData
    // The 'name' field in pinataOptions corresponds to the file's name when stored on Pinata.
    // The File object itself has a name property, which we can use.
    formData.append('name', file.name); 

    if (keyvalues && Object.keys(keyvalues).length > 0) {
      const keyvaluesString = JSON.stringify(keyvalues);
      formData.append('keyvalues', keyvaluesString);
      console.log(`PinataService.uploadFile: Appended keyvalues: ${keyvaluesString}`);
    }
    if (groupId) {
      formData.append('group_id', groupId);
      console.log(`PinataService.uploadFile: Appended groupId: ${groupId}`);
      }

    console.log("PinataService.uploadFile: FormData entries:");
    for (const entry of (formData as any).entries()) {
        console.log(`  ${entry[0]}: ${entry[1] instanceof File ? `File(${entry[1].name}, ${entry[1].size} bytes)` : entry[1]}`);
    }

    // Use this.uploadBaseUrl for file uploads
    const responseData = await this.makeApiRequest(this.uploadBaseUrl, '/files', {
        method: 'POST',
        body: formData,
      });

    if (!responseData?.data?.cid) {
        console.error("PinataService.uploadFile: Pinata V3 upload response missing CID:", responseData);
        throw new Error('Failed to upload file: CID missing in response from Pinata V3 API.');
    }
    console.log(`PinataService.uploadFile: Successfully uploaded file ${file.name}, CID: ${responseData.data.cid}`);
    return responseData.data.cid;
  }

  /**
   * Upload a base64 image to IPFS
   */
  async uploadBase64Image(
    base64Data: string,
    filename: string = 'image.png',
    mimeType: string = 'image/png',
    metadata?: Record<string, string>
  ): Promise<string> {
    console.log(`PinataService.uploadBase64Image: Preparing base64 image: ${filename}, type: ${mimeType}`);
      const base64Content = base64Data.includes('base64,')
        ? base64Data.split('base64,')[1]
        : base64Data;

      const byteCharacters = atob(base64Content);
      const byteArrays = [];
      for (let offset = 0; offset < byteCharacters.length; offset += 512) {
        const slice = byteCharacters.slice(offset, offset + 512);
        const byteNumbers = new Array(slice.length);
        for (let i = 0; i < slice.length; i++) {
          byteNumbers[i] = slice.charCodeAt(i);
        }
      byteArrays.push(new Uint8Array(byteNumbers));
      }
      const blob = new Blob(byteArrays, { type: mimeType });
      const file = new File([blob], filename, { type: mimeType });

      return this.uploadFile(file, metadata);
  }

  /**
   * Get JSON content from IPFS via Pinata gateway
   */
  async getJSON(cid: string): Promise<any> {
    if (!cid) {
      console.error('PinataService.getJSON: CID is required.');
      throw new Error('CID is required to get JSON.');
    }
    console.log(`PinataService.getJSON: Fetching JSON for CID: ${cid} from gateway: ${this.gateway}`);
    try {
      const response = await fetch(`${this.gateway}${cid}`);
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`PinataService.getJSON: Error fetching from gateway (${this.gateway}${cid}): ${response.statusText} - ${errorText}`);
        throw new Error(`Failed to fetch JSON from IPFS gateway (${this.gateway}${cid}): ${response.statusText} - ${errorText}`);
      }
      const jsonData = await response.json();
      console.log(`PinataService.getJSON: Successfully fetched JSON for CID: ${cid}`);
      return jsonData;
    } catch (error) {
      console.error(`PinataService.getJSON: Failed to get JSON from IPFS for CID ${cid}:`, error);
      throw error;
    }
  }

  /**
   * Fetches an image from IPFS and returns it as a base64 string
   */
  async getImageAsBase64(cid: string): Promise<string> {
    if (!cid) {
      console.error('PinataService.getImageAsBase64: CID is required.');
      throw new Error('CID is required to fetch an image.');
    }
    console.log(`PinataService.getImageAsBase64: Fetching image for CID: ${cid} as base64 from gateway: ${this.gateway}`);
    try {
      const response = await fetch(`${this.gateway}${cid}`);
      if (!response.ok) {
        console.error(`PinataService.getImageAsBase64: Error fetching image from gateway (${this.gateway}${cid}): ${response.statusText}`);
        throw new Error(`Failed to fetch image from IPFS: ${response.statusText}`);
      }
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          console.log(`PinataService.getImageAsBase64: Successfully fetched image as base64 for CID: ${cid}`);
          resolve(reader.result as string);
        };
        reader.onerror = (err) => {
            console.error(`PinataService.getImageAsBase64: FileReader error for CID ${cid}:`, err);
            reject(err);
        };
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error(`PinataService.getImageAsBase64: Failed to get image as base64 from IPFS for CID ${cid}:`, error);
      throw error;
    }
  }

  async uploadCampaignMetadata(metadata: CampaignMetadata): Promise<string> {
    console.log(`PinataService.uploadCampaignMetadata: Uploading metadata for campaign ID: ${metadata.id || 'N/A'}`);
    return this.uploadJSON(metadata, {
        name: `campaign-${metadata.id || 'metadata'}.json`,
        type: 'campaign', title: metadata.title, category: metadata.category 
    });
  }

  async getCampaignMetadata(cid: string): Promise<CampaignMetadata> {
    console.log(`PinataService.getCampaignMetadata: Fetching campaign metadata for CID: ${cid}`);
    return this.getJSON(cid) as Promise<CampaignMetadata>;
  }

  async uploadTestimonial(testimonial: TestimonialMetadata): Promise<string> {
    console.log(`PinataService.uploadTestimonial: Uploading testimonial by author: ${testimonial.authorName || 'N/A'}`);
    return this.uploadJSON(testimonial, {
        name: `testimonial-${testimonial.authorName?.replace(/\s+/g, '_') || 'data'}.json`,
        type: 'testimonial', author: testimonial.authorName, campaignId: testimonial.campaignId || '' 
    });
  }

  async uploadReward(reward: RewardMetadata): Promise<string> {
    console.log(`PinataService.uploadReward: Uploading reward titled: ${reward.title || 'N/A'}`);
    return this.uploadJSON(reward, {
        name: `reward-${reward.title.replace(/\s+/g, '_') || 'data'}.json`,
        type: 'reward', title: reward.title, campaignId: reward.campaignId || ''
    });
  }

  async uploadCampaignDatabase(data: {
    campaigns: CampaignMetadata[];
    testimonials: TestimonialMetadata[];
    rewards: RewardMetadata[];
  }): Promise<string> {
    console.log('PinataService.uploadCampaignDatabase: Uploading main campaign database file.');
    return this.uploadJSON(data, {
      name: 'MedFund_Campaign_Database.json',
      type: 'database',
      timestamp: Date.now().toString()
    });
  }
} 