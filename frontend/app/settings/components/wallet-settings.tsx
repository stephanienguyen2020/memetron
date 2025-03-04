"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { Loader2, Wallet } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useBettingService } from "@/services/BettingService";
import { ethers } from "ethers";

export function WalletSettings() {
  const { address, isConnected, isConnecting } = useAccount();
  const bettingService = useBettingService();
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [twitterHandle, setTwitterHandle] = useState("");
  const [isDepositing, setIsDepositing] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [betCredits, setBetCredits] = useState<string>("0");
  const [isMounted, setIsMounted] = useState(false);

  // Handle mounting
  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  // Fetch bet credits when mounted and address changes
  useEffect(() => {
    let mounted = true;

    const fetchBetCredits = async () => {
      if (!isMounted || !address) return;

      try {
        const credits = await bettingService.getUserBetCredits(address);
        if (mounted) {
          setBetCredits(ethers.formatEther(credits));
        }
      } catch (error) {
        console.error("Error fetching bet credits:", error);
        if (mounted) {
          setBetCredits("0");
        }
      }
    };

    fetchBetCredits();

    return () => {
      mounted = false;
    };
  }, [address, isMounted, bettingService]);

  // Show loading state during initial hydration or connection
  if (!isMounted || isConnecting) {
    return (
      <div className="space-y-6">
        <Card className="border-white/10 bg-black/50 backdrop-blur-xl">
          <CardContent className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleDeposit = async () => {
    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    setIsDepositing(true);
    try {
      const tx = await bettingService.buyBetCredits(depositAmount);
      toast.success(
        `Successfully deposited ${depositAmount} ETH worth of bet credits`
      );
      setDepositAmount("");

      // Refresh bet credits with cleanup
      const mounted = true;
      try {
        if (address) {
          const credits = await bettingService.getUserBetCredits(address);
          if (mounted) {
            setBetCredits(ethers.formatEther(credits));
          }
        }
      } catch (error) {
        console.error("Error refreshing bet credits:", error);
      }
    } catch (error: any) {
      console.error("Error depositing funds:", error);
      toast.error(error.message || "Failed to deposit funds");
    } finally {
      setIsDepositing(false);
    }
  };

  const handleWithdraw = async () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    setIsWithdrawing(true);
    try {
      const tx = await bettingService.withdrawCredits(withdrawAmount);
      toast.success(
        `Successfully withdrew ${withdrawAmount} ETH worth of bet credits`
      );
      setWithdrawAmount("");

      // Refresh bet credits with cleanup
      const mounted = true;
      try {
        if (address) {
          const credits = await bettingService.getUserBetCredits(address);
          if (mounted) {
            setBetCredits(ethers.formatEther(credits));
          }
        }
      } catch (error) {
        console.error("Error refreshing bet credits:", error);
      }
    } catch (error: any) {
      console.error("Error withdrawing funds:", error);
      toast.error(error.message || "Failed to withdraw funds");
    } finally {
      setIsWithdrawing(false);
    }
  };

  const handleRegisterTwitter = async () => {
    if (!twitterHandle) {
      toast.error("Please enter a valid Twitter handle");
      return;
    }

    setIsRegistering(true);
    try {
      const tx = await bettingService.registerTwitterHandle(twitterHandle);
      toast.success(`Successfully registered Twitter handle: ${twitterHandle}`);
      setTwitterHandle("");
    } catch (error: any) {
      console.error("Error registering Twitter handle:", error);
      toast.error(error.message || "Failed to register Twitter handle");
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Wallet Settings</h3>
        <p className="text-sm text-muted-foreground">
          Manage your bet credits and wallet connection for HedgeFi.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-white/10 bg-black/50 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              Wallet & Bet Credits
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isConnected ? (
              <div className="space-y-4">
                <div className="p-4 bg-white/5 rounded-lg">
                  <div className="text-sm text-muted-foreground mb-1">
                    Your Bet Credits
                  </div>
                  <div className="text-2xl font-medium font-mono">
                    {betCredits} ETH
                  </div>
                </div>

                <div className="p-4 bg-white/5 rounded-lg">
                  <div className="text-sm text-muted-foreground mb-1">
                    Connected Address
                  </div>
                  <div className="text-sm font-medium font-mono break-all">
                    {address}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-medium">Buy Bet Credits</div>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      className="flex-1"
                      min="0"
                      step="0.01"
                      placeholder="Amount in ETH"
                    />
                    <Button
                      onClick={handleDeposit}
                      disabled={isDepositing}
                      className="whitespace-nowrap"
                    >
                      {isDepositing && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Buy Credits
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-medium">
                    Withdraw Bet Credits
                  </div>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      className="flex-1"
                      min="0"
                      step="0.01"
                      placeholder="Amount in ETH"
                    />
                    <Button
                      onClick={handleWithdraw}
                      disabled={isWithdrawing}
                      variant="outline"
                      className="whitespace-nowrap"
                    >
                      {isWithdrawing && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Withdraw
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-medium">
                    Register Twitter Handle
                  </div>
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      value={twitterHandle}
                      onChange={(e) => setTwitterHandle(e.target.value)}
                      className="flex-1"
                      placeholder="@username"
                    />
                    <Button
                      onClick={handleRegisterTwitter}
                      disabled={isRegistering}
                      className="whitespace-nowrap"
                    >
                      {isRegistering && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Register
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Connect your wallet to manage your bet credits and create
                  predictions.
                </p>
                <Button onClick={() => {}} className="w-full">
                  Connect Wallet
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-black/50 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              Transaction History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                View your recent bet credit transactions.
              </p>

              {/* This would be populated with actual transaction data */}
              <div className="rounded-md border border-white/10 overflow-hidden">
                <div className="bg-white/5 p-3 text-sm font-medium">
                  Recent Transactions
                </div>
                <div className="p-4 text-sm text-center text-muted-foreground">
                  No transactions yet
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
