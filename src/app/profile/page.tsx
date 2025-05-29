'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/blockchain/ProtectedRoute';
import { useCardanoWallet } from '@/blockchain/context/WalletContext';
import AddressDisplay from '@/components/blockchain/AddressDisplay';

const ProfilePage = () => {
  const { user } = useAuth();
  const { walletName, walletAddress, walletBalance, connected: isWalletConnected } = useCardanoWallet();
  const [activeTab, setActiveTab] = useState('overview');
  const [tokens, setTokens] = useState<any[]>([]);
  const [loadingTokens, setLoadingTokens] = useState(false);

  // Mock data for user activity
  const userActivity = [
    {
      id: 1,
      type: 'campaign',
      title: 'Emergency Heart Surgery',
      date: '2024-03-15',
      status: 'Active',
    },
    {
      id: 2,
      type: 'donation',
      title: 'Cancer Treatment Support',
      amount: 100,
      date: '2024-03-10',
    },
    {
      id: 3,
      type: 'verification',
      title: 'Identity Verification',
      date: '2024-03-05',
      status: 'Completed',
    },
  ];

  const formatWalletBalance = (balance: string | null) => {
    if (!balance) return '0.00';
    // Assuming balance from context is already in ADA as a string
    return `${parseFloat(balance).toFixed(2)} ₳`;
  };

  return (
    <ProtectedRoute redirectTo="/login">
      <div className="min-h-screen bg-gray-50 dark:bg-gray-800 pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Profile Header */}
          <div className="bg-white dark:bg-gray-700 shadow rounded-lg mb-6">
            <div className="px-4 py-5 sm:px-6">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <div className="h-20 w-20 rounded-full bg-blue-100 flex items-center justify-center">
                    <svg
                      className="h-12 w-12 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {user?.email?.split('@')[0] || 'User Profile'}
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Wallet Information Section */}
          {isWalletConnected && (
            <div className="bg-white dark:bg-gray-700 shadow rounded-lg p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Wallet Information</h2>
              <div className="space-y-4">
                <div>
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Connected Wallet</span>
                  <p className="font-semibold text-gray-800 dark:text-gray-200">{walletName || 'N/A'}</p>
                </div>
                {walletAddress && (
                  <AddressDisplay
                    address={walletAddress}
                    label="Wallet Address"
                  />
                )}
                <div>
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Balance</span>
                  <p className="font-semibold text-gray-800 dark:text-gray-200">{formatWalletBalance(walletBalance)}</p>
                </div>
              </div>
            </div>
          )}

          {/* Your Tokens Section (Placeholder) */}
          {isWalletConnected && (
            <div className="bg-white dark:bg-gray-700 shadow rounded-lg p-6 mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Your Tokens</h2>
                {loadingTokens ? (
                    <div className="text-center py-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                        <p className="mt-2 text-gray-500 dark:text-gray-400">Loading tokens...</p>
                    </div>
                ) : tokens.length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400">You don't have any platform tokens yet. Participate to earn!</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {tokens.map((token: any) => (
                            <div key={token.unit} className="bg-gray-50 dark:bg-gray-600 rounded-lg p-4">
                                <p className="font-medium text-gray-800 dark:text-gray-200">{token.assetName || 'Token'}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Quantity: {token.quantity}</p>
                                <p className="text-xs font-mono text-gray-500 dark:text-gray-400 truncate">{token.unit}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
          )}

          {/* Tabs */}
          <div className="mt-6">
            <div className="border-b border-gray-200 dark:border-gray-600">
              <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`${
                    activeTab === 'overview'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab('activity')}
                  className={`${
                    activeTab === 'activity'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                >
                  Activity
                </button>
                <button
                  onClick={() => setActiveTab('campaigns')}
                  className={`${
                    activeTab === 'campaigns'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                >
                  My Campaigns
                </button>
              </nav>
            </div>
          </div>

          {/* Tab Content */}
          <div className="mt-6">
            {activeTab === 'overview' && (
              <div className="bg-white dark:bg-gray-700 shadow rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Account Overview
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Account Information
                    </h3>
                    <dl className="mt-2 space-y-2">
                      <div className="flex justify-between">
                        <dt className="text-sm text-gray-500 dark:text-gray-400">Email</dt>
                        <dd className="text-sm text-gray-900 dark:text-white">{user?.email}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-sm text-gray-500 dark:text-gray-400">Account Type</dt>
                        <dd className="text-sm text-gray-900 dark:text-white">Standard</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-sm text-gray-500 dark:text-gray-400">Verification Status</dt>
                        <dd className="text-sm text-green-600">Verified</dd>
                      </div>
                    </dl>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Campaign Statistics
                    </h3>
                    <dl className="mt-2 space-y-2">
                      <div className="flex justify-between">
                        <dt className="text-sm text-gray-500 dark:text-gray-400">Active Campaigns</dt>
                        <dd className="text-sm text-gray-900 dark:text-white">2</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-sm text-gray-500 dark:text-gray-400">Total Donations</dt>
                        <dd className="text-sm text-gray-900 dark:text-white">₳1,500</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-sm text-gray-500 dark:text-gray-400">Campaigns Created</dt>
                        <dd className="text-sm text-gray-900 dark:text-white">3</dd>
                      </div>
                    </dl>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'activity' && (
              <div className="bg-white dark:bg-gray-700 shadow rounded-lg">
                <div className="px-4 py-5 sm:px-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Recent Activity
                  </h3>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-600">
                  <ul className="divide-y divide-gray-200 dark:divide-gray-600">
                    {userActivity.map((activity) => (
                      <li key={activity.id} className="px-4 py-4 sm:px-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="flex-shrink-0">
                              {activity.type === 'campaign' && (
                                <svg
                                  className="h-6 w-6 text-blue-600"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                                  />
                                </svg>
                              )}
                              {activity.type === 'donation' && (
                                <svg
                                  className="h-6 w-6 text-green-600"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                  />
                                </svg>
                              )}
                              {activity.type === 'verification' && (
                                <svg
                                  className="h-6 w-6 text-yellow-600"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                  />
                                </svg>
                              )}
                            </div>
                            <div className="ml-4">
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {activity.title}
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {new Date(activity.date).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="ml-4">
                            {activity.status && (
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  activity.status === 'Completed'
                                    ? 'bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-100'
                                    : 'bg-blue-100 text-blue-800 dark:bg-blue-700 dark:text-blue-100'
                                }`}
                              >
                                {activity.status}
                              </span>
                            )}
                            {activity.amount && (
                              <span className="text-sm font-medium text-gray-900 dark:text-white">
                                ₳{activity.amount}
                              </span>
                            )}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {activeTab === 'campaigns' && (
              <div className="bg-white dark:bg-gray-700 shadow rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  My Campaigns
                </h2>
                <p className="text-gray-500 dark:text-gray-400">You have not created any campaigns yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default ProfilePage; 