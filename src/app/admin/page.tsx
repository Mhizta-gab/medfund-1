'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import VerificationPanel from '@/components/admin/VerificationPanel';
import { useAuth } from '@/context/AuthContext';

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState('verification');
  const { logout, user } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="mt-2 text-sm text-gray-600">
              Welcome, {user?.email}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Logout
          </button>
        </div>

        {/* Admin Navigation */}
        <div className="mb-8">
          <nav className="flex space-x-4" aria-label="Admin Tabs">
            <button
              onClick={() => setActiveTab('verification')}
              className={`px-3 py-2 text-sm font-medium rounded-md ${
                activeTab === 'verification'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Campaign Verification
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`px-3 py-2 text-sm font-medium rounded-md ${
                activeTab === 'users'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              User Management
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-3 py-2 text-sm font-medium rounded-md ${
                activeTab === 'settings'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Platform Settings
            </button>
          </nav>
        </div>

        {/* Content Area */}
        <div className="bg-white rounded-lg shadow">
          {activeTab === 'verification' && <VerificationPanel />}
          {activeTab === 'users' && (
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">User Management</h2>
              <p className="text-gray-600">User management features coming soon...</p>
            </div>
          )}
          {activeTab === 'settings' && (
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Platform Settings</h2>
              <p className="text-gray-600">Platform settings features coming soon...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPage; 