"use client";

import { motion } from "framer-motion";
import { AppLayout } from "../components/app-layout";
import { PortfolioOverview } from "./portfolio/components/portfolio-overview";
import { PortfolioChart } from "./portfolio/components/portfolio-chart";
import { PortfolioAnalytics } from "./portfolio/components/portfolio-analytics";
import { BetsSection } from "./components/bets-section";
import { LaunchedTokens } from "./components/launched-tokens";
import { MemeNews } from "./components/meme-news";
import { AboutMemes } from "./components/about-memes";
import { useAccount } from "wagmi";
import { useWallet } from "../providers/WalletProvider";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Wallet } from "lucide-react";

export default function DashboardPage() {
  const { address, isConnected } = useAccount();
  const { isAuthenticated } = useWallet();
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  // Update wallet address when connection status changes
  useEffect(() => {
    if (isConnected && address) {
      setWalletAddress(address);
    } else {
      // Try to get from localStorage as fallback
      const savedAddress = localStorage.getItem("userAddress");
      setWalletAddress(savedAddress);
    }
  }, [isConnected, address]);

  return (
    <AppLayout>
      <div className="px-4 pr-[400px]">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 max-w-5xl mx-auto mt-6">
          <h1 className="text-4xl font-bold">
            Portfolio{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-500">
              Snapshot
            </span>
          </h1>

          {/* Connected Wallet Display */}
          {walletAddress && (
            <div className="flex items-center gap-2 mt-2 md:mt-0 p-3 rounded-md bg-sky-500/10 border border-sky-500/20">
              <Wallet className="h-4 w-4 text-sky-500" />
              <span className="text-sm font-medium">Connected:</span>
              <span className="text-sm text-muted-foreground">
                {walletAddress.substring(0, 6)}...
                {walletAddress.substring(walletAddress.length - 4)}
              </span>
            </div>
          )}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6 max-w-5xl mx-auto"
        >
          {/* Portfolio Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <PortfolioOverview />
          </motion.div>

          {/* Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-8"
          >
            <PortfolioChart />
          </motion.div>

          {/* Portfolio Analytics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mb-8"
          >
            <PortfolioAnalytics />
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            <BetsSection />
            <LaunchedTokens />
          </div>
        </motion.div>
      </div>

      {/* Fixed Right Sidebar */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="fixed top-[64px] right-0 w-[380px] h-[calc(100vh-64px)] overflow-y-auto bg-gray-900/50 backdrop-blur-sm border-l border-green-500/10"
      >
        <div className="p-4 space-y-6">
          <MemeNews />
          <AboutMemes />
        </div>
      </motion.div>
    </AppLayout>
  );
}
