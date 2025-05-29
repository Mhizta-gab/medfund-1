'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { MeshProvider } from '@meshsdk/react';
import { Blockfrost, Lucid, Network, Provider, LucidEvolution } from '@lucid-evolution/lucid';
import { toast } from 'sonner';

interface BlockchainContextProps {
  network: string;
  lucid: LucidEvolution | null;
  isLoading: boolean;
  error: string | null;
}

const BlockchainContext = createContext<BlockchainContextProps | undefined>(undefined);

interface BlockchainProviderProps {
  children: ReactNode;
}

export const BlockchainProvider: React.FC<BlockchainProviderProps> = ({ children }) => {
  const [lucidInstance, setLucidInstance] = useState<LucidEvolution | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [network, setNetwork] = useState<string>('preprod');

  useEffect(() => {
    // Set network from env vars safely in client
    setNetwork(process.env.NEXT_PUBLIC_NETWORK || 'preprod');
  }, []);

  useEffect(() => {
    // Only run in browser environment
    if (typeof window === 'undefined') {
      setIsLoading(false);
      return;
    }

    const initLucid = async () => {
      setIsLoading(true);
      try {
        const apiKey = process.env.NEXT_PUBLIC_BLOCKFROST_API_KEY;
        if (!apiKey) {
          throw new Error('NEXT_PUBLIC_BLOCKFROST_API_KEY is not defined in environment variables. Please ensure it is set in .env.local and the development server is restarted.');
        }
        
        const blockfrostProvider: Provider = new Blockfrost(
          `https://cardano-${network}.blockfrost.io/api/v0`,
          apiKey
        );
        
        const lucid = await Lucid(blockfrostProvider, network as Network);
        setLucidInstance(lucid);
        setError(null);
      } catch (err: any) {
        console.error('Failed to initialize Lucid with Blockfrost provider:', err);
        const errorMsg = `Failed to initialize Lucid: ${err.message}`;
        setError(errorMsg);
        toast.error(errorMsg);
      } finally {
        setIsLoading(false);
      }
    };

    initLucid();
  }, [network]);

  // Configure MeshProvider options
  const meshConfig = {
    clientId: process.env.NEXT_PUBLIC_MESH_CLIENT_ID || undefined,
    // More options can be added here as needed
    // autoConnect: true, 
    // autoConnectWallet: lastUsedWallet,
  };

  return (
    <BlockchainContext.Provider
      value={{
        network,
        lucid: lucidInstance,
        isLoading,
        error
      }}
    >
      <MeshProvider {...meshConfig}>
        {children}
      </MeshProvider>
    </BlockchainContext.Provider>
  );
};

export const useBlockchain = () => {
  const context = useContext(BlockchainContext);
  if (context === undefined) {
    throw new Error('useBlockchain must be used within a BlockchainProvider');
  }
  return context;
}; 