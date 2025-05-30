export interface MedicalDocument {
  version: string;
  documentType: 
    | 'medical_record' 
    | 'doctor_note'
    | 'prescription'
    | 'lab_result'
    | 'imaging_scan'
    | 'hospital_bill'
    | 'insurance_statement'
    | 'consent_form'
    | 'treatment_plan_detailed'
    | 'verification_identity'
    | 'verification_medical_professional'
    | 'campaign_update_proof' 
    | 'other';
  title: string;
  description?: string;
  issuedBy?: { // Optional, as some documents are patient-uploaded
    name?: string; // e.g., Hospital Name, Doctor Name
    id?: string;   // e.g., Hospital ID, Doctor License ID
    role?: string; // e.g., 'Hospital Administration', 'Cardiologist'
    verificationCID?: string; // CID of verifier's credentials if applicable
  };
  patientId: string; // Link to the patient (could be a campaign ID or a separate patient identifier)
  relatedCampaignCID?: string; // Link to the main CampaignMetadata on IPFS
  issuedDate?: string; // ISO 8601 format
  uploadDate: string; // ISO 8601 format, when it was uploaded to IPFS
  tags?: string[];
  
  // Content related fields - assuming content might be encrypted or sensitive
  contentCID: string;       // IPFS CID of the actual document file (potentially encrypted)
  fileName?: string;         // Original file name for reference
  fileType?: string;         // MIME type of the document
  fileSize?: number;         // Size in bytes
  
  // Encryption & Access Control - conceptual, actual implementation varies
  isEncrypted: boolean;
  encryptionDetails?: {
    algorithm: string; // e.g., 'AES-GCM', 'ChaCha20-Poly1305'
    publicKeyCID?: string; // CID of public key if asymmetric encryption used for a specific party
    accessCondition?: string; // Description of how to gain access (e.g., 'Requires patient and doctor approval via smart contract')
  };
  checksum?: {
    algorithm: string; // e.g., 'SHA-256'
    hash: string;
  }; // Checksum of the original, unencrypted file if applicable
  uploadedBy: string; // Wallet address or ID of the uploader
} 