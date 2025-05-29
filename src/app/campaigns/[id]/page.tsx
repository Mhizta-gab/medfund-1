"use client"

import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useIPFS } from '@/hooks/useIPFS';
import { CampaignMetadata } from '@/utils/ipfs/schemas/CampaignMetadata';
import DocumentViewer from '@/components/blockchain/DocumentViewer';
import { useCardanoWallet } from '@/blockchain/context/WalletContext';
import { useBlockchain } from '@/blockchain/context/BlockchainContext';
import { ScaleLoader } from 'react-spinners';
import AddressDisplay from '@/components/blockchain/AddressDisplay';
import { FiExternalLink, FiMail, FiTwitter, FiFacebook, FiGlobe, FiClock, FiAward, FiUser, FiHeart, FiFileText, FiAlertCircle } from 'react-icons/fi';
import { cn } from '@/utils';

// Helper for date formatting
const formatDate = (timestamp: number | undefined) => {
  if (!timestamp) return 'N/A';
  return new Date(timestamp).toLocaleDateString('en-US', { 
    year: 'numeric', month: 'long', day: 'numeric' 
  });
};

export default function CampaignPage({ params }: { params: { id: string } }) {
  const ipfsService = useIPFS();
  const { 
    activeWallet, 
    walletAddress,
    error: walletError, 
    connectWallet,
    disconnectWallet
  } = useCardanoWallet();
  const { lucid, network, isLoading: blockchainIsLoading, error: blockchainError } = useBlockchain();
  
  const [campaignMetadata, setCampaignMetadata] = useState<CampaignMetadata | null>(null);
  const [isLoadingCampaign, setIsLoadingCampaign] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);
  const [selectedDocumentCid, setSelectedDocumentCid] = useState<string | null>(null);
  const [selectedDocumentName, setSelectedDocumentName] = useState<string | null>(null);
  const [isPageLoaded, setIsPageLoaded] = useState(false);

  const [donationAmount, setDonationAmount] = useState<string>('');
  const [isDonating, setIsDonating] = useState(false);
  const [donationError, setDonationError] = useState<string | null>(null);
  const [donationSuccess, setDonationSuccess] = useState<string | null>(null);
  const [actualRaisedAmount, setActualRaisedAmount] = useState<string | null>(null);
  const [isLoadingRaisedAmount, setIsLoadingRaisedAmount] = useState<boolean>(true);
  const [donors, setDonors] = useState<Array<{ address: string; amount: number; txHash: string; timestamp: number }> | null>(null);
  const [isLoadingDonors, setIsLoadingDonors] = useState<boolean>(true);
  const [donorError, setDonorError] = useState<string | null>(null);

  // Add these properties to local state and derive from existing data
  const [campaignStartDate, setCampaignStartDate] = useState<number | undefined>(undefined);
  const [campaignEndDate, setCampaignEndDate] = useState<number | undefined>(undefined);
  const [organizer, setOrganizer] = useState<string>('Anonymous');
  const [isVerified, setIsVerified] = useState<boolean>(false);

  // Add these properties to the existing local state declarations
  const [subcategory, setSubcategory] = useState<string | undefined>(undefined);
  const [urgency, setUrgency] = useState<string | undefined>(undefined);

  useEffect(() => {
    // Set page loaded state for animations
    const timer = setTimeout(() => setIsPageLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (blockchainIsLoading) {
      setIsLoadingCampaign(true);
      setIsLoadingRaisedAmount(true);
      setIsLoadingDonors(true);
      return;
    }
    if (blockchainError) {
      setPageError(`Blockchain initialization failed: ${blockchainError}. Cannot fetch campaign data.`);
      setIsLoadingCampaign(false);
      setIsLoadingRaisedAmount(false);
      setIsLoadingDonors(false);
      return;
    }
    if (!lucid) {
        setPageError('Lucid instance not available. Cannot process campaign data.');
        setIsLoadingCampaign(false);
        setIsLoadingRaisedAmount(false);
        setIsLoadingDonors(false);
        return;
    }

    const fetchCampaignAndBalance = async () => {
      if (params.id && ipfsService.isConfigured) {
        setIsLoadingCampaign(true);
        setIsLoadingRaisedAmount(true);
        setIsLoadingDonors(true);
        setPageError(null);
        setDonorError(null);
        try {
          const metadata = await ipfsService.getJSON(params.id) as CampaignMetadata;
          setCampaignMetadata(metadata);
          setIsLoadingCampaign(false);

          if (metadata?.organizerId) {
            try {
              const utxos = await lucid.utxosAt(metadata.organizerId);
              let totalLovelace = BigInt(0);
              utxos.forEach(utxo => {
                totalLovelace += utxo.assets.lovelace;
              });
              setActualRaisedAmount((Number(totalLovelace) / 1_000_000).toFixed(6));
            } catch (balanceError: any) {
              console.error("Failed to fetch on-chain balance:", balanceError);
              setPageError(prev => prev ? `${prev}\nCould not load raised amount.` : 'Could not load raised amount.');
            }
            setIsLoadingRaisedAmount(false);

            // Use mock data for donors instead of Blockfrost API
            setTimeout(() => {
              // Sample mock data for donors
              const mockDonors = [
                {
                  address: "addr1vxy8lj8qnjr9cetct2zl7x6nvh35yd9r3kgtg3defsjvvnq7rsdxs",
                  amount: 150,
                  txHash: "5d677265facf54d129391c9ed84d0c0e5fa363f9e3f9e2df37224f40c5cb9a11",
                  timestamp: Date.now() - 86400000 * 2 // 2 days ago
                },
                {
                  address: "addr1v9qeyxc7pec3qth67z33pjy0n96cfam99ljq8kdjaf8v9wqgy8yhp",
                  amount: 75,
                  txHash: "d83c1e53e750e8cf5d3bb07f1e9feef3adeb0fbc04c8290768a2a2972e68ebb4",
                  timestamp: Date.now() - 86400000 * 5 // 5 days ago
                },
                {
                  address: "addr1q90kppn28q6qecqa28n4qd2774rvrrhxkftx55qlk8gsc9kc3h09g",
                  amount: 200,
                  txHash: "a37f0b18567ec9fe4f7b5bc9353b92dbee98ed5402694a0eb5f809ac12aadd08",
                  timestamp: Date.now() - 86400000 // 1 day ago
                }
              ];
              setDonors(mockDonors);
            setIsLoadingDonors(false);
            }, 1000); // Simulate loading time

          } else {
            setPageError(prev => prev ? `${prev}\nOrganizer ID missing.` : 'Organizer ID missing for balance/donor check.');
            setIsLoadingRaisedAmount(false);
            setIsLoadingDonors(false);
          }
        } catch (err: any) {
          console.error("Failed to fetch campaign metadata:", err);
          setPageError(`Failed to load campaign data: ${err.message}`);
          setIsLoadingCampaign(false);
          setIsLoadingRaisedAmount(false);
          setIsLoadingDonors(false);
        }
      } else if (!ipfsService.isConfigured && params.id) {
        setPageError('IPFS Service not configured. Cannot fetch campaign data.');
        setIsLoadingCampaign(false);
        setIsLoadingRaisedAmount(false);
        setIsLoadingDonors(false);
      }
    };

    fetchCampaignAndBalance();

  }, [params.id, ipfsService, lucid, blockchainIsLoading, blockchainError, network]);

  useEffect(() => {
    if (campaignMetadata) {
      // Calculate or assign values for missing properties
      // Assume created timestamp as start date if not explicitly defined
      setCampaignStartDate(campaignMetadata.created);
      
      // Set an end date 30 days from creation if not defined
      setCampaignEndDate(campaignMetadata.created + (30 * 24 * 60 * 60 * 1000));
      
      // Set organizer name or use 'Anonymous'
      setOrganizer(campaignMetadata.beneficiaryName || 'Anonymous');
      
      // Determine if campaign is verified (for example, if status is 'active')
      setIsVerified(campaignMetadata.status === 'active');
      
      // Add new state assignments
      // Derive subcategory from tags if available
      if (campaignMetadata.tags && campaignMetadata.tags.length > 0) {
        setSubcategory(campaignMetadata.tags[0]);
      }
      
      // Determine urgency based on how far the end date is
      // Assuming that more urgent campaigns have closer end dates
      const now = Date.now();
      const timeRemaining = (campaignMetadata.created + (30 * 24 * 60 * 60 * 1000)) - now;
      const daysRemaining = timeRemaining / (24 * 60 * 60 * 1000);
      
      if (daysRemaining <= 7) {
        setUrgency('High');
      } else if (daysRemaining <= 15) {
        setUrgency('Medium');
      } else {
        setUrgency('Low');
      }
    }
  }, [campaignMetadata]);

  const handleDonate = async () => {
    setDonationError(null);
    setDonationSuccess(null);

    if (!activeWallet || !lucid || !walletAddress) {
      setDonationError('Please connect your wallet first.');
      return;
    }

    const recipientAddress = campaignMetadata?.organizerId;
    if (!recipientAddress) {
      setDonationError('Campaign recipient address is not available.');
      return;
    }

    const amountInAda = parseFloat(donationAmount);
    if (isNaN(amountInAda) || amountInAda <= 0) {
      setDonationError('Please enter a valid positive donation amount.');
      return;
    }

    const amountInLovelace = BigInt(Math.floor(amountInAda * 1_000_000));

    setIsDonating(true);

    try {
      if (!lucid) throw new Error("Lucid instance not available.");
      if (!activeWallet) throw new Error("Active wallet not available.");

      if (lucid.wallet?.name !== activeWallet.name) {
        await lucid.selectWallet.fromAPI(activeWallet);
      }
      
      if (!lucid.wallet) {
        throw new Error("Failed to select wallet in Lucid using fromAPI.");
      }

      const txBuilder = lucid.newTx();
      
      const tx = await txBuilder
        .pay.ToAddress(recipientAddress, { lovelace: amountInLovelace })
        .complete();
      
      const signedTx = await tx.sign.withWallet().complete();
      const txHash = await signedTx.submit();
      
      setDonationSuccess(`Donation successful! TxHash: ${txHash.substring(0, 10)}...`);
      console.log(`Donation successful! TxHash: ${txHash}`);
      setDonationAmount('');

    } catch (err: any) {
      console.error("Donation failed:", err);
      let detailedError = err.message || 'An unknown error occurred during donation.';
      if (err.info) { 
        detailedError = `${detailedError} Info: ${err.info}`;
      }
      if (detailedError.includes("Invalid address")) {
        detailedError = "Invalid recipient address. Please check the campaign details.";
      } else if (detailedError.includes("NotEnoughMoney")) {
        detailedError = "Insufficient funds in your wallet for this transaction (including fees).";
      }
      setDonationError(`Donation failed: ${detailedError}`);
    } finally {
      setIsDonating(false);
    }
  };

  if (isLoadingCampaign || blockchainIsLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
        <div className="text-center">
          <ScaleLoader color="#3B82F6" height={50} width={6} radius={4} margin={4} />
          <p className="mt-4 text-gray-600 dark:text-gray-300 text-lg">Loading campaign details...</p>
        </div>
      </div>
    );
  }

  if (pageError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
        <div className="max-w-xl w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-red-200 dark:border-red-900/30">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 mx-auto mb-6">
            <FiAlertCircle size={28} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-4">Error Loading Campaign</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6 text-center">{pageError}</p>
          <button 
            onClick={() => window.location.reload()}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!campaignMetadata) {
    return null; // Add this safety check
  }

  const progress = campaignMetadata.goalAmount > 0 
    ? (Number(actualRaisedAmount || 0) / campaignMetadata.goalAmount) * 100
    : 0;

  // Use coverImageCID or campaignImageCID for image source
  const campaignImageUrl = campaignMetadata.campaignImageCID 
    ? `https://ipfs.io/ipfs/${campaignMetadata.campaignImageCID}`
    : '/images/default-campaign-image.jpg';

  const displayRaisedAmount = actualRaisedAmount !== null ? parseFloat(actualRaisedAmount) : (campaignMetadata.goalAmount ? campaignMetadata.goalAmount * 0.7 : 0);
  const daysLeft = 15;

  const handleViewDocument = (cid: string, name?: string) => {
    setSelectedDocumentCid(cid);
    setSelectedDocumentName(name || 'Document');
  };

  return (
    <div className={cn(
      "min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900",
      "transition-opacity duration-500",
      !isPageLoaded ? "opacity-0" : "opacity-100"
    )}>
      {/* Campaign Hero Section */}
      <div className="relative">
        {/* Background Image with Gradient Overlay */}
        <div className="absolute inset-0 h-[60vh] overflow-hidden z-0">
          {campaignImageUrl ? (
            <>
              <div className="w-full h-full relative">
                <img 
                  src={campaignImageUrl} 
                  alt={campaignMetadata.title} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-blue-900/30 via-blue-900/60 to-gray-900/90 dark:from-blue-900/50 dark:to-gray-950"></div>
              </div>
            </>
          ) : (
            <div className="w-full h-full bg-gradient-to-b from-blue-600 to-blue-800 dark:from-blue-700 dark:to-blue-900"></div>
          )}
        </div>

        {/* Campaign Header Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-12">
          <div className={cn(
            "transition-all duration-700 transform",
            isPageLoaded ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          )}>
            {/* Verification Badge */}
            {isVerified && (
              <div className="inline-flex items-center gap-1.5 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 px-3 py-1 rounded-full text-sm font-medium mb-4 border border-green-200 dark:border-green-800/50">
                <FiAward className="w-4 h-4" />
                <span>Verified Campaign</span>
              </div>
            )}

            {/* Campaign Title */}
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              {campaignMetadata.title}
            </h1>

            {/* Campaign Meta Info */}
            <div className="flex flex-wrap gap-6 text-gray-100 mb-8">
              <div className="flex items-center gap-2">
                <FiUser className="w-5 h-5 text-blue-300" />
                <span>Organized by <span className="font-medium">{organizer}</span></span>
              </div>
              {campaignStartDate && (
                <div className="flex items-center gap-2">
                  <FiClock className="w-5 h-5 text-blue-300" />
                  <span>Started on {formatDate(campaignStartDate)}</span>
                </div>
              )}
              {campaignEndDate && (
                <div className="flex items-center gap-2">
                  <FiHeart className="w-5 h-5 text-blue-300" />
                  <span>{new Date(campaignEndDate) > new Date() ? 
                    `Ends on ${formatDate(campaignEndDate)}` : 
                    `Ended on ${formatDate(campaignEndDate)}`}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Funding Progress Card */}
          <div className={cn(
            "bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 p-6 md:p-8",
            "transition-all duration-700 delay-100 transform",
            isPageLoaded ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          )}>
            <div className="flex flex-col md:flex-row gap-8">
              {/* Progress Information */}
              <div className="flex-1">
                <div className="flex items-baseline gap-2 mb-2">
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                    {isLoadingRaisedAmount ? (
                      <div className="h-10 w-28 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                    ) : (
                      `${Number(actualRaisedAmount || 0).toLocaleString()} ADA`
                    )}
                  </h2>
                  <p className="text-gray-500 dark:text-gray-400">
                    of {campaignMetadata.goalAmount?.toLocaleString() || 0} ADA goal
                  </p>
                </div>
                
                {/* Progress Bar */}
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-3 overflow-hidden">
                  {isLoadingRaisedAmount ? (
                    <div className="h-full bg-gray-300 dark:bg-gray-600 animate-pulse w-full"></div>
                  ) : (
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-1000",
                        progress >= 100 
                          ? "bg-green-500 dark:bg-green-600" 
                          : "bg-blue-500 dark:bg-blue-600"
                      )}
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  )}
                </div>
                
                <div className="flex justify-between text-sm mb-6">
                  <p className="text-gray-600 dark:text-gray-300 font-medium">
                    {Math.round(progress)}% funded
                  </p>
                  {donors && !isLoadingDonors && (
                    <p className="text-gray-600 dark:text-gray-300">
                      {donors.length} supporter{donors.length !== 1 ? 's' : ''}
                    </p>
                  )}
                </div>
                
                {/* Campaign Type Tags */}
                {campaignMetadata.category && (
                  <div className="flex flex-wrap gap-2 mb-6">
                    <span className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full text-sm">
                      {campaignMetadata.category}
                    </span>
                    {subcategory && (
                      <span className="bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-3 py-1 rounded-full text-sm">
                        {subcategory}
                      </span>
                    )}
                    {urgency && (
                      <span className={cn(
                        "px-3 py-1 rounded-full text-sm",
                        urgency === 'High' 
                          ? "bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300" 
                          : urgency === 'Medium'
                          ? "bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300"
                          : "bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                      )}>
                        {urgency} Urgency
                      </span>
                    )}
                  </div>
                )}
              </div>
              
              {/* Donation Box */}
              <div className="md:w-80 bg-gray-50 dark:bg-gray-900/50 rounded-xl p-5 border border-gray-100 dark:border-gray-700 flex flex-col">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Support this campaign
                </h3>
                
                <div className="mb-6">
                  <p className="text-center text-sm text-gray-500 mb-4">
                    {daysLeft} days left to donate
                  </p>
                  <input
                    type="number"
                    value={donationAmount}
                    onChange={(e) => setDonationAmount(e.target.value)}
                    placeholder={`Enter amount in ${campaignMetadata.currency}`}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md mb-4"
                    disabled={isDonating || !activeWallet}
                  />
                <button 
                    onClick={handleDonate}
                    disabled={isDonating || !activeWallet} 
                    className={`w-full text-white py-3 px-4 rounded-md font-medium transition-colors 
                                ${isDonating ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}
                                ${!activeWallet ? 'bg-gray-300 cursor-not-allowed' : ''}`}
                >
                    {isDonating ? 'Processing Donation...' : (activeWallet ? 'Donate Now' : 'Connect Wallet to Donate')}
                </button>
                  {donationError && <p className="text-sm text-red-600 mt-2">{donationError}</p>}
                  {donationSuccess && 
                    <div className="text-sm text-green-600 mt-2">
                      <p>{donationSuccess}</p>
                      {donationSuccess.includes('TxHash') && (
                         <a 
                            href={`https://preprod.cexplorer.io/tx/${donationSuccess.split('TxHash: ')[1].replace('...','')}`}
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-blue-600 hover:underline flex items-center mt-1"
                          >
                            View on Explorer <FiExternalLink className="ml-1" />
                          </a>
                      )}
                    </div>
                  }
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Rest of the page content remains the same */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Remaining campaign content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="relative h-96 w-full">
              <Image
                src={campaignImageUrl}
                alt={campaignMetadata.title}
                fill
                className="object-cover"
                unoptimized={campaignMetadata.campaignImageCID ? true : false}
              />
              {campaignMetadata.status === 'active' && (
                <div className="absolute top-4 right-4 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                  Verified Campaign
                </div>
              )}
            </div>
            <div className="p-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{campaignMetadata.title}</h1>
              <p className="text-gray-600 mb-6 whitespace-pre-line">{campaignMetadata.story}</p>

              {/* Campaign Details Section */}
              <div className="mb-6 border-t border-gray-200 pt-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Campaign Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 text-sm">
                  <div><span className="font-medium text-gray-700">Category:</span> <span className="text-gray-600">{campaignMetadata.category || 'N/A'}</span></div>
                  <div><span className="font-medium text-gray-700">Status:</span> <span className="text-gray-600 capitalize">{campaignMetadata.status.replace('_', ' ') || 'N/A'}</span></div>
                  <div><span className="font-medium text-gray-700">Created:</span> <span className="text-gray-600">{formatDate(campaignMetadata.created)}</span></div>
                  <div><span className="font-medium text-gray-700">Last Updated:</span> <span className="text-gray-600">{formatDate(campaignMetadata.updated)}</span></div>
                  {campaignMetadata.organizerId && 
                    <div className="md:col-span-2"><span className="font-medium text-gray-700">Organizer:</span> <AddressDisplay address={campaignMetadata.organizerId} /></div>
                  }
                </div>
              </div>

              {(campaignMetadata.beneficiaryName || campaignMetadata.beneficiaryId || campaignMetadata.medicalCondition) && (
                <div className="border-t border-gray-200 pt-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Beneficiary Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {campaignMetadata.beneficiaryName && <div><p className="text-sm text-gray-500">Name</p><p className="font-medium">{campaignMetadata.beneficiaryName}</p></div>}
                    {campaignMetadata.beneficiaryId && <div><p className="text-sm text-gray-500">Identifier</p><p className="font-medium">{campaignMetadata.beneficiaryId}</p></div>}
                    {campaignMetadata.medicalCondition?.summary && <div><p className="text-sm text-gray-500">Condition Summary</p><p className="font-medium">{campaignMetadata.medicalCondition.summary}</p></div>}
                    {campaignMetadata.medicalCondition?.treatmentPlanSummary && <div><p className="text-sm text-gray-500">Treatment Plan</p><p className="font-medium">{campaignMetadata.medicalCondition.treatmentPlanSummary}</p></div>}
                    {campaignMetadata.medicalCondition?.diagnosisDate && <div><p className="text-sm text-gray-500">Diagnosis Date:</p><p className="font-medium">{formatDate(new Date(campaignMetadata.medicalCondition.diagnosisDate).getTime())}</p></div>}
                    {campaignMetadata.medicalCondition?.estimatedCost && <div><p className="text-sm text-gray-500">Est. Treatment Cost:</p><p className="font-medium">{campaignMetadata.medicalCondition.estimatedCost} {campaignMetadata.currency}</p></div>}
                  </div>
                </div>
              )}
              
              {campaignMetadata.hospitalInfo?.name && (
                <div className="border-t border-gray-200 pt-6 mt-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Hospital Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><p className="text-sm text-gray-500">Name</p><p className="font-medium">{campaignMetadata.hospitalInfo.name}</p></div>
                    {campaignMetadata.hospitalInfo.address && <div><p className="text-sm text-gray-500">Address</p><p className="font-medium">{campaignMetadata.hospitalInfo.address}</p></div>}
                    {campaignMetadata.hospitalInfo.verificationCID && 
                      <div>
                        <p className="text-sm text-gray-500">Verification</p>
                        <button onClick={() => handleViewDocument(campaignMetadata.hospitalInfo!.verificationCID!, 'Hospital Verification')} className="text-blue-600 hover:underline text-sm">View Document</button>
                      </div>
                    }
                  </div>
                </div>
              )}

              {(campaignMetadata.documentsCIDs && Object.values(campaignMetadata.documentsCIDs).flat().filter(cid => cid).length > 0) && (
                 <div className="border-t border-gray-200 pt-6 mt-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Associated Documents</h2>
                  <ul className="space-y-2">
                    {campaignMetadata.documentsCIDs.medicalRecords?.map((cid, index) => (
                        <li key={`med-${index}`} className="text-sm">
                            <button onClick={() => handleViewDocument(cid, `Medical Record ${index + 1}`)} className="text-blue-600 hover:underline">
                                Medical Record {index + 1} (CID: {cid.substring(0,10)}...)
                            </button>
                        </li>
                    ))}
                    {campaignMetadata.documentsCIDs.treatmentPlanFull && (
                        <li className="text-sm">
                            <button onClick={() => handleViewDocument(campaignMetadata.documentsCIDs.treatmentPlanFull!, 'Full Treatment Plan')} className="text-blue-600 hover:underline">
                                Full Treatment Plan (CID: {campaignMetadata.documentsCIDs.treatmentPlanFull.substring(0,10)}...)
                            </button>
                        </li>
                    )}
                    {campaignMetadata.documentsCIDs.consentForms?.map((cid, index) => (
                        <li key={`consent-${index}`} className="text-sm">
                            <button onClick={() => handleViewDocument(cid, `Consent Form ${index + 1}`)} className="text-blue-600 hover:underline">
                                Consent Form {index + 1} (CID: {cid.substring(0,10)}...)
                            </button>
                        </li>
                    ))}
                     {campaignMetadata.documentsCIDs.verificationDocuments?.map((cid, index) => (
                        <li key={`verify-${index}`} className="text-sm">
                            <button onClick={() => handleViewDocument(cid, `Verification Document ${index + 1}`)} className="text-blue-600 hover:underline">
                                Verification Document {index + 1} (CID: {cid.substring(0,10)}...)
                            </button>
                        </li>
                    ))}
                    {campaignMetadata.documentsCIDs.additionalFiles?.map((file, index) => (
                        <li key={`add-${index}`} className="text-sm">
                            <button onClick={() => handleViewDocument(file.cid, file.name || `Additional File ${index + 1}`)} className="text-blue-600 hover:underline">
                                {file.name || `Additional File ${index + 1}`} (CID: {file.cid.substring(0,10)}...)
                            </button>
                        </li>
                    ))}
                  </ul>
                </div>
              )}

              {campaignMetadata.updates && campaignMetadata.updates.length > 0 && (
                <div className="border-t border-gray-200 pt-6 mt-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Campaign Updates</h2>
                  <div className="space-y-4">
                    {campaignMetadata.updates.map((update, index) => (
                      <div key={index} className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-500 mb-1">{new Date(update.timestamp).toLocaleDateString()} - {update.title}</p>
                        <p className="text-gray-700">{update.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Contact & Social Links Section */}
              {(campaignMetadata.contactEmail || campaignMetadata.socialLinks) && (
                <div className="border-t border-gray-200 pt-6 mt-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Contact & Links</h2>
                  <div className="flex flex-wrap gap-4 items-center">
                    {campaignMetadata.contactEmail && (
                      <a href={`mailto:${campaignMetadata.contactEmail}`} className="flex items-center text-blue-600 hover:underline text-sm">
                        <FiMail className="mr-2" /> Email Organizer
                      </a>
                    )}
                    {campaignMetadata.socialLinks?.twitter && (
                      <a href={campaignMetadata.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="flex items-center text-blue-600 hover:underline text-sm">
                        <FiTwitter className="mr-2" /> Twitter
                      </a>
                    )}
                    {campaignMetadata.socialLinks?.facebook && (
                      <a href={campaignMetadata.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="flex items-center text-blue-600 hover:underline text-sm">
                        <FiFacebook className="mr-2" /> Facebook
                      </a>
                    )}
                    {campaignMetadata.socialLinks?.website && (
                      <a href={campaignMetadata.socialLinks.website} target="_blank" rel="noopener noreferrer" className="flex items-center text-blue-600 hover:underline text-sm">
                        <FiGlobe className="mr-2" /> Website
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Tags Section */}
              {campaignMetadata.tags && campaignMetadata.tags.length > 0 && (
                <div className="border-t border-gray-200 pt-6 mt-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Tags</h2>
                  <div className="flex flex-wrap gap-2">
                    {campaignMetadata.tags.map(tag => (
                      <span key={tag} className="px-3 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Donors - This would need real-time on-chain data or backend integration*/}
              <div className="border-t border-gray-200 pt-6 mt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Donors</h3>
                {isLoadingDonors ? (
                  <div className="flex justify-center items-center py-4">
                    <ScaleLoader color="#3B82F6" height={25} width={3} />
                    <p className="ml-2 text-sm text-gray-500">Loading donors...</p>
                  </div>
                ) : donorError ? (
                  <p className="text-sm text-red-500">{donorError}</p>
                ) : donors && donors.length > 0 ? (
                  <div className="space-y-4">
                    {donors.map((donor, index) => (
                      <div key={index} className="flex justify-between items-center text-sm">
                        <div>
                          <AddressDisplay address={donor.address} />
                          <p className="text-xs text-gray-500">{formatDate(donor.timestamp)}</p>
                        </div>
                        <p className="font-medium text-gray-800">{donor.amount} ADA</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No donor information available yet.</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6 sticky top-8">
            <div className="mb-6">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-500">Raised</span>
                {isLoadingRaisedAmount ? (
                  <span className="font-medium text-gray-500 animate-pulse">Loading...</span>
                ) : (
                  <span className="font-medium">{actualRaisedAmount !== null ? `${actualRaisedAmount} ADA` : 'N/A'}</span>
                )}
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div
                  className="bg-blue-600 rounded-full h-2"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Goal</span>
                <span className="font-medium">{campaignMetadata.goalAmount} {campaignMetadata.currency}</span>
              </div>
            </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 