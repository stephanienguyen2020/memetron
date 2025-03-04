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
import {
  getTokens,
  getPriceForTokens,
  getPurchasedTokens,
  getTokenBalance,
} from "@/services/memecoin-launchpad";

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

  // Fetch user created tokens from blockchain
  useEffect(() => {
    const fetchCreatedTokens = async () => {
      try {
        setIsLoading(true);
        const tokens = await getTokens({ isCreator: true });
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

              const price = await getPriceForTokens(tokenSaleData, BigInt(1));
              tokenPrice = ethers.formatEther(price);
              console.log(`Token price for ${token.name}:`, tokenPrice);
            } catch (error) {
              console.error(
                `Error fetching price for token ${token.name}:`,
                error
              );
              // Set price to 0 on error
              tokenPrice = "0";
            }
          }

          return {
            id: token.token,
            name: token.name,
            symbol: token.name.substring(0, 4).toUpperCase(),
            description: token.description || "No description available",
            imageUrl: token.image || "/placeholder.svg",
            price: tokenPrice, // Use the actual price from the contract
            marketCap: (Number(token.raised) / 1e18).toFixed(2),
            priceChange: Math.random() * 20 - 10, // Random price change for now
            fundingRaised: token.raised.toString(),
            chain: "NEAR", // Default to ethereum, should be determined from the chain ID
            volume24h: "$" + (Math.random() * 100000).toFixed(2),
            holders: (Math.random() * 1000).toFixed(0).toString(),
            launchDate: new Date().toISOString().split("T")[0],
            status: token.isOpen ? "active" : "locked",
            type: "created",
          };
        });

        // Wait for all price fetching to complete
        const formattedTokens = await Promise.all(formattedTokensPromises);
        setCreatedTokens(formattedTokens);
      } catch (error) {
        console.error("Error fetching created tokens:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCreatedTokens();
  }, []);

  // Fetch purchased tokens
  useEffect(() => {
    const fetchPurchasedTokens = async () => {
      try {
        setIsLoading(true);
        const tokens = await getPurchasedTokens();
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
                metadataURI: token.image || "", // Use image URL as metadataURI
              };

              const price = await getPriceForTokens(tokenSaleData, BigInt(1));
              tokenPrice = ethers.formatEther(price);
              console.log(`Token price for ${token.name}:`, tokenPrice);
            } catch (error) {
              console.error(
                `Error fetching price for token ${token.name}:`,
                error
              );
              // Set price to 0 on error
              tokenPrice = "0";
            }
          }

          // Format the balance
          const balance =
            "balance" in token && token.balance !== undefined
              ? ethers.formatEther(token.balance as bigint)
              : "0";

          return {
            id: token.token,
            name: token.name,
            symbol: token.name.substring(0, 4).toUpperCase(),
            description: token.description || "No description available",
            imageUrl: token.image || "/placeholder.svg",
            price: tokenPrice, // Use the actual price from the contract
            marketCap: (Number(token.raised) / 1e18).toFixed(2),
            priceChange: Math.random() * 20 - 10, // Random price change for now
            fundingRaised: token.raised.toString(),
            chain: "NEAR", // Default to ethereum, should be determined from the chain ID
            volume24h: "$" + (Math.random() * 100000).toFixed(2),
            holders: (Math.random() * 1000).toFixed(0).toString(),
            launchDate: new Date().toISOString().split("T")[0],
            status: token.isOpen ? "active" : "locked",
            balance: balance,
            type: "purchased",
          };
        });

        // Wait for all price fetching to complete
        const formattedTokens = await Promise.all(formattedTokensPromises);
        setPurchasedTokens(formattedTokens);
      } catch (error) {
        console.error("Error fetching purchased tokens:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPurchasedTokens();
  }, []);

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

  return (
    <AppLayout>
      <main className="pt-6 pb-16">
        <div className="container max-w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-4"
          >
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-3xl font-bold">
                  My
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-500">
                    {" "}
                    Tokens
                  </span>
                </h1>
                <p className="text-muted-foreground">
                  Manage and monitor all your tokens
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Link href="/launch">
                  <Button className="gap-2">
                    <Plus className="w-4 h-4" />
                    Create New Token
                  </Button>
                </Link>
              </div>
            </div>

            {/* Token Type Tabs */}
            <div className="flex justify-center mb-6">
              <Tabs
                value={tokenTypeTab}
                onValueChange={setTokenTypeTab}
                className="w-full max-w-md"
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger
                    value="created"
                    className="flex items-center gap-2"
                  >
                    <Rocket className="w-4 h-4" />
                    Created Tokens
                  </TabsTrigger>
                  <TabsTrigger
                    value="purchased"
                    className="flex items-center gap-2"
                  >
                    <Wallet className="w-4 h-4" />
                    Purchased Tokens
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
              <Card className="overflow-hidden border-white/10 bg-black/60 backdrop-blur-xl">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <Rocket className="w-5 h-5 text-sky-400" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Total Tokens
                    </p>
                    <div className="flex items-baseline gap-2">
                      <p className="text-2xl font-bold">{tokens.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="overflow-hidden border-white/10 bg-black/60 backdrop-blur-xl">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <Users className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Total Holders
                    </p>
                    <div className="flex items-baseline gap-2">
                      <p className="text-2xl font-bold">3,617</p>
                      <span className="text-green-500">+12.5%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="overflow-hidden border-white/10 bg-black/60 backdrop-blur-xl">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <DollarSign className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Total Volume
                    </p>
                    <div className="flex items-baseline gap-2">
                      <p className="text-2xl font-bold">
                        ${totalVolume.toLocaleString()}
                      </p>
                      <span className="text-green-500">+8.3%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="overflow-hidden border-white/10 bg-black/60 backdrop-blur-xl">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <TrendingUp className="w-5 h-5 text-yellow-400" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">24h Volume</p>
                    <div className="flex items-baseline gap-2">
                      <p className="text-2xl font-bold">$155,840</p>
                      <span className="text-red-500">-3.2%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="overflow-hidden border-white/10 bg-black/60 backdrop-blur-xl xl:col-span-1">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <TrendingUp className="w-5 h-5 text-green-400" />
                    <p className="text-base font-medium">Best Performer</p>
                  </div>
                  <div className="mt-2">
                    <div className="flex items-center gap-2">
                      <div className="text-xl font-bold">
                        {bestPerformer?.symbol}
                      </div>
                      <Badge
                        variant="default"
                        className="text-green-500 bg-green-500/20"
                      >
                        +{bestPerformer?.priceChange.toFixed(2)}%
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">24h change</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="overflow-hidden border-white/10 bg-black/60 backdrop-blur-xl xl:col-span-1">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <TrendingDown className="w-5 h-5 text-red-400" />
                    <p className="text-base font-medium">Worst Performer</p>
                  </div>
                  <div className="mt-2">
                    <div className="flex items-center gap-2">
                      <div className="text-xl font-bold">
                        {worstPerformer?.symbol}
                      </div>
                      <Badge
                        variant="destructive"
                        className="text-red-500 bg-red-500/20"
                      >
                        {worstPerformer?.priceChange.toFixed(2)}%
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">24h change</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
              <Tabs
                defaultValue="all"
                className="w-full"
                onValueChange={setActiveTab}
              >
                <TabsList>
                  <TabsTrigger value="all">All Tokens</TabsTrigger>
                  <TabsTrigger value="active">Active</TabsTrigger>
                  <TabsTrigger value="locked">Locked</TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="flex w-full gap-2 md:w-auto">
                <div className="relative flex-1 md:w-64">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search tokens..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon">
                      <Filter className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Filter By</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Newest First</DropdownMenuItem>
                    <DropdownMenuItem>Oldest First</DropdownMenuItem>
                    <DropdownMenuItem>Highest Market Cap</DropdownMenuItem>
                    <DropdownMenuItem>Most Holders</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <Card className="border-white/10 bg-black/60 backdrop-blur-xl">
              <CardHeader>
                <CardTitle>
                  {tokenTypeTab === "created"
                    ? "Your Created Tokens"
                    : "Your Purchased Tokens"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-white/10">
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
                        className="transition-colors border-b border-white/5 hover:bg-white/5"
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <img
                              src={token.imageUrl || "/placeholder.svg"}
                              alt={token.name}
                              className="w-10 h-10 border rounded-full border-white/10"
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
                            className="px-2 py-1 bg-black/40 border-white/20"
                          >
                            {token.chain}
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
                                className="w-8 h-8 rounded-full"
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
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
    </AppLayout>
  );
}
