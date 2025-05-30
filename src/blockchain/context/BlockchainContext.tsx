'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { MeshProvider } from '@meshsdk/react';
import { toast } from 'sonner';

// Import types only
import type { Network, Provider, LucidEvolution } from '@lucid-evolution/lucid';

interface BlockchainContextProps {
  network: string;
  lucid: LucidEvolution | null;
  isLoading: boolean;
  error: string | null;
  useMeshFallback: boolean;
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
  const [useMeshFallback, setUseMeshFallback] = useState<boolean>(false);

  useEffect(() => {
    // Set network from env vars safely in client
    setNetwork(process.env.NEXT_PUBLIC_NETWORK || 'preprod');
  }, []);

  useEffect(() => {
    // Only run in browser environment
    if (typeof window === 'undefined') {
      setIsLoading(false);
      setUseMeshFallback(true);
      return;
    }

    const initLucid = async () => {
      setIsLoading(true);
      
      try {
        const apiKey = process.env.NEXT_PUBLIC_BLOCKFROST_API_KEY;
        if (!apiKey) {
          console.warn('NEXT_PUBLIC_BLOCKFROST_API_KEY is not defined. Falling back to Mesh SDK only.');
          setUseMeshFallback(true);
          setLucidInstance(null);
          setError('Blockfrost API key not found. Using Mesh SDK for transactions.');
          return;
        }
        
        // Dynamically import Lucid modules to avoid SSR issues
        try {
          // Import the modules only when needed on the client
          const { Blockfrost, Lucid } = await import('@lucid-evolution/lucid');
          
          const blockfrostProvider: Provider = new Blockfrost(
            `https://cardano-${network}.blockfrost.io/api/v0`,
            apiKey
          );
          
          const lucid = await Lucid(blockfrostProvider, network as Network);
          setLucidInstance(lucid);
          setError(null);
          setUseMeshFallback(false);
        } catch (initErr: any) {
          console.error('Failed to initialize Lucid with Blockfrost provider:', initErr);
          
          // Handle BigInt conversion error specifically
          if (initErr instanceof TypeError && initErr.message.includes('BigInt')) {
            console.warn('BigInt conversion error. This might be due to missing protocol parameters or network issues.');
            setUseMeshFallback(true);
            toast.warning('Using Mesh SDK fallback for transactions due to Lucid initialization error.');
          } else {
            const errorMsg = `Failed to initialize Lucid: ${initErr.message}`;
            setError(errorMsg);
            setUseMeshFallback(true);
            toast.error(errorMsg);
          }
        }
      } catch (err: any) {
        console.error('Outer error initializing blockchain providers:', err);
        const errorMsg = `Error setting up blockchain: ${err.message}`;
        setError(errorMsg);
        setUseMeshFallback(true);
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
  };

  return (
    <BlockchainContext.Provider
      value={{
        network,
        lucid: lucidInstance,
        isLoading,
        error,
        useMeshFallback
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