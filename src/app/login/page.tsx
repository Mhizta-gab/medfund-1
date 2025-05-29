'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
// import { useAuth } from '@/context/AuthContext'; // Commented out traditional auth
import Link from 'next/link';
import { useCardanoWallet } from '@/blockchain/context/WalletContext';
// import WalletConnect from '@/components/blockchain/WalletConnect'; // Re-using WalletConnect for consistency
import dynamic from 'next/dynamic';

const WalletConnect = dynamic(() => import('@/components/blockchain/WalletConnect'), { 
  ssr: false,
  loading: () => <p className="text-center text-gray-500 dark:text-gray-400">Loading wallet options...</p>
});

const LoginPage = () => {
  const router = useRouter();
  // const { login, isAuthenticated } = useAuth(); // Commented out traditional auth
  const { 
    connected: isWalletConnected, 
    connectingMesh: isWalletConnecting, 
    walletAddress, 
    error: walletError,
    walletName
  } = useCardanoWallet();

  const [redirecting, setRedirecting] = useState(false);
  const [loginAttempted, setLoginAttempted] = useState(false);

  // Check localStorage on mount to see if we've already attempted login before
  useEffect(() => {
    const hasAttemptedLogin = localStorage.getItem('walletLoginAttempted') === 'true';
    setLoginAttempted(hasAttemptedLogin);
  }, []);
  
  // Handle wallet connection status changes
  useEffect(() => {
    // Only redirect if wallet is connected and we have an address
    if (isWalletConnected && walletAddress) {
      // Mark that a login attempt was successful
      localStorage.setItem('walletLoginAttempted', 'true');
      setLoginAttempted(true);
      setRedirecting(true);
      
      // Redirect to profile or a default dashboard page after wallet connection
      const timer = setTimeout(() => {
        router.push('/profile');
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [isWalletConnected, walletAddress, router]);

  // const handleSubmit = async (e: React.FormEvent) => { // Commented out traditional auth submit
  //   e.preventDefault();
  //   setError('');
  //   setIsLoading(true);
  //   try {
  //     const user = await login(credentials.email, credentials.password);
  //     setTimeout(() => {
  //       if (user.role === 'admin') {
  //         router.push('/admin');
  //       } else {
  //         router.push('/');
  //       }
  //     }, 100);
  //   } catch (err) {
  //     setError('Invalid credentials');
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 sm:p-10 rounded-xl shadow-2xl">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            {isWalletConnected ? 'Wallet Connected' : 'Connect Your Wallet'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            {isWalletConnected 
              ? `Connected to ${walletName || 'your wallet'}`
              : 'Please connect your Cardano wallet to access MedFund.'}
          </p>
        </div>

        {redirecting ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-lg font-medium text-gray-700 dark:text-gray-300">Authentication successful!</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Redirecting to your profile...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {isWalletConnected ? (
              <div className="text-center">
                <div className="bg-green-100 text-green-800 rounded-lg p-4 mb-4">
                  <p className="font-medium">Wallet connected successfully!</p>
                  <p className="text-sm mt-1">You can now access your account.</p>
                </div>
                <button
                  onClick={() => router.push('/profile')}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Go to Profile
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-4">
                <div className="w-full">
                  <WalletConnect />
                </div>
                {walletError && (
                  <p className="mt-2 text-center text-sm text-red-600 dark:text-red-400">
                    Error: {walletError}
                  </p>
                )}
                {isWalletConnecting && (
                  <p className="mt-2 text-center text-sm text-gray-500 dark:text-gray-400">
                    Attempting to connect your wallet...
                  </p>
                )}
                <div className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
                  <p>No wallet? Install one of these Cardano wallets:</p>
                  <div className="flex justify-center space-x-4 mt-2">
                    <a href="https://namiwallet.io/" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Nami</a>
                    <a href="https://yoroi-wallet.com/" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Yoroi</a>
                    <a href="https://eternl.io/" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Eternl</a>
                  </div>
                </div>
              </div>
            )}
            
            <hr className="my-6 border-gray-300 dark:border-gray-600"/>
            
            <div className="text-center text-sm">
              <p className="text-gray-600 dark:text-gray-400">
                Need to use traditional login? {' '}
                <Link href="/traditional-login" className="font-medium text-blue-600 hover:text-blue-500">
                  Login with email
                </Link>
              </p>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Don't have an account? {' '}
                <Link href="/register" className="font-medium text-blue-600 hover:text-blue-500">
                  Register here
                </Link>
              </p>
            </div>
          </div>
        )}
        
        {/* Original form commented out 
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
              {error}
            </div>
          )}
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={credentials.email}
                onChange={(e) =>
                  setCredentials({ ...credentials, email: e.target.value })
                }
                disabled={isLoading}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={credentials.password}
                onChange={(e) =>
                  setCredentials({ ...credentials, password: e.target.value })
                }
                disabled={isLoading}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
                isLoading
                  ? 'bg-blue-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link href="/register" className="font-medium text-blue-600 hover:text-blue-500">
                Register
              </Link>
            </p>
          </div>
        </form>
        */}
      </div>
    </div>
  );
};

export default LoginPage; 