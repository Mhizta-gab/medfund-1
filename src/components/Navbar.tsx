"use client"
import Link from 'next/link';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import logo from '../../public/images/MedFund_Logo.png';
import { UserButton, SignInButton, SignUpButton, useUser } from "@clerk/nextjs";
import { useCardanoWallet } from '@/blockchain/context/WalletContext';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Button } from '@/components/ui/button';
import { WalletBalance } from '@/components/ui/wallet-balance';
import {
  Wallet,
  ChevronDown,
  Landmark,
  Heart,
  PiggyBank,
  BarChart3,
  MessageSquareHeart,
  Vote,
  Menu,
  X
} from "lucide-react";

const Navbar = () => {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isSignedIn, user } = useUser();
  const { 
    connected,
    walletName,
    walletAddress,
    walletBalance,
    connectWallet,
    disconnectWallet,
    availableWallets
  } = useCardanoWallet();

  // Format address to shortened format
  const formatAddress = (address: string | null): string => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-6)}`;
  };

  return (
    <nav className="bg-white shadow-md dark:bg-gray-900 fixed w-full z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-2xl font-bold text-blue-600">
                <Image 
                  src={logo} 
                  width={100} 
                  height={100} 
                  alt='MedFund_Logo'
                />
              </Link>
            </div>
            
            {/* Desktop Navigation Links */}
            <div className="hidden sm:ml-6 sm:flex sm:space-x-2">
              <Link
                href="/campaigns"
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-500 rounded-md dark:text-gray-200 dark:hover:text-blue-400"
              >
                <Landmark size={16} className="mr-1" />
                Campaigns
              </Link>
              
              <Link
                href="/create-campaign"
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-500 rounded-md dark:text-gray-200 dark:hover:text-blue-400"
              >
                <Heart size={16} className="mr-1" />
                Start Campaign
              </Link>
              
              <Link
                href="/governance"
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-500 rounded-md dark:text-gray-200 dark:hover:text-blue-400"
              >
                <Vote size={16} className="mr-1" />
                Governance
              </Link>
              
              <Link
                href="/rewards"
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-500 rounded-md dark:text-gray-200 dark:hover:text-blue-400"
              >
                <PiggyBank size={16} className="mr-1" />
                Rewards
              </Link>
              
              <Link
                href="/analytics"
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-500 rounded-md dark:text-gray-200 dark:hover:text-blue-400"
              >
                <BarChart3 size={16} className="mr-1" />
                Analytics
              </Link>
              
              <Link
                href="/testimonials"
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-500 rounded-md dark:text-gray-200 dark:hover:text-blue-400"
              >
                <MessageSquareHeart size={16} className="mr-1" />
                Testimonials
              </Link>
            </div>
          </div>
          
          {/* Desktop User Menu */}
          <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-3">
            {/* Wallet Connection */}
            <WalletDropdown 
              connected={connected}
              walletName={walletName}
              walletAddress={walletAddress}
              availableWallets={availableWallets}
              connectWallet={connectWallet}
              disconnectWallet={disconnectWallet}
              formatAddress={formatAddress}
              walletBalance={walletBalance}
            />
            
            {/* Auth Buttons */}
            {isSignedIn ? (
              <div className="flex items-center space-x-2">
                <Link
                  href="/profile"
                  className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md dark:text-gray-200 dark:hover:bg-gray-800"
                >
                  Profile
                </Link>
                <UserButton afterSignOutUrl="/" />
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <SignInButton mode="modal">
                  <Button variant="outline" size="sm">
                    Login
                  </Button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <Button variant="default" size="sm">
                    Register
                  </Button>
                </SignUpButton>
              </div>
            )}
          </div>
          
          {/* Mobile menu button */}
          <div className="-mr-2 flex items-center sm:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
            >
              <span className="sr-only">Open main menu</span>
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`${isMobileMenuOpen ? 'block' : 'hidden'} sm:hidden`}>
        <div className="pt-2 pb-3 space-y-1">
          <Link
            href="/campaigns"
            className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-500"
          >
            <Landmark size={16} className="inline mr-2" />
            Campaigns
          </Link>
          <Link
            href="/create-campaign"
            className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-500"
          >
            <Heart size={16} className="inline mr-2" />
            Start Campaign
          </Link>
          <Link
            href="/governance"
            className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-500"
          >
            <Vote size={16} className="inline mr-2" />
            Governance
          </Link>
          <Link
            href="/rewards"
            className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-500"
          >
            <PiggyBank size={16} className="inline mr-2" />
            Rewards
          </Link>
          <Link
            href="/analytics"
            className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-500"
          >
            <BarChart3 size={16} className="inline mr-2" />
            Analytics
          </Link>
          <Link
            href="/testimonials"
            className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-500"
          >
            <MessageSquareHeart size={16} className="inline mr-2" />
            Testimonials
          </Link>
        </div>
        
        {/* Mobile wallet balance */}
        {connected && walletBalance && (
          <div className="px-5 py-3 border-t border-gray-200">
            <WalletBalance balance={walletBalance} variant="default" />
          </div>
        )}
        
        <div className="pt-4 pb-3 border-t border-gray-200">
          <div className="flex items-center px-5 justify-between">
            <div className="flex items-center">
              <Wallet className="h-5 w-5 text-gray-500" />
              <div className="ml-2 text-sm font-medium text-gray-700">
                {connected ? formatAddress(walletAddress) : 'Not connected'}
              </div>
            </div>
            
            {connected ? (
              <Button 
                variant="destructive" 
                size="sm"
                onClick={disconnectWallet}
              >
                Disconnect
              </Button>
            ) : (
              <MobileWalletButtons 
                availableWallets={availableWallets}
                connectWallet={connectWallet}
              />
            )}
          </div>
          
          <div className="mt-3 space-y-1 px-2">
            {isSignedIn ? (
              <div className="flex items-center justify-between px-3">
                <Link
                  href="/profile"
                  className="text-base font-medium text-gray-700 hover:text-blue-600 block py-2"
                >
                  Profile
                </Link>
                <UserButton afterSignOutUrl="/" />
              </div>
            ) : (
              <div className="flex space-x-4 px-3 py-2">
                <SignInButton mode="modal">
                  <Button variant="outline" size="sm">
                    Login
                  </Button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <Button variant="default" size="sm">
                    Register
                  </Button>
                </SignUpButton>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

// Wallet dropdown component for desktop
interface WalletDropdownProps {
  connected: boolean;
  walletName: string | null;
  walletAddress: string | null;
  availableWallets: { name: string; icon: string; version: string }[];
  connectWallet: (name: string) => Promise<boolean>;
  disconnectWallet: () => void;
  formatAddress: (address: string | null) => string;
  walletBalance: string | null;
}

const WalletDropdown = ({ 
  connected, 
  walletName, 
  walletAddress, 
  availableWallets,
  connectWallet,
  disconnectWallet,
  formatAddress,
  walletBalance
}: WalletDropdownProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant={connected ? "outline" : "default"} 
          className={connected 
            ? "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300" 
            : ""
          }
        >
          <Wallet className="mr-2 h-4 w-4" />
          {connected 
            ? `${walletName || 'Wallet'} (${formatAddress(walletAddress)})`
            : "Connect Wallet"
          }
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 bg-white dark:bg-gray-800 border shadow-md">
        {connected ? (
          <>
            <DropdownMenuLabel>Connected to {walletName}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {walletBalance && (
              <>
                <DropdownMenuItem className="text-sm font-medium">
                  Balance: {walletBalance} ₳
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}
            <DropdownMenuItem className="text-xs text-gray-500 break-all">
              {walletAddress}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="text-red-600 focus:text-red-600 cursor-pointer"
              onClick={disconnectWallet}
            >
              Disconnect Wallet
            </DropdownMenuItem>
          </>
        ) : (
          <>
            <DropdownMenuLabel>Select Wallet</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {availableWallets.length === 0 ? (
              <DropdownMenuItem disabled>No wallets installed</DropdownMenuItem>
            ) : (
              availableWallets.map((wallet) => (
                <DropdownMenuItem 
                  key={wallet.name}
                  onClick={() => connectWallet(wallet.name)}
                  className="flex items-center cursor-pointer"
                >
                  {wallet.icon && (
                    <img src={wallet.icon} alt={wallet.name} className="w-4 h-4 mr-2" />
                  )}
                  <span>{wallet.name}</span>
                </DropdownMenuItem>
              ))
            )}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

// Mobile wallet buttons component
interface MobileWalletButtonsProps {
  availableWallets: { name: string; icon: string; version: string }[];
  connectWallet: (name: string) => Promise<boolean>;
}

const MobileWalletButtons = ({
  availableWallets,
  connectWallet
}: MobileWalletButtonsProps) => {
  const [showWallets, setShowWallets] = useState(false);
  
  if (!showWallets) {
    return (
      <Button 
        size="sm"
        onClick={() => setShowWallets(true)}
      >
        Connect
      </Button>
    );
  }
  
  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {availableWallets.map((wallet) => (
        <Button
          key={wallet.name}
          variant="outline"
          size="sm"
          className="flex items-center"
          onClick={() => connectWallet(wallet.name)}
        >
          {wallet.icon && (
            <img src={wallet.icon} alt={wallet.name} className="w-4 h-4 mr-1" />
          )}
          {wallet.name}
        </Button>
      ))}
    </div>
  );
};

export default Navbar; 