'use client';
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
import { toast } from 'sonner';

// Helper for date formatting
const formatDate = (timestamp: number | undefined) => {
  if (!timestamp) return 'N/A';
  return new Date(timestamp).toLocaleDateString('en-US', { 
    year: 'numeric', month: 'long', day: 'numeric' 
  });
};

export default function CampaignDetail() {
  const { id } = useParams();
  const { connected, activeWallet, walletAddress, walletName, connectWallet, disconnectWallet, recoverWalletAddress } = useCardanoWallet();
  const { network, useMeshFallback } = useBlockchain();
  
  // Get IPFS utilities
  const { 
    getCampaign,
    getCampaignImageUrl,
    getImageUrl,
    isLoading: ipfsLoading,
    error: ipfsError 
  } = useIPFS();
  
  const [campaign, setCampaign] = useState<(CampaignMetadata & { id: string, campaignAddress: string, raisedAmount: number }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [donationAmount, setDonationAmount] = useState<string>('');
  const [donationProcessing, setDonationProcessing] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [showMedicalDocuments, setShowMedicalDocuments] = useState(false);
  const [recoveredAddress, setRecoveredAddress] = useState<string | null>(null);

  // For the progress bar
  const progress = campaign ? (campaign.raisedAmount / campaign.goalAmount) * 100 : 0;
  
  // Calculate days left
  const calculateDaysLeft = () => {
    if (!campaign?.updated) return 'N/A';
    const endTimestamp = campaign.endDate || (campaign.created + (30 * 24 * 60 * 60 * 1000)); // Assuming 30-day campaigns if no end date
    const daysLeft = Math.ceil((endTimestamp - Date.now()) / (24 * 60 * 60 * 1000));
    return daysLeft > 0 ? `${daysLeft} days left` : 'Campaign ended';
  };

  useEffect(() => {
    const fetchCampaignData = async () => {
      if (!id) return;
      
      setLoading(true);
      setError(null);
      
      try {
        // Fetch campaign from IPFS
        const campaignData = getCampaign(id as string);
        
        if (!campaignData) {
          setError(`Campaign with ID ${id} not found`);
          setLoading(false);
          return;
        }
        
        // In a real app, we'd fetch the campaign address from the blockchain
        // For now, use a placeholder address structure based on the campaign ID
        const campaignAddress = `addr1${typeof id === 'string' ? id.substring(0, 8).padEnd(103, '0') : ''}`;
        
        setCampaign({
          ...campaignData,
          id: id as string,
          campaignAddress,
          // Make sure we have raisedAmount (should be in the schema already)
          raisedAmount: campaignData.raisedAmount || 0
        });
      } catch (err: any) {
        console.error('Error fetching campaign:', err);
        setError(`Failed to load campaign: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    
    // Only fetch when not loading IPFS and we have an ID
    if (!ipfsLoading && id) {
      fetchCampaignData();
    }
  }, [id, ipfsLoading, getCampaign]);

  // Add a useEffect to log wallet connection status
  useEffect(() => {
    console.log('Wallet connection status:', {
      connected,
      walletAddress,
      walletName,
      activeWallet: !!activeWallet
    });
  }, [connected, walletAddress, walletName, activeWallet]);

  // Add a function to manually get the wallet address as a fallback
  const getWalletAddressDirectly = async () => {
    if (!activeWallet) return null;
    
    try {
      console.log('Attempting to get wallet address directly');
      
      // Try getUsedAddresses first
      try {
        const addresses = await activeWallet.getUsedAddresses();
        if (addresses && addresses.length > 0) {
          console.log('Got address directly:', addresses[0]);
          return addresses[0];
        }
      } catch (err) {
        console.error('Failed to get used addresses directly:', err);
      }
      
      // Then try getChangeAddress as fallback
      try {
        if (typeof activeWallet.getChangeAddress === 'function') {
          const changeAddress = await activeWallet.getChangeAddress();
          if (changeAddress) {
            console.log('Got change address directly:', changeAddress);
            return changeAddress;
          }
        }
      } catch (err) {
        console.error('Failed to get change address directly:', err);
      }
      
      // Try any other wallet-specific methods
      try {
        // Some wallets might expose the address directly
        if (activeWallet.address) {
          console.log('Got wallet address from property:', activeWallet.address);
          return activeWallet.address;
        }
      } catch (err) {
        console.error('Failed to get address from property:', err);
      }
      
      return null;
    } catch (err) {
      console.error('Error getting wallet address directly:', err);
      return null;
    }
  };

  // Update the handleDonation function to use the direct method if needed
  const handleDonation = async () => {
    console.log('Starting donation process', {
      connected,
      walletAddress,
      recoveredAddress,
      activeWallet: !!activeWallet
    });
    
    if (!connected) {
      toast.error('Please connect your wallet to donate');
      return;
    }
    
    if (!activeWallet) {
      toast.error('Wallet connection issue: No active wallet found');
      return;
    }
    
    // Get wallet address, either from context or recovered address
    let donorAddress = walletAddress || recoveredAddress;
    if (!donorAddress) {
      toast.info('Attempting to retrieve wallet address directly...');
      donorAddress = await getWalletAddressDirectly();
      
      if (!donorAddress) {
        toast.error('Could not retrieve your wallet address. Please try reconnecting your wallet.');
        return;
      }
      
      // Save the recovered address for future use
      setRecoveredAddress(donorAddress);
    }
    
    if (!campaign) {
      toast.error('Campaign data is not available');
      return;
    }
    
    // Validate donation amount
    const amountValue = parseFloat(donationAmount);
    const validationError = validateDonationAmount(amountValue);
    if (validationError) {
      toast.error(validationError);
      return;
    }
    
    setDonationProcessing(true);
    
    try {
      // Prepare donation metadata
      const metadata = {
        721: {
          donation: {
            campaignId: campaign.id,
            timestamp: Date.now()
          }
        }
      };
      
      console.log('Sending donation transaction', {
        donorAddress,
        recipientAddress: campaign.campaignAddress,
        amountInAda: amountValue
      });
      
      // Execute donation transaction
      const txHash = await donateToCampaign(
        {
          donorAddress,
          recipientAddress: campaign.campaignAddress,
          amountInAda: amountValue,
          metadata
        },
        network
      );
      
      console.log('Donation transaction submitted:', txHash);
      toast.success(`Donation of ${amountValue} ADA successfully sent!`);
      setDonationAmount('');
      
    } catch (err: any) {
      console.error('Donation error:', err);
      toast.error(`Donation failed: ${err.message || 'Unknown error'}`);
    } finally {
      setDonationProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
        <div className="text-center">
          <ScaleLoader color="#3B82F6" height={50} width={6} radius={4} margin={4} />
          <p className="mt-4 text-gray-600 dark:text-gray-300 text-lg">Loading campaign details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
        <div className="text-center">
          <FiAlertCircle className="w-16 h-16 mx-auto text-red-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Error Loading Campaign</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-8">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
        <div className="text-center">
          <FiAlertCircle className="w-16 h-16 mx-auto text-amber-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Campaign Not Found</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-8">The campaign you are looking for does not exist or has been removed.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
      {/* Campaign Header */}
      <div className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="container mx-auto px-4 py-8 md:py-12 relative">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center space-x-2 text-sm mb-3">
              <span className="bg-blue-500/30 backdrop-blur-sm px-3 py-1 rounded-full">
                {campaign.category}
              </span>
              <span className="bg-blue-500/30 backdrop-blur-sm px-3 py-1 rounded-full">
                {calculateDaysLeft()}
              </span>
              <span className={cn(
                "px-3 py-1 rounded-full",
                campaign.status === 'active' ? "bg-green-500/30" : 
                campaign.status === 'pending_verification' ? "bg-amber-500/30" : 
                "bg-red-500/30"
              )}>
                {campaign.status.replace('_', ' ')}
              </span>
            </div>
            
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4">{campaign.title}</h1>
            
            <div className="flex flex-wrap items-center text-sm mt-4">
              <div className="flex items-center mr-6 mb-2">
                <FiUser className="mr-2" />
                <span>Organized by {campaign.beneficiaryName || 'Anonymous'}</span>
              </div>
              <div className="flex items-center mr-6 mb-2">
                <FiClock className="mr-2" />
                <span>Created {formatDate(campaign.created)}</span>
              </div>
              {campaign.hospitalInfo?.name && (
                <div className="flex items-center mb-2">
                  <FiAward className="mr-2" />
                  <span>{campaign.hospitalInfo.name}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl">
        {/* Left Column - Campaign Details */}
        <div className="lg:col-span-2 space-y-8">
          {/* Campaign Image */}
          <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="w-full h-80 relative bg-gray-200 dark:bg-gray-700">
              <Image 
                src={campaign.campaignImageCID ? 
                  `https://ipfs.io/ipfs/${campaign.campaignImageCID}` : 
                  '/images/default-campaign.jpg'} 
                alt={campaign.title}
                fill
                className="object-cover"
              />
            </div>
          </div>
          
          {/* Story Section */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Campaign Story</h2>
            <div className="prose max-w-none dark:prose-invert">
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                {campaign.story}
              </p>
            </div>
          </div>
          
          {/* Medical Condition */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Medical Information</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Condition Summary</h3>
                <p className="text-gray-700 dark:text-gray-300">{campaign.medicalCondition?.summary || 'No summary available'}</p>
              </div>
              
              {campaign.medicalCondition?.diagnosisDate && (
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Diagnosis Date</h3>
                  <p className="text-gray-700 dark:text-gray-300">{campaign.medicalCondition.diagnosisDate}</p>
                </div>
              )}
              
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Treatment Plan</h3>
                <p className="text-gray-700 dark:text-gray-300">{campaign.medicalCondition?.treatmentPlanSummary || 'No treatment plan available'}</p>
              </div>
              
              {campaign.documentsCIDs && (
                <div>
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-gray-900 dark:text-white">Supporting Documents</h3>
                    <button 
                      onClick={() => setShowMedicalDocuments(!showMedicalDocuments)}
                      className="text-blue-600 dark:text-blue-400 text-sm flex items-center"
                    >
                      <FiFileText className="mr-1" />
                      {showMedicalDocuments ? 'Hide Documents' : 'View Documents'}
                    </button>
                  </div>
                  
                  {showMedicalDocuments && (
                    <div className="mt-4 space-y-4">
                      {campaign.documentsCIDs.treatmentPlanFull && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Treatment Plan</h4>
                          <DocumentViewer ipfsCid={campaign.documentsCIDs.treatmentPlanFull} fileName="Treatment Plan" />
                        </div>
                      )}
                      
                      {campaign.documentsCIDs.medicalRecords && campaign.documentsCIDs.medicalRecords.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Medical Records</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {campaign.documentsCIDs.medicalRecords.map((cid, index) => (
                              <DocumentViewer key={index} ipfsCid={cid} fileName={`Medical Record ${index + 1}`} />
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {campaign.documentsCIDs.verificationDocuments && campaign.documentsCIDs.verificationDocuments.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Verification Documents</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {campaign.documentsCIDs.verificationDocuments.map((cid, index) => (
                              <DocumentViewer key={index} ipfsCid={cid} fileName={`Verification Document ${index + 1}`} />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {/* Updates Section */}
          {campaign.updates && campaign.updates.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
              <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Campaign Updates</h2>
              
              <div className="space-y-6">
                {campaign.updates.map((update, index) => (
                  <div key={index} className="border-l-4 border-blue-500 pl-4">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white">{update.title}</h3>
                      <span className="text-sm text-gray-500 dark:text-gray-400">{formatDate(update.timestamp)}</span>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300">{update.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Right Column - Donation Widget */}
        <div className="space-y-6">
          {/* Donation Widget */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm sticky top-4">
            <div className="mb-6">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-900 dark:text-white font-semibold">
                  {campaign.raisedAmount.toLocaleString()} {campaign.currency}
                </span>
                <span className="text-gray-500 dark:text-gray-400">
                  raised of {campaign.goalAmount.toLocaleString()} {campaign.currency} goal
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-700",
                    progress >= 100 
                      ? "bg-green-500 dark:bg-green-600" 
                      : "bg-blue-500 dark:bg-blue-600"
                  )}
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
              <div className="mt-1 text-right">
                <span className="text-xs text-gray-500 dark:text-gray-400">{Math.round(progress)}% funded</span>
              </div>
            </div>
            
            {campaign.status === 'active' ? (
              <>
                {connected ? (
                  <div className="space-y-4">
                    {!walletAddress && !recoveredAddress ? (
                      <div className="text-center p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-700">
                        <FiAlertCircle className="w-6 h-6 mx-auto text-amber-500 mb-2" />
                        <p className="text-amber-800 dark:text-amber-300 mb-4">
                          Wallet is connected but address not detected. Please try reconnecting your wallet.
                        </p>
                        <button
                          onClick={() => {
                            // First disconnect
                            disconnectWallet();
                            // Then after a short delay, try to reconnect if there's a last used wallet
                            setTimeout(() => {
                              if (walletName) {
                                connectWallet(walletName);
                              }
                            }, 1000);
                          }}
                          className="px-4 py-2 bg-amber-100 dark:bg-amber-800 text-amber-800 dark:text-amber-200 rounded-lg hover:bg-amber-200 dark:hover:bg-amber-700 transition-colors"
                        >
                          Reconnect Wallet
                        </button>
                      </div>
                    ) : (
                      <>
                        <div>
                          <label htmlFor="donationAmount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Donation Amount (ADA)
                          </label>
                          <div className="relative">
                            <input
                              type="number"
                              id="donationAmount"
                              value={donationAmount}
                              onChange={(e) => setDonationAmount(e.target.value)}
                              placeholder="10"
                              min="5"
                              step="1"
                              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                              disabled={donationProcessing}
                            />
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                              <span className="text-gray-500 dark:text-gray-400">ADA</span>
                            </div>
                          </div>
                        </div>
                        
                        <button
                          onClick={handleDonation}
                          disabled={donationProcessing || !donationAmount}
                          className={cn(
                            "w-full flex items-center justify-center py-3 px-4 rounded-lg font-medium text-white",
                            "transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]",
                            donationProcessing || !donationAmount
                              ? "bg-gray-400 dark:bg-gray-600 cursor-not-allowed"
                              : "bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-md hover:shadow-lg"
                          )}
                        >
                          {donationProcessing ? (
                            <>
                              <ScaleLoader color="#ffffff" height={20} width={3} radius={2} margin={2} />
                              <span className="ml-2">Processing...</span>
                            </>
                          ) : (
                            <>
                              <FiHeart className="mr-2" />
                              Donate Now
                            </>
                          )}
                        </button>
                        
                        <div className="text-xs text-gray-500 dark:text-gray-400 text-center space-y-1">
                          <p>Donations are processed on the {network} Cardano network.</p>
                          <p>Minimum donation: 5 ADA</p>
                          {recoveredAddress && !walletAddress && (
                            <p className="text-green-600 dark:text-green-400">
                              Using recovered wallet address: {recoveredAddress.slice(0, 8)}...{recoveredAddress.slice(-8)}
                            </p>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-center text-gray-700 dark:text-gray-300 mb-2">
                      Connect your wallet to donate to this campaign
                    </p>
                    <ConnectWalletButton fullWidth size="lg" />
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-6">
                <FiAlertCircle className="w-12 h-12 mx-auto text-amber-500 mb-3" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {campaign.status === 'completed' ? 'Campaign Completed' : 
                   campaign.status === 'pending_verification' ? 'Awaiting Verification' : 
                   'Campaign Unavailable'}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {campaign.status === 'completed' ? 'This campaign has reached its goal. Thank you for your support!' : 
                   campaign.status === 'pending_verification' ? 'This campaign is currently being verified by our team.' : 
                   'This campaign is not accepting donations at this time.'}
                </p>
              </div>
            )}
          </div>
          
          {/* Campaign Address */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Campaign Details</h3>
            
            <div className="space-y-3">
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Campaign ID</h4>
                <div className="text-sm text-gray-900 dark:text-white font-mono bg-gray-100 dark:bg-gray-700 p-2 rounded">
                  {campaign.id}
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Campaign Address</h4>
                <AddressDisplay address={campaign.campaignAddress} />
              </div>
              
              {campaign.hospitalInfo?.name && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Hospital</h4>
                  <p className="text-gray-900 dark:text-white">{campaign.hospitalInfo.name}</p>
                </div>
              )}
              
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Created</h4>
                <p className="text-gray-900 dark:text-white">{formatDate(campaign.created)}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Last Updated</h4>
                <p className="text-gray-900 dark:text-white">{formatDate(campaign.updated)}</p>
              </div>
            </div>
          </div>
          
          {/* Share Section */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Share Campaign</h3>
            
            <div className="flex flex-wrap gap-2">
              <button className="flex items-center space-x-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors">
                <FiTwitter />
                <span>Twitter</span>
              </button>
              
              <button className="flex items-center space-x-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors">
                <FiFacebook />
                <span>Facebook</span>
              </button>
              
              <button className="flex items-center space-x-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors">
                <FiMail />
                <span>Email</span>
              </button>
            </div>
          </div>
          
          {/* Blockchain Status */}
          <BlockchainStatus />
        </div>
      </div>
    </div>
  );
} 