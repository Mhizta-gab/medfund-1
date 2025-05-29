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
}

const CardanoWalletContext = createContext<CardanoWalletContextProps | undefined>(undefined);

interface CardanoWalletProviderProps {
  children: ReactNode;
}

export const CardanoWalletProvider: React.FC<CardanoWalletProviderProps> = ({ children }) => {
  const { connected, connect, disconnect, wallet, connecting, name: connectedWalletName, error: meshHookError } = useWallet();
  
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [walletBalance, setWalletBalance] = useState<string | null>(null); 
  const [availableWallets, setAvailableWallets] = useState<{ name: string; icon: string; version: string }[]>([]);
  const [customError, setCustomError] = useState<string | null>(null);

  useEffect(() => {
    // Only run in browser environment
    if (typeof window === 'undefined') {
      return;
    }
    
    const loadAvailableWallets = () => {
      try {
        const wallets = BrowserWallet.getInstalledWallets();
        setAvailableWallets(wallets.map(w => ({ name: w.name, icon: w.icon, version: w.version })));
      } catch (err) {
        console.error('Failed to load available wallets:', err);
        setCustomError('Failed to load wallet list');
      }
    };
    
    loadAvailableWallets();
  }, []);

  useEffect(() => {
    // Only run in browser environment
    if (typeof window === 'undefined') {
      return;
    }
    
    const updateWalletInfo = async () => {
      if (connected && wallet) {
        try {
          const addresses = await wallet.getUsedAddresses();
          setWalletAddress(addresses.length > 0 ? addresses[0] : null);
          
          const balanceAssets = await wallet.getBalance();
          const adaBalance = balanceAssets.find(asset => asset.unit === 'lovelace');
          setWalletBalance(adaBalance ? (BigInt(adaBalance.quantity) / BigInt(1000000)).toString() : '0');
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
  }, [connected, wallet]);

  const handleConnect = async (walletNameToConnect: string): Promise<boolean> => {
    setCustomError(null);
    try {
      await connect(walletNameToConnect);
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
      disconnect();
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

  return (
    <CardanoWalletContext.Provider
      value={{
        connected,
        connectingMesh: connecting,
        walletName: connectedWalletName || null, 
        walletAddress,
        walletBalance,
        availableWallets,
        connectWallet: handleConnect,
        disconnectWallet: handleDisconnect,
        error: getCombinedError(),
        activeWallet: wallet || null 
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