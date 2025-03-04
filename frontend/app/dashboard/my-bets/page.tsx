"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  Plus,
  Filter,
  TrendingUp,
  TrendingDown,
  Dices,
  Award,
  BarChart,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppLayout } from "../../components/app-layout";
import { BetCard } from "../../bets/bet-card";
import { BetFilters } from "../../bets/bet-filters";
import { useBettingService } from "@/services/BettingService";
import { useAccount } from "wagmi";
import { ethers } from "ethers";

// Interface for bet data from smart contract
interface ContractBet {
  id: number;
  creator: string;
  amount: bigint;
  title: string;
  description: string;
  category: string;
  twitterHandle: string;
  endDate: bigint;
  initialPoolAmount: bigint;
  imageURL: string;
  isClosed: boolean;
  supportCount: number;
  againstCount: number;
  outcome: boolean;
}

// Interface for bet card display
interface DisplayBet {
  id: number;
  title: string;
  image: string;
  category: string;
  endDate: string;
  totalPool: number;
  yesPool: number;
  noPool: number;
  yesProbability: number;
  noProbability: number;
  isResolved?: boolean;
  result?: "yes" | "no";
}

export default function MyBetsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<
    "all" | "active" | "resolved"
  >("all");
  const [showFilters, setShowFilters] = useState(false);
  const [bets, setBets] = useState<ContractBet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const bettingService = useBettingService();
  const { address, isConnected } = useAccount();

  // Add state for mounted status
  const [isMounted, setIsMounted] = useState(false);

  // Update useEffect to handle mounting and fetch bets
  useEffect(() => {
    let mounted = true;

    const fetchBets = async () => {
      try {
        if (!isConnected) {
          router.push("/bets");
          return;
        }

        setIsLoading(true);
        const allBets = await bettingService.getAllBets();

        if (mounted) {
          setBets(allBets);
          setIsLoading(false);
          setIsMounted(true);
        }
      } catch (error) {
        console.error("Error fetching bets:", error);
        if (mounted) {
          setIsLoading(false);
          setIsMounted(true);
        }
      }
    };

    fetchBets();

    return () => {
      mounted = false;
    };
  }, [isConnected, router]); // Remove bettingService from dependencies

  // Filter bets based on user's involvement
  const myBets = bets.filter(
    (bet) =>
      bet.creator.toLowerCase() === address?.toLowerCase() ||
      bet.twitterHandle.toLowerCase() === address?.toLowerCase()
  );

  const activeBets = myBets.filter((bet) => !bet.isClosed);
  const pastBets = myBets.filter((bet) => bet.isClosed);

  // Calculate statistics
  const totalBets = myBets.length;
  const wonBets = pastBets.filter((bet) => bet.outcome).length;
  const lostBets = pastBets.filter((bet) => !bet.outcome).length;
  const pendingBets = activeBets.length;
  const winRate = totalBets > 0 ? Math.round((wonBets / totalBets) * 100) : 0;

  // Calculate total profit/loss with proper BigInt handling
  const totalProfit = pastBets.reduce((acc, bet) => {
    const amount = Number(ethers.formatEther(BigInt(bet.initialPoolAmount)));
    return acc + (bet.outcome ? amount : -amount);
  }, 0);

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

  // Return loading state until component is mounted
  if (!isMounted) {
    return (
      <AppLayout>
        <div className="container py-6">
          <Card className="border-white/10 bg-black/50 backdrop-blur-xl">
            <CardContent className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  // Update the convertToDisplayBet function to handle dates consistently
  const convertToDisplayBet = (bet: ContractBet): DisplayBet => {
    const totalParticipants =
      Number(bet.supportCount) + Number(bet.againstCount);
    const yesProbability =
      totalParticipants > 0
        ? Number(bet.supportCount) / totalParticipants
        : 0.5;
    const noProbability =
      totalParticipants > 0
        ? Number(bet.againstCount) / totalParticipants
        : 0.5;

    // Format the date in UTC to ensure consistency
    const date = new Date(Number(bet.endDate) * 1000);
    const endDateISO = date.toISOString();

    // Ensure initialPoolAmount is treated as BigInt
    const poolAmount = BigInt(bet.initialPoolAmount.toString());

    return {
      id: bet.id,
      title: bet.title,
      image: bet.imageURL,
      category: bet.category,
      endDate: endDateISO,
      totalPool: Number(ethers.formatEther(poolAmount)),
      yesPool: Number(bet.supportCount),
      noPool: Number(bet.againstCount),
      yesProbability: yesProbability * 100,
      noProbability: noProbability * 100,
      isResolved: bet.isClosed,
      result: bet.isClosed ? (bet.outcome ? "yes" : "no") : undefined,
    };
  };

  if (!isConnected) {
    return (
      <AppLayout>
        <div className="container py-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 p-6 rounded-md"
          >
            <h2 className="text-2xl font-bold mb-2">Authentication Required</h2>
            <p>
              You need to be signed in to view your bets. Redirecting to the
              bets page...
            </p>
          </motion.div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header section */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold">
                My{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-500">
                  Bets
                </span>
              </h1>
              <p className="text-muted-foreground mt-1">
                Manage and track your prediction market bets
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search your bets..."
                  className="pl-8 w-[200px] md:w-[250px]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowFilters(!showFilters)}
                className={showFilters ? "bg-white/10" : ""}
              >
                <Filter className="h-4 w-4" />
              </Button>
              <Button asChild>
                <Link href="/bets/create">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Bet
                </Link>
              </Button>
            </div>
          </div>

          {/* Statistics Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Total Bets Card */}
              <Card className="border-white/10 bg-black/50 backdrop-blur-xl">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Bets
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Dices className="h-8 w-8 mr-3 text-blue-400" />
                      <div>
                        <div className="text-2xl font-bold">{totalBets}</div>
                        <p className="text-xs text-muted-foreground">
                          {pendingBets} active, {pastBets.length} completed
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Win Rate Card */}
              <Card className="border-white/10 bg-black/50 backdrop-blur-xl">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Win Rate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Award className="h-8 w-8 mr-3 text-green-400" />
                      <div>
                        <div className="text-2xl font-bold">{winRate}%</div>
                        <p className="text-xs text-muted-foreground">
                          {wonBets} won, {lostBets} lost
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Total Profit Card */}
              <Card className="border-white/10 bg-black/50 backdrop-blur-xl">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Profit
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      {totalProfit >= 0 ? (
                        <TrendingUp className="h-8 w-8 mr-3 text-green-400" />
                      ) : (
                        <TrendingDown className="h-8 w-8 mr-3 text-red-400" />
                      )}
                      <div>
                        <div className="text-2xl font-bold">
                          {totalProfit > 0 ? "+" : ""}
                          {totalProfit.toFixed(4)} ETH
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Lifetime profit/loss
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Active Pool Size Card */}
              <Card className="border-white/10 bg-black/50 backdrop-blur-xl">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Active Pool Size
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <BarChart className="h-8 w-8 mr-3 text-blue-400" />
                      <div>
                        <div className="text-2xl font-bold">
                          {ethers.formatEther(
                            activeBets.reduce(
                              (acc, bet) =>
                                acc + BigInt(bet.initialPoolAmount.toString()),
                              BigInt(0)
                            )
                          )}{" "}
                          ETH
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Total active pool size
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>

          {/* Filters */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6"
            >
              <Card className="border-white/10 bg-black/50 backdrop-blur-xl">
                <CardContent className="pt-6">
                  <BetFilters
                    activeFilter={activeFilter}
                    selectedCategory={selectedCategory}
                    onFilterChange={setActiveFilter}
                    onCategoryChange={setSelectedCategory}
                  />
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Tabs */}
          <Tabs defaultValue="active" className="mb-8">
            <TabsList>
              <TabsTrigger value="active">Active Bets</TabsTrigger>
              <TabsTrigger value="past">Past Bets</TabsTrigger>
              <TabsTrigger value="created">Created by Me</TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="mt-6">
              {isLoading ? (
                <Card className="border-white/10 bg-black/50 backdrop-blur-xl">
                  <CardContent className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </CardContent>
                </Card>
              ) : filteredActiveBets.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredActiveBets.map((bet) => (
                    <BetCard key={bet.id} bet={convertToDisplayBet(bet)} />
                  ))}
                </div>
              ) : (
                <Card className="border-white/10 bg-black/50 backdrop-blur-xl">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Dices className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-xl font-medium mb-2">
                      No active bets found
                    </h3>
                    <p className="text-muted-foreground text-center max-w-md mb-6">
                      You don't have any active bets matching your search
                      criteria. Try clearing your filters or create a new bet.
                    </p>
                    <Button asChild>
                      <Link href="/bets">Browse Prediction Markets</Link>
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="past" className="mt-6">
              {isLoading ? (
                <Card className="border-white/10 bg-black/50 backdrop-blur-xl">
                  <CardContent className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </CardContent>
                </Card>
              ) : filteredPastBets.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredPastBets.map((bet) => (
                    <BetCard key={bet.id} bet={convertToDisplayBet(bet)} />
                  ))}
                </div>
              ) : (
                <Card className="border-white/10 bg-black/50 backdrop-blur-xl">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Dices className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-xl font-medium mb-2">
                      No past bets found
                    </h3>
                    <p className="text-muted-foreground text-center max-w-md mb-6">
                      You don't have any past bets matching your search
                      criteria. Try clearing your filters or participate in some
                      prediction markets.
                    </p>
                    <Button asChild>
                      <Link href="/bets">Browse Prediction Markets</Link>
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="created" className="mt-6">
              {isLoading ? (
                <Card className="border-white/10 bg-black/50 backdrop-blur-xl">
                  <CardContent className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </CardContent>
                </Card>
              ) : myBets.filter(
                  (bet) => bet.creator.toLowerCase() === address?.toLowerCase()
                ).length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {myBets
                    .filter(
                      (bet) =>
                        bet.creator.toLowerCase() === address?.toLowerCase()
                    )
                    .map((bet) => (
                      <BetCard key={bet.id} bet={convertToDisplayBet(bet)} />
                    ))}
                </div>
              ) : (
                <Card className="border-white/10 bg-black/50 backdrop-blur-xl">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Dices className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-xl font-medium mb-2">
                      No created bets yet
                    </h3>
                    <p className="text-muted-foreground text-center max-w-md mb-6">
                      You haven't created any prediction markets yet. Create
                      your first prediction market and let others bet on the
                      outcome.
                    </p>
                    <Button asChild>
                      <Link href="/bets/create">
                        <Plus className="h-4 w-4 mr-2" />
                        Create Prediction Market
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </AppLayout>
  );
}
