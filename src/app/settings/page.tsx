'use client';

import { useState } from 'react';
import { AuthProvider, useAuth } from '@/context/AuthContext';

const SettingsContent = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('account');
  const [notifications, setNotifications] = useState({
    email: true,
    campaignUpdates: true,
    donationAlerts: true,
    verificationStatus: true,
  });
  const [privacy, setPrivacy] = useState({
    showEmail: false,
    showDonations: true,
    showCampaigns: true,
  });

  const handleNotificationChange = (key: string) => {
    setNotifications((prev) => ({
      ...prev,
      [key]: !prev[key as keyof typeof notifications],
    }));
  };

  const handlePrivacyChange = (key: string) => {
    setPrivacy((prev) => ({
      ...prev,
      [key]: !prev[key as keyof typeof privacy],
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-8">Settings</h1>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('account')}
                className={`${
                  activeTab === 'account'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Account
              </button>
              <button
                onClick={() => setActiveTab('notifications')}
                className={`${
                  activeTab === 'notifications'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Notifications
              </button>
              <button
                onClick={() => setActiveTab('privacy')}
                className={`${
                  activeTab === 'privacy'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Privacy
              </button>
              <button
                onClick={() => setActiveTab('security')}
                className={`${
                  activeTab === 'security'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Security
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="mt-8">
            {activeTab === 'account' && (
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-6">
                  Account Settings
                </h2>
                <div className="space-y-6">
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Email
                    </label>
                    <div className="mt-1 flex rounded-md shadow-sm">
                      <input
                        type="email"
                        name="email"
                        id="email"
                        value={user?.email}
                        disabled
                        className="flex-1 min-w-0 block w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-gray-50"
                      />
                    </div>
                  </div>
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Display Name
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="name"
                        id="name"
                        defaultValue={user?.email?.split('@')[0]}
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                  <div>
                    <button
                      type="button"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-6">
                  Notification Preferences
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">
                        Email Notifications
                      </h3>
                      <p className="text-sm text-gray-500">
                        Receive notifications via email
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleNotificationChange('email')}
                      className={`${
                        notifications.email
                          ? 'bg-blue-600'
                          : 'bg-gray-200'
                      } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                    >
                      <span
                        className={`${
                          notifications.email
                            ? 'translate-x-5'
                            : 'translate-x-0'
                        } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                      />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">
                        Campaign Updates
                      </h3>
                      <p className="text-sm text-gray-500">
                        Get notified about your campaign progress
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleNotificationChange('campaignUpdates')}
                      className={`${
                        notifications.campaignUpdates
                          ? 'bg-blue-600'
                          : 'bg-gray-200'
                      } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                    >
                      <span
                        className={`${
                          notifications.campaignUpdates
                            ? 'translate-x-5'
                            : 'translate-x-0'
                        } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                      />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">
                        Donation Alerts
                      </h3>
                      <p className="text-sm text-gray-500">
                        Receive notifications for new donations
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleNotificationChange('donationAlerts')}
                      className={`${
                        notifications.donationAlerts
                          ? 'bg-blue-600'
                          : 'bg-gray-200'
                      } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                    >
                      <span
                        className={`${
                          notifications.donationAlerts
                            ? 'translate-x-5'
                            : 'translate-x-0'
                        } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'privacy' && (
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-6">
                  Privacy Settings
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">
                        Show Email
                      </h3>
                      <p className="text-sm text-gray-500">
                        Display your email on your public profile
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handlePrivacyChange('showEmail')}
                      className={`${
                        privacy.showEmail
                          ? 'bg-blue-600'
                          : 'bg-gray-200'
                      } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                    >
                      <span
                        className={`${
                          privacy.showEmail
                            ? 'translate-x-5'
                            : 'translate-x-0'
                        } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                      />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">
                        Show Donations
                      </h3>
                      <p className="text-sm text-gray-500">
                        Display your donation history publicly
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handlePrivacyChange('showDonations')}
                      className={`${
                        privacy.showDonations
                          ? 'bg-blue-600'
                          : 'bg-gray-200'
                      } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                    >
                      <span
                        className={`${
                          privacy.showDonations
                            ? 'translate-x-5'
                            : 'translate-x-0'
                        } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-6">
                  Security Settings
                </h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">
                      Change Password
                    </h3>
                    <div className="mt-4 space-y-4">
                      <div>
                        <label
                          htmlFor="current-password"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Current Password
                        </label>
                        <input
                          type="password"
                          name="current-password"
                          id="current-password"
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="new-password"
                          className="block text-sm font-medium text-gray-700"
                        >
                          New Password
                        </label>
                        <input
                          type="password"
                          name="new-password"
                          id="new-password"
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="confirm-password"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          name="confirm-password"
                          id="confirm-password"
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    <button
                      type="button"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Update Password
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const SettingsPage = () => {
  return (
    <AuthProvider>
      <SettingsContent />
    </AuthProvider>
  );
};

export default SettingsPage; 