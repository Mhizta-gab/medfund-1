"use client"

import Image from 'next/image';
import { useState } from 'react';

interface CampaignDetails {
  id: string;
  title: string;
  description: string;
  goalAmount: number;
  raisedAmount: number;
  imageUrl: string;
  daysLeft: number;
  verified: boolean;
  patientInfo: {
    name: string;
    age: number;
    condition: string;
    hospital: string;
  };
  updates: Array<{
    date: string;
    content: string;
  }>;
  donors: Array<{
    address: string;
    amount: number;
    timestamp: string;
  }>;
}

// Mock campaigns array
const campaigns: CampaignDetails[] = [
  {
    id: '1',
    title: 'Emergency Heart Surgery',
    description: 'Help John receive life-saving heart surgery at Central Hospital. Your contribution can make a difference in saving a life. The surgery is scheduled for next month, and we need to raise the funds as soon as possible.',
    goalAmount: 50000,
    raisedAmount: 35000,
    imageUrl: '/images/campaign1.jpeg',
    daysLeft: 15,
    verified: true,
    patientInfo: {
      name: 'John Doe',
      age: 45,
      condition: 'Coronary Artery Disease',
      hospital: 'Central Hospital',
    },
    updates: [
      {
        date: '2024-04-01',
        content: 'Medical evaluation completed. Surgery scheduled for next month.',
      },
      {
        date: '2024-03-28',
        content: 'Initial consultation with cardiac surgeon completed.',
      },
    ],
    donors: [
      {
        address: 'addr1q8f4z...',
        amount: 1000,
        timestamp: '2024-04-01T10:30:00Z',
      },
      {
        address: 'addr1v9m2h...',
        amount: 500,
        timestamp: '2024-03-31T15:45:00Z',
      },
    ],
  },
  // Add more campaigns as needed
];

export default function CampaignPage({ params }: { params: { id: string } }) {
  const [donationAmount, setDonationAmount] = useState<string>('');

  // Find the campaign by id
  const campaignData = campaigns.find(c => c.id === params.id);

  if (!campaignData) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Campaign Not Found</h1>
        <p className="text-gray-600">The campaign you are looking for does not exist.</p>
      </div>
    );
  }

  const handleDonate = async () => {
    // TODO: Implement Cardano wallet integration and transaction
    console.log('Donating:', donationAmount, 'ADA');
  };

  const progress = (campaignData.raisedAmount / campaignData.goalAmount) * 100;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="relative h-96 w-full">
              <Image
                src={campaignData.imageUrl}
                alt={campaignData.title}
                fill
                className="object-cover"
              />
              {campaignData.verified && (
                <div className="absolute top-4 right-4 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                  Verified Campaign
                </div>
              )}
            </div>
            <div className="p-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{campaignData.title}</h1>
              <p className="text-gray-600 mb-6">{campaignData.description}</p>

              <div className="border-t border-gray-200 pt-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Patient Information</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p className="font-medium">{campaignData.patientInfo.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Age</p>
                    <p className="font-medium">{campaignData.patientInfo.age} years</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Medical Condition</p>
                    <p className="font-medium">{campaignData.patientInfo.condition}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Hospital</p>
                    <p className="font-medium">{campaignData.patientInfo.hospital}</p>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6 mt-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Campaign Updates</h2>
                <div className="space-y-4">
                  {campaignData.updates.map((update, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-500 mb-1">{update.date}</p>
                      <p className="text-gray-700">{update.content}</p>
                    </div>
                  ))}
                </div>
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
                <span className="font-medium">{campaignData.raisedAmount} ADA</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div
                  className="bg-blue-600 rounded-full h-2"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Goal</span>
                <span className="font-medium">{campaignData.goalAmount} ADA</span>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-center text-sm text-gray-500 mb-4">
                {campaignData.daysLeft} days left to donate
              </p>
              <input
                type="number"
                value={donationAmount}
                onChange={(e) => setDonationAmount(e.target.value)}
                placeholder="Enter amount in ADA"
                className="w-full px-4 py-2 border border-gray-300 rounded-md mb-4"
              />
              <button
                onClick={handleDonate}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-md font-medium hover:bg-blue-700"
              >
                Donate Now
              </button>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Donors</h3>
              <div className="space-y-4">
                {campaignData.donors.map((donor, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">
                          {donor.address.slice(0, 8)}...
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(donor.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm font-medium text-gray-900">{donor.amount} ADA</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}