export interface TransactionRecord {
  version: string;
  transactionType: 
    | 'campaign_creation_fee'
    | 'donation_ada'
    | 'donation_stablecoin'
    | 'donation_native_token'
    | 'milestone_fund_release'
    | 'withdrawal_to_beneficiary'
    | 'refund_to_donor'
    | 'governance_vote_cast'
    | 'governance_proposal_fee'
    | 'reward_claim'
    | 'platform_fee'
    | 'other_blockchain_interaction';
  relatedCampaignCID?: string; // IPFS CID of the CampaignMetadata, if applicable
  relatedProposalId?: string; // On-chain or off-chain ID of a governance proposal, if applicable
  
  // Financial Details
  amount: string; // Using string to handle large numbers (e.g., lovelace or token smallest unit)
  asset: {
    policyId?: string; // Empty or specific value for ADA (e.g., 'ada' or empty)
    assetName?: string;  // Hex-encoded or human-readable if available. Empty for ADA.
    unit: string;       // Typically 'lovelace' for ADA, or policyId.assetNameHex for native tokens
    decimals: number;   // e.g., 6 for ADA, or token-specific
    symbol?: string;     // e.g., '₳', 'USDT', 'MFT' (MedFundToken)
  };
  usdValueEquivalent?: number; // Approximate USD value at the time of transaction, for display
  
  // Parties Involved
  fromAddress?: string; // Sender's Cardano address (can be an internal platform address or user wallet)
  toAddress: string;   // Receiver's Cardano address
  
  // Blockchain & Platform Identifiers
  txHash: string;                 // On-chain Cardano transaction hash
  blockHeight?: number;            // Block number where the transaction was included
  slot?: number;                   // Slot number
  platformInternalTxId?: string; // MedFund's internal ID for this record, if different from txHash
  
  // Status & Timestamps
  status: 'pending' | 'confirmed' | 'failed' | 'submitted' | 'expired';
  timestamp: number;              // Unix epoch (seconds or milliseconds) of transaction submission or confirmation
  confirmationTimestamp?: number;  // Unix epoch of blockchain confirmation
  
  // Additional Context
  description?: string;            // User-friendly description or memo
  metadata?: any;                // Any on-chain transaction metadata, or off-chain notes
  fee?: {
    amount: string; // Lovelace
    assetUnit: 'lovelace';
  }; // Transaction fee paid, if recorded separately
} 