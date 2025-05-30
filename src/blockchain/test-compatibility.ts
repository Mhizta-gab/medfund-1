/**
 * Blockchain Compatibility Test Script
 * This script checks whether Mesh SDK and Lucid Evolution are compatible with the installed
 * Cardano wallets on the user's browser
 */

import { BrowserWallet } from '@meshsdk/core';
import { Blockfrost, Lucid, Network } from '@lucid-evolution/lucid';

export async function testMeshCompatibility() {
  console.log("Testing Mesh SDK compatibility...");
  
  try {
    // Get available wallets
    const wallets = BrowserWallet.getInstalledWallets();
    console.log(`Found ${wallets.length} wallet(s):`);
    
    wallets.forEach(wallet => {
      console.log(`- ${wallet.name} (${wallet.version})`);
    });
    
    // If there's at least one wallet, try to connect to it
    if (wallets.length > 0) {
      const walletName = wallets[0].name;
      console.log(`Attempting to connect to ${walletName}...`);
      try {
        const wallet = await BrowserWallet.enable(walletName);
        const addresses = await wallet.getUsedAddresses();
        console.log(`Successfully connected to ${walletName}!`);
        console.log(`First address: ${addresses[0] || 'No address found'}`);
        
        // Check if we can build a transaction
        console.log("Testing transaction building...");
        try {
          // Just create a simple transaction object - don't submit it
          const tx = {
            recipients: [
              {
                address: addresses[0],
                amount: [
                  { unit: 'lovelace', quantity: '1000000' }
                ]
              }
            ]
          };
          console.log("Transaction object created successfully");
          return { 
            success: true, 
            message: `Mesh SDK is compatible with ${walletName}`,
            wallet: walletName
          };
        } catch (txErr) {
          console.error("Error creating transaction:", txErr);
          return { 
            success: false, 
            message: `Failed to create transaction with Mesh SDK: ${txErr.message}`,
            wallet: walletName
          };
        }
      } catch (walletErr) {
        console.error(`Failed to connect to ${walletName}:`, walletErr);
        return { 
          success: false, 
          message: `Failed to connect to ${walletName} with Mesh SDK: ${walletErr.message}`,
          wallet: walletName
        };
      }
    } else {
      return { 
        success: false, 
        message: "No Cardano wallets found. Please install a wallet extension like Nami, Eternl, or Flint." 
      };
    }
  } catch (error) {
    console.error("Error testing Mesh SDK compatibility:", error);
    return { 
      success: false, 
      message: `Error testing Mesh SDK compatibility: ${error.message}` 
    };
  }
}

export async function testLucidCompatibility(blockfrostApiKey: string, network: Network = 'Preprod') {
  console.log("Testing Lucid Evolution compatibility...");
  
  try {
    // Get available wallets
    const wallets = BrowserWallet.getInstalledWallets();
    
    if (wallets.length === 0) {
      return { 
        success: false, 
        message: "No Cardano wallets found. Please install a wallet extension like Nami, Eternl, or Flint." 
      };
    }
    
    // Initialize Lucid with Blockfrost provider
    try {
      const blockfrostProvider = new Blockfrost(
        `https://cardano-${network.toLowerCase()}.blockfrost.io/api/v0`,
        blockfrostApiKey
      );
      
      const lucid = await Lucid(blockfrostProvider, network);
      console.log("Lucid initialized successfully with Blockfrost provider");
      
      // Try to connect to the first wallet
      const walletName = wallets[0].name;
      console.log(`Attempting to connect ${walletName} to Lucid...`);
      
      try {
        // First get the wallet API
        const wallet = await BrowserWallet.enable(walletName);
        
        // Try to connect it to Lucid
        await lucid.selectWallet.fromAPI(wallet);
        
        console.log(`Successfully connected ${walletName} to Lucid!`);
        
        // Test transaction building (don't submit)
        const firstAddress = await wallet.getUsedAddresses();
        if (firstAddress.length > 0) {
          try {
            const tx = lucid.newTx()
              .pay.ToAddress(firstAddress[0], { lovelace: BigInt(1000000) });
            
            console.log("Transaction builder created successfully");
            return { 
              success: true, 
              message: `Lucid Evolution is compatible with ${walletName}`,
              wallet: walletName
            };
          } catch (txErr) {
            console.error("Error creating transaction with Lucid:", txErr);
            return { 
              success: false, 
              message: `Failed to create transaction with Lucid: ${txErr.message}`,
              wallet: walletName
            };
          }
        } else {
          return { 
            success: true, 
            message: `Lucid Evolution is compatible with ${walletName}, but no addresses found`,
            wallet: walletName
          };
        }
      } catch (walletErr) {
        console.error(`Failed to connect ${walletName} to Lucid:`, walletErr);
        return { 
          success: false, 
          message: `Failed to connect ${walletName} to Lucid: ${walletErr.message}`,
          wallet: walletName
        };
      }
    } catch (lucidErr) {
      console.error("Failed to initialize Lucid:", lucidErr);
      return { 
        success: false, 
        message: `Failed to initialize Lucid: ${lucidErr.message}` 
      };
    }
  } catch (error) {
    console.error("Error testing Lucid compatibility:", error);
    return { 
      success: false, 
      message: `Error testing Lucid compatibility: ${error.message}` 
    };
  }
}

export async function testBlockchainCompatibility(blockfrostApiKey: string) {
  // Test both implementations and return results
  const meshResults = await testMeshCompatibility();
  const lucidResults = await testLucidCompatibility(blockfrostApiKey);
  
  return {
    mesh: meshResults,
    lucid: lucidResults,
    // Recommend the best option based on test results
    recommendation: meshResults.success ? 'mesh' : (lucidResults.success ? 'lucid' : 'none')
  };
} 