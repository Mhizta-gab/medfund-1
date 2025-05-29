import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { AuthProvider } from '@/context/AuthContext';
import { BlockchainProvider } from '@/blockchain/context/BlockchainContext';
import { CardanoWalletProvider } from '@/blockchain/context/WalletContext';

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
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <BlockchainProvider>
            <CardanoWalletProvider>
              <Navbar />
              <main className="pt-16 min-h-screen">{children}</main>
              <Footer />
            </CardanoWalletProvider>
          </BlockchainProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
