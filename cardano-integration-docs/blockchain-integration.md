# Blockchain Integration

This document outlines the detailed steps for integrating Cardano blockchain functionality into the MedFund application.

## Dependencies Installation

The first step is to install the required dependencies:

```bash
npm install @meshsdk/core @meshsdk/react @blockfrost/blockfrost-js @lucid-evolution/lucid
```

## Environment Configuration

Set up environment variables for API keys and network configuration:

```env
# .env.local
NEXT_PUBLIC_NETWORK=preprod
BLOCKFROST_API_KEY=your_blockfrost_api_key
BLOCKFROST_IPFS_KEY=your_blockfrost_ipfs_key
```

## Blockchain Context Provider

Create a blockchain context provider to manage Cardano network connections and wallet state:

```typescript
// src/blockchain/context/BlockchainContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { MeshProvider } from '@meshsdk/react';
import { BlockfrostProvider } from '@lucid-evolution/lucid';

interface BlockchainContextProps {
  network: string;
  provider: any;
  isLoading: boolean;
  error: string | null;
}

const BlockchainContext = createContext<BlockchainContextProps | undefined>(undefined);

export const BlockchainProvider: React.FC = ({ children }) => {
  const [provider, setProvider] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const network = process.env.NEXT_PUBLIC_NETWORK || 'preprod';

  useEffect(() => {
    const initBlockfrost = async () => {
      try {
        const blockfrostProvider = new BlockfrostProvider(
          `https://cardano-${network}.blockfrost.io/api/v0`,
          process.env.BLOCKFROST_API_KEY
        );
        setProvider(blockfrostProvider);
      } catch (err) {
        setError(`Failed to initialize Blockfrost provider: ${err.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    initBlockfrost();
  }, [network]);

  return (
    <BlockchainContext.Provider
      value={{
        network,
        provider,
        isLoading,
        error
      }}
    >
      <MeshProvider>
        {children}
      </MeshProvider>
    </BlockchainContext.Provider>
  );
};

export const useBlockchain = () => {
  const context = useContext(BlockchainContext);
  if (context === undefined) {
    throw new Error('useBlockchain must be used within a BlockchainProvider');
  }
  return context;
};
```

## Application Layout Integration

Implement the MeshProvider in the application layout file:

```typescript
// src/app/layout.tsx
import { BlockchainProvider } from '@/blockchain/context/BlockchainContext';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <BlockchainProvider>
          {/* Rest of your layout */}
          {children}
        </BlockchainProvider>
      </body>
    </html>
  );
}
```

## Transaction Service

Create a service to handle blockchain transactions:

```typescript
// src/blockchain/services/TransactionService.ts
import { Lucid } from '@lucid-evolution/lucid';
import { Transaction } from '@meshsdk/core';

export class TransactionService {
  private lucid: Lucid;
  
  constructor(provider, network) {
    this.lucid = await Lucid(provider, network);
  }
  
  async donateToAddress(wallet, address, amount, metadata = {}) {
    try {
      // Build transaction using Lucid Evolution
      const tx = await this.lucid.newTx()
        .payToAddress(address, { lovelace: amount })
        .attachMetadata(721, metadata)
        .complete();
      
      const signedTx = await tx.sign.withWallet().complete();
      return await signedTx.submit();
    } catch (error) {
      console.error('Transaction error:', error);
      throw error;
    }
  }
  
  async donateUsingMesh(wallet, address, amount, metadata = {}) {
    // Alternative implementation using MeshJS for wallet compatibility
    try {
      const tx = new Transaction({ initiator: wallet })
        .sendLovelace(address, amount.toString())
        .attachMetadata(721, metadata);
      
      const unsignedTx = await tx.build();
      const signedTx = await wallet.signTx(unsignedTx);
      return await wallet.submitTx(signedTx);
    } catch (error) {
      console.error('Transaction error:', error);
      throw error;
    }
  }
}
```

## Webhook Listener Setup

Create a serverless function to handle webhook events from Blockfrost:

```typescript
// src/app/api/blockchain/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyBlockfrostWebhook } from '@/blockchain/utils/webhookVerifier';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const signature = request.headers.get('Blockfrost-Signature');
    
    // Verify webhook signature
    if (!verifyBlockfrostWebhook(body, signature)) {
      return NextResponse.json(
        { error: 'Invalid webhook signature' }, 
        { status: 401 }
      );
    }
    
    // Process the webhook event
    const { type, payload } = body;
    
    switch (type) {
      case 'tx_confirmation':
        // Handle transaction confirmation
        await handleTransactionConfirmation(payload);
        break;
      case 'block_confirmation':
        // Handle block confirmation
        await handleBlockConfirmation(payload);
        break;
      default:
        console.log(`Unknown webhook event type: ${type}`);
    }
    
    return NextResponse.json({ status: 'success' });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}

async function handleTransactionConfirmation(payload) {
  // Implementation for transaction confirmation handling
  // Update campaign funding status, notify users, etc.
}

async function handleBlockConfirmation(payload) {
  // Implementation for block confirmation handling
}
```

## Verification Status Tracking

Implement a service to track and verify status of campaigns on-chain:

```typescript
// src/blockchain/services/VerificationService.ts
import { BlockfrostProvider } from '@lucid-evolution/lucid';

export class VerificationService {
  private provider: BlockfrostProvider;
  
  constructor(apiKey: string, network: string = 'preprod') {
    this.provider = new BlockfrostProvider(
      `https://cardano-${network}.blockfrost.io/api/v0`,
      apiKey
    );
  }
  
  async getVerificationStatus(campaignId: string) {
    try {
      // Query blockchain for verification attestations
      const attestations = await this.queryAttestations(campaignId);
      return this.processAttestations(attestations);
    } catch (error) {
      console.error('Verification status error:', error);
      throw error;
    }
  }
  
  private async queryAttestations(campaignId: string) {
    // Implementation to query on-chain attestations
    // This could involve searching for specific metadata in transactions
    // or querying a smart contract state
  }
  
  private processAttestations(attestations: any[]) {
    // Process attestations to determine verification status
    // Return status object with verification details
  }
}
```

## Blockchain Data Sync Service

Create a service to synchronize blockchain data with the application:

```typescript
// src/blockchain/services/BlockchainSyncService.ts
export class BlockchainSyncService {
  private provider;
  private db; // Database or state management reference
  
  constructor(provider, db) {
    this.provider = provider;
    this.db = db;
  }
  
  async syncCampaignData(campaignId: string) {
    try {
      // Query blockchain for campaign transactions
      const transactions = await this.fetchCampaignTransactions(campaignId);
      
      // Update local state with blockchain data
      await this.updateCampaignState(campaignId, transactions);
      
      return true;
    } catch (error) {
      console.error('Blockchain sync error:', error);
      throw error;
    }
  }
  
  private async fetchCampaignTransactions(campaignId: string) {
    // Implementation to fetch all transactions related to a campaign
  }
  
  private async updateCampaignState(campaignId: string, transactions: any[]) {
    // Implementation to update local state based on blockchain data
  }
}
```

## Testing and Monitoring

Add testing and monitoring utilities for blockchain integration:

```typescript
// src/blockchain/utils/monitoring.ts
export const monitorTransaction = async (txHash: string, provider: any) => {
  let confirmed = false;
  let attempts = 0;
  
  while (!confirmed && attempts < 30) {
    try {
      const status = await provider.getTxStatus(txHash);
      if (status === 'confirmed') {
        confirmed = true;
      } else {
        await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
        attempts++;
      }
    } catch (error) {
      console.error('Transaction monitoring error:', error);
      attempts++;
    }
  }
  
  return confirmed;
};
```

## Next Steps

After implementing these core blockchain integration components, the next steps are to:

1. Set up IPFS integration for document storage (see [IPFS Integration](./ipfs-integration.md))
2. Implement smart contract integration for campaign management (see [Smart Contract Integration](./smart-contract-integration.md))
3. Add wallet connection functionality (see [Wallet Connection](./wallet-connection.md)) 