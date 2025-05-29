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
import { FiExternalLink, FiMail, FiTwitter, FiFacebook, FiGlobe } from 'react-icons/fi';
import { BlockFrostAPI } from '@blockfrost/blockfrost-js';

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

  const [donationAmount, setDonationAmount] = useState<string>('');
  const [isDonating, setIsDonating] = useState(false);
  const [donationError, setDonationError] = useState<string | null>(null);
  const [donationSuccess, setDonationSuccess] = useState<string | null>(null);
  const [actualRaisedAmount, setActualRaisedAmount] = useState<string | null>(null);
  const [isLoadingRaisedAmount, setIsLoadingRaisedAmount] = useState<boolean>(true);
  const [donors, setDonors] = useState<Array<{ address: string; amount: number; txHash: string; timestamp: number }> | null>(null);
  const [isLoadingDonors, setIsLoadingDonors] = useState<boolean>(true);
  const [donorError, setDonorError] = useState<string | null>(null);

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

    const fetchCampaignAndBalanceAndDonors = async () => {
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

            // Fetch donors
            try {
              if (!process.env.NEXT_PUBLIC_BLOCKFROST_API_KEY || !metadata?.organizerId) {
                setDonorError("Missing API key or Organizer ID for donor fetching.");
                setIsLoadingDonors(false);
                // return; // Exit if essential info is missing - already handled by setIsLoadingDonors(false) and conditional rendering
              } else {
                const blockFrostApi = new BlockFrostAPI({
                  projectId: process.env.NEXT_PUBLIC_BLOCKFROST_API_KEY!,
                  network: network === 'Mainnet' ? 'mainnet' : 'preprod',
                });
                
                const campaignAddress = metadata.organizerId;
                // Fetch recent transactions for the campaign address
                const txHistory = await blockFrostApi.addressesTransactions(campaignAddress, { count: 25, order: 'desc' });
                
                const fetchedDonors: Array<{ address: string; amount: number; txHash: string; timestamp: number }> = [];

                for (const txInfo of txHistory) {
                  const txUtxos = await blockFrostApi.txsUtxos(txInfo.tx_hash);
                  
                  let amountToCampaign = BigInt(0);
                  let potentialDonorAddress: string | null = null;

                  // Sum outputs to the campaign address in this transaction
                  txUtxos.outputs.forEach(output => {
                    if (output.address === campaignAddress) {
                      const adaOutput = output.amount.find(asset => asset.unit === 'lovelace');
                      if (adaOutput) {
                        amountToCampaign += BigInt(adaOutput.quantity);
                      }
                    }
                  });

                  if (amountToCampaign > 0) {
                    // Identify a potential donor from inputs
                    // This is a simplification: picks the first input address not belonging to the campaign
                    for (const input of txUtxos.inputs) {
                        // We need to get the address from the input's UTxO. Blockfrost UTxO references often don't contain the address directly in /txs/{hash}/utxos inputs part.
                        // The input references a previous output. To get the input address, we would typically need to look up that previous transaction's output details.
                        // This adds significant complexity (another API call per input).
                        // Simplified: for now, we can't reliably get donor address from this endpoint alone without more calls.
                        // So, we'll use a placeholder or acknowledge this limitation.
                        // For a hackathon, we might have to display the tx_hash and amount, and note address identification is complex.
                    }
                    // For now, as a placeholder until address resolution is refined:
                    // If we can get addresses from inputs (often requires more lookups):
                    const firstExternalInput = txUtxos.inputs.find(input => input.address !== campaignAddress && input.address);
                    if (firstExternalInput && firstExternalInput.address) {
                        potentialDonorAddress = firstExternalInput.address;
                    } else {
                        // If no input address is readily available or all are from campaign (e.g. consolidation)
                        // we might use a generic label or skip if we can't identify an external donor.
                        // For now, if we can't find an external input address directly, we'll mark it as unknown.
                        potentialDonorAddress = "Unknown Donor (see tx)"; 
                    }

                    // Blockfrost provides `block_time` for the transaction, which is a unix timestamp
                    const txDetails = await blockFrostApi.txs(txInfo.tx_hash); // Fetches block_time

                    fetchedDonors.push({
                      address: potentialDonorAddress, // This is often simplified / approximated here
                      amount: Number(amountToCampaign) / 1_000_000,
                      txHash: txInfo.tx_hash,
                      timestamp: txDetails.block_time * 1000, // Convert seconds to milliseconds
                    });
                  }
                  if (fetchedDonors.length >= 10) break; // Limit to 10 processed donor entries for display simplicity
                }
                setDonors(fetchedDonors);
                if (fetchedDonors.length === 0 && txHistory.length > 0) {
                    setDonorError('Found recent transactions, but could not identify distinct donors or amounts to display from the simplified parsing.');
                } else if (txHistory.length === 0) {
                    setDonorError('No recent transactions found for this campaign address.');
                }
                 else {
                    setDonorError(null);
                }
              }
            } catch (err: any) {
              console.error("Failed to initialize Blockfrost or fetch donors:", err);
              setDonorError(`Could not load recent donors: ${err.message}`);
            }
            setIsLoadingDonors(false);

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

    fetchCampaignAndBalanceAndDonors();

  }, [params.id, ipfsService, lucid, blockchainIsLoading, blockchainError, network]);

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
      <div className="flex flex-col items-center justify-center min-h-screen">
        <ScaleLoader color="#3B82F6" loading={true} height={50} width={6} radius={3} />
        <p className="mt-4 text-lg text-gray-700">Loading campaign details...</p>
      </div>
    );
  }

  if (pageError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <p className="text-red-600 text-xl">{pageError}</p>
        <p className="text-sm text-gray-500 mt-2">Please ensure the Campaign ID (IPFS CID) is correct and the IPFS service is available.</p>
      </div>
    );
  }

  if (!campaignMetadata) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-gray-700 text-xl">Campaign not found.</p>
      </div>
    );
  }

  const campaignImageUrl = campaignMetadata.campaignImageCID 
    ? `${ipfsService.gatewayUrl || 'https://ipfs.blockfrost.io/ipfs/'}${campaignMetadata.campaignImageCID}`
    : '/images/placeholder-campaign.jpg';

  const displayRaisedAmount = actualRaisedAmount !== null ? parseFloat(actualRaisedAmount) : (campaignMetadata.goalAmount ? campaignMetadata.goalAmount * 0.7 : 0);
  const daysLeft = 15;
  const progress = campaignMetadata.goalAmount ? (displayRaisedAmount / campaignMetadata.goalAmount) * 100 : 0;

  const handleViewDocument = (cid: string, name?: string) => {
    setSelectedDocumentCid(cid);
    setSelectedDocumentName(name || 'Document');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {selectedDocumentCid && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-4 md:p-6 rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">{selectedDocumentName}</h3>
                <button 
                    onClick={() => setSelectedDocumentCid(null)} 
                    className="text-gray-600 hover:text-gray-900 text-2xl font-bold"
                >
                    &times;
                </button>
            </div>
            <DocumentViewer ipfsCid={selectedDocumentCid} fileName={selectedDocumentName || undefined} />
          </div>
        </div>
      )}

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
  );
} 