'use client';

import { useState } from 'react';
import { useCardanoWallet } from '@/blockchain/context/WalletContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserProfile } from '@clerk/nextjs';
import AddressDisplay from '@/components/blockchain/AddressDisplay';

export default function ProfilePage() {
  const { walletName, walletAddress, walletBalance, connected: isWalletConnected } = useCardanoWallet();
  const [activeTab, setActiveTab] = useState('overview');

  const formatWalletBalance = (balance: string | null) => {
    if (!balance) return '0.00';
    return `${parseFloat(balance).toFixed(2)} ₳`;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">My Profile</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* User Info */}
            <Card>
              <CardHeader>
                <CardTitle>User Profile</CardTitle>
                <CardDescription>Manage your account information</CardDescription>
              </CardHeader>
              <CardContent>
                <UserProfile
                  appearance={{
                    elements: {
                      rootBox: "w-full mx-auto",
                      card: "shadow-none p-0",
                      navbar: "hidden",
                      pageScrollBox: "p-0"
                    }
                  }}
                />
              </CardContent>
            </Card>
            
            {/* Wallet Info */}
            {isWalletConnected && (
              <Card>
                <CardHeader>
                  <CardTitle>Wallet Information</CardTitle>
                  <CardDescription>Connected Cardano wallet details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
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
                </CardContent>
              </Card>
            )}
          </div>
          
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Account Details</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="activity">Activity</TabsTrigger>
                    <TabsTrigger value="campaigns">My Campaigns</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="overview" className="mt-4">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Account Overview</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            Account Statistics
                          </h4>
                          <dl className="mt-2 space-y-2">
                            <div className="flex justify-between">
                              <dt className="text-sm text-gray-500 dark:text-gray-400">Account Created</dt>
                              <dd className="text-sm text-gray-900 dark:text-white">June 2024</dd>
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
                          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            Campaign Statistics
                          </h4>
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
                  </TabsContent>
                  
                  <TabsContent value="activity" className="mt-4">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Recent Activity</h3>
                      <div className="divide-y divide-gray-200 dark:divide-gray-700">
                        {[1, 2, 3].map((activity) => (
                          <div key={activity} className="py-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium">Campaign Donation</p>
                                <p className="text-sm text-gray-500">You donated ₳50 to Emergency Heart Surgery</p>
                              </div>
                              <span className="text-sm text-gray-500">June 15, 2024</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="campaigns" className="mt-4">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">My Campaigns</h3>
                      <div className="grid gap-4">
                        {[1, 2].map((campaign) => (
                          <div key={campaign} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-medium">Emergency Heart Surgery</h4>
                                <p className="text-sm text-gray-500">Created: June 1, 2024</p>
                                <p className="mt-2 text-sm">Raised: ₳1,200 of ₳5,000 goal</p>
                              </div>
                              <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">Active</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 