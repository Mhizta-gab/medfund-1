'use client';

import { SignUp } from '@clerk/nextjs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function RegisterPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto grid gap-8 md:grid-cols-2">
        <Card className="md:col-span-1 h-fit">
          <CardHeader>
            <CardTitle>Create your account</CardTitle>
            <CardDescription>
              Join MedFund to support and create medical campaigns
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SignUp 
              appearance={{
                elements: {
                  formButtonPrimary: 'bg-blue-600 hover:bg-blue-700 text-white',
                  footerActionLink: 'text-blue-600 hover:text-blue-700',
                }
              }}
              redirectUrl="/profile"
            />
          </CardContent>
        </Card>
        
        <div className="hidden md:flex md:flex-col justify-center space-y-6">
          <h2 className="text-3xl font-bold tracking-tight">Join the MedFund Community</h2>
          <p className="text-gray-600 dark:text-gray-300">
            When you create an account with MedFund, you're joining a community committed to revolutionizing medical fundraising through blockchain technology.
          </p>
          <ul className="space-y-3">
            <li className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
              <span>Create your own medical fundraising campaigns</span>
            </li>
            <li className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
              <span>Track your contributions transparently</span>
            </li>
            <li className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
              <span>Connect with verified healthcare professionals</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
} 