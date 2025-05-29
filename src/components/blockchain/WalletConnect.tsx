'use client';

import React, { useState } from 'react';
import { useCardanoWallet } from '@/blockchain/context/WalletContext';

export default function WalletConnect() {
  const {
    connected,
    connectingMesh,
    walletName,
    walletAddress,
    walletBalance,
    availableWallets,
    connectWallet,
    disconnectWallet,
    error
  } = useCardanoWallet();
  
  const [showWalletList, setShowWalletList] = useState(false);

  // Ensure this component only renders client-side where window is available
  if (typeof window === 'undefined') {
    return null;
  }
  
  const handleConnect = async (name: string) => {
    await connectWallet(name);
    setShowWalletList(false);
  };
  
  const formatAddress = (address: string | null): string => {
    if (!address) return '';
    if (address.length < 16) return address; // Avoid slicing if too short
    return `${address.slice(0, 8)}...${address.slice(-8)}`;
  };
  
  // walletBalance is already in ADA from the context
  const displayBalance = walletBalance ? `${parseFloat(walletBalance).toFixed(2)} ₳` : '0.00 ₳';

  return (
    <div className="relative">
      {connected ? (
        <div className="flex items-center space-x-2 md:space-x-4">
          <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-2 text-xs md:text-sm">
            <div className="font-medium text-gray-800 dark:text-gray-200">{walletName || 'Wallet'}</div>
            <div className="text-gray-600 dark:text-gray-400">{formatAddress(walletAddress)}</div>
            <div className="font-bold text-gray-800 dark:text-gray-200">{displayBalance}</div>
          </div>
          <button
            onClick={disconnectWallet}
            className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 md:px-4 md:py-2 rounded-lg text-xs md:text-sm whitespace-nowrap"
          >
            Disconnect
          </button>
        </div>
      ) : (
        <div className="flex items-center">
          <button
            onClick={() => setShowWalletList(!showWalletList)}
            disabled={connectingMesh}
            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 md:px-4 md:py-2 rounded-lg text-xs md:text-sm whitespace-nowrap"
          >
            {connectingMesh ? 'Connecting...' : 'Connect Wallet'}
          </button>
          
          {showWalletList && (
            <div className="absolute top-full right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-md shadow-lg z-20 border dark:border-gray-700">
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
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
                    >
                      <img src={wallet.icon} alt={wallet.name} className="w-5 h-5" />
                      <span>{wallet.name}</span>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      )}
      
      {error && (
        <div className="text-red-500 text-xs mt-1 absolute right-0 top-full whitespace-nowrap">
          {error}
        </div>
      )}
    </div>
  );
} 