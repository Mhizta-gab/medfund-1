"use client"

import React, { useState, useEffect } from 'react';
import { 
  FiAward, FiGift, FiHeart, FiUsers, 
  FiActivity, FiCheck, FiClock, FiStar 
} from 'react-icons/fi';
import { cn } from "@/utils";

// Mock data for user rewards
const userRewards = {
  medTokens: 1500,
  totalDonated: 25000,
  level: 'Gold Donor',
  nextLevel: {
    name: 'Platinum Donor',
    threshold: 35000,
    benefits: ['25% healthcare discounts', 'Priority access to new campaigns', 'Governance voting power x2']
  },
  discounts: [
    {
      id: '1',
      provider: 'Central Hospital',
      discount: '15%',
      validUntil: '2024-12-31',
      description: 'Discount on all medical services',
      logoUrl: 'https://placekitten.com/100/100',
    },
    {
      id: '2',
      provider: 'MedLab Diagnostics',
      discount: '20%',
      validUntil: '2024-12-31',
      description: 'Discount on laboratory tests',
      logoUrl: 'https://placekitten.com/101/101',
    },
    {
      id: '3',
      provider: 'PharmaCare Plus',
      discount: '10%',
      validUntil: '2024-12-31',
      description: 'Discount on prescription medications',
      logoUrl: 'https://placekitten.com/102/102',
    },
  ],
  achievements: [
    {
      id: '1',
      title: 'First Donation',
      description: 'Made your first donation',
      icon: '🎉',
      earned: true,
      date: '2023-10-15',
      tokenReward: 50
    },
    {
      id: '2',
      title: 'Regular Donor',
      description: 'Donated for 3 consecutive months',
      icon: '⭐',
      earned: true,
      date: '2024-01-22',
      tokenReward: 100
    },
    {
      id: '3',
      title: 'Life Saver',
      description: 'Contributed to 10 successful campaigns',
      icon: '❤️',
      earned: false,
      tokenReward: 250
    },
    {
      id: '4',
      title: 'Governance Participant',
      description: 'Voted on 5 platform proposals',
      icon: '🏛️',
      earned: false,
      tokenReward: 150
    },
    {
      id: '5',
      title: 'Community Champion',
      description: 'Referred 3 friends who made donations',
      icon: '🌟',
      earned: true,
      date: '2024-02-05',
      tokenReward: 200
    },
    {
      id: '6',
      title: 'Medical Hero',
      description: 'Total donations exceeding 20,000 ADA',
      icon: '🦸',
      earned: true,
      date: '2024-03-10',
      tokenReward: 500
    },
  ],
  history: [
    { id: '1', event: 'Donation to Cancer Treatment Fund', change: '+150', date: '2024-04-15' },
    { id: '2', event: 'Referral Bonus', change: '+50', date: '2024-04-02' },
    { id: '3', event: 'Redeemed for Hospital Discount', change: '-200', date: '2024-03-20' },
    { id: '4', event: 'Achievement: Regular Donor', change: '+100', date: '2024-01-22' },
    { id: '5', event: 'Governance Participation', change: '+25', date: '2024-01-10' },
  ]
};

export default function RewardsPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Calculate progress to next level
  const currentProgress = (userRewards.totalDonated / userRewards.nextLevel.threshold) * 100;

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <div className={cn(
      "min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900 pb-16",
      "transition-opacity duration-500",
      !isLoaded ? "opacity-0" : "opacity-100"
    )}>
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 dark:from-blue-900/30 dark:via-purple-900/30 dark:to-pink-900/30 animate-gradient-x"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 text-transparent bg-clip-text">
              Your Rewards & Benefits
            </h1>
            <p className="mt-4 text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Track your MedTokens, unlock healthcare discounts, and earn achievements
        </p>
      </div>

          {/* Token Level Card */}
          <div className="mt-12 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl blur opacity-10 dark:opacity-20"></div>
            <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700">
              <div className="p-6 sm:p-10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {/* MedTokens Balance */}
                  <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4">
                      <FiAward className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400 mb-1">MedTokens Balance</h3>
                    <div className="relative">
                      <span className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 text-transparent bg-clip-text">
                        {userRewards.medTokens}
                      </span>
                    </div>
        </div>

                  {/* Total Donated */}
                  <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-4">
                      <FiHeart className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400 mb-1">Total Donated</h3>
                    <span className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 text-transparent bg-clip-text">
                      {userRewards.totalDonated} ADA
                    </span>
        </div>

                  {/* Donor Level */}
                  <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 rounded-full bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center mb-4">
                      <FiStar className="w-8 h-8 text-pink-600 dark:text-pink-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400 mb-1">Donor Level</h3>
                    <span className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-red-600 dark:from-pink-400 dark:to-red-400 text-transparent bg-clip-text">
                      {userRewards.level}
                    </span>
                  </div>
                </div>

                {/* Progress to Next Level */}
                <div className="mt-10 px-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                      Progress to {userRewards.nextLevel.name}
                    </span>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                      {userRewards.totalDonated} / {userRewards.nextLevel.threshold} ADA
                    </span>
                  </div>
                  <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      style={{ width: `${Math.min(currentProgress, 100)}%` }}
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                    />
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {userRewards.nextLevel.benefits.map((benefit, index) => (
                      <span 
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-800/50"
                      >
                        <FiCheck className="mr-1 w-3 h-3" /> {benefit}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
      {/* Navigation Tabs */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex rounded-lg bg-gray-100 dark:bg-gray-800 p-1">
        <button
          onClick={() => setActiveTab('overview')}
              className={`flex items-center px-4 py-2 rounded-md ${
            activeTab === 'overview'
                  ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-800'
          }`}
        >
              <FiActivity className="mr-2 h-4 w-4" />
          Overview
        </button>
        <button
          onClick={() => setActiveTab('discounts')}
              className={`flex items-center px-4 py-2 rounded-md ${
            activeTab === 'discounts'
                  ? 'bg-white dark:bg-gray-700 text-purple-600 dark:text-purple-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-800'
          }`}
        >
              <FiGift className="mr-2 h-4 w-4" />
              Discounts
        </button>
        <button
          onClick={() => setActiveTab('achievements')}
              className={`flex items-center px-4 py-2 rounded-md ${
            activeTab === 'achievements'
                  ? 'bg-white dark:bg-gray-700 text-pink-600 dark:text-pink-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-800'
          }`}
        >
              <FiAward className="mr-2 h-4 w-4" />
          Achievements
        </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center px-4 py-2 rounded-md ${
                activeTab === 'history'
                  ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-800'
              }`}
            >
              <FiClock className="mr-2 h-4 w-4" />
              History
            </button>
          </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="mb-4 border-b border-gray-100 dark:border-gray-700 pb-4">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">How to Earn More MedTokens</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Follow these steps to increase your rewards</p>
              </div>
              <div className="space-y-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                    <span className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-lg font-medium">
                  1
                </span>
              </div>
              <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Make Donations</h3>
                    <p className="text-gray-600 dark:text-gray-400">Earn 1 MedToken for every 10 ADA donated to campaigns</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0">
                    <span className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-lg font-medium">
                  2
                </span>
              </div>
              <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Refer Friends</h3>
                    <p className="text-gray-600 dark:text-gray-400">Get 50 MedTokens for each successful referral who makes a donation</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0">
                    <span className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 text-lg font-medium">
                  3
                </span>
              </div>
              <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Participate in Governance</h3>
                    <p className="text-gray-600 dark:text-gray-400">Earn tokens by voting on platform proposals and helping shape MedFund</p>
                  </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'discounts' && (
        <div className="space-y-6">
          {userRewards.discounts.map((discount) => (
              <div key={discount.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 flex items-center">
                <div className="flex-shrink-0 mr-6">
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-200 dark:border-gray-700">
                    <img 
                      src={discount.logoUrl} 
                      alt={discount.provider} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                <div className="flex-grow">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{discount.provider}</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-2">{discount.description}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Valid until {new Date(discount.validUntil).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex-shrink-0 ml-4">
                  <div className="px-6 py-3 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-500 dark:to-purple-500">
                    <span className="text-2xl font-bold text-white">{discount.discount}</span>
                  </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'achievements' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {userRewards.achievements.map((achievement) => (
            <div
              key={achievement.id}
                className={`bg-white dark:bg-gray-800 rounded-lg shadow p-6 ${
                  !achievement.earned ? 'opacity-60' : ''
              }`}
            >
                <div className="mb-4 flex justify-between items-start">
                  <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-2xl">
                    {achievement.icon}
                  </div>
                  {achievement.earned ? (
                    <div className="flex items-center text-green-600 dark:text-green-400 text-sm font-medium">
                      <FiCheck className="mr-1" />
                      Earned
                    </div>
                  ) : (
                    <div className="flex items-center text-gray-400 dark:text-gray-500 text-sm font-medium">
                      <FiClock className="mr-1" />
                      Locked
                    </div>
                  )}
                </div>
                
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{achievement.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">{achievement.description}</p>
                
                <div className="flex justify-between items-center border-t border-gray-100 dark:border-gray-700 pt-4 mt-auto">
                  <div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">Reward</span>
                    <p className="font-semibold text-blue-600 dark:text-blue-400">{achievement.tokenReward} MedTokens</p>
                  </div>
                  {achievement.earned && achievement.date && (
                    <div className="text-right">
                      <span className="text-xs text-gray-500 dark:text-gray-400">Earned on</span>
                      <p className="text-sm">{new Date(achievement.date).toLocaleDateString()}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        
        {activeTab === 'history' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="mb-4 border-b border-gray-100 dark:border-gray-700 pb-4">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">MedToken Transaction History</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Track your token earnings and usage</p>
            </div>
            <div className="space-y-4">
              {userRewards.history.map((item) => (
                <div 
                  key={item.id}
                  className="flex justify-between items-center p-4 rounded-lg bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800"
                >
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{item.event}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{new Date(item.date).toLocaleDateString()}</p>
                  </div>
                  <div className={`font-semibold text-lg ${
                    item.change.startsWith('+') 
                      ? "text-green-600 dark:text-green-400" 
                      : "text-red-600 dark:text-red-400"
                  }`}>
                    {item.change} MedTokens
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Refer Friends Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        <div className="relative overflow-hidden rounded-2xl">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/80 to-purple-600/80"></div>
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='30' height='30' viewBox='0 0 30 30' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1.22676 0C1.91374 0 2.45351 0.539773 2.45351 1.22676C2.45351 1.91374 1.91374 2.45351 1.22676 2.45351C0.539773 2.45351 0 1.91374 0 1.22676C0 0.539773 0.539773 0 1.22676 0Z' fill='rgba(255,255,255,0.5)'/%3E%3C/svg%3E\")", backgroundSize: "30px 30px" }}></div>
          
          <div className="relative px-6 py-12 sm:px-12 sm:py-16 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">Refer Friends, Earn Rewards Together</h2>
            <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
              Share MedFund with friends and family. For each person who joins and makes a donation, you'll both receive 50 MedTokens.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
              <input 
                type="text" 
                value="https://medfund.io/ref/user123" 
                readOnly 
                className="px-4 py-3 rounded-lg flex-grow border border-white/20 bg-white/10 text-white placeholder-white/60 backdrop-blur-sm"
              />
              <button className="px-4 py-2 rounded-lg bg-white text-blue-600 hover:bg-white/90 font-medium flex items-center justify-center">
                <FiUsers className="mr-2 h-4 w-4" />
                Copy Link
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 