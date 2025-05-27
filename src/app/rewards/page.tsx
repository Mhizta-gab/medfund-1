"use client"

import { useState } from 'react';

// Mock data for user rewards
const userRewards = {
  medTokens: 1500,
  totalDonated: 25000,
  level: 'Gold Donor',
  discounts: [
    {
      id: '1',
      provider: 'Central Hospital',
      discount: '15%',
      validUntil: '2024-12-31',
      description: 'Discount on all medical services',
    },
    {
      id: '2',
      provider: 'MedLab Diagnostics',
      discount: '20%',
      validUntil: '2024-12-31',
      description: 'Discount on laboratory tests',
    },
  ],
  achievements: [
    {
      id: '1',
      title: 'First Donation',
      description: 'Made your first donation',
      icon: '🎉',
      earned: true,
    },
    {
      id: '2',
      title: 'Regular Donor',
      description: 'Donated for 3 consecutive months',
      icon: '⭐',
      earned: true,
    },
    {
      id: '3',
      title: 'Life Saver',
      description: 'Contributed to 10 successful campaigns',
      icon: '❤️',
      earned: false,
    },
  ],
};

export default function RewardsPage() {
  const [activeTab, setActiveTab] = useState('overview'); // overview, discounts, achievements

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Your Rewards</h1>
        <p className="text-gray-600">
          Track your MedTokens, donor level, and exclusive healthcare discounts.
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">MedTokens Balance</h3>
          <p className="text-3xl font-bold text-blue-600">{userRewards.medTokens}</p>
          <p className="text-sm text-gray-500 mt-1">Available to use</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Total Donated</h3>
          <p className="text-3xl font-bold text-blue-600">{userRewards.totalDonated} ADA</p>
          <p className="text-sm text-gray-500 mt-1">Lifetime contributions</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Donor Level</h3>
          <p className="text-3xl font-bold text-blue-600">{userRewards.level}</p>
          <p className="text-sm text-gray-500 mt-1">Current status</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-4 mb-8 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-4 px-4 ${
            activeTab === 'overview'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('discounts')}
          className={`pb-4 px-4 ${
            activeTab === 'discounts'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Healthcare Discounts
        </button>
        <button
          onClick={() => setActiveTab('achievements')}
          className={`pb-4 px-4 ${
            activeTab === 'achievements'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Achievements
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">How to Earn More MedTokens</h2>
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-blue-100 text-blue-600">
                  1
                </span>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Make Donations</h3>
                <p className="text-gray-600">Earn 1 MedToken for every 10 ADA donated</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-blue-100 text-blue-600">
                  2
                </span>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Refer Friends</h3>
                <p className="text-gray-600">Get 50 MedTokens for each successful referral</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-blue-100 text-blue-600">
                  3
                </span>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Participate in Governance</h3>
                <p className="text-gray-600">Earn tokens by voting on platform proposals</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'discounts' && (
        <div className="space-y-6">
          {userRewards.discounts.map((discount) => (
            <div key={discount.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{discount.provider}</h3>
                  <p className="text-gray-600">{discount.description}</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Valid until {new Date(discount.validUntil).toLocaleDateString()}
                  </p>
                </div>
                <span className="text-2xl font-bold text-blue-600">{discount.discount}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'achievements' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {userRewards.achievements.map((achievement) => (
            <div
              key={achievement.id}
              className={`bg-white rounded-lg shadow p-6 ${
                !achievement.earned && 'opacity-50'
              }`}
            >
              <div className="flex items-center mb-4">
                <span className="text-3xl mr-3">{achievement.icon}</span>
                <h3 className="text-lg font-medium text-gray-900">{achievement.title}</h3>
              </div>
              <p className="text-gray-600">{achievement.description}</p>
              <p className="text-sm text-gray-500 mt-2">
                {achievement.earned ? 'Earned' : 'Not earned yet'}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 