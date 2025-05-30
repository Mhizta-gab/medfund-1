export interface VerificationAttestation {
  version: string;
  campaignCID: string; // IPFS CID of the CampaignMetadata this attestation refers to
  attestationType: 
    | 'identity_verified'
    | 'medical_condition_confirmed'
    | 'hospital_affiliation_confirmed'
    | 'treatment_plan_reviewed'
    | 'cost_estimation_validated'
    | 'community_endorsement'
    | 'milestone_achieved' // For fund release verification
    | 'other';
  statement: string; // A clear statement of what is being attested (e.g., "Dr. X confirms patient Y diagnosis of Z")
  
  verifierInfo: {
    id: string; // Verifier's wallet address or unique identifier
    name?: string; // Name of the verifier (individual or organization)
    role: 'patient' | 'guardian' | 'doctor' | 'hospital_admin' | 'medical_reviewer' | 'auditor' | 'community_validator' | 'platform_admin';
    organization?: string; // e.g., Hospital Name, Clinic Name, Audit Firm
    credentialsCID?: string; // IPFS CID of verifier's credentials or public profile
  };
  
  evidence: {
    description?: string; // Description of the evidence provided
    documentCIDs?: string[]; // IPFS CIDs of supporting documents (MedicalDocument CIDs, etc.)
    onChainTxHashes?: string[]; // Blockchain transaction hashes if relevant (e.g., for identity tokens)
  }[];
  
  attestationDate: string; // ISO 8601 format, when the attestation was made
  expiryDate?: string; // ISO 8601 format, if the attestation expires
  
  status: 'valid' | 'revoked' | 'disputed' | 'expired' | 'pending_review';
  revocationReason?: string; // If status is 'revoked'
  
  // Cryptographic proof
  signature: string;      // Digital signature of the (hash of) this attestation object by the verifier
  signedDataHash: string; // Hash of the attestation data (excluding signature itself) that was signed
  signingAlgorithm: string; // e.g., 'Ed25519', 'CIP-8'
  publicKey: string;      // Verifier's public key used for the signature
  
  notes?: string; // Additional comments or notes from the verifier
} 