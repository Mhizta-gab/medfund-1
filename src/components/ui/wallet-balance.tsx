"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Coins, AlertCircle } from 'lucide-react';

interface WalletBalanceProps {
  balance: string | null;
  isLoading?: boolean;
  variant?: 'default' | 'compact' | 'card';
  showAnimation?: boolean;
}

export function WalletBalance({
  balance,
  isLoading = false,
  variant = 'default',
  showAnimation = true,
}: WalletBalanceProps) {
  // Format balance to 2 decimal places
  const formattedBalance = balance 
    ? parseFloat(balance).toLocaleString('en-US', { 
        minimumFractionDigits: 2, 
        maximumFractionDigits: 2 
      })
    : '0.00';
    
  // Determine if balance is low (below 5 ADA)
  const isBalanceLow = balance ? parseFloat(balance) < 5 : false;
  
  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-1 text-sm font-medium rounded-lg px-2 py-1 bg-blue-50 dark:bg-blue-900/20">
        <Coins size={14} className="text-blue-500" />
        <span>{formattedBalance}</span>
        <span className="text-xs">ADA</span>
      </div>
    );
  }
  
  if (variant === 'card') {
    return (
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/40 dark:to-indigo-900/40 border border-blue-100 dark:border-blue-800 rounded-xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <Heart className="h-4 w-4 text-blue-500" />
            <span className="text-sm font-medium text-blue-600 dark:text-blue-400">Available Balance</span>
          </div>
          {isBalanceLow && (
            <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400 text-xs">
              <AlertCircle className="h-3 w-3" />
              <span>Low</span>
            </div>
          )}
        </div>
        <div className="font-bold text-2xl text-blue-700 dark:text-blue-300">
          {formattedBalance} <span className="text-sm">ADA</span>
        </div>
      </div>
    );
  }
  
  return (
    <div className="relative">
      {showAnimation && (
        <motion.div
          className="absolute inset-0 rounded-lg -z-10 bg-gradient-to-r from-blue-500/10 to-indigo-500/10"
          animate={{
            scale: [1, 1.02, 1],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            repeatType: "reverse",
          }}
        />
      )}
      
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-lg px-3 py-2 dark:from-blue-900/20 dark:to-indigo-900/20 dark:border-blue-800">
        <div className="flex items-center gap-2">
          {isLoading ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ 
                duration: 1.5, 
                repeat: Infinity, 
                ease: "linear" 
              }}
              className="h-4 w-4"
            >
              <Coins className="h-4 w-4 text-blue-400" />
            </motion.div>
          ) : (
            <Heart className="h-4 w-4 text-blue-500" />
          )}
          <div className="font-medium text-lg text-blue-700 dark:text-blue-300">
            {isLoading ? (
              <motion.div 
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="h-6 w-16 bg-blue-200 dark:bg-blue-700/30 rounded"
              />
            ) : (
              <>
                {formattedBalance} <span className="text-xs text-blue-600 dark:text-blue-400">ADA</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 