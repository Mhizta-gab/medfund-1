# MedFund Blockchain Integration

This directory contains the Cardano blockchain integration for the MedFund platform.

## Architecture

The blockchain integration is built using:

1. **Mesh SDK** - Used for wallet connection and transaction handling
2. **Lucid Evolution** (as fallback) - Alternative blockchain integration library

The system is designed with a fallback mechanism:
- First, it tries to initialize Lucid Evolution with Blockfrost
- If Lucid fails to initialize (e.g., due to API key issues or BigInt conversion errors), it automatically falls back to using Mesh SDK

## Components

### Contexts

- **WalletContext** - Handles wallet connection, disconnection, and state
- **BlockchainContext** - Initializes blockchain providers and provides blockchain state, including the `useMeshFallback` flag

### Contracts

- **CampaignFunding.ts** - Handles donation transactions to campaigns, with support for both Mesh SDK and other wallet APIs

### UI Components

- **WalletConnect.tsx** - Main wallet connection component for the navigation
- **ConnectWalletButton.tsx** - Simplified wallet connection button for use in campaigns
- **AddressDisplay.tsx** - Displays Cardano addresses with copy functionality
- **DocumentViewer.tsx** - Displays IPFS documents related to campaigns
- **ProtectedRoute.tsx** - Route protection based on wallet connection state

## Using the Wallet Integration

To connect to a Cardano wallet in your component:

```tsx
import { useCardanoWallet } from '@/blockchain/context/WalletContext';

function MyComponent() {
  const { 
    connected, 
    walletName, 
    walletAddress, 
    connectWallet, 
    disconnectWallet 
  } = useCardanoWallet();

  // Connect to a specific wallet by name
  const handleConnect = async () => {
    await connectWallet('Nami');
  };

  return (
    <div>
      {connected ? (
        <div>
          <p>Connected to {walletName}</p>
          <p>Address: {walletAddress}</p>
          <button onClick={disconnectWallet}>Disconnect</button>
        </div>
      ) : (
        <button onClick={handleConnect}>Connect Wallet</button>
      )}
    </div>
  );
}
```

## Using the Donation Contract

To create a donation transaction:

```tsx
import { donateToCampaign, validateDonationAmount } from '@/blockchain/contracts/CampaignFunding';
import { useBlockchain } from '@/blockchain/context/BlockchainContext';

function MyComponent() {
  const { useMeshFallback } = useBlockchain();
  // In your component
  const handleDonate = async () => {
    const amountInAda = 10; // 10 ADA
    const recipientAddress = 'addr1...'; // Campaign recipient address
    
    // Validate amount
    const validationError = validateDonationAmount(amountInAda);
    if (validationError) {
      console.error(validationError);
      return;
    }

    try {
      // The donation contract automatically handles the correct API to use
      // whether we're using Mesh SDK or another wallet API
      const txHash = await donateToCampaign(
        {
          donorAddress: walletAddress,
          recipientAddress,
          amountInAda,
          metadata: {
            674: {
              msg: 'Donation to medical campaign',
              campaign: 'campaign-id'
            }
          }
        },
        activeWallet
      );
      
      console.log('Donation successful:', txHash);
    } catch (error) {
      console.error('Donation failed:', error);
    }
  };
}
```

## Troubleshooting

### BigInt Conversion Error

If you see an error like `Cannot convert undefined to a BigInt`, it usually means:

1. The Blockfrost API key is invalid or has usage limits
2. Network connectivity issues with Blockfrost
3. Missing protocol parameters from the Blockfrost API

The application will automatically fall back to using Mesh SDK in this case.

### Setting Environment Variables

For proper functionality, set these environment variables in your `.env.local` file:

```
NEXT_PUBLIC_BLOCKFROST_API_KEY=your_blockfrost_api_key
NEXT_PUBLIC_NETWORK=preprod
NEXT_PUBLIC_MESH_CLIENT_ID=your_mesh_client_id
```

## Metadata Structure

Campaign donations include metadata in the transaction to track campaign funding:

```json
{
  "674": {
    "msg": "Donation to campaign: [Campaign Title]",
    "campaign": "[Campaign IPFS CID]"
  }
}
```

## IPFS Integration

Campaign data is stored on IPFS and referenced in blockchain transactions. The IPFS service is accessed through the `useIPFS` hook:

```tsx
import { useIPFS } from '@/hooks/useIPFS';

function MyComponent() {
  const ipfsService = useIPFS();
  
  const fetchCampaign = async (cid) => {
    const campaignData = await ipfsService.getJSON(cid);
    return campaignData;
  };
}
``` 