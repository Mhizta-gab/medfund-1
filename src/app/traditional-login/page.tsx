'use client';

import Link from 'next/link';

const TraditionalLoginPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 sm:p-10 rounded-xl shadow-2xl">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Traditional Login
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            This page is a placeholder for traditional email/password login.
          </p>
        </div>
        <div className="mt-6">
          {/* Add your traditional login form here */}
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            Login form will be implemented here.
          </p>
        </div>
        <div className="mt-6 text-center">
          <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
            &larr; Back to Wallet Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TraditionalLoginPage; 