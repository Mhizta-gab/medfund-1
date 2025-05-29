'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCardanoWallet } from '@/blockchain/context/WalletContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export default function ProtectedRoute({
  children,
  redirectTo = '/login' // Default redirect to /login if not connected
}: ProtectedRouteProps) {
  const { connected, connectingMesh } = useCardanoWallet();
  const router = useRouter();
  
  useEffect(() => {
    // If still connecting, wait. If not connected and not connecting, redirect.
    if (!connectingMesh && !connected) {
      router.push(redirectTo);
    }
  }, [connected, connectingMesh, redirectTo, router]);
  
  if (connectingMesh) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          {/* Basic spinner, can be replaced with a branded loader component */}
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-700 dark:text-gray-300">Connecting to wallet...</p>
        </div>
      </div>
    );
  }
  
  // If not connected (and not connecting anymore), router.push would have been called.
  // Render children only if connected.
  if (!connected) {
    return null; // Or a more specific unauthorized message/component
  }
  
  return <>{children}</>;
} 