'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useCardanoWallet } from '@/blockchain/context/WalletContext';
import { toast } from 'sonner';

/**
 * Hook to combine Clerk authentication with Cardano wallet connection
 * Provides a unified interface for authentication and wallet states
 */
export function useAuthWallet() {
  const { user, isSignedIn, isLoaded: isClerkLoaded } = useUser();
  const {
    connected: isWalletConnected,
    connectingMesh: isWalletConnecting,
    walletName,
    walletAddress,
    connectWallet,
    disconnectWallet,
    lastUsedWallet,
    availableWallets
  } = useCardanoWallet();

  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [shouldSuggestWallet, setShouldSuggestWallet] = useState(false);

  // Detect when user is signed in but has no wallet connected
  useEffect(() => {
    if (isClerkLoaded && isSignedIn && !isWalletConnected && !isWalletConnecting) {
      // Show wallet connection suggestion after a delay
      const timer = setTimeout(() => {
        setShouldSuggestWallet(true);
      }, 3000);
      
      return () => clearTimeout(timer);
    } else {
      setShouldSuggestWallet(false);
    }
  }, [isClerkLoaded, isSignedIn, isWalletConnected, isWalletConnecting]);

  // Helper function to connect wallet
  const connectUserWallet = async (walletName: string) => {
    setIsAuthenticating(true);
    try {
      const success = await connectWallet(walletName);
      if (success) {
        // Update user metadata with wallet info (if needed)
        if (user && walletAddress) {
          try {
            await user.update({
              unsafeMetadata: {
                ...user.unsafeMetadata,
                walletAddress,
                walletName
              }
            });
          } catch (err) {
            console.error('Failed to update user metadata:', err);
            // Don't fail the whole operation if metadata update fails
          }
        }
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error connecting wallet:', err);
      toast.error('Failed to connect wallet');
      return false;
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Helper function to disconnect wallet
  const disconnectUserWallet = async () => {
    disconnectWallet();
    
    // Optionally remove wallet info from user metadata
    if (user) {
      try {
        const currentMetadata = { ...user.unsafeMetadata };
        delete currentMetadata.walletAddress;
        delete currentMetadata.walletName;
        
        await user.update({
          unsafeMetadata: currentMetadata
        });
      } catch (err) {
        console.error('Failed to update user metadata:', err);
        // Don't fail the operation if metadata update fails
      }
    }
  };

  // Helper to check if the user has a preferred wallet stored in their clerk profile
  const getPreferredWallet = (): string | null => {
    if (!user || !user.unsafeMetadata) return null;
    
    const walletName = user.unsafeMetadata.walletName as string | undefined;
    if (!walletName) return null;
    
    // Check if the preferred wallet is installed
    const isWalletAvailable = availableWallets.some(
      w => w.name.toLowerCase() === walletName.toLowerCase()
    );
    
    return isWalletAvailable ? walletName : null;
  };

  return {
    // Authentication state
    isSignedIn,
    isClerkLoaded,
    user,
    
    // Wallet state
    isWalletConnected,
    isWalletConnecting,
    walletName,
    walletAddress,
    lastUsedWallet,
    
    // Combined state
    isAuthenticating: isAuthenticating || isWalletConnecting,
    isFullyAuthenticated: isSignedIn && isWalletConnected,
    
    // Actions
    connectWallet: connectUserWallet,
    disconnectWallet: disconnectUserWallet,
    
    // UI helpers
    shouldSuggestWallet,
    availableWallets,
    preferredWallet: getPreferredWallet()
  };
} 