'use client';

import React, { useState, useEffect } from 'react';
import { useCardanoWallet } from '@/blockchain/context/WalletContext';
import { toast } from 'sonner';

interface ConnectWalletButtonProps {
  variant?: 'primary' | 'secondary';
  fullWidth?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  children?: React.ReactNode;
}

export default function ConnectWalletButton({
  variant = 'primary',
  fullWidth = false,
  size = 'md',
  className = '',
  children
}: ConnectWalletButtonProps) {
  const {
    connected,
    connectingMesh,
    walletName,
    walletAddress,
    connectWallet,
    disconnectWallet,
    availableWallets,
    lastUsedWallet,
    recoverWalletAddress
  } = useCardanoWallet();

  const [showWalletList, setShowWalletList] = useState(false);
  const [isRecovering, setIsRecovering] = useState(false);

  // Add a function to verify the wallet connection is complete with an address
  const verifyConnection = async () => {
    if (connected && !walletAddress && !isRecovering) {
      setIsRecovering(true);
      
      try {
        console.log('ConnectWalletButton: Verifying wallet connection and recovering address if needed');
        const recoveredAddress = await recoverWalletAddress();
        
        if (recoveredAddress) {
          console.log('ConnectWalletButton: Successfully recovered wallet address:', recoveredAddress);
          // Address recovered and saved in context
        } else {
          console.warn('ConnectWalletButton: Could not recover wallet address');
        }
      } catch (err) {
        console.error('ConnectWalletButton: Error verifying connection:', err);
      } finally {
        setIsRecovering(false);
      }
    }
  };

  // Check for missing address whenever connected status changes
  useEffect(() => {
    verifyConnection();
  }, [connected]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleConnect = async () => {
    if (connected) {
      disconnectWallet();
      toast.info('Wallet disconnected');
      
      return;
    }
    
    // If there's a last used wallet, try to connect to that
    if (lastUsedWallet) {
      try {
        const success = await connectWallet(lastUsedWallet);
        if (success) {
        toast.success(`Connected to ${lastUsedWallet}`);
          
          // Verify connection and recover address if needed
          setTimeout(verifyConnection, 1000);
        } else {
          // If connecting to last used wallet fails, show wallet list
          toast.error(`Failed to connect to ${lastUsedWallet}`);
          setShowWalletList(true);
        }
      } catch (err: any) {
        toast.error(`Failed to connect: ${err.message}`);
        setShowWalletList(true);
      }
    } else {
      // No last used wallet, show the wallet list
      setShowWalletList(true);
    }
  };
    
  // Add code to display the wallet list when showWalletList is true
  useEffect(() => {
    if (showWalletList && availableWallets.length > 0) {
    toast.info(
      <div className="space-y-2">
        <p className="font-medium">Select a wallet to connect:</p>
        <div className="flex flex-col space-y-1">
          {availableWallets.map(wallet => (
            <button
              key={wallet.name}
                onClick={() => {
                  connectWallet(wallet.name);
                  setShowWalletList(false);
                }}
              className="flex items-center space-x-2 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-800/50 rounded-md transition-colors text-left"
            >
              {wallet.icon && <img src={wallet.icon} alt={wallet.name} className="w-5 h-5" />}
              <span>{wallet.name}</span>
            </button>
          ))}
        </div>
      </div>,
        { duration: 10000, onDismiss: () => setShowWalletList(false) }
    );
    }
  }, [showWalletList, availableWallets, connectWallet]);

  // Button size classes
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  // Button variant classes
  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200'
  };

  const buttonClasses = `
    rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-70
    ${sizeClasses[size]} 
    ${variantClasses[variant]}
    ${fullWidth ? 'w-full' : ''}
    ${className}
  `;

  return (
    <button
      onClick={handleConnect}
      disabled={connectingMesh}
      className={buttonClasses}
    >
      {connectingMesh ? (
        <span className="flex items-center justify-center">
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Connecting...
        </span>
      ) : children ? (
        children
      ) : connected ? (
        `Disconnect ${walletName || 'Wallet'}`
      ) : (
        'Connect Wallet'
      )}
    </button>
  );
} 