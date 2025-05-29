"use client"

import { useState, useEffect } from 'react';
import CreateCampaignForm from '@/components/CreateCampaignForm';
import ProtectedRoute from '@/components/blockchain/ProtectedRoute';
import { motion } from 'framer-motion';
import { FiUser, FiDollarSign, FiTarget, FiCheckCircle } from 'react-icons/fi';
import { cn } from "@/utils";

export default function CreateCampaignPage() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <ProtectedRoute redirectTo="/login">
      <div className="min-h-screen bg-[#f8fafc] dark:bg-[#0f172a]">
        {/* Decorative background elements - reduced opacity for better text contrast */}
        <div className="absolute top-0 left-0 w-full h-[30vh] bg-gradient-to-br from-emerald-500 to-cyan-500 transform -skew-y-3 origin-top-left z-0 opacity-5 dark:opacity-10"></div>
        <div className="absolute top-64 right-0 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-5 animate-blob"></div>
        <div className="absolute top-96 left-20 w-72 h-72 bg-yellow-500 rounded-full mix-blend-multiply filter blur-3xl opacity-5 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-32 right-32 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-5 animate-blob animation-delay-4000"></div>
        
        {/* Main content */}
        <div className="relative z-10 pt-20 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h1 className="text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-6xl">
              Create Your <span className="text-emerald-600 dark:text-emerald-400">Medical Campaign</span>
            </h1>
            <p className="mt-4 text-xl text-gray-700 dark:text-gray-200 max-w-3xl mx-auto">
              Every campaign brings hope to someone in need. Let's get yours set up in minutes.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left column - Info and steps */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="lg:col-span-4 space-y-8"
            >
              {/* Campaign info card */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700">
                <div className="bg-gradient-to-r from-emerald-600 to-cyan-600 h-2"></div>
                <div className="p-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Your Campaign Journey</h2>
                  <p className="text-gray-700 dark:text-gray-200 mb-5">
                    Our platform has helped raise over $10M for medical causes. Join our community of changemakers today.
                  </p>
                  
                  <div className="grid grid-cols-2 gap-4 mt-6">
                    <div className="bg-emerald-50 dark:bg-emerald-900/30 rounded-lg p-4 text-center">
                      <p className="text-emerald-700 dark:text-emerald-300 font-bold text-2xl">98%</p>
                      <p className="text-gray-700 dark:text-gray-300 text-sm font-medium">Verification Rate</p>
                    </div>
                    <div className="bg-cyan-50 dark:bg-cyan-900/30 rounded-lg p-4 text-center">
                      <p className="text-cyan-700 dark:text-cyan-300 font-bold text-2xl">3 Days</p>
                      <p className="text-gray-700 dark:text-gray-300 text-sm font-medium">Avg. Approval Time</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Steps */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700">
                <div className="p-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">How It Works</h2>
                  
                  <div className="space-y-8">
                    {[
                      {
                        icon: <FiUser className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />,
                        title: "Tell Your Story",
                        description: "Share your medical journey and why you need support"
                      },
                      {
                        icon: <FiDollarSign className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />,
                        title: "Set Your Goal",
                        description: "Define the amount needed for your treatment"
                      },
                      {
                        icon: <FiTarget className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />,
                        title: "Get Verified",
                        description: "Our team reviews your campaign within 3 days"
                      },
                      {
                        icon: <FiCheckCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />,
                        title: "Receive Support",
                        description: "Funds go directly to your healthcare provider"
                      }
                    ].map((step, index) => (
                      <div key={index} className="flex">
                        <div className="flex-shrink-0">
                          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-800/50">
                            {step.icon}
                          </div>
                        </div>
                        <div className="ml-4">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{step.title}</h3>
                          <p className="mt-1 text-sm text-gray-700 dark:text-gray-200">{step.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Testimonial */}
              <div className="bg-gradient-to-br from-emerald-600 to-cyan-600 rounded-2xl shadow-xl overflow-hidden text-white p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center">
                    <span className="text-emerald-600 text-xl font-bold">JD</span>
                  </div>
                  <div className="ml-4">
                    <h3 className="font-semibold text-white">John D.</h3>
                    <p className="text-white text-sm">Cancer Treatment Campaign</p>
                  </div>
                </div>
                <p className="italic text-white font-medium">
                  "MedFund made it possible for me to afford my treatment. The platform was easy to use and the team was incredibly supportive throughout the process."
                </p>
              </div>
            </motion.div>
            
            {/* Right column - Form */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="lg:col-span-8"
            >
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700">
                <div className="bg-gradient-to-r from-emerald-600 to-cyan-600 h-2"></div>
                <div className="p-8">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Campaign Details</h2>
                  <div className="bg-emerald-50 dark:bg-emerald-800/30 rounded-lg p-4 mb-8 flex items-start">
                    <svg className="w-6 h-6 text-emerald-600 dark:text-emerald-400 mr-3 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                      All campaigns are reviewed by our medical team. Please provide accurate information to speed up the verification process.
                    </p>
                  </div>
                  
                  {/* Wrapper for the form with explicit text styling */}
                  <div className="form-wrapper [&_label]:text-gray-700 [&_label]:dark:text-gray-200 [&_label]:font-medium 
                                 [&_input]:text-gray-800 [&_input]:dark:text-white [&_input]:font-medium
                                 [&_textarea]:text-gray-800 [&_textarea]:dark:text-white [&_textarea]:font-medium
                                 [&_select]:text-gray-800 [&_select]:dark:text-white [&_select]:font-medium
                                 [&_p]:text-gray-700 [&_p]:dark:text-gray-200">
                    <CreateCampaignForm />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
          
          {/* Trust badges */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-16 text-center"
          >
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-4">Trusted By Leading Healthcare Providers</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center justify-center grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all duration-300">
                  <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                  <div className="ml-3">
                    <div className="h-3 w-24 bg-gray-300 dark:bg-gray-600 rounded"></div>
                    <div className="h-2 w-16 bg-gray-300 dark:bg-gray-600 rounded mt-2"></div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </ProtectedRoute>
  );
} 