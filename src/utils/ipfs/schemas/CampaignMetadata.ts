export interface CampaignMetadata {
  version: string;
  title: string;
  story: string; // Changed from description to story for more narrative content
  goalAmount: number;
  currency: string; // e.g., 'ADA', 'USD' (though goalAmount should be in lovelace if for contract)
  category: string;
  beneficiaryName?: string;
  beneficiaryId?: string; // Optional ID for the beneficiary
  campaignImageCID?: string; // IPFS CID for the main campaign image
  coverImageCID?: string; // IPFS CID for a cover image
  hospitalInfo?: {
    name?: string;
    id?: string; // e.g., a registered hospital ID
    address?: string;
    verificationCID?: string; // IPFS CID of hospital verification document
  };
  medicalCondition: {
    summary: string; // Changed from description
    diagnosisDate?: string;
    treatmentPlanSummary: string; // Changed from treatmentPlan
    estimatedCost?: number;
  };
  documentsCIDs: { // Renamed from documents for clarity (CID = Content Identifier)
    medicalRecords?: string[]; 
    verificationDocuments?: string[]; 
    treatmentPlanFull?: string; 
    consentForms?: string[];
    additionalFiles?: { name: string, cid: string }[];
  };
  updates?: {
    timestamp: number;
    title: string;
    content: string;
    imageCIDs?: string[]; 
  }[];
  contactEmail?: string; // For off-chain communication if needed
  socialLinks?: {
    twitter?: string;
    facebook?: string;
    website?: string;
  };
  tags?: string[];
  created: number; // Timestamp (Unix epoch in seconds or milliseconds)
  updated: number; // Timestamp
  status: 'draft' | 'pending_verification' | 'active' | 'completed' | 'on_hold' | 'cancelled';
  organizerId?: string; // Wallet address or unique ID of the campaign organizer
} 