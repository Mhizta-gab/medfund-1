// import { BlockFrostIPFS } from '@blockfrost/blockfrost-js';

export class IPFSService {
  // private ipfs: BlockFrostIPFS | null = null;
  private apiKey: string;
  private apiUrl: string = 'https://ipfs.blockfrost.io/api/v0';
  public gatewayUrl: string = 'https://ipfs.blockfrost.io/ipfs/'; // Default gateway
  public isConfigured: boolean = false;
  
  constructor(apiKey: string, gatewayUrl?: string) {
    if (!apiKey) {
      throw new Error('Blockfrost IPFS API key is required to initialize IPFSService.');
    }
    this.apiKey = apiKey;
    
    // We no longer create a BlockFrostIPFS instance - we'll use fetch API for everything
    // if (typeof window === 'undefined') {
    //   // Server-side
    //   this.ipfs = new BlockFrostIPFS({
    //     projectId: apiKey,
    //   });
    // }
    
    if (gatewayUrl) {
      this.gatewayUrl = gatewayUrl.endsWith('/') ? gatewayUrl : `${gatewayUrl}/`;
    }
    
    this.isConfigured = true;
  }
  
  async uploadFile(file: File): Promise<string> {
    try {
      // Use fetch API for browser compatibility
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch(`${this.apiUrl}/add`, {
        method: 'POST',
        headers: {
          'project_id': this.apiKey
        },
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`IPFS upload failed: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      if (!data || !data.ipfs_hash) {
        throw new Error('IPFS upload failed: No IPFS hash returned.');
      }
      
      return data.ipfs_hash;
    } catch (error: any) {
      console.error('IPFS uploadFile error:', error.message || error);
      throw new Error(`IPFS uploadFile failed: ${error.message || error}`);
    }
  }
  
  async uploadJSON(data: any): Promise<string> {
    try {
      const jsonString = JSON.stringify(data);
      const blob = new Blob([jsonString], { type: 'application/json' });
      // Create a file with a more descriptive name if possible, though Blockfrost might ignore it.
      const file = new File([blob], 'data.json', { type: 'application/json' });
      
      return await this.uploadFile(file);
    } catch (error: any) {
      console.error('IPFS uploadJSON error:', error.message || error);
      throw new Error(`IPFS uploadJSON failed: ${error.message || error}`);
    }
  }
  
  // Fetches the raw response. The consumer will need to handle .json(), .blob(), .text() etc.
  async getFileResponse(ipfsHash: string): Promise<Response> {
    try {
      if (!ipfsHash) {
        throw new Error('IPFS hash is required to get a file.');
      }
      const fullUrl = `${this.gatewayUrl}${ipfsHash}`;
      const response = await fetch(fullUrl);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch IPFS content from ${fullUrl}: ${response.status} ${response.statusText}`);
      }
      
      return response;
    } catch (error: any) {
      console.error('IPFS getFileResponse error:', error.message || error);
      throw new Error(`IPFS getFileResponse failed: ${error.message || error}`);
    }
  }

  // Convenience method to get JSON data directly
  async getJSON(ipfsHash: string): Promise<any> {
    const response = await this.getFileResponse(ipfsHash);
    try {
      return await response.json();
    } catch (error: any) {
      console.error('IPFS getJSON error - failed to parse JSON:', error.message || error);
      throw new Error(`IPFS getJSON failed - not valid JSON or fetch error: ${error.message || error}`);
    }
  }
  
  async pinFile(ipfsHash: string): Promise<any> {
    try {
      if (!ipfsHash) {
        throw new Error('IPFS hash is required to pin a file.');
      }

      // Use fetch API for browser compatibility
      const response = await fetch(`${this.apiUrl}/pin/add/${ipfsHash}`, {
        method: 'POST',
        headers: {
          'project_id': this.apiKey
        }
      });
      
      if (!response.ok) {
        throw new Error(`IPFS pin failed: ${response.status} ${response.statusText}`);
      }
      
      return response.json();
    } catch (error: any) {
      console.error('IPFS pinFile error:', error.message || error);
      throw new Error(`IPFS pinFile failed: ${error.message || error}`);
    }
  }
  
  async unpinFile(ipfsHash: string): Promise<any> {
    try {
      if (!ipfsHash) {
        throw new Error('IPFS hash is required to unpin a file.');
      }

      // Use fetch API for browser compatibility
      const response = await fetch(`${this.apiUrl}/pin/remove/${ipfsHash}`, {
        method: 'POST',
        headers: {
          'project_id': this.apiKey
        }
      });
      
      if (!response.ok) {
        throw new Error(`IPFS unpin failed: ${response.status} ${response.statusText}`);
      }
      
      return response.json();
    } catch (error: any) {
      console.error('IPFS unpinFile error:', error.message || error);
      throw new Error(`IPFS unpinFile failed: ${error.message || error}`);
    }
  }
} 