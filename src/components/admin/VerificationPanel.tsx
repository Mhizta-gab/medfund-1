'use client';

import { useState } from 'react';
import Image from 'next/image';

interface VerificationDocument {
  id: string;
  type: string;
  url: string;
  uploadedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
}

interface CampaignVerification {
  campaignId: string;
  campaignTitle: string;
  documents: VerificationDocument[];
  status: 'pending' | 'in-progress' | 'completed' | 'rejected';
  verifiedBy?: string;
  verificationDate?: string;
}

const VerificationPanel = () => {
  const [selectedCampaign, setSelectedCampaign] = useState<CampaignVerification | null>(null);
  const [verificationNotes, setVerificationNotes] = useState('');

  // Mock data - In production, this would come from an API
  const [campaigns, setCampaigns] = useState<CampaignVerification[]>([
    {
      campaignId: '1',
      campaignTitle: 'Emergency Heart Surgery',
      status: 'pending',
      documents: [
        {
          id: '1',
          type: 'Government ID',
          url: '/documents/id1.pdf',
          uploadedAt: '2024-03-15',
          status: 'pending',
        },
        {
          id: '2',
          type: 'Medical Records',
          url: '/documents/medical1.pdf',
          uploadedAt: '2024-03-15',
          status: 'pending',
        },
        {
          id: '3',
          type: 'Hospital Letter',
          url: '/documents/hospital1.pdf',
          uploadedAt: '2024-03-15',
          status: 'pending',
        },
      ],
    },
  ]);

  const handleDocumentReview = (documentId: string, status: 'approved' | 'rejected') => {
    if (!selectedCampaign) return;

    const updatedCampaigns = campaigns.map(campaign => {
      if (campaign.campaignId === selectedCampaign.campaignId) {
        const updatedDocuments = campaign.documents.map(doc => {
          if (doc.id === documentId) {
            return { ...doc, status };
          }
          return doc;
        });

        const allDocumentsReviewed = updatedDocuments.every(doc => doc.status !== 'pending');
        const allApproved = updatedDocuments.every(doc => doc.status === 'approved');

        return {
          ...campaign,
          documents: updatedDocuments,
          status: allDocumentsReviewed
            ? allApproved
              ? 'completed'
              : 'rejected'
            : 'in-progress',
        } as CampaignVerification;
      }
      return campaign;
    });

    setCampaigns(updatedCampaigns);
    setSelectedCampaign(updatedCampaigns.find(c => c.campaignId === selectedCampaign.campaignId) || null);
  };

  const handleFinalVerification = () => {
    if (!selectedCampaign) return;

    const updatedCampaigns = campaigns.map(campaign => {
      if (campaign.campaignId === selectedCampaign.campaignId) {
        return {
          ...campaign,
          status: 'completed' as const,
          verifiedBy: 'Admin User', // In production, this would be the actual admin's name
          verificationDate: new Date().toISOString(),
        } as CampaignVerification;
      }
      return campaign;
    });

    setCampaigns(updatedCampaigns);
    setSelectedCampaign(null);
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Campaign Verification</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Campaign List */}
        <div className="md:col-span-1">
          <h3 className="text-lg font-semibold mb-4">Pending Verifications</h3>
          <div className="space-y-4">
            {campaigns.map(campaign => (
              <div
                key={campaign.campaignId}
                className={`p-4 rounded-lg cursor-pointer ${
                  selectedCampaign?.campaignId === campaign.campaignId
                    ? 'bg-blue-50 border-2 border-blue-500'
                    : 'bg-white border border-gray-200'
                }`}
                onClick={() => setSelectedCampaign(campaign)}
              >
                <h4 className="font-medium">{campaign.campaignTitle}</h4>
                <p className="text-sm text-gray-500">
                  {campaign.documents.length} documents to review
                </p>
                <span
                  className={`inline-block mt-2 px-2 py-1 rounded-full text-xs font-medium ${
                    campaign.status === 'completed'
                      ? 'bg-green-100 text-green-800'
                      : campaign.status === 'rejected'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {campaign.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Document Review */}
        {selectedCampaign && (
          <div className="md:col-span-2">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">
                Review Documents - {selectedCampaign.campaignTitle}
              </h3>
              
              <div className="space-y-6">
                {selectedCampaign.documents.map(document => (
                  <div
                    key={document.id}
                    className="border rounded-lg p-4"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium">{document.type}</h4>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          document.status === 'approved'
                            ? 'bg-green-100 text-green-800'
                            : document.status === 'rejected'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {document.status}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center mt-4">
                      <button
                        onClick={() => window.open(document.url, '_blank')}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        View Document
                      </button>
                      
                      <div className="space-x-2">
                        <button
                          onClick={() => handleDocumentReview(document.id, 'approved')}
                          className={`px-3 py-1 rounded text-sm ${
                            document.status === 'approved'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800 hover:bg-green-100 hover:text-green-800'
                          }`}
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleDocumentReview(document.id, 'rejected')}
                          className={`px-3 py-1 rounded text-sm ${
                            document.status === 'rejected'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-800 hover:bg-red-100 hover:text-red-800'
                          }`}
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Verification Notes
                  </label>
                  <textarea
                    value={verificationNotes}
                    onChange={(e) => setVerificationNotes(e.target.value)}
                    rows={3}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Add any notes about the verification process..."
                  />
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    onClick={handleFinalVerification}
                    disabled={selectedCampaign.status !== 'completed'}
                    className={`px-4 py-2 rounded-md text-white ${
                      selectedCampaign.status === 'completed'
                        ? 'bg-blue-600 hover:bg-blue-700'
                        : 'bg-gray-400 cursor-not-allowed'
                    }`}
                  >
                    Complete Verification
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerificationPanel; 