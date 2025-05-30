# Campaign Donation Feature

This directory contains components related to the medical fundraising campaigns, focusing on displaying campaign details and enabling donations through the Cardano blockchain.

## Key Components

- `CampaignDetail.tsx` - Main component for displaying a single campaign and processing donations
- `CampaignCard.tsx` - Card component for listing campaigns in the campaigns page

## Integration with Cardano Blockchain

The donation feature integrates with Cardano using a combination of:

1. **Mesh SDK** - Primary library for wallet connection and transaction handling
2. **Lucid Evolution** - Used as a fallback for transaction building

### Wallet Connection

Wallet connection is handled through the `useCardanoWallet` hook, which uses Mesh SDK's `useWallet` internally but adds additional functionality:

- Auto-reconnection to previously used wallets
- Support for various wallet providers (Nami, Eternl, Flint, etc.)
- Simplified API for wallet interactions

### Donation Process

The donation process follows these steps:

1. User connects their Cardano wallet
2. User enters the donation amount (validated with minimum/maximum limits)
3. The system validates the input and wallet connection
4. A transaction is created with:
   - Payment to the campaign address
   - Metadata with campaign ID and timestamp for tracking
5. The transaction is signed by the user's wallet
6. The transaction is submitted to the Cardano network
7. Success/failure feedback is provided to the user

### Transaction Metadata

Each donation includes metadata in the Cardano transaction with the format:

```json
{
  "721": {
    "donation": {
      "campaignId": "campaign-123",
      "timestamp": 1681234567890
    }
  }
}
```

This metadata helps with tracking donations and associating them with specific campaigns.

## IPFS Integration

Campaign details are stored on IPFS, with only transaction data and metadata stored on the blockchain. This approach provides:

- Cost-effective storage of large data (images, documents)
- Immutable references via IPFS CIDs
- Verification of medical documentation

## Development Notes

- For local development, the system uses mock data
- In production, the component fetches campaign data from both blockchain and IPFS
- Blockfrost is used as the API provider for blockchain and IPFS interactions

## Testing Donations

To test the donation feature:
1. Start the development server: `pnpm dev`
2. Install a supported Cardano wallet extension (Nami, Eternl, Flint, etc.)
3. Navigate to a campaign page
4. Connect your wallet
5. Enter a donation amount
6. Confirm the transaction in your wallet

For testnet testing, ensure your wallet is configured for the testnet network and has test ADA (tADA) available. 