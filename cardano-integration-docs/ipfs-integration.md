# IPFS Integration

This document outlines the detailed steps for integrating IPFS as the primary database for the MedFund application using Blockfrost's IPFS API.

## IPFS Service Setup

First, set up a service to interact with the Blockfrost IPFS API:

```typescript
// src/utils/ipfs/IPFSService.ts
import { BlockFrostIPFS } from '@blockfrost/blockfrost-js';

export class IPFSService {
  private ipfs: BlockFrostIPFS;
  
  constructor(apiKey: string) {
    this.ipfs = new BlockFrostIPFS({
      projectId: apiKey
    });
  }
  
  async uploadFile(file: File): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await this.ipfs.add(file);
      return response.ipfs_hash;
    } catch (error) {
      console.error('IPFS upload error:', error);
      throw error;
    }
  }
  
  async uploadJSON(data: any): Promise<string> {
    try {
      const jsonString = JSON.stringify(data);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const file = new File([blob], 'data.json');
      
      return await this.uploadFile(file);
    } catch (error) {
      console.error('IPFS JSON upload error:', error);
      throw error;
    }
  }
  
  async getFile(ipfsHash: string): Promise<any> {
    try {
      const gateway = `https://ipfs.blockfrost.io/ipfs/${ipfsHash}`;
      const response = await fetch(gateway);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch IPFS content: ${response.statusText}`);
      }
      
      return response;
    } catch (error) {
      console.error('IPFS retrieval error:', error);
      throw error;
    }
  }
  
  async pinFile(ipfsHash: string): Promise<any> {
    try {
      return await this.ipfs.pin(ipfsHash);
    } catch (error) {
      console.error('IPFS pin error:', error);
      throw error;
    }
  }
  
  async unpinFile(ipfsHash: string): Promise<any> {
    try {
      return await this.ipfs.unpin(ipfsHash);
    } catch (error) {
      console.error('IPFS unpin error:', error);
      throw error;
    }
  }
}
```

## Data Schemas

Define structured data schemas for different types of content stored on IPFS:

### Campaign Metadata Schema

```typescript
// src/utils/ipfs/schemas/CampaignMetadata.ts
export interface CampaignMetadata {
  version: string;
  title: string;
  description: string;
  goalAmount: number;
  category: string;
  patient: {
    id: string;
    name?: string;
    age?: number;
  };
  hospital: {
    id: string;
    name: string;
    verificationHash?: string;
  };
  medicalCondition: {
    description: string;
    diagnosisDate: string;
    treatmentPlan: string;
  };
  documents: {
    medicalRecords?: string[]; // IPFS hashes of encrypted medical records
    verificationDocuments?: string[]; // IPFS hashes of verification documents
    treatmentPlan?: string; // IPFS hash of treatment plan document
  };
  updates: {
    timestamp: number;
    content: string;
    documents?: string[]; // IPFS hashes of update documents
  }[];
  created: number; // Timestamp
  updated: number; // Timestamp
  status: 'pending' | 'verified' | 'active' | 'completed' | 'cancelled';
}
```

### Medical Document Schema

```typescript
// src/utils/ipfs/schemas/MedicalDocument.ts
export interface MedicalDocument {
  version: string;
  documentType: 'medicalRecord' | 'verificationDocument' | 'treatmentPlan' | 'update';
  title: string;
  description?: string;
  issuedBy: {
    id: string;
    name: string;
    role: string;
  };
  issuedTo: {
    id: string;
    name: string;
  };
  issuedDate: string;
  contentHash: string; // Hash of the encrypted content
  encryptionMethod: string;
  accessControl: {
    publicKey: string;
    conditions?: any[];
  }[];
  created: number; // Timestamp
}
```

### Verification Attestation Schema

```typescript
// src/utils/ipfs/schemas/VerificationAttestation.ts
export interface VerificationAttestation {
  version: string;
  campaignId: string;
  verifierId: string;
  verifierName: string;
  verifierRole: 'hospital' | 'doctor' | 'admin' | 'community';
  attestationType: 'identity' | 'medical' | 'financial' | 'review';
  status: 'verified' | 'rejected' | 'pending';
  comments?: string;
  evidenceHashes: string[]; // IPFS hashes of supporting documents
  signature: string; // Digital signature of the verifier
  publicKey: string; // Public key of the verifier
  timestamp: number;
}
```

### Transaction Record Schema

```typescript
// src/utils/ipfs/schemas/TransactionRecord.ts
export interface TransactionRecord {
  version: string;
  transactionType: 'donation' | 'withdrawal' | 'refund';
  campaignId: string;
  amount: number;
  token: 'lovelace' | string; // Default is ADA, can be other tokens
  fromAddress?: string; // Optional for privacy
  toAddress: string;
  txHash: string; // Blockchain transaction hash
  metadata?: any;
  timestamp: number;
}
```

## Integration with Campaign Creation Flow

Modify the campaign creation form to store data on IPFS:

```typescript
// src/components/CreateCampaignForm.tsx (modified)
import { useIPFS } from '@/hooks/useIPFS';
import { CampaignMetadata } from '@/utils/ipfs/schemas/CampaignMetadata';

const CreateCampaignForm = () => {
  const { uploadJSON, uploadFile } = useIPFS();
  
  // Existing form state and logic...
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Upload any medical documents to IPFS first
      const documentHashes: Record<string, string> = {};
      
      if (formData.medicalDocuments.length > 0) {
        for (const doc of formData.medicalDocuments) {
          const hash = await uploadFile(doc);
          documentHashes[doc.name] = hash;
        }
      }
      
      if (formData.hospitalVerification) {
        documentHashes.hospitalVerification = await uploadFile(formData.hospitalVerification);
      }
      
      if (formData.treatmentPlan) {
        documentHashes.treatmentPlan = await uploadFile(formData.treatmentPlan);
      }
      
      // Create campaign metadata
      const campaignMetadata: CampaignMetadata = {
        version: "1.0",
        title: formData.title,
        description: formData.description,
        goalAmount: parseFloat(formData.goalAmount),
        category: formData.category,
        patient: {
          id: formData.patientId,
        },
        hospital: {
          id: "", // To be filled by hospital verification
          name: "", // To be filled by hospital verification
        },
        medicalCondition: {
          description: formData.description,
          diagnosisDate: "", // To be filled later
          treatmentPlan: formData.description, // Simplified, actual treatment plan is a document
        },
        documents: {
          medicalRecords: Object.values(documentHashes).filter(hash => hash !== documentHashes.hospitalVerification && hash !== documentHashes.treatmentPlan),
          verificationDocuments: documentHashes.hospitalVerification ? [documentHashes.hospitalVerification] : undefined,
          treatmentPlan: documentHashes.treatmentPlan,
        },
        updates: [],
        created: Date.now(),
        updated: Date.now(),
        status: 'pending',
      };
      
      // Upload campaign metadata to IPFS
      const metadataHash = await uploadJSON(campaignMetadata);
      
      // Submit campaign to blockchain with IPFS hash reference
      // This will be handled by the blockchain integration
      
      alert('Campaign submitted successfully! It will be reviewed by our team.');
      router.push('/campaigns');
    } catch (err) {
      setError('Failed to submit campaign. Please try again.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Rest of component...
};
```

## IPFS Hook for React Components

Create a custom hook to use IPFS in React components:

```typescript
// src/hooks/useIPFS.ts
import { useState, useCallback, useContext } from 'react';
import { IPFSService } from '@/utils/ipfs/IPFSService';
import { BlockchainContext } from '@/blockchain/context/BlockchainContext';

export function useIPFS() {
  const { error, setError } = useContext(BlockchainContext);
  const [isLoading, setIsLoading] = useState(false);
  
  const ipfsService = new IPFSService(process.env.BLOCKFROST_IPFS_KEY);
  
  const uploadFile = useCallback(async (file: File) => {
    setIsLoading(true);
    try {
      const hash = await ipfsService.uploadFile(file);
      return hash;
    } catch (err) {
      setError(`Failed to upload to IPFS: ${err.message}`);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [ipfsService, setError]);
  
  const uploadJSON = useCallback(async (data: any) => {
    setIsLoading(true);
    try {
      const hash = await ipfsService.uploadJSON(data);
      return hash;
    } catch (err) {
      setError(`Failed to upload JSON to IPFS: ${err.message}`);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [ipfsService, setError]);
  
  const getFile = useCallback(async (hash: string) => {
    setIsLoading(true);
    try {
      const data = await ipfsService.getFile(hash);
      return data;
    } catch (err) {
      setError(`Failed to retrieve from IPFS: ${err.message}`);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [ipfsService, setError]);
  
  return { uploadFile, uploadJSON, getFile, isLoading, error };
}
```

## Campaign Detail Page Integration

Update the campaign detail page to fetch and display data from IPFS:

```typescript
// src/app/campaigns/[id]/page.tsx (modified)
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useIPFS } from '@/hooks/useIPFS';
import { CampaignMetadata } from '@/utils/ipfs/schemas/CampaignMetadata';

export default function CampaignDetailPage() {
  const { id } = useParams();
  const { getFile } = useIPFS();
  const [campaignData, setCampaignData] = useState<CampaignMetadata | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchCampaignData = async () => {
      try {
        // First, fetch campaign IPFS hash from blockchain or API
        const response = await fetch(`/api/campaigns/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch campaign data');
        }
        
        const { ipfsHash } = await response.json();
        
        // Then fetch the actual data from IPFS
        const ipfsResponse = await getFile(ipfsHash);
        const metadata = await ipfsResponse.json();
        
        setCampaignData(metadata);
      } catch (err) {
        setError(`Error loading campaign: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCampaignData();
  }, [id, getFile]);
  
  // Render campaign details using the data from IPFS
  // ...
}
```

## Document Viewer Component

Create a component for viewing IPFS-stored documents:

```typescript
// src/components/IPFSDocumentViewer.tsx
'use client';

import { useState, useEffect } from 'react';
import { useIPFS } from '@/hooks/useIPFS';

interface IPFSDocumentViewerProps {
  ipfsHash: string;
  documentType?: string;
}

export default function IPFSDocumentViewer({ ipfsHash, documentType = 'application/pdf' }: IPFSDocumentViewerProps) {
  const { getFile } = useIPFS();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [documentUrl, setDocumentUrl] = useState<string | null>(null);
  
  useEffect(() => {
    const loadDocument = async () => {
      try {
        if (!ipfsHash) {
          throw new Error('No IPFS hash provided');
        }
        
        const response = await getFile(ipfsHash);
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        
        setDocumentUrl(url);
      } catch (err) {
        setError(`Failed to load document: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    
    loadDocument();
    
    return () => {
      // Clean up created URL when component unmounts
      if (documentUrl) {
        URL.revokeObjectURL(documentUrl);
      }
    };
  }, [ipfsHash, getFile]);
  
  if (loading) {
    return <div>Loading document...</div>;
  }
  
  if (error) {
    return <div className="error">{error}</div>;
  }
  
  if (!documentUrl) {
    return <div>No document available</div>;
  }
  
  // Render based on document type
  switch (documentType) {
    case 'application/pdf':
      return (
        <iframe
          src={documentUrl}
          className="w-full h-96 border-0"
          title="PDF Document"
        />
      );
    case 'image/jpeg':
    case 'image/png':
      return <img src={documentUrl} alt="Document" className="max-w-full" />;
    default:
      return <a href={documentUrl} download>Download Document</a>;
  }
}
```

## Backend API for Campaign Data

Create API routes to handle the connection between blockchain and IPFS:

```typescript
// src/app/api/campaigns/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getCampaignIPFSHash } from '@/blockchain/services/CampaignService';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get IPFS hash from blockchain
    const ipfsHash = await getCampaignIPFSHash(params.id);
    
    return NextResponse.json({ ipfsHash });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch campaign data' },
      { status: 500 }
    );
  }
}
```

## Caching Strategy

Implement a caching strategy for IPFS content to improve performance:

```typescript
// src/utils/ipfs/IPFSCache.ts
type CacheEntry = {
  data: any;
  timestamp: number;
};

export class IPFSCache {
  private cache: Map<string, CacheEntry>;
  private maxAge: number; // in milliseconds
  
  constructor(maxAgeMinutes: number = 30) {
    this.cache = new Map();
    this.maxAge = maxAgeMinutes * 60 * 1000;
  }
  
  set(hash: string, data: any): void {
    this.cache.set(hash, {
      data,
      timestamp: Date.now()
    });
  }
  
  get(hash: string): any | null {
    const entry = this.cache.get(hash);
    
    if (!entry) {
      return null;
    }
    
    // Check if entry has expired
    if (Date.now() - entry.timestamp > this.maxAge) {
      this.cache.delete(hash);
      return null;
    }
    
    return entry.data;
  }
  
  clear(): void {
    this.cache.clear();
  }
  
  prune(): void {
    const now = Date.now();
    for (const [hash, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.maxAge) {
        this.cache.delete(hash);
      }
    }
  }
}

// Create a singleton instance
export const ipfsCache = new IPFSCache();
```

## Enhanced IPFS Service with Caching

Update the IPFS service to use caching:

```typescript
// src/utils/ipfs/IPFSService.ts (updated)
import { BlockFrostIPFS } from '@blockfrost/blockfrost-js';
import { ipfsCache } from './IPFSCache';

export class IPFSService {
  private ipfs: BlockFrostIPFS;
  
  constructor(apiKey: string) {
    this.ipfs = new BlockFrostIPFS({
      projectId: apiKey
    });
  }
  
  // ... existing methods ...
  
  async getFile(ipfsHash: string): Promise<any> {
    try {
      // Check cache first
      const cached = ipfsCache.get(ipfsHash);
      if (cached) {
        return cached;
      }
      
      const gateway = `https://ipfs.blockfrost.io/ipfs/${ipfsHash}`;
      const response = await fetch(gateway);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch IPFS content: ${response.statusText}`);
      }
      
      // Clone the response before caching
      const clonedResponse = response.clone();
      ipfsCache.set(ipfsHash, clonedResponse);
      
      return response;
    } catch (error) {
      console.error('IPFS retrieval error:', error);
      throw error;
    }
  }
}
```

## Next Steps

After implementing the IPFS integration, the next steps are to:

1. Implement smart contract integration for campaign management (see [Smart Contract Integration](./smart-contract-integration.md))
2. Add wallet connection functionality (see [Wallet Connection](./wallet-connection.md))
3. Set up additional Cardano features (see [Additional Features](./additional-features.md)) 