# MedFund - Medical Crowdfunding on Cardano

MedFund is a decentralized platform for medical crowdfunding built on the Cardano blockchain, designed to provide transparent and secure fundraising for medical expenses.

## Features

- **Cardano Wallet Integration**: Connect with Cardano wallets like Eternl, Nami, Lace, etc.
- **Clerk Authentication**: Secure authentication with social login options
- **Fundraising Campaigns**: Create and contribute to medical fundraising campaigns
- **Transparent Funding**: All transactions are recorded on the Cardano blockchain
- **Governance**: Community governance for platform decisions

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- pnpm (recommended) or npm
- Cardano wallet extension (Eternl, Nami, Lace, etc.)
- Blockfrost API key (for Cardano blockchain interaction)
- Clerk account (for authentication)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/medfund.git
   cd medfund
   ```

2. Install dependencies using pnpm:
   ```bash
   pnpm install
   ```

3. Create a `.env.local` file in the root directory with the following variables:
   ```
   # Pinata IPFS API Configuration
   NEXT_PUBLIC_PINATA_JWT=your_pinata_jwt_token_here
   NEXT_PUBLIC_IPFS_GATEWAY_URL=https://gateway.pinata.cloud/ipfs/

   # Cardano Blockchain Configuration
   NEXT_PUBLIC_NETWORK=preprod
   NEXT_PUBLIC_BLOCKFROST_API_KEY=your_blockfrost_api_key_here

   # Mesh SDK Configuration
   NEXT_PUBLIC_MESH_CLIENT_ID=your_mesh_client_id_here
   NEXT_PUBLIC_MESH_AUTO_CONNECT=true

   # Clerk Authentication
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   CLERK_SECRET_KEY=your_clerk_secret_key
   NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login
   NEXT_PUBLIC_CLERK_SIGN_UP_URL=/register
   NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/profile
   NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/profile
   ```

4. Start the development server:
   ```bash
   pnpm dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Wallet Connection

MedFund supports seamless wallet connection with the following features:

- **One-Click Connection**: Connect your Cardano wallet with a single click
- **Auto Reconnect**: Automatically reconnect to your last used wallet
- **Preferred Wallet**: Save your preferred wallet in your user profile
- **Integration with Clerk**: Connect your blockchain identity with your authentication profile

### Supported Wallets

- Eternl
- Nami
- Lace
- Flint
- GeroWallet
- Typhon
- And other CIP-30 compliant wallets

## Development

### Project Structure

```
medfund/
├── public/          # Static assets
├── src/
│   ├── app/         # Next.js App Router pages
│   ├── blockchain/  # Blockchain integration
│   │   ├── context/ # Blockchain context providers
│   │   └── contracts/ # Smart contract interactions
│   ├── components/  # UI components
│   ├── hooks/       # Custom React hooks
│   └── utils/       # Utility functions
├── .env.local       # Environment variables
└── README.md        # Project documentation
```

### Key Technologies

- **Next.js**: React framework with App Router
- **Mesh SDK**: Cardano wallet integration
- **Lucid**: Cardano transaction library
- **Clerk**: Authentication and user management
- **Tailwind CSS**: Utility-first CSS framework

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Cardano Foundation
- Mesh SDK Team
- Blockfrost API
