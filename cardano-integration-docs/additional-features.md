# Additional Cardano Features

This document outlines additional Cardano blockchain features that will be integrated into the MedFund application to enhance its functionality.

## Native Token Rewards

Implement a reward system using Cardano native tokens to incentivize platform participation:

```typescript
// src/blockchain/services/RewardTokenService.ts
import { RewardsContractService, TokenData } from '@/blockchain/contracts/RewardsContractService';

export class RewardTokenService {
  private rewardsService: RewardsContractService;
  
  constructor(rewardsService: RewardsContractService) {
    this.rewardsService = rewardsService;
  }
  
  async createRewardToken(wallet: any, recipientAddress: string, actionType: string): Promise<string | null> {
    try {
      // Define token metadata based on action type
      const metadata = this.getTokenMetadata(actionType);
      
      // Create token data
      const tokenData: TokenData = {
        recipientAddress,
        assetName: `MedFund${actionType}`,
        quantity: '1',
        metadata: {
          name: `MedFund ${actionType} Token`,
          description: `Reward token for ${actionType} on MedFund platform`,
          image: 'ipfs://QmXxxx...', // IPFS hash of token image
          ...metadata
        }
      };
      
      // Mint token
      return await this.rewardsService.mintRewardToken(wallet, tokenData);
    } catch (error) {
      console.error('Create reward token error:', error);
      return null;
    }
  }
  
  private getTokenMetadata(actionType: string): any {
    switch (actionType) {
      case 'Donation':
        return {
          attributes: {
            category: 'Contribution',
            level: 'Supporter',
            points: 10
          }
        };
      case 'Verification':
        return {
          attributes: {
            category: 'Trust',
            level: 'Verifier',
            points: 20
          }
        };
      case 'Campaign':
        return {
          attributes: {
            category: 'Creation',
            level: 'Creator',
            points: 15
          }
        };
      default:
        return {
          attributes: {
            category: 'Participation',
            level: 'Member',
            points: 5
          }
        };
    }
  }
}
```

## Staking Mechanism

Implement a staking mechanism to allow users to stake ADA for governance rights:

```typescript
// src/blockchain/services/StakingService.ts
import { BaseContractService } from '@/blockchain/contracts/BaseContractService';
import { Transaction } from '@meshsdk/core';

export interface StakeData {
  amount: bigint;
  duration: number; // in days
  stakingAddress: string;
}

export class StakingService extends BaseContractService {
  private scriptAddress: string;
  
  constructor(apiKey: string, network: string = 'preprod', scriptAddress?: string) {
    super(apiKey, network);
    this.scriptAddress = scriptAddress || 'addr_test1...'; // Default test script address
  }
  
  async stakeAda(wallet: any, stakeData: StakeData): Promise<string> {
    try {
      // Calculate unlock time (current time + duration in milliseconds)
      const unlockTime = Date.now() + stakeData.duration * 24 * 60 * 60 * 1000;
      
      // Create metadata for staking
      const metadata = {
        721: {
          stake: {
            amount: stakeData.amount.toString(),
            duration: stakeData.duration,
            unlockTime,
            stakingAddress: stakeData.stakingAddress,
            timestamp: Date.now()
          }
        }
      };
      
      // Create staking transaction
      const tx = await this.lucid.newTx()
        .payToAddress(this.scriptAddress, { lovelace: stakeData.amount })
        .attachMetadata(721, metadata)
        .complete();
      
      const signedTx = await tx.sign.withWallet().complete();
      return await signedTx.submit();
    } catch (error) {
      console.error('Staking error:', error);
      throw error;
    }
  }
  
  async unstake(wallet: any, stakeId: string): Promise<string> {
    try {
      // Implementation for unstaking
      // This would involve checking if the lock period has expired
      // and then returning the staked ADA to the user
      
      return 'tx_hash';
    } catch (error) {
      console.error('Unstaking error:', error);
      throw error;
    }
  }
  
  async getStakingInfo(address: string): Promise<any[]> {
    try {
      // Query blockchain for staking information
      // This is a simplified implementation
      return [];
    } catch (error) {
      console.error('Get staking info error:', error);
      throw error;
    }
  }
}
```

## Multi-signature Transactions

Implement multi-signature transactions for campaign fund disbursement:

```typescript
// src/blockchain/services/MultiSigService.ts
import { BaseContractService } from '@/blockchain/contracts/BaseContractService';
import { Transaction } from '@meshsdk/core';

export interface MultiSigConfig {
  requiredSignatures: number;
  signers: string[];
}

export interface MultiSigTxData {
  campaignId: string;
  amount: bigint;
  recipientAddress: string;
  purpose: string;
}

export class MultiSigService extends BaseContractService {
  private scriptAddress: string;
  
  constructor(apiKey: string, network: string = 'preprod', scriptAddress?: string) {
    super(apiKey, network);
    this.scriptAddress = scriptAddress || 'addr_test1...'; // Default test script address
  }
  
  async createMultiSigTransaction(wallet: any, txData: MultiSigTxData, config: MultiSigConfig): Promise<string> {
    try {
      // Create metadata for multi-sig transaction
      const metadata = {
        721: {
          multiSig: {
            campaignId: txData.campaignId,
            amount: txData.amount.toString(),
            recipient: txData.recipientAddress,
            purpose: txData.purpose,
            requiredSignatures: config.requiredSignatures,
            signers: config.signers,
            signatures: [wallet.name], // First signature
            timestamp: Date.now()
          }
        }
      };
      
      // Create multi-sig transaction
      const tx = await this.lucid.newTx()
        .payToAddress(this.scriptAddress, { lovelace: txData.amount })
        .attachMetadata(721, metadata)
        .complete();
      
      const signedTx = await tx.sign.withWallet().complete();
      return await signedTx.submit();
    } catch (error) {
      console.error('Create multi-sig transaction error:', error);
      throw error;
    }
  }
  
  async signTransaction(wallet: any, txId: string): Promise<string> {
    try {
      // Implementation for adding a signature to an existing multi-sig transaction
      // This would involve fetching the current transaction metadata,
      // adding the new signature, and submitting an updated transaction
      
      return 'tx_hash';
    } catch (error) {
      console.error('Sign transaction error:', error);
      throw error;
    }
  }
  
  async executeTransaction(wallet: any, txId: string): Promise<string> {
    try {
      // Implementation for executing a multi-sig transaction
      // This would involve checking if the required number of signatures
      // has been reached, and then executing the transaction
      
      return 'tx_hash';
    } catch (error) {
      console.error('Execute transaction error:', error);
      throw error;
    }
  }
}
```

## Metadata-based Verification

Implement a verification system using transaction metadata:

```typescript
// src/blockchain/services/MetadataVerificationService.ts
import { BaseContractService } from '@/blockchain/contracts/BaseContractService';

export interface VerificationMetadata {
  campaignId: string;
  documentHash: string;
  verifierAddress: string;
  verifierRole: string;
  status: 'verified' | 'rejected' | 'pending';
  comments?: string;
}

export class MetadataVerificationService extends BaseContractService {
  async createVerificationAttestation(wallet: any, metadata: VerificationMetadata): Promise<string> {
    try {
      // Create transaction with verification metadata
      const tx = await this.lucid.newTx()
        .attachMetadata(721, {
          verification: {
            campaignId: metadata.campaignId,
            documentHash: metadata.documentHash,
            verifier: metadata.verifierAddress,
            role: metadata.verifierRole,
            status: metadata.status,
            comments: metadata.comments,
            timestamp: Date.now()
          }
        })
        .complete();
      
      const signedTx = await tx.sign.withWallet().complete();
      return await signedTx.submit();
    } catch (error) {
      console.error('Create verification attestation error:', error);
      throw error;
    }
  }
  
  async getVerificationAttestations(campaignId: string): Promise<any[]> {
    try {
      // Query blockchain for verification attestations
      // This would involve searching for transactions with specific metadata
      
      // This is a simplified implementation
      return [];
    } catch (error) {
      console.error('Get verification attestations error:', error);
      throw error;
    }
  }
}
```

## Milestone-based Fund Release

Implement a milestone-based fund release system:

```typescript
// src/blockchain/services/MilestoneService.ts
import { BaseContractService } from '@/blockchain/contracts/BaseContractService';

export interface Milestone {
  id: string;
  campaignId: string;
  title: string;
  description: string;
  amount: bigint;
  evidenceRequired: string[];
  completed: boolean;
}

export class MilestoneService extends BaseContractService {
  private scriptAddress: string;
  
  constructor(apiKey: string, network: string = 'preprod', scriptAddress?: string) {
    super(apiKey, network);
    this.scriptAddress = scriptAddress || 'addr_test1...'; // Default test script address
  }
  
  async createMilestone(wallet: any, milestone: Milestone): Promise<string> {
    try {
      // Create metadata for milestone
      const metadata = {
        721: {
          milestone: {
            id: milestone.id,
            campaignId: milestone.campaignId,
            title: milestone.title,
            description: milestone.description,
            amount: milestone.amount.toString(),
            evidenceRequired: milestone.evidenceRequired,
            completed: false,
            timestamp: Date.now()
          }
        }
      };
      
      // Create milestone transaction
      const tx = await this.lucid.newTx()
        .attachMetadata(721, metadata)
        .complete();
      
      const signedTx = await tx.sign.withWallet().complete();
      return await signedTx.submit();
    } catch (error) {
      console.error('Create milestone error:', error);
      throw error;
    }
  }
  
  async completeMilestone(wallet: any, milestoneId: string, evidenceHashes: string[]): Promise<string> {
    try {
      // Create metadata for milestone completion
      const metadata = {
        721: {
          milestoneCompletion: {
            milestoneId,
            evidence: evidenceHashes,
            completedBy: await wallet.getChangeAddress(),
            timestamp: Date.now()
          }
        }
      };
      
      // Create milestone completion transaction
      const tx = await this.lucid.newTx()
        .attachMetadata(721, metadata)
        .complete();
      
      const signedTx = await tx.sign.withWallet().complete();
      return await signedTx.submit();
    } catch (error) {
      console.error('Complete milestone error:', error);
      throw error;
    }
  }
  
  async releaseMilestoneFunds(wallet: any, milestoneId: string, recipientAddress: string): Promise<string> {
    try {
      // Implementation for releasing funds upon milestone completion
      // This would involve checking if the milestone has been completed
      // and then releasing the funds to the recipient
      
      return 'tx_hash';
    } catch (error) {
      console.error('Release milestone funds error:', error);
      throw error;
    }
  }
}
```

## Decentralized Identity Integration

Implement integration with Atala PRISM for decentralized identity:

```typescript
// src/blockchain/services/IdentityService.ts
// Note: This is a simplified implementation as Atala PRISM integration
// would require additional libraries and setup

export class IdentityService {
  async createDID(wallet: any, userInfo: any): Promise<string> {
    try {
      // Implementation for creating a decentralized identifier
      // This would involve interaction with Atala PRISM or similar services
      
      return 'did:prism:example';
    } catch (error) {
      console.error('Create DID error:', error);
      throw error;
    }
  }
  
  async issueCredential(issuerDID: string, subjectDID: string, claims: any): Promise<string> {
    try {
      // Implementation for issuing a verifiable credential
      // This would involve creating and signing a credential using Atala PRISM
      
      return 'credential_id';
    } catch (error) {
      console.error('Issue credential error:', error);
      throw error;
    }
  }
  
  async verifyCredential(credentialId: string): Promise<boolean> {
    try {
      // Implementation for verifying a credential
      // This would involve checking the credential's signature and validity
      
      return true;
    } catch (error) {
      console.error('Verify credential error:', error);
      throw error;
    }
  }
}
```

## Integration with Rewards Page

Update the rewards page to display and manage reward tokens:

```typescript
// src/app/rewards/page.tsx (modified)
'use client';

import { useEffect, useState } from 'react';
import { useCardanoWallet } from '@/blockchain/context/WalletContext';
import { useContracts } from '@/hooks/useContracts';
import ProtectedRoute from '@/components/blockchain/ProtectedRoute';

export default function RewardsPage() {
  const { connected, walletAddress } = useCardanoWallet();
  const { rewardsService } = useContracts();
  const [tokens, setTokens] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    const fetchTokens = async () => {
      if (rewardsService && walletAddress) {
        setLoading(true);
        try {
          const userTokens = await rewardsService.getUserTokens(walletAddress);
          setTokens(userTokens);
        } catch (error) {
          console.error('Failed to fetch tokens:', error);
        } finally {
          setLoading(false);
        }
      }
    };
    
    fetchTokens();
  }, [rewardsService, walletAddress]);
  
  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Your Rewards</h1>
        
        {!connected ? (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4">
            <p>Please connect your wallet to view your rewards.</p>
          </div>
        ) : loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4">Loading your rewards...</p>
          </div>
        ) : tokens.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <h2 className="text-xl font-medium mb-4">No Rewards Yet</h2>
            <p className="text-gray-600 mb-6">
              Participate in the MedFund platform to earn reward tokens.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium">Donate to Campaigns</h3>
                <p className="text-sm text-gray-500">Earn supporter tokens</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium">Create Campaigns</h3>
                <p className="text-sm text-gray-500">Earn creator tokens</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium">Verify Information</h3>
                <p className="text-sm text-gray-500">Earn verifier tokens</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tokens.map((token) => (
              <div key={token.unit} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="bg-blue-500 text-white p-4">
                  <h2 className="text-lg font-bold">{token.assetName || 'MedFund Token'}</h2>
                </div>
                <div className="p-4">
                  <div className="mb-4">
                    <span className="text-sm text-gray-500">Quantity</span>
                    <p className="font-medium">{token.quantity}</p>
                  </div>
                  <div className="mb-4">
                    <span className="text-sm text-gray-500">Policy ID</span>
                    <p className="text-xs font-mono truncate">{token.policyId}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Asset Name</span>
                    <p className="text-xs font-mono">{token.assetName}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
```

## Next Steps

After implementing these additional Cardano features, the final step is to:

1. Implement the timeline for the integration process (see [Timeline](./timeline.md)) 