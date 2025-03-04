"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { AppLayout } from "../components/app-layout";
import { Input } from "@/components/ui/input";
import { Search, Rocket, Loader2, AlertCircle, Wallet } from "lucide-react";
import GridBackground from "../components/GridBackground";
import { LeaderboardCard } from "./leaderboard-card";
import { BetFilters } from "./bet-filters";
import { BetSection } from "./bet-section";
import { PastBetsSlider } from "./past-bets-slider";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useBettingService } from "@/services/BettingService";
import { ethers } from "ethers";
import { useToast } from "@/components/ui/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useWalletClient } from "wagmi";
import { Bet } from "./types";

// Our internal type for blockchain data
interface BlockchainBet {
  id: number;
  title: string;
  description: string;
  category: string;
  createdBy: string;
  endDate: Date;
  endDateFormatted: string;
  isActive: boolean;
  status: string;
  poolAmount: string;
  joinAmount: string;
  participants: number;
  imageUrl: string;
  votesYes: number;
  votesNo: number;
  outcome: boolean;
  resolved: boolean;
}

export default function BetsPage() {
  // Page state
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [activeCurrentPage, setActiveCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  // Bets data state
  const [bets, setBets] = useState<Bet[]>([]);
  const [activeBets, setActiveBets] = useState<Bet[]>([]);
  const [pastBets, setPastBets] = useState<Bet[]>([]);
  const [totalVolume, setTotalVolume] = useState("0.000");

  // Check wallet connection
  const { data: walletClient } = useWalletClient();
  const [isWalletConnected, setIsWalletConnected] = useState(false);

  // Services and utilities
  const bettingService = useBettingService();
  const { toast } = useToast();

  // Track if data has been fetched to prevent refetching
  const dataFetched = useRef(false);

  // Update wallet connection status
  useEffect(() => {
    setIsWalletConnected(!!walletClient);
  }, [walletClient]);

  // Fetch bets data only once on component mount
  useEffect(() => {
    // Skip if data has already been fetched
    if (dataFetched.current) return;

    async function fetchBets() {
      try {
        // Set loading state and mark as fetched
        setLoading(true);
        dataFetched.current = true;

        // Get bets from blockchain
        const allBets = await bettingService.getAllBets();
        // console.log("Fetched bets:", allBets);

        // Handle empty or error cases
        if (!allBets || allBets.length === 0) {
          setBets([]);
          setActiveBets([]);
          setPastBets([]);
          setTotalVolume("0.000");
          setLoading(false);
          return;
        }

        // Process bets data
        const processedBets = allBets
          .map((bet, index) => {
            if (!bet) return null;

            try {
              // Format values with safety checks
              const joinAmount = bet.amount
                ? ethers.formatEther(bet.amount.toString())
                : "0";

              const poolAmount = bet.initialPoolAmount
                ? ethers.formatEther(bet.initialPoolAmount.toString())
                : "0";

              // Calculate dates and status
              const currentDate = new Date();
              const endDateTimestamp = bet.endDate
                ? Number(bet.endDate) * 1000
                : currentDate.getTime() + 30 * 24 * 60 * 60 * 1000;

              const endDate = new Date(endDateTimestamp);
              const isActive = currentDate < endDate && !bet.isClosed;

              // Return formatted bet
              return {
                id: Number(bet.id || index),
                title: bet.title || `Bet #${bet.id || index}`,
                description: bet.description || "No description provided",
                category: bet.category || "Uncategorized",
                createdBy: bet.creator || "Unknown",
                endDate: endDate,
                endDateFormatted: endDate.toLocaleString(),
                isActive: isActive,
                status: isActive ? "active" : "closed",
                poolAmount: poolAmount || "0",
                joinAmount: joinAmount || "0",
                participants:
                  (Number(bet.supportCount) || 0) +
                  (Number(bet.againstCount) || 0),
                imageUrl: bet.imageURL || "/placeholder.svg",
                votesYes: Number(bet.supportCount) || 0,
                votesNo: Number(bet.againstCount) || 0,
                outcome: Boolean(bet.outcome),
                resolved: Boolean(bet.isClosed),
              };
            } catch (error) {
              console.warn(`Error formatting bet at index ${index}:`, error);
              return null;
            }
          })
          .filter(Boolean) as BlockchainBet[];

        // Convert to UI format
        const formattedBets = processedBets.map((bet) => ({
          id: String(bet.id),
          title: bet.title,
          image: bet.imageUrl,
          category: bet.category,
          endDate: bet.endDateFormatted,
          totalPool: parseFloat(bet.poolAmount),
          yesPool:
            parseFloat(bet.poolAmount) *
            (bet.votesYes / (bet.votesYes + bet.votesNo || 1)),
          noPool:
            parseFloat(bet.poolAmount) *
            (bet.votesNo / (bet.votesYes + bet.votesNo || 1)),
          yesProbability:
            (bet.votesYes / (bet.votesYes + bet.votesNo || 1)) * 100,
          noProbability:
            (bet.votesNo / (bet.votesYes + bet.votesNo || 1)) * 100,
          isResolved: bet.resolved,
          result: bet.resolved
            ? bet.outcome
              ? ("yes" as const)
              : ("no" as const)
            : undefined,
        }));

        // Update all state in a batch
        const active = formattedBets.filter((bet) => !bet.isResolved);
        const past = formattedBets.filter((bet) => bet.isResolved);
        const volume = formattedBets.reduce(
          (acc, bet) => acc + bet.totalPool,
          0
        );

        // Set all state at once
        setBets(formattedBets);
        setActiveBets(active);
        setPastBets(past);
        setTotalVolume(volume.toFixed(3));
      } catch (error) {
        console.error("Error fetching bets:", error);
        toast({
          title: "Error fetching bets",
          description: "Failed to load bets from the blockchain.",
          variant: "destructive",
        });

        // Reset states
        setBets([]);
        setActiveBets([]);
        setPastBets([]);
        setTotalVolume("0.000");
      } finally {
        setLoading(false);
      }
    }

    fetchBets();

    // No cleanup needed since we use dataFetched.current to prevent refetching
  }, [bettingService, toast]); // Only stable dependencies

  // Manual refresh function for user-triggered refreshes
  const handleRefresh = () => {
    dataFetched.current = false; // Reset the fetched flag
    setLoading(true); // Show loading state again

    // Re-run the effect in the next tick
    setTimeout(() => {
      const event = new Event("fetch");
      window.dispatchEvent(event);
    }, 0);
  };

  // Listen for custom fetch event (triggered by handleRefresh)
  useEffect(() => {
    const refetchHandler = () => {
      dataFetched.current = false;
    };

    window.addEventListener("fetch", refetchHandler);
    return () => window.removeEventListener("fetch", refetchHandler);
  }, []);

  // Filter bets based on search term and category
  const filteredActiveBets = activeBets.filter(
    (bet) =>
      (bet.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bet.category.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (!selectedCategory || bet.category === selectedCategory)
  );

  const filteredPastBets = pastBets.filter(
    (bet) =>
      (bet.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bet.category.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (!selectedCategory || bet.category === selectedCategory)
  );

  return (
    <AppLayout showFooter={false}>
      <GridBackground />
      <div className="py-8">
        <div className="container max-w-[1600px] mx-auto px-4">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-12"
          >
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h1 className="text-4xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-500">
                  Prediction Bets
                </h1>
                <p className="text-muted-foreground">
                  Place your bets and challenge others on future events
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Link href="/bets/create">
                  <Button className="bg-gradient-to-r from-sky-400 to-blue-500 hover:from-sky-400/90 hover:to-blue-500/90">
                    <Rocket className="mr-2 h-4 w-4" />
                    Create Prediction
                  </Button>
                </Link>
                <div className="flex items-center gap-2 bg-black/40 backdrop-blur-sm rounded-full px-4 py-2 border border-white/10">
                  <div className="text-sm">
                    <span className="text-gray-400">Total Volume:</span>{" "}
                    <span className="font-mono font-medium text-white">
                      {totalVolume} ETH
                    </span>
                  </div>
                  <div className="w-px h-4 bg-white/10" />
                  <div className="text-sm">
                    <span className="text-gray-400">Active Bets:</span>{" "}
                    <span className="font-mono font-medium text-white">
                      {activeBets.length}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Wallet Warning - show when wallet is not connected */}
          {!isWalletConnected && !loading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="mb-8"
            >
              <Alert
                variant="default"
                className="bg-yellow-500/10 border-yellow-500/20"
              >
                <Wallet className="h-5 w-5 text-yellow-500" />
                <AlertTitle>Wallet Not Connected</AlertTitle>
                <AlertDescription>
                  Connect your wallet to interact with bets on the blockchain
                  and see the latest data.
                </AlertDescription>
              </Alert>
            </motion.div>
          )}

          {/* Search and Filters */}
          <div className="flex flex-col lg:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search bets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12"
              />
            </div>
            <BetFilters
              activeFilter="all"
              selectedCategory={selectedCategory}
              onFilterChange={() => {}}
              onCategoryChange={setSelectedCategory}
            />
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="h-10 w-10 animate-spin text-blue-500 mb-4" />
              <p className="text-muted-foreground mb-6">
                Loading bets from the blockchain...
              </p>
              <Button
                variant="outline"
                onClick={handleRefresh}
                className="border-white/10"
              >
                Refresh Data
              </Button>
            </div>
          )}

          {/* No Bets State */}
          {!loading && bets.length === 0 && (
            <div className="col-span-12 space-y-4">
              <Alert variant="default" className="bg-black/40 border-white/10">
                <AlertCircle className="h-5 w-5 text-blue-500" />
                <AlertTitle>No Bets Found</AlertTitle>
                <AlertDescription>
                  {isWalletConnected
                    ? "There are currently no bets on the blockchain. Be the first to create one!"
                    : "Connect your wallet to see and interact with bets."}
                </AlertDescription>
              </Alert>

              <div className="text-center py-10">
                <Link href="/bets/create">
                  <Button className="bg-gradient-to-r from-sky-400 to-blue-500 hover:from-sky-400/90 hover:to-blue-500/90">
                    <Rocket className="mr-2 h-4 w-4" />
                    Create the First Bet
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {/* Main Content */}
          {!loading && bets.length > 0 && (
            <div className="grid grid-cols-12 gap-6">
              {/* Bets Sections */}
              <div className="col-span-12 lg:col-span-9 space-y-12">
                {/* Active Bets */}
                {filteredActiveBets.length > 0 ? (
                  <BetSection
                    title="Active Bets"
                    bets={filteredActiveBets}
                    currentPage={activeCurrentPage}
                    onPageChange={setActiveCurrentPage}
                    itemsPerPage={6}
                    showViewAll={true}
                  />
                ) : (
                  <div className="space-y-4">
                    <h2 className="text-2xl font-semibold">Active Bets</h2>
                    <div className="text-center py-10 border border-white/10 rounded-xl bg-black/20">
                      <p className="text-muted-foreground">
                        No active bets available
                      </p>
                    </div>
                  </div>
                )}

                {/* Past Bets */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-semibold">Past Bets</h2>
                    <Link
                      href="/bets/history"
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      View All Past Bets
                    </Link>
                  </div>
                  {filteredPastBets.length > 0 ? (
                    <div className="overflow-hidden rounded-xl border border-white/10">
                      <PastBetsSlider bets={filteredPastBets} />
                    </div>
                  ) : (
                    <div className="text-center py-10 border border-white/10 rounded-xl bg-black/20">
                      <p className="text-muted-foreground">
                        No past bets found
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Leaderboards */}
              <div className="col-span-12 lg:col-span-3 space-y-6">
                <LeaderboardCard
                  title="Top Bettors"
                  entries={[
                    { address: "0x1234...5678", amount: 1000, rank: 1 },
                    { address: "0x8765...4321", amount: 750, rank: 2 },
                    { address: "0x9876...5432", amount: 500, rank: 3 },
                    { address: "0x5432...1098", amount: 250, rank: 4 },
                    { address: "0x1098...7654", amount: 100, rank: 5 },
                  ]}
                />
                <LeaderboardCard
                  title="Recent Winners"
                  entries={[
                    { address: "0xabcd...efgh", amount: 2500, rank: 1 },
                    { address: "0xijkl...mnop", amount: 1500, rank: 2 },
                    { address: "0xqrst...uvwx", amount: 1000, rank: 3 },
                    { address: "0xyzab...cdef", amount: 750, rank: 4 },
                    { address: "0xghij...klmn", amount: 500, rank: 5 },
                  ]}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
