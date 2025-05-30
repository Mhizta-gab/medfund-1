/**
 * CampaignFunding.ts
 * Contains functions for handling campaign funding transactions using Mesh SDK
 */

import { Transaction } from '@meshsdk/core';
import { toast } from 'sonner';

export interface DonationParams {
  donorAddress: string;
  recipientAddress: string;
  amountInAda: number;
  metadata?: Record<string, any>;
}

/**
 * Creates a donation transaction for a campaign using Mesh SDK
 * @param params DonationParams object containing donation details
 * @param wallet The wallet instance to use for the transaction
 * @returns Transaction hash if successful
 */
export async function donateToCampaign(
  params: DonationParams,
  wallet: any
): Promise<string> {
  try {
    const { recipientAddress, amountInAda, metadata } = params;
  
  if (!wallet) {
    throw new Error('Wallet not connected');
  }
  
  if (!recipientAddress) {
    throw new Error('Campaign recipient address is not available');
  }
  
  if (isNaN(amountInAda) || amountInAda <= 0) {
    throw new Error('Please enter a valid positive donation amount');
  }
  
    // Convert ADA to lovelace (1 ADA = 1,000,000 lovelace)
  const amountInLovelace = Math.floor(amountInAda * 1_000_000).toString();
  
    console.log(`Sending ${amountInLovelace} lovelace to ${recipientAddress}`);
    
    // Log wallet information for debugging
    logWalletInfo(wallet);

    // Create a new transaction using Mesh SDK
    const tx = new Transaction({ initiator: wallet });

    // Send lovelace to the recipient
    tx.sendLovelace(recipientAddress, amountInLovelace);

    // Add metadata if provided
    if (metadata) {
      // Use metadata label 674 for general message metadata
      tx.setMetadata(674, metadata);
    }

    console.log('Building transaction...');
    const unsignedTx = await tx.build();
    console.log('Transaction built successfully');

    console.log('Signing transaction...');
    const signedTx = await wallet.signTx(unsignedTx);
    console.log('Transaction signed successfully');

    console.log('Submitting transaction...');
    const txHash = await wallet.submitTx(signedTx);
    console.log('Transaction submitted successfully:', txHash);

    toast.success('Donation transaction submitted successfully!');
    return txHash;
  } catch (error: any) {
    handleTransactionError(error);
    throw error;
  }
}

/**
 * Alternative donation method using sendValue for complex transactions
 * @param params DonationParams object containing donation details
 * @param wallet The wallet instance to use for the transaction
 * @param utxo Optional specific UTXO to use
 * @returns Transaction hash if successful
 */
export async function donateWithValue(
  params: DonationParams,
  wallet: any,
  utxo?: any
): Promise<string> {
  try {
    const { recipientAddress, amountInAda, metadata } = params;
    
    if (!wallet) {
      throw new Error('Wallet not connected');
    }
    
    if (!recipientAddress) {
      throw new Error('Campaign recipient address is not available');
    }
    
    const amountInLovelace = Math.floor(amountInAda * 1_000_000).toString();
    console.log(`Sending ${amountInLovelace} lovelace to ${recipientAddress} using sendValue`);
  
    // Create a new transaction
    const tx = new Transaction({ initiator: wallet });
    
    // If a specific UTXO was provided, use sendValue
    if (utxo) {
      tx.sendValue(recipientAddress, utxo);
    } else {
      // Otherwise just use standard sendLovelace
      tx.sendLovelace(recipientAddress, amountInLovelace);
    }
  
  // Add metadata if provided
  if (metadata) {
      tx.setMetadata(674, metadata);
  }
  
    const unsignedTx = await tx.build();
    const signedTx = await wallet.signTx(unsignedTx);
    const txHash = await wallet.submitTx(signedTx);

    toast.success('Donation transaction submitted successfully!');
    return txHash;
  } catch (error: any) {
    handleTransactionError(error);
    throw error;
  }
}

/**
 * Special handling for multi-signature transactions if needed
 * @param params DonationParams object containing donation details
 * @param wallet The wallet instance to use for the transaction
 * @returns Transaction hash if successful
 */
export async function donateWithMultisig(
  params: DonationParams,
  wallet: any,
  secondWallet: any
): Promise<string> {
  try {
    const { recipientAddress, amountInAda, metadata } = params;
    
    if (!wallet || !secondWallet) {
      throw new Error('All required wallets must be connected');
    }
    
    if (!recipientAddress) {
      throw new Error('Campaign recipient address is not available');
    }
    
    const amountInLovelace = Math.floor(amountInAda * 1_000_000).toString();
    console.log(`Sending ${amountInLovelace} lovelace to ${recipientAddress} with multi-sig`);
    
    // Create a new transaction
    const tx = new Transaction({ initiator: wallet });
    
    // Send lovelace to the recipient
    tx.sendLovelace(recipientAddress, amountInLovelace);
    
    // Add metadata if provided
    if (metadata) {
      tx.setMetadata(674, metadata);
    }

    // Build the transaction
    const unsignedTx = await tx.build();
    
    // First signature - usually the user wallet
    const partiallySignedTx = await wallet.signTx(unsignedTx, true);
    
    // Second signature - this could be another wallet
    const fullySignedTx = await secondWallet.signTx(partiallySignedTx, true);
    
    // Submit the transaction
    const txHash = await wallet.submitTx(fullySignedTx);

    toast.success('Multi-signature donation submitted successfully!');
    return txHash;
  } catch (error: any) {
    handleTransactionError(error);
    throw error;
  }
}

/**
 * Log wallet information for debugging
 * @param wallet Wallet instance
 */
function logWalletInfo(wallet: any): void {
  console.log('Wallet capabilities:', {
    name: wallet.name || wallet._walletName || wallet.walletName || 'unknown',
    isMesh: typeof wallet.sendTx === 'function',
    isLucid: wallet._lucid !== undefined || typeof wallet.newTx === 'function',
    isCIP30: typeof wallet.signTx === 'function' && typeof wallet.submitTx === 'function',
    isLace: wallet.name?.toLowerCase().includes('lace') || 
            wallet._walletName?.toLowerCase().includes('lace') ||
            wallet.walletName?.toLowerCase().includes('lace')
  });
}

/**
 * Handle transaction errors with appropriate user feedback
 * @param error Error object
 */
function handleTransactionError(error: any): void {
  let errorMessage = error.message || 'An unknown error occurred during the donation process.';
  
  if (errorMessage.includes("Invalid address")) {
    errorMessage = "Invalid recipient address. Please check the campaign details.";
  } else if (errorMessage.includes("INPUTS_EXHAUSTED") || 
             errorMessage.includes("NotEnoughMoney") || 
             errorMessage.includes("UtxoBalanceInsufficient") ||
             errorMessage.includes("UTxO Balance Insufficient")) {
    errorMessage = "Insufficient funds in your wallet for this transaction (including fees).";
  } else if (errorMessage.includes("UserDeclined") || errorMessage.includes("Transaction cancelled")) {
    errorMessage = "Transaction cancelled by user.";
  } else if (errorMessage.includes("CBOR") || errorMessage.includes("Invalid transaction format")) {
    errorMessage = "There was an issue formatting the transaction for your wallet. Please try again.";
  } else if (errorMessage.includes("Invalid string") && errorMessage.includes("hex string")) {
    errorMessage = "Your wallet expects transactions in a specific format. Please update your wallet.";
  }
  
  console.error("Donation failed:", error.info ? error.info : error);
  toast.error(errorMessage);
}

/**
 * Validates a donation amount
 * @param amountInAda The amount to validate in ADA
 * @returns Error message if invalid, null if valid
 */
export function validateDonationAmount(amountInAda: number): string | null {
  if (isNaN(amountInAda)) {
    return 'Please enter a valid number';
  }
  
  if (amountInAda <= 0) {
    return 'Amount must be greater than 0';
  }
  
  if (amountInAda < 1) { // Lowering minimum for testing, adjust as needed
    return 'Minimum donation is 1 ADA';
  }
  
  if (amountInAda > 100000) {
    return 'Maximum donation is 100,000 ADA';
  }
  
  return null;
} 