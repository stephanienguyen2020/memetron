"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Share2, Twitter, CheckCircle2, XCircle, Trophy } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { TimeLeft } from "./time-left";
import { cn } from "@/lib/utils";

interface Bet {
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

export function BetCard({ bet }: { bet: Bet }) {
  const formattedDate = new Date(bet.endDate).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  // Calculate payout multiplier for winning side
  const winningPayout =
    bet.result === "yes"
      ? (bet.totalPool / bet.yesPool).toFixed(2)
      : (bet.totalPool / bet.noPool).toFixed(2);

  return (
    <motion.div whileHover={{ y: -5 }} className="group h-full">
      <Card className="overflow-hidden border-white/10 bg-black flex flex-col h-full">
        {/* Image */}
        <div className="relative h-48 flex-shrink-0">
          <Image
            src={
              bet.image && bet.image.startsWith("http")
                ? bet.image
                : "/placeholder.svg"
            }
            alt={bet.title}
            fill
            className="object-cover"
            onError={(e) => {
              console.error(`Error loading image for bet ${bet.id}:`, e);
              // Set fallback image
              e.currentTarget.src = "/placeholder.svg";
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
          <div className="absolute top-4 left-4">
            <Badge
              variant="outline"
              className="bg-black/90 backdrop-blur-sm border-white/10 text-white"
            >
              {bet.category}
            </Badge>
          </div>
          {bet.isResolved && (
            <div className="absolute top-4 right-4">
              <Badge
                variant="outline"
                className={cn(
                  "backdrop-blur-sm border-white/10",
                  bet.result === "yes"
                    ? "bg-green-500/20 text-green-500"
                    : "bg-red-500/20 text-red-500"
                )}
              >
                Resolved
              </Badge>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col flex-grow">
          <h3 className="text-lg font-semibold text-white mb-4 h-14 line-clamp-2 overflow-hidden">
            {bet.title}
          </h3>

          <div className="space-y-4 flex-grow flex flex-col justify-between">
            {/* Pool Distribution */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span
                  className={cn(
                    "flex items-center gap-1",
                    bet.isResolved
                      ? bet.result === "yes"
                        ? "text-green-400 font-medium"
                        : "text-gray-400"
                      : "text-green-400"
                  )}
                >
                  Yes {(bet.yesProbability * 100).toFixed(0)}%
                  {bet.isResolved && bet.result === "yes" && (
                    <CheckCircle2 className="h-4 w-4" />
                  )}
                </span>
                <span
                  className={cn(
                    "flex items-center gap-1",
                    bet.isResolved
                      ? bet.result === "no"
                        ? "text-red-400 font-medium"
                        : "text-gray-400"
                      : "text-red-400"
                  )}
                >
                  {bet.isResolved && bet.result === "no" && (
                    <XCircle className="h-4 w-4" />
                  )}
                  No {(bet.noProbability * 100).toFixed(0)}%
                </span>
              </div>
              <div className="relative h-2 overflow-hidden rounded-full bg-white/5">
                <div
                  className={cn(
                    "absolute inset-y-0 left-0",
                    bet.isResolved
                      ? "bg-white/20"
                      : "bg-gradient-to-r from-sky-400 to-blue-500"
                  )}
                  style={{ width: `${bet.yesProbability * 100}%` }}
                />
              </div>
            </div>

            {/* Pool Info */}
            <div className="flex items-center justify-between text-sm">
              <div>
                <span className="text-gray-400">Total Pool</span>
                <div className="font-medium font-mono text-white">
                  ${bet.totalPool.toLocaleString()}
                </div>
              </div>
              {bet.isResolved ? (
                <div className="text-sm text-gray-400">
                  Ended {formattedDate}
                </div>
              ) : (
                <TimeLeft endDate={bet.endDate} />
              )}
            </div>

            {/* Actions or Results */}
            <div className="mt-auto">
              {bet.isResolved ? (
                <div className="space-y-3">
                  {/* Result Banner */}
                  <div
                    className={cn(
                      "flex items-center gap-2 p-3 rounded-lg border",
                      bet.result === "yes"
                        ? "bg-green-500/10 border-green-500/20 text-green-500"
                        : "bg-red-500/10 border-red-500/20 text-red-500"
                    )}
                  >
                    <Trophy className="h-5 w-5" />
                    <div className="flex-1">
                      <span className="font-medium">
                        {bet.result === "yes" ? "Yes" : "No"} was correct
                      </span>
                      <div className="text-sm opacity-90">
                        {bet.result === "yes"
                          ? `${(bet.yesProbability * 100).toFixed(
                              0
                            )}% predicted correctly`
                          : `${(bet.noProbability * 100).toFixed(
                              0
                            )}% predicted correctly`}
                        {" • "}
                        {Number(winningPayout)}x payout
                      </div>
                    </div>
                  </div>

                  {/* Share Results */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      className="flex-1 border-white/10"
                    >
                      View Details
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="border-white/10"
                    >
                      <Twitter className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="border-white/10"
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 pt-2">
                  <Link
                    href={`/bets/place-bet?id=${bet.id}`}
                    className="flex-1"
                  >
                    <Button className="w-full bg-gradient-to-r from-sky-400 to-blue-500">
                      Place Bet
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="icon"
                    className="border-white/10"
                  >
                    <Twitter className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="border-white/10"
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
