"use client"

import CreateCampaignForm from '@/components/CreateCampaignForm';
import ProtectedRoute from '@/components/blockchain/ProtectedRoute';

export default function CreateCampaignPage() {
  return (
    <ProtectedRoute redirectTo="/login">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Create a Campaign</h1>
          <p className="text-gray-600">
            Start your medical fundraising campaign. Please provide accurate information to ensure your campaign can be verified.
          </p>
        </div>
        
        <CreateCampaignForm />
      </div>
    </ProtectedRoute>
  );
} 