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

<<<<<<< HEAD
interface CampaignDetails {
  id: string;
  title: string;
  description: string;
  goalAmount: number;
  raisedAmount: number;
  imageUrl: string;
  daysLeft: number;
  verified: boolean;
  patientInfo: {
    name: string;
    age: number;
    condition: string;
    hospital: string;
  };
  updates: Array<{
    date: string;
    content: string;
  }>;
  donors: Array<{
    address: string;
    amount: number;
    timestamp: string;
  }>;
}

// Mock campaigns array
const campaigns: CampaignDetails[] = [
  {
    id: '1',
    title: 'Emergency Heart Surgery',
    description: 'Help John receive life-saving heart surgery at Central Hospital. Your contribution can make a difference in saving a life. The surgery is scheduled for next month, and we need to raise the funds as soon as possible.',
    goalAmount: 50000,
    raisedAmount: 35000,
    imageUrl: '/images/campaign1.jpeg',
    daysLeft: 15,
    verified: true,
    patientInfo: {
      name: 'John Doe',
      age: 45,
      condition: 'Coronary Artery Disease',
      hospital: 'Central Hospital',
    },
    updates: [
      {
        date: '2024-04-01',
        content: 'Medical evaluation completed. Surgery scheduled for next month.',
      },
      {
        date: '2024-03-28',
        content: 'Initial consultation with cardiac surgeon completed.',
      },
    ],
    donors: [
      {
        address: 'addr1q8f4z...',
        amount: 1000,
        timestamp: '2024-04-01T10:30:00Z',
      },
      {
        address: 'addr1v9m2h...',
        amount: 500,
        timestamp: '2024-03-31T15:45:00Z',
      },
    ],
  },
  // Add more campaigns as needed
];

export default function CampaignPage({ params }: { params: { id: string } }) {
  const [donationAmount, setDonationAmount] = useState<string>('');

  // Find the campaign by id
  const campaignData = campaigns.find(c => c.id === params.id);

  if (!campaignData) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Campaign Not Found</h1>
        <p className="text-gray-600">The campaign you are looking for does not exist.</p>
      </div>
    );
  }

  const handleDonate = async () => {
    // TODO: Implement Cardano wallet integration and transaction
    console.log('Donating:', donationAmount, 'ADA');
  };

  const progress = (campaignData.raisedAmount / campaignData.goalAmount) * 100;

=======
// Helper for date formatting
const formatDate = (timestamp: number | undefined) => {
  if (!timestamp) return 'N/A';
  return new Date(timestamp).toLocaleDateString('en-US', { 
    year: 'numeric', month: 'long', day: 'numeric' 
  });
};

export default function CampaignPage() {
>>>>>>> f46bf8365b3460f909ca9053856f23699efd83cc
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