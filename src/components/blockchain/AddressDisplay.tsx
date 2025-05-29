'use client';

import React, { useState } from 'react';

interface AddressDisplayProps {
  address: string;
  label?: string;
  truncate?: boolean;
  className?: string;
}

export default function AddressDisplay({
  address,
  label,
  truncate = true,
  className = ''
}: AddressDisplayProps) {
  const [copied, setCopied] = useState(false);
  
  const displayAddress = truncate && address.length > 16
    ? `${address.slice(0, 8)}...${address.slice(-8)}`
    : address;
  
  const copyToClipboard = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(address).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }).catch(err => console.error('Failed to copy text: ', err));
    } else {
      // Fallback for non-navigator.clipboard environments (less common now)
      const textArea = document.createElement('textarea');
      textArea.value = address;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Fallback to copy text failed: ', err);
      }
      document.body.removeChild(textArea);
    }
  };
  
  return (
    <div className={`flex flex-col ${className}`}>
      {label && <span className="text-sm text-gray-500 dark:text-gray-400 mb-1">{label}</span>}
      <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-2 group">
        <span className="font-mono text-sm text-gray-800 dark:text-gray-200 break-all">{displayAddress}</span>
        <button
          onClick={copyToClipboard}
          className="ml-2 text-blue-500 hover:text-blue-600 opacity-50 group-hover:opacity-100 transition-opacity duration-150"
          title={copied ? "Copied!" : "Copy address"}
        >
          {copied ? 
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            :
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          }
        </button>
      </div>
    </div>
  );
} 