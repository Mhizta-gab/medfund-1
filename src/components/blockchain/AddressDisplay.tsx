'use client';

import { useState } from 'react';

interface AddressDisplayProps {
  address: string;
  label?: string;
}

export default function AddressDisplay({ address, label = 'Address' }: AddressDisplayProps) {
  const [copied, setCopied] = useState(false);

  // Truncate address for display
  const truncatedAddress = address.length > 12 
    ? `${address.slice(0, 6)}...${address.slice(-6)}`
    : address;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-1">
      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</span>
      <div className="flex items-center space-x-2">
        <code className="p-2 bg-gray-100 dark:bg-gray-800 rounded text-sm truncate max-w-[200px]">
          {truncatedAddress}
        </code>
        <button
          onClick={copyToClipboard}
          className="p-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          aria-label="Copy address"
        >
          {copied ? (
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="text-green-500"
            >
              <path d="M20 6L9 17l-5-5" />
            </svg>
          ) : (
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="text-gray-500"
            >
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
} 