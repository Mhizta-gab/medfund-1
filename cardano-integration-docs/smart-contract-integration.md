# Smart Contract Integration

This document outlines the detailed steps for integrating smart contracts into the MedFund application using Mesh Smart Contract Library and Lucid Evolution.

## Smart Contract Architecture

The MedFund application will use the following smart contracts:

1. **Campaign Contract** - Manages campaign creation, funding, and fund disbursement
2. **Verification Contract** - Handles verification attestations for campaigns
3. **Governance Contract** - Manages voting and proposal processes for fund allocation
4. **Rewards Contract** - Handles token distribution for platform participation

## Contract Service Setup

First, let's create a base contract service that will be extended by specific contract implementations:

```typescript
// src/blockchain/contracts/BaseContractService.ts
import { Lucid, Blockfrost } from '@lucid-evolution/lucid';
import { Transaction } from '@meshsdk/core';

export abstract class BaseContractService {
  protected lucid: Lucid;
  protected network: string;
  
  constructor(apiKey: string, network: string = 'preprod') {
    this.network = network;
    this.initializeLucid(apiKey);
  }
  
  private async initializeLucid(apiKey: string): Promise<void> {
    const blockfrostProvider = new Blockfrost(
      `https://cardano-${this.network}.blockfrost.io/api/v0`,
      apiKey
    );
    
    this.lucid = await Lucid(blockfrostProvider, this.network as any);
  }
  
  protected async buildLucidTransaction(txBuilder: any): Promise<string> {
    const tx = await txBuilder.complete();
    const signedTx = await tx.sign.withWallet().complete();
    return await signedTx.submit();
  }
  
  protected async buildMeshTransaction(wallet: any, txBuilder: any): Promise<string> {
    const unsignedTx = await txBuilder.build();
    const signedTx = await wallet.signTx(unsignedTx);
    return await wallet.submitTx(signedTx);
  }
}
```

## Campaign Contract Service

Now, let's implement the Campaign Contract Service:

```typescript
// src/blockchain/contracts/CampaignContractService.ts
import { BaseContractService } from './BaseContractService';
import { Transaction } from '@meshsdk/core';
import { Data } from '@lucid-evolution/lucid';

export interface CampaignData {
  title: string;
  description: string;
  goalAmount: number;
  category: string;
  ipfsHash: string;
  creatorAddress: string;
}

export class CampaignContractService extends BaseContractService {
  private scriptAddress: string;
  
  constructor(apiKey: string, network: string = 'preprod', scriptAddress?: string) {
    super(apiKey, network);
    // Use provided script address or default test address
    this.scriptAddress = scriptAddress || 'addr_test1...'; // Default test script address
  }
  
  async createCampaign(wallet: any, campaignData: CampaignData): Promise<string> {
    try {
      // Create campaign using Lucid Evolution
      const metadata = {
        721: {
          campaign: {
            title: campaignData.title,
            description: campaignData.description,
            goal: campaignData.goalAmount,
            category: campaignData.category,
            ipfs: campaignData.ipfsHash,
            creator: campaignData.creatorAddress,
            timestamp: Date.now()
          }
        }
      };
      
      const tx = await this.lucid.newTx()
        .payToAddress(this.scriptAddress, { lovelace: 2000000n }) // 2 ADA deposit
        .attachMetadata(721, metadata)
        .complete();
      
      const signedTx = await tx.sign.withWallet().complete();
      return await signedTx.submit();
    } catch (error) {
      console.error('Create campaign error:', error);
      throw error;
    }
  }
  
  async donateToCampaign(wallet: any, campaignId: string, amount: bigint, donorAddress: string): Promise<string> {
    try {
      // Create donation transaction using Mesh SDK for better wallet compatibility
      const tx = new Transaction({ initiator: wallet });
      
      // Add campaign ID and donor info to metadata
      const metadata = {
        721: {
          donation: {
            campaignId: campaignId,
            donor: donorAddress,
            amount: amount.toString(),
            timestamp: Date.now()
          }
        }
      };
      
      tx.sendLovelace(this.scriptAddress, amount.toString())
        .attachMetadata(721, metadata);
      
      const unsignedTx = await tx.build();
      const signedTx = await wallet.signTx(unsignedTx);
      return await wallet.submitTx(signedTx);
    } catch (error) {
      console.error('Donation error:', error);
      throw error;
    }
  }
  
  async withdrawFunds(wallet: any, campaignId: string, amount: bigint, recipientAddress: string): Promise<string> {
    try {
      // Create datum for withdrawal
      const datum: Data = {
        alternative: 0,
        fields: [
          campaignId,
          amount.toString(),
          recipientAddress
        ]
      };
      
      // Create redeemer for withdrawal
      const redeemer: Data = {
        alternative: 0,
        fields: []
      };
      
      // Get UTxO to spend from script address
      const utxos = await this.lucid.utxosAt(this.scriptAddress);
      const campaignUtxo = utxos.find(utxo => {
        // Find UTxO for the specific campaign
        // This is a simplified example - in a real implementation, 
        // you would need to check the datum hash
        return true;
      });
      
      if (!campaignUtxo) {
        throw new Error('Campaign UTxO not found');
      }
      
      // Build transaction to withdraw funds
      const tx = await this.lucid.newTx()
        .collectFrom([campaignUtxo], redeemer)
        .payToAddress(recipientAddress, { lovelace: amount })
        .attachMetadata(721, {
          withdrawal: {
            campaignId: campaignId,
            amount: amount.toString(),
            recipient: recipientAddress,
            timestamp: Date.now()
          }
        })
        .complete();
      
      const signedTx = await tx.sign.withWallet().complete();
      return await signedTx.submit();
    } catch (error) {
      console.error('Withdrawal error:', error);
      throw error;
    }
  }
  
  async getCampaignDetails(campaignId: string): Promise<any> {
    try {
      // Query blockchain for campaign details
      const transactions = await this.lucid.utxosAt(this.scriptAddress);
      
      // Process and return campaign details
      // This is a simplified implementation
      return {
        id: campaignId,
        // Other details would be extracted from the blockchain
      };
    } catch (error) {
      console.error('Get campaign details error:', error);
      throw error;
    }
  }
}
```

## Verification Contract Service

Next, let's implement the Verification Contract Service:

```typescript
// src/blockchain/contracts/VerificationContractService.ts
import { BaseContractService } from './BaseContractService';
import { Data } from '@lucid-evolution/lucid';

export interface VerificationData {
  campaignId: string;
  verifierId: string;
  verificationType: 'identity' | 'medical' | 'financial';
  ipfsHash: string; // Hash of verification documents on IPFS
}

export class VerificationContractService extends BaseContractService {
  private scriptAddress: string;
  
  constructor(apiKey: string, network: string = 'preprod', scriptAddress?: string) {
    super(apiKey, network);
    this.scriptAddress = scriptAddress || 'addr_test1...'; // Default test script address
  }
  
  async createVerification(wallet: any, verificationData: VerificationData): Promise<string> {
    try {
      // Create verification attestation
      const metadata = {
        721: {
          verification: {
            campaignId: verificationData.campaignId,
            verifierId: verificationData.verifierId,
            type: verificationData.verificationType,
            ipfs: verificationData.ipfsHash,
            timestamp: Date.now()
          }
        }
      };
      
      const tx = await this.lucid.newTx()
        .payToAddress(this.scriptAddress, { lovelace: 2000000n }) // 2 ADA deposit
        .attachMetadata(721, metadata)
        .complete();
      
      const signedTx = await tx.sign.withWallet().complete();
      return await signedTx.submit();
    } catch (error) {
      console.error('Create verification error:', error);
      throw error;
    }
  }
  
  async getVerifications(campaignId: string): Promise<any[]> {
    try {
      // Query blockchain for verification attestations
      // This is a simplified implementation
      return [];
    } catch (error) {
      console.error('Get verifications error:', error);
      throw error;
    }
  }
}
```

## Governance Contract Service

Now, let's implement the Governance Contract Service:

```typescript
// src/blockchain/contracts/GovernanceContractService.ts
import { BaseContractService } from './BaseContractService';
import { Data } from '@lucid-evolution/lucid';

export interface ProposalData {
  title: string;
  description: string;
  campaignId?: string;
  ipfsHash: string;
  proposerAddress: string;
  votingEndTime: number;
}

export interface VoteData {
  proposalId: string;
  voterAddress: string;
  vote: 'yes' | 'no' | 'abstain';
  weight: number;
}

export class GovernanceContractService extends BaseContractService {
  private scriptAddress: string;
  
  constructor(apiKey: string, network: string = 'preprod', scriptAddress?: string) {
    super(apiKey, network);
    this.scriptAddress = scriptAddress || 'addr_test1...'; // Default test script address
  }
  
  async createProposal(wallet: any, proposalData: ProposalData): Promise<string> {
    try {
      // Create proposal
      const metadata = {
        721: {
          proposal: {
            title: proposalData.title,
            description: proposalData.description,
            campaignId: proposalData.campaignId,
            ipfs: proposalData.ipfsHash,
            proposer: proposalData.proposerAddress,
            votingEndTime: proposalData.votingEndTime,
            timestamp: Date.now()
          }
        }
      };
      
      const tx = await this.lucid.newTx()
        .payToAddress(this.scriptAddress, { lovelace: 5000000n }) // 5 ADA deposit
        .attachMetadata(721, metadata)
        .complete();
      
      const signedTx = await tx.sign.withWallet().complete();
      return await signedTx.submit();
    } catch (error) {
      console.error('Create proposal error:', error);
      throw error;
    }
  }
  
  async castVote(wallet: any, voteData: VoteData): Promise<string> {
    try {
      // Cast vote
      const metadata = {
        721: {
          vote: {
            proposalId: voteData.proposalId,
            voter: voteData.voterAddress,
            vote: voteData.vote,
            weight: voteData.weight,
            timestamp: Date.now()
          }
        }
      };
      
      const tx = await this.lucid.newTx()
        .payToAddress(this.scriptAddress, { lovelace: 1000000n }) // 1 ADA deposit
        .attachMetadata(721, metadata)
        .complete();
      
      const signedTx = await tx.sign.withWallet().complete();
      return await signedTx.submit();
    } catch (error) {
      console.error('Cast vote error:', error);
      throw error;
    }
  }
  
  async getProposals(): Promise<any[]> {
    try {
      // Query blockchain for proposals
      // This is a simplified implementation
      return [];
    } catch (error) {
      console.error('Get proposals error:', error);
      throw error;
    }
  }
  
  async getVotes(proposalId: string): Promise<any[]> {
    try {
      // Query blockchain for votes
      // This is a simplified implementation
      return [];
    } catch (error) {
      console.error('Get votes error:', error);
      throw error;
    }
  }
}
```

## Rewards Contract Service

Finally, let's implement the Rewards Contract Service:

```typescript
// src/blockchain/contracts/RewardsContractService.ts
import { BaseContractService } from './BaseContractService';
import { Transaction } from '@meshsdk/core';
import { ForgeScript } from '@meshsdk/core';

export interface TokenData {
  recipientAddress: string;
  assetName: string;
  quantity: string;
  metadata: any;
}

export class RewardsContractService extends BaseContractService {
  private policyId: string;
  private policyScript: any;
  
  constructor(apiKey: string, network: string = 'preprod', policyId?: string, policyScript?: any) {
    super(apiKey, network);
    this.policyId = policyId || ''; // Default policy ID
    this.policyScript = policyScript;
  }
  
  async initializePolicy(wallet: any): Promise<string> {
    try {
      // Create policy script
      const address = await wallet.getChangeAddress();
      this.policyScript = ForgeScript.withOneSignature(address);
      
      // Extract policy ID
      this.policyId = this.policyScript.policyId;
      
      return this.policyId;
    } catch (error) {
      console.error('Initialize policy error:', error);
      throw error;
    }
  }
  
  async mintRewardToken(wallet: any, tokenData: TokenData): Promise<string> {
    try {
      if (!this.policyId || !this.policyScript) {
        await this.initializePolicy(wallet);
      }
      
      // Use Mesh SDK for token minting
      const tx = new Transaction({ initiator: wallet });
      
      const asset = {
        assetName: tokenData.assetName,
        assetQuantity: tokenData.quantity,
        metadata: tokenData.metadata,
        label: '721',
        recipient: tokenData.recipientAddress
      };
      
      tx.mintAsset(this.policyScript, asset);
      
      const unsignedTx = await tx.build();
      const signedTx = await wallet.signTx(unsignedTx);
      return await wallet.submitTx(signedTx);
    } catch (error) {
      console.error('Mint reward token error:', error);
      throw error;
    }
  }
  
  async getUserTokens(address: string): Promise<any[]> {
    try {
      // Query blockchain for user tokens
      const assets = await this.lucid.utxosAt(address);
      
      // Filter for tokens with our policy ID
      const tokens = assets
        .flatMap(utxo => Object.entries(utxo.assets))
        .filter(([unit]) => unit.startsWith(this.policyId))
        .map(([unit, quantity]) => ({
          unit,
          quantity,
          policyId: unit.slice(0, 56),
          assetName: unit.slice(56),
        }));
      
      return tokens;
    } catch (error) {
      console.error('Get user tokens error:', error);
      throw error;
    }
  }
}
```

## Contract Factory

Create a factory to manage all contract services:

```typescript
// src/blockchain/contracts/ContractFactory.ts
import { CampaignContractService } from './CampaignContractService';
import { VerificationContractService } from './VerificationContractService';
import { GovernanceContractService } from './GovernanceContractService';
import { RewardsContractService } from './RewardsContractService';

export class ContractFactory {
  private apiKey: string;
  private network: string;
  
  constructor(apiKey: string, network: string = 'preprod') {
    this.apiKey = apiKey;
    this.network = network;
  }
  
  createCampaignService(scriptAddress?: string): CampaignContractService {
    return new CampaignContractService(this.apiKey, this.network, scriptAddress);
  }
  
  createVerificationService(scriptAddress?: string): VerificationContractService {
    return new VerificationContractService(this.apiKey, this.network, scriptAddress);
  }
  
  createGovernanceService(scriptAddress?: string): GovernanceContractService {
    return new GovernanceContractService(this.apiKey, this.network, scriptAddress);
  }
  
  createRewardsService(policyId?: string, policyScript?: any): RewardsContractService {
    return new RewardsContractService(this.apiKey, this.network, policyId, policyScript);
  }
}
```

## React Hook for Contract Interactions

Create a React hook for contract interactions:

```typescript
// src/hooks/useContracts.ts
import { useContext, useMemo } from 'react';
import { BlockchainContext } from '@/blockchain/context/BlockchainContext';
import { ContractFactory } from '@/blockchain/contracts/ContractFactory';
import { useWallet } from '@meshsdk/react';

export function useContracts() {
  const { provider, network } = useContext(BlockchainContext);
  const { wallet, connected } = useWallet();
  
  const contractFactory = useMemo(() => {
    if (!provider) return null;
    
    return new ContractFactory(
      process.env.BLOCKFROST_API_KEY,
      network
    );
  }, [provider, network]);
  
  const campaignService = useMemo(() => {
    if (!contractFactory) return null;
    
    return contractFactory.createCampaignService();
  }, [contractFactory]);
  
  const verificationService = useMemo(() => {
    if (!contractFactory) return null;
    
    return contractFactory.createVerificationService();
  }, [contractFactory]);
  
  const governanceService = useMemo(() => {
    if (!contractFactory) return null;
    
    return contractFactory.createGovernanceService();
  }, [contractFactory]);
  
  const rewardsService = useMemo(() => {
    if (!contractFactory) return null;
    
    return contractFactory.createRewardsService();
  }, [contractFactory]);
  
  return {
    campaignService,
    verificationService,
    governanceService,
    rewardsService,
    wallet,
    connected
  };
}
```

## Integration with Campaign Creation Page

Update the campaign creation page to use the contract services:

```typescript
// src/app/create-campaign/page.tsx (modified)
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useContracts } from '@/hooks/useContracts';
import { useIPFS } from '@/hooks/useIPFS';
import CreateCampaignForm from '@/components/CreateCampaignForm';
import { CampaignData } from '@/blockchain/contracts/CampaignContractService';

export default function CreateCampaignPage() {
  const router = useRouter();
  const { campaignService, wallet, connected } = useContracts();
  const { uploadJSON, uploadFile } = useIPFS();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleCreateCampaign = async (formData: any) => {
    if (!connected || !campaignService) {
      setError('Please connect your wallet first');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Upload campaign data to IPFS
      const ipfsHash = await uploadJSON({
        title: formData.title,
        description: formData.description,
        goalAmount: formData.goalAmount,
        category: formData.category,
        // Other campaign data...
      });
      
      // Get wallet address
      const address = (await wallet.getUsedAddresses())[0];
      
      // Create campaign data
      const campaignData: CampaignData = {
        title: formData.title,
        description: formData.description,
        goalAmount: parseFloat(formData.goalAmount),
        category: formData.category,
        ipfsHash,
        creatorAddress: address
      };
      
      // Create campaign on blockchain
      const txHash = await campaignService.createCampaign(wallet, campaignData);
      
      // Show success message
      alert(`Campaign created successfully! Transaction hash: ${txHash}`);
      
      // Redirect to campaigns page
      router.push('/campaigns');
    } catch (err) {
      setError(`Failed to create campaign: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Create a Campaign</h1>
      
      {!connected && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6">
          <p>Please connect your wallet to create a campaign.</p>
        </div>
      )}
      
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
          <p>{error}</p>
        </div>
      )}
      
      <CreateCampaignForm
        onSubmit={handleCreateCampaign}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
```

## Integration with Campaign Detail Page

Update the campaign detail page to use contract services:

```typescript
// src/app/campaigns/[id]/page.tsx (modified)
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useContracts } from '@/hooks/useContracts';
import { useIPFS } from '@/hooks/useIPFS';

export default function CampaignDetailPage() {
  const { id } = useParams();
  const { campaignService, wallet, connected } = useContracts();
  const { getFile } = useIPFS();
  const [campaign, setCampaign] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [donationAmount, setDonationAmount] = useState<string>('');
  
  useEffect(() => {
    const fetchCampaignData = async () => {
      if (!campaignService) return;
      
      try {
        // Get campaign details from blockchain
        const campaignDetails = await campaignService.getCampaignDetails(id as string);
        
        // Get campaign metadata from IPFS
        const ipfsResponse = await getFile(campaignDetails.ipfsHash);
        const metadata = await ipfsResponse.json();
        
        // Combine blockchain and IPFS data
        setCampaign({
          ...campaignDetails,
          ...metadata
        });
      } catch (err) {
        setError(`Error loading campaign: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    
    if (campaignService) {
      fetchCampaignData();
    }
  }, [id, campaignService, getFile]);
  
  const handleDonate = async () => {
    if (!connected || !campaignService || !wallet) {
      setError('Please connect your wallet first');
      return;
    }
    
    try {
      // Convert ADA to lovelace (1 ADA = 1,000,000 lovelace)
      const lovelaceAmount = BigInt(Math.floor(parseFloat(donationAmount) * 1000000));
      
      // Get wallet address
      const address = (await wallet.getUsedAddresses())[0];
      
      // Make donation
      const txHash = await campaignService.donateToCampaign(
        wallet,
        id as string,
        lovelaceAmount,
        address
      );
      
      alert(`Donation successful! Transaction hash: ${txHash}`);
      setDonationAmount('');
      
      // Refresh campaign data
      setLoading(true);
      const campaignDetails = await campaignService.getCampaignDetails(id as string);
      setCampaign(prev => ({
        ...prev,
        ...campaignDetails
      }));
      setLoading(false);
    } catch (err) {
      setError(`Donation failed: ${err.message}`);
    }
  };
  
  // Render campaign details and donation form
  // ...
}
```

## Next Steps

After implementing these smart contract integration components, the next steps are to:

1. Add wallet connection functionality (see [Wallet Connection](./wallet-connection.md))
2. Set up additional Cardano features (see [Additional Features](./additional-features.md))
3. Implement the timeline for the integration process (see [Timeline](./timeline.md)) 