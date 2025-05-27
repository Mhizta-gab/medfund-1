"use client"

import { useState } from 'react';

// Mock data for proposals
const proposals = [
  {
    id: '1',
    title: 'Emergency Fund Allocation',
    description: 'Proposal to allocate 10,000 ADA from the community pool for emergency medical cases.',
    votesFor: 15000,
    votesAgainst: 5000,
    status: 'active',
    endDate: '2024-04-30',
    creator: 'addr1q9f4z...',
  },
  {
    id: '2',
    title: 'Verification Process Update',
    description: 'Implement additional verification steps for campaign creators to enhance trust.',
    votesFor: 12000,
    votesAgainst: 3000,
    status: 'active',
    endDate: '2024-04-25',
    creator: 'addr1v9m2h...',
  },
  {
    id: '3',
    title: 'Platform Fee Adjustment',
    description: 'Reduce platform fees from 1% to 0.5% to encourage more donations.',
    votesFor: 20000,
    votesAgainst: 8000,
    status: 'completed',
    endDate: '2024-03-30',
    creator: 'addr1q8h3k...',
  },
];

export default function GovernancePage() {
  const [activeTab, setActiveTab] = useState('active'); // active, completed

  const filteredProposals = proposals.filter(
    proposal => activeTab === 'active' ? proposal.status === 'active' : proposal.status === 'completed'
  );

  const handleVote = async (proposalId: string, voteType: 'for' | 'against') => {
    // TODO: Implement voting logic with Cardano wallet integration
    console.log('Voting', voteType, 'on proposal:', proposalId);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Governance</h1>
        <p className="text-gray-600">
          Participate in MedFund's decentralized governance. Vote on proposals to help shape the platform's future.
        </p>
      </div>

      <div className="flex gap-4 mb-8">
        <button
          onClick={() => setActiveTab('active')}
          className={`px-4 py-2 rounded-md ${
            activeTab === 'active'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Active Proposals
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className={`px-4 py-2 rounded-md ${
            activeTab === 'completed'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Completed Proposals
        </button>
      </div>

      <div className="space-y-6">
        {filteredProposals.map((proposal) => {
          const totalVotes = proposal.votesFor + proposal.votesAgainst;
          const forPercentage = (proposal.votesFor / totalVotes) * 100;
          const againstPercentage = (proposal.votesAgainst / totalVotes) * 100;

          return (
            <div key={proposal.id} className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{proposal.title}</h3>
                    <p className="text-sm text-gray-500">Created by {proposal.creator}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    proposal.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {proposal.status === 'active' ? 'Active' : 'Completed'}
                  </span>
                </div>

                <p className="text-gray-600 mb-6">{proposal.description}</p>

                <div className="mb-6">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Votes</span>
                    <span className="font-medium">{totalVotes.toLocaleString()} ADA</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600"
                      style={{ width: `${forPercentage}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-sm mt-2">
                    <span className="text-green-600">For: {proposal.votesFor.toLocaleString()} ADA ({forPercentage.toFixed(1)}%)</span>
                    <span className="text-red-600">Against: {proposal.votesAgainst.toLocaleString()} ADA ({againstPercentage.toFixed(1)}%)</span>
                  </div>
                </div>

                {proposal.status === 'active' && (
                  <div className="flex gap-4">
                    <button
                      onClick={() => handleVote(proposal.id, 'for')}
                      className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700"
                    >
                      Vote For
                    </button>
                    <button
                      onClick={() => handleVote(proposal.id, 'against')}
                      className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700"
                    >
                      Vote Against
                    </button>
                  </div>
                )}

                <div className="mt-4 text-sm text-gray-500">
                  {proposal.status === 'active' ? (
                    <p>Voting ends on {new Date(proposal.endDate).toLocaleDateString()}</p>
                  ) : (
                    <p>Voting ended on {new Date(proposal.endDate).toLocaleDateString()}</p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
} 