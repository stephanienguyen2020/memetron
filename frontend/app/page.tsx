"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { motion } from "framer-motion";
import { AppLayout } from "./components/app-layout";
import {
  Zap,
  Command,
  Scale,
  Bot,
  Shield,
  Sparkles,
  Check,
  Sprout,
  TrendingUp,
  Eye,
  Wallet,
} from "lucide-react";
import GridBackground from "./components/GridBackground";
import { useState, useMemo, useEffect } from "react";
import { MemeCoinMarketCap } from "./components/MemeCoinMarketCap";
import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useWallet } from "./providers/WalletProvider";

// Dummy data for trending coins (replace with your actual data)
const trendingCoins = [
  {
    id: "doge",
    name: "Dogecoin",
    symbol: "DOGE",
    price: 0.08,
    marketCap: 10000000000,
    change24h: 5.2,
    volume24h: 500000000,
  },
  {
    id: "shib",
    name: "Shiba Inu",
    symbol: "SHIB",
    price: 0.00001,
    marketCap: 5000000000,
    change24h: -2.5,
    volume24h: 250000000,
  },
  {
    id: "pepe",
    name: "Pepe",
    symbol: "PEPE",
    price: 0.000001,
    marketCap: 1000000000,
    change24h: 10.0,
    volume24h: 100000000,
  },
  {
    id: "wsm",
    name: "Wall Street Memes",
    symbol: "WSM",
    price: 0.05,
    marketCap: 500000000,
    change24h: 3.0,
    volume24h: 50000000,
  },
  {
    id: "bonk",
    name: "Bonk",
    symbol: "BONK",
    price: 0.000005,
    marketCap: 250000000,
    change24h: 7.5,
    volume24h: 25000000,
  },
  {
    id: "floppy",
    name: "Floppy",
    symbol: "FLOPPY",
    price: 0.0000005,
    marketCap: 100000000,
    change24h: -1.0,
    volume24h: 10000000,
  },
  {
    id: "spongebob",
    name: "SpongeBob",
    symbol: "SPONGE",
    price: 0.0000001,
    marketCap: 50000000,
    change24h: 12.0,
    volume24h: 5000000,
  },
  {
    id: "catge",
    name: "Catge Coin",
    symbol: "CATGE",
    price: 0.00000005,
    marketCap: 25000000,
    change24h: -3.5,
    volume24h: 2500000,
  },
  {
    id: "dogelon",
    name: "Dogelon Mars",
    symbol: "ELON",
    price: 0.00000001,
    marketCap: 10000000,
    change24h: 8.0,
    volume24h: 1000000,
  },
  {
    id: "mong",
    name: "MongCoin",
    symbol: "MONG",
    price: 0.000000005,
    marketCap: 5000000,
    change24h: 4.5,
    volume24h: 500000,
  },
];

export default function Home(): JSX.Element {
  const router = useRouter();
  const { isConnected, connect } = useWallet();
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [activeFilter, setActiveFilter] = useState<
    "new" | "gainers" | "visited"
  >("new");
  const itemsPerPage = 5;

  const filterOptions = [
    { id: "new", label: "New", icon: Sprout },
    { id: "gainers", label: "Gainers", icon: TrendingUp },
    { id: "visited", label: "Most Visited", icon: Eye },
  ] as const;

  // Check authentication status
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const savedAuth = localStorage.getItem("isAuthenticated") === "true";
    setIsAuthenticated(isConnected || savedAuth);

    // If authenticated, redirect to dashboard
    if (isConnected || savedAuth) {
      router.push("/dashboard");
    }
  }, [isConnected, router]);

  // Filter and sort coins based on active filter
  const filteredCoins = useMemo(() => {
    let filtered = [...trendingCoins];

    switch (activeFilter) {
      case "new":
        // Sort by newest first (you might want to add a timestamp field to your coins)
        filtered = filtered.sort((a, b) => b.marketCap - a.marketCap);
        break;
      case "gainers":
        // Sort by 24h change
        filtered = filtered.sort((a, b) => b.change24h - a.change24h);
        break;
      case "visited":
        // Sort by volume as a proxy for "most visited"
        filtered = filtered.sort((a, b) => b.volume24h - a.volume24h);
        break;
    }

    return filtered;
  }, [activeFilter]);

  const totalPages = Math.ceil(filteredCoins.length / itemsPerPage);

  const getCurrentPageItems = () => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return filteredCoins.slice(start, end);
  };

  // Function to handle the "Get Started" button click
  const handleGetStarted = async () => {
    try {
      // If not connected, try to connect wallet
      if (!isConnected) {
        await connect();
        // The WalletProvider will handle redirection to dashboard after successful connection
      } else {
        // If already connected, just navigate to dashboard
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Failed to connect wallet:", error);
      // If connection fails, still navigate to dashboard
      // User can connect wallet there if needed
      router.push("/dashboard");
    }
  };

  return (
    <AppLayout showFooter={false}>
      <GridBackground />
      <div className="py-8">
        <section className="space-y-6 pb-8 pt-6 md:pb-12 md:pt-10 lg:py-32">
          <div className="container flex max-w-[64rem] flex-col items-center gap-4 text-center">
            <motion.a
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              href="#"
              className="inline-flex items-center rounded-full bg-muted px-4 py-1.5 text-sm font-medium"
            >
              🎉 <Separator className="mx-2 h-4" orientation="vertical" /> The
              Ultimate MemeCoin Factory on NEAR & Aurora
            </motion.a>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-4xl font-bold leading-tight tracking-tighter md:text-6xl lg:text-7xl lg:leading-[1.1]"
            >
              Build, Trade, Bet, Dominate.
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-500">
                Only on NEAR & Aurora.
              </span>
            </motion.h1>
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="max-w-[750px] text-center text-lg text-muted-foreground sm:text-xl"
            >
              AI-powered insights to predict trends, dodge rugs, and catch
              moonshots before they take off—mint, swap, trade, and bet in the
              largest decentralized launchpad, marketplace, and prediction
              market for viral meme coins.
            </motion.span>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex gap-4"
            >
              <Button
                size="lg"
                className="h-12 px-8"
                onClick={handleGetStarted}
              >
                Get Started
              </Button>
              <Button size="lg" variant="outline" className="h-12 px-8">
                View Demo
              </Button>
            </motion.div>

            {/* Connect Wallet Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="mt-8 w-full max-w-md"
            ></motion.div>
          </div>
        </section>

        {/* <Separator className="my-12" />

        <div className="container">
          <h2 className="mb-8 text-3xl font-bold">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-500">
              Trending Meme Coins
            </span>
          </h2>
          <MemeCoinMarketCap />
        </div> */}
      </div>
    </AppLayout>
  );
}
