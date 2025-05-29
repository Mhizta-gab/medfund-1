import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ClerkProvider } from '@clerk/nextjs';
import { BlockchainProvider } from '@/blockchain/context/BlockchainContext';
import { CardanoWalletProvider } from '@/blockchain/context/WalletContext';
import { Toaster } from 'sonner';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MedFund - Medical Crowdfunding Platform",
  description: "A decentralized platform for medical crowdfunding using Cardano blockchain",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Extract the Clerk publishable key from environment
  const clerkPubKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  
  if (!clerkPubKey) {
    throw new Error("Missing NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY env var");
  }
  
  return (
    <html lang="en">
      <body className={inter.className}>
        <ClerkProvider 
          publishableKey={clerkPubKey}
          appearance={{
            elements: {
              formButtonPrimary: 'bg-blue-600 hover:bg-blue-700 text-white',
              footerActionLink: 'text-blue-600 hover:text-blue-700',
            }
          }}
        >
          <BlockchainProvider>
            <CardanoWalletProvider>
              <Navbar />
              <main className="pt-16 min-h-screen">{children}</main>
              <Footer />
              <Toaster position="top-right" richColors />
            </CardanoWalletProvider>
          </BlockchainProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
