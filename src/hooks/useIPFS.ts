import { useMemo } from 'react';
import { IPFSService } from '@/utils/ipfs/IPFSService';

export function useIPFS() {
  const ipfsApiKey = process.env.NEXT_PUBLIC_BLOCKFROST_IPFS_KEY || '';
  // Optionally, allow configuring a different IPFS gateway via env var
  const ipfsGatewayUrl = process.env.NEXT_PUBLIC_IPFS_GATEWAY_URL;

  const ipfsService = useMemo(() => {
    if (!ipfsApiKey) {
      console.warn(
        'NEXT_PUBLIC_BLOCKFROST_IPFS_KEY is not defined. IPFS functionality will be limited or non-operational.'
      );
      // Return a dummy service if IPFS key is missing
      return {
        uploadFile: async (file: File) => { 
          console.error('IPFS Service: API key missing.'); 
          throw new Error('IPFS Service not configured: API key missing.'); 
        },
        uploadJSON: async (data: any) => { 
          console.error('IPFS Service: API key missing.'); 
          throw new Error('IPFS Service not configured: API key missing.'); 
        },
        getFileResponse: async (ipfsHash: string) => { 
          console.error('IPFS Service: API key missing or invalid hash.'); 
          throw new Error('IPFS Service not configured or invalid hash.'); 
        },
        getJSON: async (ipfsHash: string) => { 
          console.error('IPFS Service: API key missing or invalid hash.'); 
          throw new Error('IPFS Service not configured or invalid hash.'); 
        },
        pinFile: async (ipfsHash: string) => { 
          console.error('IPFS Service: API key missing.'); 
          throw new Error('IPFS Service not configured.'); 
        },
        unpinFile: async (ipfsHash: string) => { 
          console.error('IPFS Service: API key missing.'); 
          throw new Error('IPFS Service not configured.'); 
        },
        gatewayUrl: 'https://ipfs.blockfrost.io/ipfs/',
        isConfigured: false
      };
    }
    
    try {
      return new IPFSService(ipfsApiKey, ipfsGatewayUrl);
    } catch (error) {
      console.error('Failed to initialize IPFS service:', error);
      return {
        uploadFile: async () => { throw new Error('IPFS Service initialization failed'); },
        uploadJSON: async () => { throw new Error('IPFS Service initialization failed'); },
        getFileResponse: async () => { throw new Error('IPFS Service initialization failed'); },
        getJSON: async () => { throw new Error('IPFS Service initialization failed'); },
        pinFile: async () => { throw new Error('IPFS Service initialization failed'); },
        unpinFile: async () => { throw new Error('IPFS Service initialization failed'); },
        gatewayUrl: 'https://ipfs.blockfrost.io/ipfs/',
        isConfigured: false
      };
    }
  }, [ipfsApiKey, ipfsGatewayUrl]);

  return ipfsService;
} 