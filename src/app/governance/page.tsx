"use client"

import { useState, useEffect } from 'react';
import { FiCheck, FiX, FiTrendingUp, FiCalendar, FiShield, FiUser, FiBarChart2 } from 'react-icons/fi';
import { cn } from '@/utils';

// Mock data for proposals
const proposals = [
  {
    id: '1',
    title: 'Emergency Fund Allocation',
    description: 'Proposal to allocate 10,000 ADA from the community pool for emergency medical cases. This will ensure that we can rapidly respond to critical medical situations and provide immediate financial support.',
    votesFor: 15000,
    votesAgainst: 5000,
    status: 'active',
    endDate: '2024-04-30',
    creator: 'addr1q9f4z...',
    category: 'Fund Management',
    importance: 'High',
  },
  {
    id: '2',
    title: 'Verification Process Update',
    description: 'Implement additional verification steps for campaign creators to enhance trust. The new process will include hospital document verification and medical professional endorsements.',
    votesFor: 12000,
    votesAgainst: 3000,
    status: 'active',
    endDate: '2024-04-25',
    creator: 'addr1v9m2h...',
    category: 'Platform Policy',
    importance: 'Medium',
  },
  {
    id: '3',
    title: 'Platform Fee Adjustment',
    description: 'Reduce platform fees from 1% to 0.5% to encourage more donations. The reduced fees will allow more funds to directly reach those in need while still maintaining platform sustainability.',
    votesFor: 20000,
    votesAgainst: 8000,
    status: 'completed',
    endDate: '2024-03-30',
    creator: 'addr1q8h3k...',
    category: 'Tokenomics',
    importance: 'Medium',
  },
  {
    id: '4',
    title: 'Partnership with Regional Hospitals',
    description: 'Establish formal partnerships with major regional hospitals to streamline patient verification and campaign creation. This will enable faster campaign approvals and more efficient fund distribution.',
    votesFor: 25000,
    votesAgainst: 2000,
    status: 'completed',
    endDate: '2024-03-15',
    creator: 'addr1v5k7p...',
    category: 'Partnerships',
    importance: 'High',
  },
];

export default function GovernancePage() {
  const [activeTab, setActiveTab] = useState('active'); // active, completed
  const [isLoaded, setIsLoaded] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);
  const [votingInProgress, setVotingInProgress] = useState<string | null>(null);

  useEffect(() => {
    setIsLoaded(true);
    // Simulate wallet connection check
    const timer = setTimeout(() => {
      setWalletConnected(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const filteredProposals = proposals.filter(
    proposal => activeTab === 'active' ? proposal.status === 'active' : proposal.status === 'completed'
  );

  const handleVote = async (proposalId: string, voteType: 'for' | 'against') => {
    if (!walletConnected) {
      // Prompt wallet connection
      alert('Please connect your wallet to vote');
      return;
    }
    
    setVotingInProgress(proposalId);
    // Simulate voting process
    setTimeout(() => {
    console.log('Voting', voteType, 'on proposal:', proposalId);
      setVotingInProgress(null);
    }, 2000);
  };

  return (
    <div className={cn(
      "min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900",
      "transition-opacity duration-500",
      !isLoaded ? "opacity-0" : "opacity-100"
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12 max-w-3xl mx-auto">
          <h1 className={cn(
            "text-4xl md:text-5xl font-extrabold mb-4",
            "bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400",
            "transition-all duration-700 transform",
            isLoaded ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          )}>
            Decentralized Governance
          </h1>
          <p className={cn(
            "text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto",
            "transition-all duration-700 delay-100",
            isLoaded ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          )}>
            Participate in MedFund's community-driven decision making. Vote on proposals 
            to help shape the platform's future and ensure transparency in fund management.
        </p>
      </div>

        <div className={cn(
          "flex justify-center gap-4 mb-12",
          "transition-all duration-700 delay-200",
          isLoaded ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
        )}>
          <TabButton 
            active={activeTab === 'active'} 
          onClick={() => setActiveTab('active')}
            icon={<FiTrendingUp className="w-4 h-4" />}
        >
          Active Proposals
          </TabButton>
          <TabButton 
            active={activeTab === 'completed'} 
          onClick={() => setActiveTab('completed')}
            icon={<FiCheck className="w-4 h-4" />}
        >
          Completed Proposals
          </TabButton>
      </div>

        <div className="space-y-8">
          {filteredProposals.length === 0 ? (
            <div className={cn(
              "text-center py-16 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700",
              "transition-all duration-700 delay-300",
              isLoaded ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
            )}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 dark:text-gray-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">No proposals found</h3>
              <p className="text-gray-600 dark:text-gray-400">There are currently no {activeTab} proposals to display</p>
            </div>
          ) : (
            filteredProposals.map((proposal, index) => {
          const totalVotes = proposal.votesFor + proposal.votesAgainst;
          const forPercentage = (proposal.votesFor / totalVotes) * 100;
          const againstPercentage = (proposal.votesAgainst / totalVotes) * 100;
              const isVoting = votingInProgress === proposal.id;

          return (
                <div 
                  key={proposal.id} 
                  className={cn(
                    "bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-100 dark:border-gray-700",
                    "transition-all duration-500 transform hover:shadow-lg",
                    "transition-all duration-700 delay-[300ms]",
                    isLoaded ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
                    `delay-[${300 + index * 100}ms]`
                  )}
                >
                  <div className="p-6 md:p-8">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
                      <div className="flex-1">
                        <div className="flex items-start gap-2 flex-wrap mb-2">
                          <span className={cn(
                            "px-3 py-1 rounded-full text-sm font-medium",
                    proposal.status === 'active'
                              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                              : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                          )}>
                    {proposal.status === 'active' ? 'Active' : 'Completed'}
                  </span>
                          <span className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300 px-3 py-1 rounded-full text-sm font-medium">
                            {proposal.category}
                          </span>
                          <span className={cn(
                            "px-3 py-1 rounded-full text-sm font-medium",
                            proposal.importance === 'High' 
                              ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300" 
                              : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                          )}>
                            {proposal.importance} Priority
                          </span>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{proposal.title}</h3>
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-4">
                          <FiUser className="mr-1" />
                          <span>Proposed by {proposal.creator}</span>
                        </div>
                      </div>
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                        <FiCalendar className="mr-1" />
                        <span>
                          {proposal.status === 'active' ? 'Ends' : 'Ended'} on {new Date(proposal.endDate).toLocaleDateString()}
                        </span>
                      </div>
                </div>

                    <p className="text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">{proposal.description}</p>

                    <div className="mb-8">
                      <div className="flex justify-between items-baseline mb-3">
                        <div className="flex items-center gap-2">
                          <FiBarChart2 className="text-gray-500 dark:text-gray-400" />
                          <span className="text-lg font-medium text-gray-900 dark:text-white">Voting Results</span>
                        </div>
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          {totalVotes.toLocaleString()} ADA Total
                        </span>
                      </div>
                      
                      <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
                        {/* For Votes */}
                        <div className="mb-4">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="font-medium text-green-600 dark:text-green-400 flex items-center">
                              <FiCheck className="mr-1" /> For
                            </span>
                            <span className="font-medium text-green-600 dark:text-green-400">
                              {proposal.votesFor.toLocaleString()} ADA ({forPercentage.toFixed(1)}%)
                            </span>
                  </div>
                          <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                    <div
                              className="h-full bg-green-500 dark:bg-green-600 rounded-full transition-all duration-1000"
                      style={{ width: `${forPercentage}%` }}
                    />
                  </div>
                        </div>
                        
                        {/* Against Votes */}
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="font-medium text-red-600 dark:text-red-400 flex items-center">
                              <FiX className="mr-1" /> Against
                            </span>
                            <span className="font-medium text-red-600 dark:text-red-400">
                              {proposal.votesAgainst.toLocaleString()} ADA ({againstPercentage.toFixed(1)}%)
                            </span>
                          </div>
                          <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-red-500 dark:bg-red-600 rounded-full transition-all duration-1000"
                              style={{ width: `${againstPercentage}%` }}
                            />
                          </div>
                        </div>
                  </div>
                </div>

                {proposal.status === 'active' && (
                      <div className="flex flex-col sm:flex-row gap-4">
                    <button
                      onClick={() => handleVote(proposal.id, 'for')}
                          disabled={isVoting}
                          className={cn(
                            "flex-1 py-3 px-4 rounded-lg font-medium text-white transition-all",
                            "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700",
                            "shadow-md hover:shadow-lg transform hover:translate-y-[-1px] active:translate-y-[1px]",
                            "flex justify-center items-center gap-2",
                            isVoting && "opacity-70 cursor-not-allowed"
                          )}
                        >
                          {isVoting ? (
                            <>
                              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Processing...
                            </>
                          ) : (
                            <>
                              <FiCheck className="w-5 h-5" /> Vote For
                            </>
                          )}
                    </button>
                    <button
                      onClick={() => handleVote(proposal.id, 'against')}
                          disabled={isVoting}
                          className={cn(
                            "flex-1 py-3 px-4 rounded-lg font-medium text-white transition-all",
                            "bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700",
                            "shadow-md hover:shadow-lg transform hover:translate-y-[-1px] active:translate-y-[1px]",
                            "flex justify-center items-center gap-2",
                            isVoting && "opacity-70 cursor-not-allowed"
                          )}
                        >
                          {isVoting ? (
                            <>
                              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Processing...
                            </>
                          ) : (
                            <>
                              <FiX className="w-5 h-5" /> Vote Against
                            </>
                          )}
                    </button>
                  </div>
                )}

                    {!walletConnected && proposal.status === 'active' && (
                      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 rounded-lg text-sm flex items-center">
                        <FiShield className="mr-2 flex-shrink-0" />
                        <span>Connect your wallet to vote on this proposal. Your voting power is proportional to your ADA stake.</span>
                      </div>
                  )}
                  </div>
                </div>
              );
            })
          )}
              </div>
        
        {activeTab === 'active' && filteredProposals.length > 0 && (
          <div className={cn(
            "mt-10 text-center",
            "transition-all duration-700 delay-[600ms]",
            isLoaded ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
          )}>
            <button className="inline-flex items-center gap-2 px-5 py-3 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-lg font-medium hover:bg-indigo-200 dark:hover:bg-indigo-900/40 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Create New Proposal
            </button>
            </div>
        )}
      </div>
    </div>
  );
}

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  icon?: React.ReactNode;
}

function TabButton({ active, onClick, children, icon }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-6 py-3 rounded-xl font-medium transition-all duration-200",
        "flex items-center gap-2",
        active
          ? "bg-indigo-600 text-white shadow-md dark:bg-indigo-700"
          : "bg-white text-gray-700 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700"
      )}
    >
      {icon}
      {children}
    </button>
  );
} 