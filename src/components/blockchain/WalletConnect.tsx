'use client';

import React, { useState, useEffect } from 'react';
import { useAuthWallet } from '@/hooks/useAuthWallet';
import { toast } from 'sonner';

export default function WalletConnect() {
  const {
    isWalletConnected,
    isWalletConnecting,
    walletName,
    walletAddress,
    connectWallet,
    disconnectWallet,
    availableWallets,
    lastUsedWallet,
    preferredWallet,
    shouldSuggestWallet
  } = useAuthWallet();
  
  const [showWalletList, setShowWalletList] = useState(false);
  const [connecting, setConnecting] = useState(false);

  // Effect to show wallet suggestion toast
  useEffect(() => {
    if (shouldSuggestWallet && preferredWallet) {
      toast.info(
        <div className="flex flex-col space-y-2">
          <p>Connect your wallet to access all features</p>
          <button
            onClick={() => handleConnect(preferredWallet)}
            className="bg-blue-500 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-600 transition-colors"
          >
            Connect {preferredWallet}
          </button>
        </div>,
        { duration: 10000 }
      );
    }
  }, [shouldSuggestWallet, preferredWallet]);

  // Ensure this component only renders client-side where window is available
  if (typeof window === 'undefined') {
    return null;
  }
  
  const handleConnect = async (name: string) => {
    setConnecting(true);
    try {
      await connectWallet(name);
      setShowWalletList(false);
      toast.success(`Successfully connected to ${name}`);
    } catch (err) {
      // Error is already handled in context
    } finally {
      setConnecting(false);
    }
  };
  
  const handleDisconnect = () => {
    disconnectWallet();
    toast.info('Wallet disconnected');
  };
  
  const formatAddress = (address: string | null): string => {
    if (!address) return '';
    if (address.length < 16) return address; // Avoid slicing if too short
    return `${address.slice(0, 8)}...${address.slice(-8)}`;
  };

  // Determine if connecting (either through the hook or our local state)
  const isConnecting = isWalletConnecting || connecting;

  return (
    <div className="relative">
      {isWalletConnected ? (
        <div className="flex items-center space-x-2 md:space-x-4">
          <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-2 text-xs md:text-sm">
            <div className="font-medium text-gray-800 dark:text-gray-200 flex items-center">
              {availableWallets.find(w => w.name === walletName)?.icon && (
                <img 
                  src={availableWallets.find(w => w.name === walletName)?.icon} 
                  alt={walletName || 'Wallet'} 
                  className="w-4 h-4 mr-1"
                />
              )}
              {walletName || 'Wallet'}
            </div>
            <div className="text-gray-600 dark:text-gray-400">{formatAddress(walletAddress)}</div>
          </div>
          <button
            onClick={handleDisconnect}
            className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 md:px-4 md:py-2 rounded-lg text-xs md:text-sm whitespace-nowrap transition-colors"
          >
            Disconnect
          </button>
        </div>
      ) :
        <div className="flex items-center">
          <button
            onClick={() => setShowWalletList(!showWalletList)}
            disabled={isConnecting}
            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 md:px-4 md:py-2 rounded-lg text-xs md:text-sm whitespace-nowrap transition-colors disabled:opacity-70"
          >
            {isConnecting ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Connecting...
              </span>
            ) : preferredWallet ? (
              <span className="flex items-center">
                {availableWallets.find(w => w.name === preferredWallet)?.icon && (
                  <img 
                    src={availableWallets.find(w => w.name === preferredWallet)?.icon} 
                    alt={preferredWallet} 
                    className="w-4 h-4 mr-1"
                  />
                )}
                Connect {preferredWallet}
              </span>
            ) : lastUsedWallet ? (
              <span className="flex items-center">
                {availableWallets.find(w => w.name === lastUsedWallet)?.icon && (
                  <img 
                    src={availableWallets.find(w => w.name === lastUsedWallet)?.icon} 
                    alt={lastUsedWallet} 
                    className="w-4 h-4 mr-1"
                  />
                )}
                Reconnect {lastUsedWallet}
              </span>
            ) : (
              'Connect Wallet'
            )}
          </button>
          
          {showWalletList && !isConnecting && (
            <div className="absolute top-full right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-md shadow-lg z-20 border dark:border-gray-700 transform transition-transform duration-200 ease-in-out origin-top-right">
              <div className="py-1">
                <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 font-medium border-b dark:border-gray-700">
                  Select a wallet
                </div>
                {availableWallets.length === 0 ? (
                  <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                    No wallets found. Please install a Cardano wallet extension.
                  </div>
                ) : (
                  availableWallets.map((wallet) => (
                    <button
                      key={wallet.name}
                      onClick={() => handleConnect(wallet.name)}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2 transition-colors"
                    >
                      <img src={wallet.icon} alt={wallet.name} className="w-5 h-5" />
                      <span>{wallet.name}</span>
                      {preferredWallet === wallet.name && (
                        <span className="text-xs text-blue-500 ml-auto">Preferred</span>
                      )}
                      {lastUsedWallet === wallet.name && preferredWallet !== wallet.name && (
                        <span className="text-xs text-blue-500 ml-auto">Last used</span>
                      )}
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      }
      
      {/* Close wallet list when clicking outside */}
      {showWalletList && (
        <div 
          className="fixed inset-0 z-10" 
          onClick={() => setShowWalletList(false)}
        />
      )}
    </div>
  );
} 