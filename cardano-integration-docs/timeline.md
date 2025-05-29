# Timeline and Milestones

This document outlines the proposed timeline and key milestones for integrating Cardano blockchain functionality into the MedFund application.

## Phase 1: Setup and Basic Integration (Weeks 1-2)

### Week 1: Environment Setup and Core Integration

#### Milestones:
- [x] Project structure setup
- [x] Install required dependencies
- [x] Set up development environment
- [x] Configure Blockfrost API keys
- [x] Implement BlockchainContext provider
- [x] Create basic wallet connection functionality

#### Tasks:
1. [x] Create blockchain directory structure
2. [x] Install Mesh SDK, Lucid Evolution, and Blockfrost libraries
3. [x] Set up environment variables for network configuration
4. [x] Implement BlockchainContext provider
5. [x] Create basic wallet connection component
6. [x] Test connection with test wallets

### Week 2: IPFS Integration and Data Schemas

#### Milestones:
- [x] Implement IPFS service
- [x] Create data schemas for IPFS storage
- [x] Develop IPFS hooks for React components
- [ ] Implement caching strategy for IPFS content

#### Tasks:
1. [x] Create IPFSService class
2. [x] Define data schemas for campaign metadata, medical documents, etc.
3. [x] Implement useIPFS hook for React components
4. [x] Create document viewer component for IPFS-stored documents
5. [ ] Implement caching strategy for IPFS content
6. [x] Test IPFS upload and retrieval functionality

## Phase 2: Advanced Cardano SDK Features & On-Chain Interactions (Weeks 3-4)

### Week 3: Core SDK Interactions

#### Milestones:
- [ ] Define strategy for managing campaign state on-chain (e.g., via metadata, NFTs, or interacting with simple existing contract patterns if SDKs allow).
- [ ] Implement SDK-based interactions for campaign lifecycle events (e.g., updates, closure).
- [ ] Develop SDK-based methods for on-chain verification attestations (e.g., using transaction metadata).
- [ ] Create utility hooks/services for common Cardano transaction patterns (e.g., metadata submission, multi-asset transactions).

#### Tasks:
1. Research SDK capabilities for managing application state via transaction metadata or NFTs.
2. Implement functions to update campaign status or key details on-chain using SDKs.
3. Develop functions for submitting verification attestations as transaction metadata.
4. Create reusable hooks/services for constructing and submitting transactions with specific metadata or asset structures.
5. Test interactions with the preprod network.
6. [ ] Test basic SDK interactions for state and verification.

### Week 4: Advanced SDK Applications

#### Milestones:
- [ ] Explore/Implement simple governance actions via SDK (e.g., multi-sig for admin, metadata-based polling).
- [ ] Implement native token minting/distribution for rewards using SDK features.
- [ ] Develop transaction monitoring utilities for relevant addresses/assets.
- [ ] Research options for listening to on-chain events relevant to the application (e.g., specific address activity).

#### Tasks:
1. Design and implement multi-signature schemes for administrative actions using SDKs.
2. Implement logic for minting and distributing native tokens as rewards via SDKs.
3. Develop utilities to monitor transactions at key campaign addresses.
4. Set up listeners or polling mechanisms for specific on-chain events using SDKs or Blockfrost.
5. Test these advanced SDK applications.
6. Integrate SDK-based features with UI components.

## Phase 3: Wallet Integration and User Experience (Weeks 5-6)

### Week 5: Enhanced Wallet Integration

#### Milestones:
- [x] Implement WalletContext provider
- [x] Create WalletConnect component
- [x] Develop wallet authentication hook
- [x] Implement protected routes

#### Tasks:
1. [x] Enhance WalletContext provider
2. [x] Create WalletConnect component for the navbar
3. [x] Implement WalletModal for wallet selection
4. [x] Develop useWalletAuth hook for authentication
5. [x] Create ProtectedRoute component
6. [x] Test wallet integration with different wallet providers

### Week 6: User Experience Improvements

#### Milestones:
- [x] Update campaign creation flow
- [x] Enhance campaign detail page
- [x] Implement donation functionality
- [x] Create profile page with wallet information

#### Tasks:
1. [x] Update campaign creation form to use IPFS and blockchain
- [x] Enhance campaign detail page to display blockchain data
- [x] Implement donation functionality with Cardano
- [x] Create profile page with wallet information
- [x] Implement AddressDisplay component
6. [x] Test user flows and fix issues

## Phase 4: Additional Cardano Features and Testing (Weeks 7-8)

### Week 7: Additional Cardano Features

#### Milestones:
- [ ] Implement native token rewards distribution mechanism.
- [ ] Explore SDK support for interacting with existing staking protocols (if applicable, or remove).
- [ ] Implement multi-signature transaction workflows for key operations.
- [ ] Enhance verification processes using on-chain metadata attestations.

#### Tasks:
1. Implement `RewardService` (or similar) for distributing native tokens based on application logic, using SDK for transactions.
2. If relevant, investigate and implement interaction with existing Cardano staking pools/delegation via SDKs.
3. Develop and integrate multi-signature transaction capabilities for secure fund management or administrative actions.
4. Refine and expand metadata-based verification for different attestations within the platform.
5. Create services for managing milestone-based fund releases (e.g. via multi-sig or timed transactions if SDKs support).
6. Test additional features.

### Week 8: Testing and Optimization

#### Milestones:
- [ ] Conduct integration testing
- [ ] Perform security audit
- [ ] Optimize performance
- [ ] Create documentation

#### Tasks:
1. Write integration tests for blockchain functionality
2. Conduct security audit of smart contract interactions
3. Optimize performance for IPFS and blockchain operations
4. Create documentation for blockchain features
5. Fix issues and bugs
6. Prepare for deployment

## Phase 5: Deployment and Monitoring (Week 9)

### Week 9: Deployment and Launch

#### Milestones:
- [ ] Deploy to testnet
- [ ] Conduct user acceptance testing
- [ ] Deploy to mainnet
- [ ] Implement monitoring

#### Tasks:
1. Deploy application to Cardano testnet
2. Conduct user acceptance testing
3. Fix any issues found during testing
4. Deploy application to Cardano mainnet
5. Implement monitoring for blockchain operations
6. Create user guides for blockchain features

## Risk Management

### Potential Risks and Mitigation Strategies

1. **Blockchain Integration Complexity**
   - Risk: Integration with Cardano might be more complex than anticipated
   - Mitigation: Start with simpler features, use well-tested libraries, and allocate buffer time

2. **Wallet Compatibility Issues**
   - Risk: Different wallets might have different behaviors or compatibility issues
   - Mitigation: Test with multiple wallets early and implement fallback mechanisms

3. **IPFS Performance**
   - Risk: IPFS operations might be slow or unreliable
   - Mitigation: Implement robust caching and fallback mechanisms

4. **Smart Contract Security**
   - Risk: Smart contracts might have security vulnerabilities
   - Mitigation: Conduct thorough security audits and use established patterns

5. **User Experience**
   - Risk: Blockchain interactions might be confusing for users
   - Mitigation: Design intuitive interfaces and provide clear guidance

## Success Criteria

The integration will be considered successful when:

1. Users can connect their Cardano wallets to the application
2. Campaigns can be created, verified, and funded using Cardano
3. Campaign data is securely stored on IPFS
4. Funds can be disbursed to verified recipients
5. Reward tokens can be minted and distributed
6. The application performs well under load
7. Users report a positive experience with the blockchain features 