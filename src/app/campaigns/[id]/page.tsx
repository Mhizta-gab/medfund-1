"use client"

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { ScaleLoader } from 'react-spinners';
import { FiUser, FiClock, FiHeart, FiAward, FiAlertCircle, FiCheck, FiExternalLink, FiMail, FiTwitter, FiFacebook, FiGlobe, FiFileText } from 'react-icons/fi';
import { cn } from '@/utils';
import DocumentViewer from '@/components/blockchain/DocumentViewer';
import AddressDisplay from '@/components/blockchain/AddressDisplay';
import { useCardanoWallet } from '@/blockchain/context/WalletContext';
import { useBlockchain } from '@/blockchain/context/BlockchainContext';
import { CampaignMetadata } from '@/utils/ipfs/schemas/CampaignMetadata';
import { donateToCampaign, validateDonationAmount } from '@/blockchain/contracts/CampaignFunding';
import { useIPFS } from '@/hooks/useIPFS';
import ConnectWalletButton from '@/components/blockchain/ConnectWalletButton';
import BlockchainStatus from '@/components/blockchain/BlockchainStatus';
import ClientOnly from '@/components/ClientOnly';
import CampaignDetail from '@/components/campaigns/CampaignDetail';

// Helper for date formatting
const formatDate = (timestamp: number | undefined) => {
  if (!timestamp) return 'N/A';
  return new Date(timestamp).toLocaleDateString('en-US', { 
    year: 'numeric', month: 'long', day: 'numeric' 
  });
};

export default function CampaignPage() {
  return (
    <ClientOnly
      fallback={
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
          <div className="text-center">
            <ScaleLoader color="#3B82F6" height={50} width={6} radius={4} margin={4} />
            <p className="mt-4 text-gray-600 dark:text-gray-300 text-lg">Loading campaign details...</p>
          </div>
        </div>
      }
    >
      <CampaignDetail />
    </ClientOnly>
  );
} 