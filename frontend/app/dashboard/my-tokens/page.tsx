"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ethers } from "ethers";
import { AppLayout } from "../../components/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowUpDown,
  ChevronDown,
  Copy,
  ExternalLink,
  Eye,
  Filter,
  MoreHorizontal,
  Plus,
  Search,
  Share2,
  Trash,
  TrendingUp,
  TrendingDown,
  Rocket,
  Users,
  DollarSign,
  LinkIcon,
  Settings,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { useTokenStore } from "../../store/tokenStore";
import { useTestTokenService } from "@/services/TestTokenService";
import {
  getTokens,
  getPriceForTokens,
  getPurchasedTokens,
  getTokenBalance,
} from "@/services/memecoin-launchpad";
import { useRouter } from "next/navigation";
import { useWallet } from "@/app/providers/WalletProvider";
import { toast } from "@/components/ui/use-toast";

export default function TokensPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [tokenTypeTab, setTokenTypeTab] = useState("created"); // "created" or "purchased"
  const [showFilters, setShowFilters] = useState(false);
  const [selectedNetwork, setSelectedNetwork] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  }>({ key: "value", direction: "desc" });
  const [isLoading, setIsLoading] = useState(true);
  const [createdTokens, setCreatedTokens] = useState<any[]>([]);
  const [purchasedTokens, setPurchasedTokens] = useState<any[]>([]);
  const testTokenService = useTestTokenService();
  const router = useRouter();
  const { networkName } = useWallet();

  // Fetch user created tokens from blockchain
  useEffect(() => {
    const fetchCreatedTokens = async () => {
      try {
        setIsLoading(true);
        const tokens = await testTokenService.testGetTokens({ isCreator: true });
        console.log("Created tokens:", tokens);

        // Process tokens and get prices
        const formattedTokensPromises = tokens.map(async (token) => {
          // Get the actual price from the contract for 1 token
          let tokenPrice = "0";
          if (token.isOpen) {
            try {
              // Create a TokenSale object with all required properties
              const tokenSaleData = {
                token: token.token,
                name: token.name,
                creator: token.creator,
                sold: token.sold,
                raised: token.raised,
                isOpen: token.isOpen,
                metadataURI: token.image || "", // Use image URL as metadataURI
              };

              const price = await testTokenService.testGetPriceForTokens(tokenSaleData, BigInt(1));
              tokenPrice = ethers.formatEther(price);
              console.log(`Token price for ${token.name}:`, tokenPrice);
            } catch (error) {
              console.error(
                `Error fetching price for token ${token.name}:`,
                error
              );
              tokenPrice = "0";
            }
          }

          return {
            id: token.token,
            name: token.name,
            symbol: token.name.substring(0, 4).toUpperCase(),
            description: token.description || "No description available",
            imageUrl: token.image || "/placeholder.svg",
            price: tokenPrice,
            marketCap: (Number(token.raised) / 1e18).toFixed(2),
            priceChange: Math.random() * 20 - 10,
            fundingRaised: token.raised.toString(),
            chain: "Electroneum", // Use Electroneum as the default chain
            volume24h: "$" + (Math.random() * 100000).toFixed(2),
            holders: (Math.random() * 1000).toFixed(0).toString(),
            launchDate: new Date().toISOString().split("T")[0],
            status: token.isOpen ? "active" : "locked",
            type: "created",
          };
        });

        const formattedTokens = await Promise.all(formattedTokensPromises);
        setCreatedTokens(formattedTokens);
      } catch (error) {
        console.error("Error fetching created tokens:", error);
        toast({
          title: "Error",
          description: "Failed to load your created tokens.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCreatedTokens();
  }, [testTokenService]);

  // Fetch purchased tokens
  useEffect(() => {
    const fetchPurchasedTokens = async () => {
      try {
        setIsLoading(true);
        const tokens = await testTokenService.testGetPurchasedTokens();
        console.log("Purchased tokens:", tokens);

        // Process tokens and get prices
        const formattedTokensPromises = tokens.map(async (token) => {
          // Get the actual price from the contract for 1 token
          let tokenPrice = "0";
          if (token.isOpen) {
            try {
              // Create a TokenSale object with all required properties
              const tokenSaleData = {
                token: token.token,
                name: token.name,
                creator: token.creator,
                sold: token.sold,
                raised: token.raised,
                isOpen: token.isOpen,
                metadataURI: token.image || "",
              };

              const price = await testTokenService.testGetPriceForTokens(tokenSaleData, BigInt(1));
              tokenPrice = ethers.formatEther(price);
              console.log(`Token price for ${token.name}:`, tokenPrice);
            } catch (error) {
              console.error(
                `Error fetching price for token ${token.name}:`,
                error
              );
              tokenPrice = "0";
            }
          }

          return {
            id: token.token,
            name: token.name,
            symbol: token.name.substring(0, 4).toUpperCase(),
            description: token.description || "No description available",
            imageUrl: token.image || "/placeholder.svg",
            price: tokenPrice,
            marketCap: (Number(token.raised) / 1e18).toFixed(2),
            priceChange: Math.random() * 20 - 10,
            fundingRaised: token.raised.toString(),
            chain: "Electroneum", // Use Electroneum as the default chain
            volume24h: "$" + (Math.random() * 100000).toFixed(2),
            holders: (Math.random() * 1000).toFixed(0).toString(),
            launchDate: new Date().toISOString().split("T")[0],
            status: token.isOpen ? "active" : "locked",
            balance: token.balance ? ethers.formatEther(token.balance) : "0",
            type: "purchased",
          };
        });

        const formattedTokens = await Promise.all(formattedTokensPromises);
        setPurchasedTokens(formattedTokens);
      } catch (error) {
        console.error("Error fetching purchased tokens:", error);
        toast({
          title: "Error",
          description: "Failed to load your purchased tokens.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchPurchasedTokens();
  }, [testTokenService]);

  // Get tokens based on the selected tab
  const tokens = tokenTypeTab === "created" ? createdTokens : purchasedTokens;

  // Filter tokens based on search query and active tab
  const filteredTokens = tokens.filter((token) => {
    const matchesSearch =
      token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      token.symbol.toLowerCase().includes(searchQuery.toLowerCase());

    if (activeTab === "all") return matchesSearch;
    if (activeTab === "active")
      return matchesSearch && token.status === "active";
    if (activeTab === "locked")
      return matchesSearch && token.status === "locked";

    return matchesSearch;
  });

  // Sort tokens based on sort config
  const sortedTokens = [...filteredTokens].sort((a, b) => {
    if (
      a[sortConfig.key as keyof typeof a] < b[sortConfig.key as keyof typeof b]
    ) {
      return sortConfig.direction === "asc" ? -1 : 1;
    }
    if (
      a[sortConfig.key as keyof typeof a] > b[sortConfig.key as keyof typeof b]
    ) {
      return sortConfig.direction === "asc" ? 1 : -1;
    }
    return 0;
  });

  // Handle sort
  const handleSort = (key: string) => {
    setSortConfig({
      key,
      direction:
        sortConfig.key === key && sortConfig.direction === "asc"
          ? "desc"
          : "asc",
    });
  };

  // Find best and worst performers
  const bestPerformer =
    tokens.length > 0
      ? [...tokens].reduce(
          (best, token) =>
            token.priceChange > best.priceChange ? token : best,
          tokens[0]
        )
      : null;

  const worstPerformer =
    tokens.length > 0
      ? [...tokens].reduce(
          (worst, token) =>
            token.priceChange < worst.priceChange ? token : worst,
          tokens[0]
        )
      : null;

  // Calculate total volume
  const totalVolume = tokens.reduce((sum, token) => {
    const volumeNumber = parseFloat(token.volume24h.replace(/[^0-9.]/g, ""));
    return sum + volumeNumber;
  }, 0);

  // Get chain from wallet if available, otherwise use Electroneum as fallback
  const getChainFromWallet = () => {
    if (networkName && networkName.includes("Electroneum")) {
      return "Electroneum";
    }
    return "Electroneum"; // Fallback to Electroneum
  };

  return (
    <AppLayout>
      <div className="min-h-screen bg-gradient-to-b from-black to-gray-900">
        <div className="container py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Header section */}
            <div className="relative mb-12 pb-6 border-b border-white/10">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div>
                  <h1 className="text-4xl font-bold mb-2">
                    My{" "}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-[#00ff00] to-emerald-400">
                      Tokens
                    </span>
                  </h1>
                  <p className="text-lg text-muted-foreground">
                    Manage and monitor your token portfolio
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Link href="/launch">
                    <Button className="bg-gradient-to-r from-green-400 to-emerald-400 hover:from-green-500 hover:to-emerald-500 transition-all">
                      <Plus className="w-4 h-4 mr-2" />
                      Create New Token
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Token Type Tabs */}
            <div className="mb-8">
              <Tabs
                value={tokenTypeTab}
                onValueChange={setTokenTypeTab}
                className="w-full"
              >
                <TabsList className="bg-white/5 p-1 rounded-lg grid w-full max-w-md mx-auto grid-cols-2">
                  <TabsTrigger
                    value="created"
                    className="data-[state=active]:bg-green-500 flex items-center gap-2"
                  >
                    <Rocket className="w-4 h-4" />
                    Created Tokens
                  </TabsTrigger>
                  <TabsTrigger
                    value="purchased"
                    className="data-[state=active]:bg-green-500 flex items-center gap-2"
                  >
                    <Wallet className="w-4 h-4" />
                    Purchased Tokens
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 mb-8">
              <Card className="bg-white/5 border-white/10 hover:border-green-500/50 transition-all hover:transform hover:scale-[1.02] cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Rocket className="w-5 h-5 text-green-400" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">
                      Total Tokens
                    </p>
                    <div className="flex items-baseline gap-2">
                      <p className="text-3xl font-bold">{tokens.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/5 border-white/10 hover:border-green-500/50 transition-all hover:transform hover:scale-[1.02] cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Users className="w-5 h-5 text-purple-400" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">
                      Total Holders
                    </p>
                    <div className="flex items-baseline gap-2">
                      <p className="text-3xl font-bold">3,617</p>
                      <span className="text-sm text-green-500">+12.5%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/5 border-white/10 hover:border-green-500/50 transition-all hover:transform hover:scale-[1.02] cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <DollarSign className="w-5 h-5 text-green-400" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">
                      Total Volume
                    </p>
                    <div className="flex items-baseline gap-2">
                      <p className="text-3xl font-bold">
                        ${totalVolume.toLocaleString()}
                      </p>
                      <span className="text-sm text-green-500">+8.3%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/5 border-white/10 hover:border-green-500/50 transition-all hover:transform hover:scale-[1.02] cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <TrendingUp className="w-5 h-5 text-yellow-400" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">24h Volume</p>
                    <div className="flex items-baseline gap-2">
                      <p className="text-3xl font-bold">$155,840</p>
                      <span className="text-sm text-red-500">-3.2%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/5 border-white/10 hover:border-green-500/50 transition-all hover:transform hover:scale-[1.02] cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <TrendingUp className="w-5 h-5 text-green-400" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">
                      Best Performer
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="text-2xl font-bold">
                        {bestPerformer?.symbol}
                      </div>
                      <Badge
                        variant="default"
                        className="bg-green-500/20 text-green-500"
                      >
                        +{bestPerformer?.priceChange.toFixed(2)}%
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/5 border-white/10 hover:border-green-500/50 transition-all hover:transform hover:scale-[1.02] cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <TrendingDown className="w-5 h-5 text-red-400" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">
                      Worst Performer
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="text-2xl font-bold">
                        {worstPerformer?.symbol}
                      </div>
                      <Badge
                        variant="destructive"
                        className="bg-red-500/20 text-red-500"
                      >
                        {worstPerformer?.priceChange.toFixed(2)}%
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filters and Search */}
            <div className="bg-white/5 rounded-xl p-6 mb-8">
              <div className="flex flex-col md:flex-row justify-between gap-4 items-start md:items-center mb-6">
                <Tabs
                  defaultValue="all"
                  className="w-full md:w-auto"
                  onValueChange={setActiveTab}
                >
                  <TabsList className="bg-black/20 p-1">
                    <TabsTrigger
                      value="all"
                      className="data-[state=active]:bg-green-500"
                    >
                      All Tokens
                    </TabsTrigger>
                    <TabsTrigger
                      value="active"
                      className="data-[state=active]:bg-green-500"
                    >
                      Active
                    </TabsTrigger>
                    <TabsTrigger
                      value="locked"
                      className="data-[state=active]:bg-green-500"
                    >
                      Locked
                    </TabsTrigger>
                  </TabsList>
                </Tabs>

                <div className="flex w-full md:w-auto gap-2">
                  <div className="relative flex-1 md:w-64">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search tokens..."
                      className="pl-10 bg-black/20 border-white/10 focus:border-green-500/50 transition-colors"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        className="border-white/10 hover:border-green-500/50 transition-colors"
                      >
                        <Filter className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="bg-black/90 border-white/10"
                    >
                      <DropdownMenuLabel className="text-xs text-gray-400">
                        Filter By
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator className="bg-white/10" />
                      <DropdownMenuItem className="hover:bg-white/5">
                        Newest First
                      </DropdownMenuItem>
                      <DropdownMenuItem className="hover:bg-white/5">
                        Oldest First
                      </DropdownMenuItem>
                      <DropdownMenuItem className="hover:bg-white/5">
                        Highest Market Cap
                      </DropdownMenuItem>
                      <DropdownMenuItem className="hover:bg-white/5">
                        Most Holders
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Token Table */}
              <div className="rounded-lg overflow-hidden border border-white/10">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-white/10 bg-black/20">
                      <TableHead className="text-xs font-medium text-gray-400 uppercase">
                        Token
                      </TableHead>
                      <TableHead className="text-xs font-medium text-gray-400 uppercase">
                        Price
                      </TableHead>
                      {tokenTypeTab === "purchased" && (
                        <TableHead className="text-xs font-medium text-gray-400 uppercase">
                          Balance
                        </TableHead>
                      )}
                      <TableHead className="hidden text-xs font-medium text-gray-400 uppercase md:table-cell">
                        Market Cap
                      </TableHead>
                      <TableHead className="hidden text-xs font-medium text-gray-400 uppercase md:table-cell">
                        Holders
                      </TableHead>
                      <TableHead className="hidden text-xs font-medium text-gray-400 uppercase md:table-cell">
                        24h Volume
                      </TableHead>
                      <TableHead className="hidden text-xs font-medium text-gray-400 uppercase lg:table-cell">
                        Launch Date
                      </TableHead>
                      <TableHead className="hidden text-xs font-medium text-gray-400 uppercase lg:table-cell">
                        Chain
                      </TableHead>
                      <TableHead className="hidden text-xs font-medium text-gray-400 uppercase lg:table-cell">
                        Status
                      </TableHead>
                      <TableHead className="text-xs font-medium text-gray-400 uppercase">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTokens.map((token) => (
                      <TableRow
                        key={token.id}
                        className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer"
                        onClick={() => router.push(`/token/${token.symbol}`)}
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <img
                              src={token.imageUrl || "/placeholder.svg"}
                              alt={token.name}
                              className="w-10 h-10 rounded-full border border-white/10"
                            />
                            <div>
                              <div className="font-medium">{token.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {token.symbol}
                              </div>
                              <div className="text-xs text-gray-500 mt-0.5 max-w-[150px] truncate">
                                {token.description}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{token.price}</div>
                          <div
                            className={`text-sm flex items-center ${
                              token.priceChange >= 0
                                ? "text-green-500"
                                : "text-red-500"
                            }`}
                          >
                            {token.priceChange >= 0 ? (
                              <TrendingUp className="w-3 h-3 mr-1" />
                            ) : (
                              <TrendingDown className="w-3 h-3 mr-1" />
                            )}
                            {token.priceChange >= 0 ? "+" : ""}
                            {token.priceChange}%
                          </div>
                        </TableCell>
                        {tokenTypeTab === "purchased" && (
                          <TableCell>
                            <div className="font-medium">{token.balance}</div>
                            <div className="text-xs text-gray-500">
                              $
                              {(
                                parseFloat(token.balance) *
                                parseFloat(token.price)
                              ).toFixed(2)}
                            </div>
                          </TableCell>
                        )}
                        <TableCell className="hidden md:table-cell">
                          <div className="font-medium">{token.marketCap}</div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="font-medium">{token.holders}</div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="font-medium">{token.volume24h}</div>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <div className="font-medium">{token.launchDate}</div>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <Badge
                            variant="outline"
                            className="bg-black/40 border-white/20"
                          >
                            {getChainFromWallet()}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <Badge
                            variant={
                              token.status === "active"
                                ? "default"
                                : "secondary"
                            }
                            className={
                              token.status === "active"
                                ? "bg-green-500/20 text-green-500 hover:bg-green-500/30"
                                : "bg-gray-500/20 text-gray-400"
                            }
                          >
                            {token.status === "active" ? "Active" : "Locked"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-full"
                              >
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="end"
                              className="w-56 bg-black/90 border-white/10"
                            >
                              <DropdownMenuLabel className="text-xs text-gray-400">
                                Token Actions
                              </DropdownMenuLabel>
                              <DropdownMenuSeparator className="bg-white/10" />
                              <DropdownMenuItem className="flex items-center gap-2 text-sm cursor-pointer hover:bg-white/5">
                                <Rocket className="w-4 h-4 text-blue-400" />
                                <span>Boost Marketing</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem className="flex items-center gap-2 text-sm cursor-pointer hover:bg-white/5">
                                <Users className="w-4 h-4 text-purple-400" />
                                <span>View Holders</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem className="flex items-center gap-2 text-sm cursor-pointer hover:bg-white/5">
                                <DollarSign className="w-4 h-4 text-green-400" />
                                <span>Add Liquidity</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem className="flex items-center gap-2 text-sm cursor-pointer hover:bg-white/5">
                                <LinkIcon className="w-4 h-4 text-yellow-400" />
                                <span>View on Explorer</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem className="flex items-center gap-2 text-sm cursor-pointer hover:bg-white/5">
                                <Share2 className="w-4 h-4 text-sky-400" />
                                <span>Share Token</span>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator className="bg-white/10" />
                              <DropdownMenuItem className="flex items-center gap-2 text-sm cursor-pointer hover:bg-white/5">
                                <Settings className="w-4 h-4 text-gray-400" />
                                <span>Token Settings</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </AppLayout>
  );
}
