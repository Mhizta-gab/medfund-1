import { useState, useEffect } from 'react';
import { PinataService } from '@/utils/ipfs/PinataService';

export const useIPFS = () => {
  const [pinataService] = useState(() => new PinataService());
  const [isConfigured, setIsConfigured] = useState(false);

  useEffect(() => {
    setIsConfigured(pinataService.configured);
  }, [pinataService]);

      return {
    uploadJSON: pinataService.uploadJSON.bind(pinataService),
    uploadFile: pinataService.uploadFile.bind(pinataService),
    getJSON: pinataService.getJSON.bind(pinataService),
    uploadCampaignMetadata: pinataService.uploadCampaignMetadata.bind(pinataService),
    getCampaignMetadata: pinataService.getCampaignMetadata.bind(pinataService),
    isConfigured,
    gatewayUrl: pinataService.gatewayUrl,
  };
}; 