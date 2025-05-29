import { CampaignMetadata } from './schemas/CampaignMetadata';

export class PinataService {
  private jwt: string;
  private gateway: string;
  private isConfigured: boolean;

  constructor() {
    this.jwt = process.env.NEXT_PUBLIC_PINATA_JWT || '';
    this.gateway = 'https://gateway.pinata.cloud/ipfs/';
    this.isConfigured = !!this.jwt;
  }

  public get configured(): boolean {
    return this.isConfigured;
  }

  public get gatewayUrl(): string {
    return this.gateway;
  }

  /**
   * Upload JSON content to IPFS via Pinata
   */
  async uploadJSON(content: any): Promise<string> {
    if (!this.isConfigured) {
      throw new Error('Pinata service not configured. Missing JWT token.');
    }

    try {
      const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.jwt}`,
        },
        body: JSON.stringify(content),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to upload JSON: ${error}`);
      }

      const data = await response.json();
      return data.IpfsHash;
    } catch (error) {
      console.error('Failed to upload JSON to Pinata:', error);
      throw error;
    }
  }

  /**
   * Upload a file to IPFS via Pinata
   */
  async uploadFile(file: File, metadata?: Record<string, string>): Promise<string> {
    if (!this.isConfigured) {
      throw new Error('Pinata service not configured. Missing JWT token.');
    }

    try {
      const formData = new FormData();
      formData.append('file', file);
      
      if (metadata) {
        formData.append('pinataMetadata', JSON.stringify({
          name: file.name,
          keyvalues: metadata
        }));
      }

      const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.jwt}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to upload file: ${error}`);
      }

      const data = await response.json();
      return data.IpfsHash;
    } catch (error) {
      console.error('Failed to upload file to Pinata:', error);
      throw error;
    }
  }

  /**
   * Get JSON content from IPFS via Pinata gateway
   */
  async getJSON(cid: string): Promise<any> {
    if (!this.isConfigured && !cid) {
      throw new Error('Pinata service not configured or missing CID.');
    }

    try {
      const response = await fetch(`${this.gateway}${cid}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch JSON from IPFS: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Failed to get JSON from IPFS:', error);
      throw error;
    }
  }

  /**
   * Upload campaign metadata to IPFS
   */
  async uploadCampaignMetadata(metadata: CampaignMetadata): Promise<string> {
    return this.uploadJSON(metadata);
  }

  /**
   * Get campaign metadata from IPFS
   */
  async getCampaignMetadata(cid: string): Promise<CampaignMetadata> {
    return this.getJSON(cid) as Promise<CampaignMetadata>;
  }
} 