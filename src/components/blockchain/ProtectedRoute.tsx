'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCardanoWallet } from '@/blockchain/context/WalletContext';
import { useUser } from '@clerk/nextjs';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireWallet?: boolean;
  redirectTo?: string;
}

export default function ProtectedRoute({
  children,
  requireWallet = false,
  redirectTo = '/login'
}: ProtectedRouteProps) {
  const { connected, connectingMesh } = useCardanoWallet();
  const { isSignedIn, isLoaded } = useUser();
  const router = useRouter();
  
  useEffect(() => {
    if (!isLoaded) return; // Wait for clerk to load
    
    // Check auth requirements
    if (!isSignedIn) {
      router.push(redirectTo);
      return;
    }
    
    // If wallet is required, check wallet connection
    if (requireWallet && !connectingMesh && !connected) {
      router.push(redirectTo);
    }
  }, [connected, connectingMesh, isSignedIn, isLoaded, requireWallet, redirectTo, router]);
  
  // Show loading while we wait for authentication status
  if (!isLoaded || connectingMesh) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-700 dark:text-gray-300">
            {connectingMesh ? 'Connecting to wallet...' : 'Loading...'}
          </p>
        </div>
      </div>
    );
  }
  
  // If not authenticated or wallet required but not connected
  if (!isSignedIn || (requireWallet && !connected)) {
    return null; // Will redirect via useEffect
  }
  
  return <>{children}</>;
} 