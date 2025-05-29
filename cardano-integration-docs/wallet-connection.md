# Wallet Connection

This document outlines the detailed steps for implementing wallet connection functionality in the MedFund application using Mesh Smart Contract Library.

## Wallet Provider Setup

First, let's set up the wallet provider using Mesh SDK:

```typescript
// src/blockchain/context/WalletContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { MeshProvider, useWallet } from '@meshsdk/react';
import { BrowserWallet } from '@meshsdk/core';

interface WalletContextProps {
  connected: boolean;
  connecting: boolean;
  walletName: string | null;
  walletAddress: string | null;
  walletBalance: string | null;
  availableWallets: string[];
  connect: (walletName: string) => Promise<boolean>;
  disconnect: () => void;
  error: string | null;
}

const WalletContext = createContext<WalletContextProps | undefined>(undefined);

export const WalletProvider: React.FC = ({ children }) => {
  const { connected, connect, disconnect, wallet } = useWallet();
  const [connecting, setConnecting] = useState<boolean>(false);
  const [walletName, setWalletName] = useState<string | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [walletBalance, setWalletBalance] = useState<string | null>(null);
  const [availableWallets, setAvailableWallets] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const loadAvailableWallets = async () => {
      try {
        const wallets = await BrowserWallet.getInstalledWallets();
        setAvailableWallets(wallets.map(wallet => wallet.name));
      } catch (err) {
        console.error('Failed to load available wallets:', err);
        setError('Failed to load available wallets');
      }
    };
    
    loadAvailableWallets();
  }, []);
  
  useEffect(() => {
    const updateWalletInfo = async () => {
      if (connected && wallet) {
        try {
          // Get wallet name
          setWalletName(wallet.name);
          
          // Get wallet address
          const addresses = await wallet.getUsedAddresses();
          if (addresses.length > 0) {
            setWalletAddress(addresses[0]);
          }
          
          // Get wallet balance
          const balance = await wallet.getBalance();
          setWalletBalance(balance);
        } catch (err) {
          console.error('Failed to update wallet info:', err);
          setError('Failed to update wallet info');
        }
      } else {
        setWalletName(null);
        setWalletAddress(null);
        setWalletBalance(null);
      }
    };
    
    updateWalletInfo();
  }, [connected, wallet]);
  
  const handleConnect = async (walletName: string) => {
    setConnecting(true);
    setError(null);
    
    try {
      await connect(walletName);
      return true;
    } catch (err) {
      console.error('Failed to connect wallet:', err);
      setError(`Failed to connect ${walletName}`);
      return false;
    } finally {
      setConnecting(false);
    }
  };
  
  const handleDisconnect = () => {
    try {
      disconnect();
    } catch (err) {
      console.error('Failed to disconnect wallet:', err);
      setError('Failed to disconnect wallet');
    }
  };
  
  return (
    <WalletContext.Provider
      value={{
        connected,
        connecting,
        walletName,
        walletAddress,
        walletBalance,
        availableWallets,
        connect: handleConnect,
        disconnect: handleDisconnect,
        error
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useCardanoWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useCardanoWallet must be used within a WalletProvider');
  }
  return context;
};
```

## Integrating Wallet Provider in App Layout

Now, let's integrate the wallet provider in the application layout:

```typescript
// src/app/layout.tsx (modified)
import { BlockchainProvider } from '@/blockchain/context/BlockchainContext';
import { MeshProvider } from '@meshsdk/react';
import { WalletProvider } from '@/blockchain/context/WalletContext';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <BlockchainProvider>
          <MeshProvider>
            <WalletProvider>
              {/* Rest of your layout */}
              {children}
            </WalletProvider>
          </MeshProvider>
        </BlockchainProvider>
      </body>
    </html>
  );
}
```

## Wallet Connection Component

Create a reusable wallet connection component:

```typescript
// src/components/blockchain/WalletConnect.tsx
'use client';

import { useState } from 'react';
import { useCardanoWallet } from '@/blockchain/context/WalletContext';

export default function WalletConnect() {
  const {
    connected,
    connecting,
    walletName,
    walletAddress,
    walletBalance,
    availableWallets,
    connect,
    disconnect,
    error
  } = useCardanoWallet();
  
  const [showWalletList, setShowWalletList] = useState(false);
  
  const handleConnect = async (name: string) => {
    await connect(name);
    setShowWalletList(false);
  };
  
  const formatAddress = (address: string | null) => {
    if (!address) return '';
    return `${address.slice(0, 8)}...${address.slice(-8)}`;
  };
  
  const formatBalance = (balance: string | null) => {
    if (!balance) return '0';
    return (parseInt(balance) / 1000000).toFixed(2);
  };
  
  return (
    <div className="relative">
      {connected ? (
        <div className="flex items-center space-x-4">
          <div className="bg-gray-100 rounded-lg p-2">
            <span className="text-sm font-medium">{walletName}</span>
            <div className="text-xs text-gray-500">{formatAddress(walletAddress)}</div>
            <div className="text-xs font-bold">{formatBalance(walletBalance)} ₳</div>
          </div>
          <button
            onClick={disconnect}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm"
          >
            Disconnect
          </button>
        </div>
      ) : (
        <div>
          <button
            onClick={() => setShowWalletList(!showWalletList)}
            disabled={connecting}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            {connecting ? 'Connecting...' : 'Connect Wallet'}
          </button>
          
          {showWalletList && (
            <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-md shadow-lg z-10">
              <div className="py-1">
                <div className="px-4 py-2 text-sm text-gray-700 font-medium border-b">
                  Select a wallet
                </div>
                {availableWallets.length === 0 ? (
                  <div className="px-4 py-2 text-sm text-gray-500">
                    No wallets found. Please install a Cardano wallet extension.
                  </div>
                ) : (
                  availableWallets.map((name) => (
                    <button
                      key={name}
                      onClick={() => handleConnect(name)}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      {name}
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      )}
      
      {error && (
        <div className="text-red-500 text-sm mt-2">{error}</div>
      )}
    </div>
  );
}
```

## Integrating Wallet Connection in Navbar

Add the wallet connection component to the navbar:

```typescript
// src/components/Navbar.tsx (modified)
import Link from 'next/link';
import WalletConnect from './blockchain/WalletConnect';

export default function Navbar() {
  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-blue-600">
              MedFund
            </Link>
            <div className="ml-10 hidden md:flex space-x-4">
              <Link href="/campaigns" className="text-gray-700 hover:text-blue-600">
                Campaigns
              </Link>
              <Link href="/create-campaign" className="text-gray-700 hover:text-blue-600">
                Create Campaign
              </Link>
              <Link href="/governance" className="text-gray-700 hover:text-blue-600">
                Governance
              </Link>
              <Link href="/rewards" className="text-gray-700 hover:text-blue-600">
                Rewards
              </Link>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <WalletConnect />
            
            <Link href="/profile" className="text-gray-700 hover:text-blue-600">
              Profile
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
```

## Wallet Authentication Hook

Create a hook for wallet authentication:

```typescript
// src/hooks/useWalletAuth.ts
import { useEffect, useState } from 'react';
import { useCardanoWallet } from '@/blockchain/context/WalletContext';

export function useWalletAuth() {
  const { connected, walletAddress } = useCardanoWallet();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);
  
  useEffect(() => {
    const checkAuthentication = async () => {
      if (connected && walletAddress) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    };
    
    checkAuthentication();
  }, [connected, walletAddress]);
  
  const authenticate = async () => {
    if (!connected) {
      setAuthError('Wallet not connected');
      return false;
    }
    
    setIsAuthenticating(true);
    setAuthError(null);
    
    try {
      // For a more secure authentication, you could implement a challenge-response
      // mechanism here, where the server sends a challenge and the user signs it
      // with their wallet
      
      setIsAuthenticated(true);
      return true;
    } catch (error) {
      setAuthError('Authentication failed');
      return false;
    } finally {
      setIsAuthenticating(false);
    }
  };
  
  const logout = () => {
    setIsAuthenticated(false);
  };
  
  return {
    isAuthenticated,
    isAuthenticating,
    authError,
    authenticate,
    logout
  };
}
```

## Protected Route Component

Create a component to protect routes that require wallet connection:

```typescript
// src/components/blockchain/ProtectedRoute.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCardanoWallet } from '@/blockchain/context/WalletContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export default function ProtectedRoute({
  children,
  redirectTo = '/login'
}: ProtectedRouteProps) {
  const { connected, connecting } = useCardanoWallet();
  const router = useRouter();
  
  useEffect(() => {
    if (!connected && !connecting) {
      router.push(redirectTo);
    }
  }, [connected, connecting, redirectTo, router]);
  
  if (connecting) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-lg">Connecting to wallet...</p>
        </div>
      </div>
    );
  }
  
  if (!connected) {
    return null;
  }
  
  return <>{children}</>;
}
```

## Wallet Connection Modal

Create a modal component for connecting wallets:

```typescript
// src/components/blockchain/WalletModal.tsx
'use client';

import { useEffect, useState } from 'react';
import { useCardanoWallet } from '@/blockchain/context/WalletContext';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function WalletModal({
  isOpen,
  onClose,
  onSuccess
}: WalletModalProps) {
  const {
    connected,
    connecting,
    availableWallets,
    connect,
    error
  } = useCardanoWallet();
  
  useEffect(() => {
    if (connected && onSuccess) {
      onSuccess();
      onClose();
    }
  }, [connected, onSuccess, onClose]);
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Connect Wallet</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            &times;
          </button>
        </div>
        
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
            <p>{error}</p>
          </div>
        )}
        
        <div className="space-y-2">
          {availableWallets.length === 0 ? (
            <div className="text-center py-4">
              <p className="mb-4">No Cardano wallets detected.</p>
              <p className="text-sm text-gray-500">
                Please install a Cardano wallet extension like{' '}
                <a
                  href="https://namiwallet.io/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  Nami
                </a>
                ,{' '}
                <a
                  href="https://yoroi-wallet.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  Yoroi
                </a>
                , or{' '}
                <a
                  href="https://eternl.io/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  Eternl
                </a>
                .
              </p>
            </div>
          ) : (
            availableWallets.map((name) => (
              <button
                key={name}
                onClick={() => connect(name)}
                disabled={connecting}
                className="w-full flex items-center justify-between bg-gray-100 hover:bg-gray-200 px-4 py-3 rounded-lg"
              >
                <span className="font-medium">{name}</span>
                {connecting && (
                  <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-500"></span>
                )}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
```

## Wallet Connection Button

Create a reusable wallet connection button:

```typescript
// src/components/blockchain/WalletButton.tsx
'use client';

import { useState } from 'react';
import { useCardanoWallet } from '@/blockchain/context/WalletContext';
import WalletModal from './WalletModal';

interface WalletButtonProps {
  label?: string;
  className?: string;
  onConnect?: () => void;
}

export default function WalletButton({
  label = 'Connect Wallet',
  className = 'bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg',
  onConnect
}: WalletButtonProps) {
  const { connected, disconnect, walletName } = useCardanoWallet();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const handleClick = () => {
    if (connected) {
      disconnect();
    } else {
      setIsModalOpen(true);
    }
  };
  
  return (
    <>
      <button
        onClick={handleClick}
        className={className}
      >
        {connected ? `Disconnect ${walletName}` : label}
      </button>
      
      <WalletModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={onConnect}
      />
    </>
  );
}
```

## Integration with Create Campaign Page

Update the create campaign page to require wallet connection:

```typescript
// src/app/create-campaign/page.tsx (modified)
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/blockchain/ProtectedRoute';
import { useCardanoWallet } from '@/blockchain/context/WalletContext';
import CreateCampaignForm from '@/components/CreateCampaignForm';

export default function CreateCampaignPage() {
  const router = useRouter();
  const { connected } = useCardanoWallet();
  
  return (
    <ProtectedRoute redirectTo="/login">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Create a Campaign</h1>
        
        <CreateCampaignForm />
      </div>
    </ProtectedRoute>
  );
}
```

## Login Page with Wallet Authentication

Create a login page that uses wallet authentication:

```typescript
// src/app/login/page.tsx (modified)
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCardanoWallet } from '@/blockchain/context/WalletContext';
import WalletButton from '@/components/blockchain/WalletButton';

export default function LoginPage() {
  const router = useRouter();
  const { connected, walletAddress } = useCardanoWallet();
  const [redirecting, setRedirecting] = useState(false);
  
  useEffect(() => {
    if (connected && walletAddress) {
      setRedirecting(true);
      const timer = setTimeout(() => {
        router.push('/profile');
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [connected, walletAddress, router]);
  
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold mb-6 text-center">Login</h1>
        
        {redirecting ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4">Wallet connected! Redirecting to your profile...</p>
          </div>
        ) : (
          <div className="space-y-6">
            <p className="text-center text-gray-600">
              Connect your Cardano wallet to access your account.
            </p>
            
            <div className="flex justify-center">
              <WalletButton
                label="Connect Cardano Wallet"
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium w-full"
              />
            </div>
            
            <div className="text-center text-sm text-gray-500">
              <p>Don't have a Cardano wallet?</p>
              <p className="mt-1">
                Install{' '}
                <a
                  href="https://namiwallet.io/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  Nami
                </a>
                ,{' '}
                <a
                  href="https://yoroi-wallet.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  Yoroi
                </a>
                , or{' '}
                <a
                  href="https://eternl.io/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  Eternl
                </a>
                .
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
```

## Wallet Address Display Component

Create a component to display wallet addresses:

```typescript
// src/components/blockchain/AddressDisplay.tsx
'use client';

import { useState } from 'react';

interface AddressDisplayProps {
  address: string;
  label?: string;
  truncate?: boolean;
}

export default function AddressDisplay({
  address,
  label,
  truncate = true
}: AddressDisplayProps) {
  const [copied, setCopied] = useState(false);
  
  const displayAddress = truncate
    ? `${address.slice(0, 8)}...${address.slice(-8)}`
    : address;
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  return (
    <div className="flex flex-col">
      {label && <span className="text-sm text-gray-500 mb-1">{label}</span>}
      <div className="flex items-center bg-gray-100 rounded-lg p-2">
        <span className="font-mono text-sm">{displayAddress}</span>
        <button
          onClick={copyToClipboard}
          className="ml-2 text-blue-500 hover:text-blue-600"
          title="Copy address"
        >
          {copied ? '✓' : '📋'}
        </button>
      </div>
    </div>
  );
}
```

## Profile Page with Wallet Information

Update the profile page to display wallet information:

```typescript
// src/app/profile/page.tsx (modified)
'use client';

import { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/blockchain/ProtectedRoute';
import { useCardanoWallet } from '@/blockchain/context/WalletContext';
import AddressDisplay from '@/components/blockchain/AddressDisplay';
import { useContracts } from '@/hooks/useContracts';

export default function ProfilePage() {
  const { walletName, walletAddress, walletBalance } = useCardanoWallet();
  const { rewardsService } = useContracts();
  const [tokens, setTokens] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    const fetchTokens = async () => {
      if (rewardsService && walletAddress) {
        setLoading(true);
        try {
          const userTokens = await rewardsService.getUserTokens(walletAddress);
          setTokens(userTokens);
        } catch (error) {
          console.error('Failed to fetch tokens:', error);
        } finally {
          setLoading(false);
        }
      }
    };
    
    fetchTokens();
  }, [rewardsService, walletAddress]);
  
  const formatBalance = (balance: string | null) => {
    if (!balance) return '0';
    return (parseInt(balance) / 1000000).toFixed(2);
  };
  
  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Your Profile</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Wallet Information</h2>
          
          <div className="space-y-4">
            <div>
              <span className="text-sm text-gray-500">Wallet</span>
              <p className="font-medium">{walletName}</p>
            </div>
            
            {walletAddress && (
              <AddressDisplay
                address={walletAddress}
                label="Address"
              />
            )}
            
            <div>
              <span className="text-sm text-gray-500">Balance</span>
              <p className="font-medium">{formatBalance(walletBalance)} ₳</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">Your Tokens</h2>
          
          {loading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-2 text-gray-500">Loading tokens...</p>
            </div>
          ) : tokens.length === 0 ? (
            <p className="text-gray-500">You don't have any tokens yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tokens.map((token) => (
                <div key={token.unit} className="bg-gray-100 rounded-lg p-4">
                  <p className="font-medium">{token.assetName || 'Token'}</p>
                  <p className="text-sm text-gray-500">Quantity: {token.quantity}</p>
                  <p className="text-xs font-mono truncate">{token.unit}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
```

## Next Steps

After implementing the wallet connection functionality, the next steps are to:

1. Set up additional Cardano features (see [Additional Features](./additional-features.md))
2. Implement the timeline for the integration process (see [Timeline](./timeline.md)) 