'use client';

import { SignIn } from '@clerk/nextjs';
import { useCardanoWallet } from '@/blockchain/context/WalletContext';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const WalletConnect = dynamic(() => import('@/components/blockchain/WalletConnect'), { 
  ssr: false,
  loading: () => <p className="text-center text-gray-500 dark:text-gray-400">Loading wallet options...</p>
});

export default function LoginPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto grid gap-8 md:grid-cols-2">
        <Card className="md:col-span-1 h-fit">
          <CardHeader>
            <CardTitle>Sign in to MedFund</CardTitle>
            <CardDescription>
              Use your email, social accounts, or wallet to sign in
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="clerk" className="w-full">
              <TabsList className="grid grid-cols-2 mb-6">
                <TabsTrigger value="clerk">Email/Social</TabsTrigger>
                <TabsTrigger value="wallet">Wallet</TabsTrigger>
              </TabsList>
              
              <TabsContent value="clerk" className="mt-2">
                <div className="mx-auto w-full max-w-md">
                  <SignIn 
                    appearance={{
                      elements: {
                        formButtonPrimary: 'bg-blue-600 hover:bg-blue-700 text-white',
                        footerActionLink: 'text-blue-600 hover:text-blue-700',
                      }
                    }}
                    redirectUrl="/profile"
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="wallet" className="mt-2">
                <div className="space-y-6">
                  <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg text-sm text-blue-800 dark:text-blue-200">
                    Connect your Cardano wallet to access your account. Your wallet serves as your identity on the blockchain.
                  </div>
                  
                  <WalletConnect />
                  
                  <div className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
                    <p>No wallet? Install one of these Cardano wallets:</p>
                    <div className="flex justify-center space-x-4 mt-2">
                      <a href="https://namiwallet.io/" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Nami</a>
                      <a href="https://yoroi-wallet.com/" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Yoroi</a>
                      <a href="https://eternl.io/" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Eternl</a>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        
        <div className="hidden md:flex md:flex-col justify-center space-y-6">
          <h2 className="text-3xl font-bold tracking-tight">Welcome to MedFund</h2>
          <p className="text-gray-600 dark:text-gray-300">
            Join our community dedicated to supporting medical campaigns through transparent blockchain funding. We leverage Cardano technology to ensure secure, transparent transactions.
          </p>
          <ul className="space-y-3">
            <li className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
              <span>Secure blockchain authentication</span>
            </li>
            <li className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
              <span>Transparent funding distributions</span>
            </li>
            <li className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
              <span>Verified medical campaigns</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
} 