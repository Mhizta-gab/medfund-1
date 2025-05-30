'use client';

import React, { useState } from 'react';
import { useBlockchain } from '@/blockchain/context/BlockchainContext';
import { useCardanoWallet } from '@/blockchain/context/WalletContext';
import { FiCheckCircle, FiAlertTriangle, FiRefreshCw, FiInfo } from 'react-icons/fi';

export default function BlockchainStatus() {
  const { network, lucid, isLoading, error, useMeshFallback } = useBlockchain();
  const { connected, walletName, walletAddress, walletBalance } = useCardanoWallet();
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="p-4 rounded-lg border bg-white dark:bg-gray-800 shadow-sm">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Blockchain Status</h3>
        <button 
          onClick={() => setExpanded(!expanded)}
          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
        >
          {expanded ? 'Hide Details' : 'Show Details'}
        </button>
      </div>
      
      <div className="mt-2 flex items-center">
        <div className="mr-2">
          {isLoading ? (
            <FiRefreshCw className="w-5 h-5 text-blue-500 animate-spin" />
          ) : error ? (
            <FiAlertTriangle className="w-5 h-5 text-amber-500" />
          ) : (
            <FiCheckCircle className="w-5 h-5 text-green-500" />
          )}
        </div>
        <div>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            {isLoading ? 'Initializing blockchain...' : 
              error ? `Error: ${error}` : 
              `Connected to ${network} network`}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Using {useMeshFallback ? 'Mesh SDK' : 'Lucid Evolution'} for transactions
          </p>
        </div>
      </div>
      
      {expanded && (
        <div className="mt-4 space-y-3 border-t pt-3">
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Network</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">{network}</p>
          </div>
          
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Lucid Status</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {lucid ? 'Initialized' : 'Not initialized'}
            </p>
          </div>
          
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Wallet Status</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {connected ? `Connected to ${walletName}` : 'Not connected'}
            </p>
            {connected && walletAddress && (
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {walletAddress}
              </p>
            )}
            {connected && walletBalance && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Balance: {walletBalance} ADA
              </p>
            )}
          </div>
          
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-md">
              <div className="flex">
                <FiInfo className="w-5 h-5 text-red-500 mr-2 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-red-800 dark:text-red-300">Error Details</p>
                  <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
                  {error.includes('BigInt') && (
                    <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                      This is likely due to issues with the Blockfrost API. The application is using Mesh SDK as a fallback.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
          
          <div className="flex justify-end">
            <button 
              onClick={() => window.location.reload()}
              className="text-sm bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-800/50 text-blue-700 dark:text-blue-300 px-3 py-1.5 rounded-md transition-colors flex items-center"
            >
              <FiRefreshCw className="w-4 h-4 mr-1" />
              Refresh Connection
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 