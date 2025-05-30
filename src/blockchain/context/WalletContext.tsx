'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useWallet } from '@meshsdk/react';
import { BrowserWallet } from '@meshsdk/core';
// IWallet or ConnectedWallet type import is problematic, will use any for now

interface CardanoWalletContextProps {
  connected: boolean;
  connectingMesh: boolean;
  walletName: string | null;
  walletAddress: string | null;
  walletBalance: string | null; 
  availableWallets: { name: string; icon: string; version: string }[];
  connectWallet: (walletName: string) => Promise<boolean>;
  disconnectWallet: () => void;
  error: string | null;
  activeWallet: any | null; // Using any for now to bypass type import issues
  lastUsedWallet: string | null;
  recoverWalletAddress: () => Promise<string | null>;
}

const CardanoWalletContext = createContext<CardanoWalletContextProps | undefined>(undefined);

// Local storage key for remembering last used wallet
const LAST_WALLET_KEY = 'medfund_last_wallet';

interface CardanoWalletProviderProps {
  children: ReactNode;
}

export const CardanoWalletProvider: React.FC<CardanoWalletProviderProps> = ({ children }) => {
  const { connected, connect, disconnect, wallet, connecting, name: connectedWalletName, error: meshHookError } = useWallet();
  
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [walletBalance, setWalletBalance] = useState<string | null>(null); 
  const [availableWallets, setAvailableWallets] = useState<{ name: string; icon: string; version: string }[]>([]);
  const [customError, setCustomError] = useState<string | null>(null);
  const [lastUsedWallet, setLastUsedWallet] = useState<string | null>(null);
  const [directWallet, setDirectWallet] = useState<any | null>(null);

  // Load available wallets and last used wallet from local storage
  useEffect(() => {
    // Only run in browser environment
    if (typeof window === 'undefined') {
      return;
    }
    
    const loadAvailableWallets = () => {
      try {
        const wallets = BrowserWallet.getInstalledWallets();
        setAvailableWallets(wallets.map(w => ({ name: w.name, icon: w.icon, version: w.version })));
        
        // Check for last used wallet
        const savedWallet = localStorage.getItem(LAST_WALLET_KEY);
        if (savedWallet) {
          setLastUsedWallet(savedWallet);
        }
      } catch (err) {
        console.error('Failed to load available wallets:', err);
        setCustomError('Failed to load wallet list');
      }
    };
    
    loadAvailableWallets();
  }, []);

  // Auto-connect to last used wallet
  useEffect(() => {
    if (typeof window === 'undefined' || !lastUsedWallet || connected || connecting) {
      return;
    }

    // Auto-connect to last used wallet if available
    const autoConnect = async () => {
      try {
        // Check if the wallet is installed
        const isWalletAvailable = availableWallets.some(w => w.name.toLowerCase() === lastUsedWallet.toLowerCase());
        
        if (isWalletAvailable) {
          await handleConnect(lastUsedWallet);
        }
      } catch (err) {
        console.error('Auto-connect failed:', err);
        // Don't show error for auto-connect failures
      }
    };

    autoConnect();
  }, [lastUsedWallet, availableWallets, connected, connecting]);

  useEffect(() => {
    // Only run in browser environment
    if (typeof window === 'undefined') {
      return;
    }
    
    const updateWalletInfo = async () => {
      // Use either direct wallet or mesh wallet
      const activeWallet = directWallet || wallet;
      
      if (connected && activeWallet) {
        try {
          console.log('Updating wallet info for:', activeWallet?.name || 'unknown wallet');
          
          // Get wallet addresses
          let addresses;
          try {
            addresses = await activeWallet.getUsedAddresses();
            console.log('Got addresses:', addresses);
          } catch (addrErr: any) {
            console.error('Failed to get wallet addresses:', addrErr);
            addresses = [];
            
            // Try alternative method for some wallets
            try {
              // Some wallets might provide address through getChangeAddress
              if (typeof activeWallet.getChangeAddress === 'function') {
                const changeAddress = await activeWallet.getChangeAddress();
                if (changeAddress) {
                  console.log('Got change address as fallback:', changeAddress);
                  addresses = [changeAddress];
                }
              }
            } catch (fallbackErr) {
              console.error('Failed to get change address:', fallbackErr);
            }
          }
          
          // Set wallet address
          if (addresses && addresses.length > 0) {
            setWalletAddress(addresses[0]);
          } else {
            console.warn('No addresses found in connected wallet');
            setWalletAddress(null);
          }
          
          // Get wallet balance
          try {
          const balanceAssets = await activeWallet.getBalance();
            const adaBalance = balanceAssets.find((asset: { unit: string, quantity: string }) => asset.unit === 'lovelace');
          setWalletBalance(adaBalance ? (BigInt(adaBalance.quantity) / BigInt(1000000)).toString() : '0');
          } catch (balErr: any) {
            console.error('Failed to get wallet balance:', balErr);
            setWalletBalance('0');
          }
          
          setCustomError(null);
        } catch (err: any) {
          console.error('Failed to update wallet info:', err);
          setCustomError('Failed to update wallet info: ' + err.message);
        }
      } else {
        setWalletAddress(null);
        setWalletBalance(null);
      }
    };

    updateWalletInfo();
  }, [connected, wallet, directWallet]);

  const handleConnect = async (walletNameToConnect: string): Promise<boolean> => {
    setCustomError(null);
    try {
      // Try direct connection first using BrowserWallet.enable
      try {
        const enabledWallet = await BrowserWallet.enable(walletNameToConnect);
        if (enabledWallet) {
          setDirectWallet(enabledWallet);
          
          // Get address to verify connection
          const addresses = await enabledWallet.getUsedAddresses();
          setWalletAddress(addresses.length > 0 ? addresses[0] : null);
          
          // Get balance
          const balanceAssets = await enabledWallet.getBalance();
          const adaBalance = balanceAssets.find((asset: { unit: string, quantity: string }) => asset.unit === 'lovelace');
          setWalletBalance(adaBalance ? (BigInt(adaBalance.quantity) / BigInt(1000000)).toString() : '0');
          
          // Save last used wallet
          localStorage.setItem(LAST_WALLET_KEY, walletNameToConnect);
          setLastUsedWallet(walletNameToConnect);
          
          return true;
        }
      } catch (directErr) {
        console.warn('Direct wallet connection failed, falling back to Mesh hook:', directErr);
        // If direct connection fails, fall back to the Mesh hook
        setDirectWallet(null);
      }
      
      // Fallback to Mesh hook
      await connect(walletNameToConnect);
      
      // Save last used wallet
      localStorage.setItem(LAST_WALLET_KEY, walletNameToConnect);
      setLastUsedWallet(walletNameToConnect);
      
      return true;
    } catch (err: any) {
      console.error(`Failed to connect ${walletNameToConnect}:`, err);
      setCustomError(`Failed to connect ${walletNameToConnect}: ${err.message}`);
      return false;
    }
  };

  const handleDisconnect = () => {
    setCustomError(null);
    try {
      // Clear direct wallet if used
      if (directWallet) {
        setDirectWallet(null);
      }
      
      // Also disconnect Mesh hook if connected
      if (connected) {
        disconnect();
      }
      
      // Reset state
      setWalletAddress(null);
      setWalletBalance(null);
    } catch (err: any) {
      console.error('Failed to disconnect wallet:', err);
      setCustomError('Failed to disconnect wallet: ' + err.message);
    }
  };

  const getCombinedError = (): string | null => {
    if (customError) return customError;
    if (meshHookError) {
      if (typeof meshHookError === 'string') return meshHookError;
      if (meshHookError instanceof Error) return meshHookError.message;
      return 'An unknown wallet error occurred';
    }
    return null;
  };

  // Determine if we're connected via either method
  const isConnected = Boolean(connected || directWallet);
  // Use the direct wallet name or the mesh wallet name
  const actualWalletName = directWallet ? lastUsedWallet : connectedWalletName;

  // Add a recoverWalletAddress function
  const recoverWalletAddress = async (): Promise<string | null> => {
    const activeWallet = directWallet || wallet;
    if (!activeWallet) return null;
    
    console.log('Recovering wallet address from context...');
    
    try {
      // Try multiple methods to get the address
      
      // First try getUsedAddresses
      try {
        const addresses = await activeWallet.getUsedAddresses();
        if (addresses && addresses.length > 0) {
          console.log('Recovered address using getUsedAddresses:', addresses[0]);
          setWalletAddress(addresses[0]); // Update the context state
          return addresses[0];
        }
      } catch (err) {
        console.error('Failed to get used addresses:', err);
      }
      
      // Then try getChangeAddress
      try {
        if (typeof activeWallet.getChangeAddress === 'function') {
          const changeAddress = await activeWallet.getChangeAddress();
          if (changeAddress) {
            console.log('Recovered address using getChangeAddress:', changeAddress);
            setWalletAddress(changeAddress); // Update the context state
            return changeAddress;
          }
        }
      } catch (err) {
        console.error('Failed to get change address:', err);
      }
      
      // Try wallet-specific properties
      try {
        if (activeWallet.address) {
          console.log('Recovered address from wallet property:', activeWallet.address);
          setWalletAddress(activeWallet.address); // Update the context state
          return activeWallet.address;
        }
      } catch (err) {
        console.error('Failed to get address from property:', err);
      }
      
      return null;
    } catch (err) {
      console.error('Error recovering wallet address:', err);
      return null;
    }
  };

  return (
    <CardanoWalletContext.Provider
      value={{
        connected: isConnected,
        connectingMesh: connecting,
        walletName: actualWalletName || null, 
        walletAddress,
        walletBalance,
        availableWallets,
        connectWallet: handleConnect,
        disconnectWallet: handleDisconnect,
        error: getCombinedError(),
        activeWallet: directWallet || wallet || null,
        lastUsedWallet,
        recoverWalletAddress
      }}
    >
      {children}
    </CardanoWalletContext.Provider>
  );
};

export const useCardanoWallet = () => {
  const context = useContext(CardanoWalletContext);
  if (context === undefined) {
    throw new Error('useCardanoWallet must be used within a CardanoWalletProvider');
  }
  return context;
}; 