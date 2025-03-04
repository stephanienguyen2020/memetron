"use client";

import { motion } from "framer-motion";
import { AppLayout } from "../components/app-layout";
import GridBackground from "../components/GridBackground";
import { MemeCoinMarketCap } from "../components/MemeCoinMarketCap";
import { fetchTrendingTokens } from "@/app/lib/coins";
import { useState, useEffect } from "react";
import { TrendingCoin } from "@/app/types/coins";

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
}

function Sparkline({
  data,
  width = 60,
  height = 20,
  color = "#4ade80",
}: SparklineProps) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min;
  const points = data
    .map(
      (value, index) =>
        `${(index / (data.length - 1)) * width},${
          height - ((value - min) / range) * height
        }`
    )
    .join(" ");

  return (
    <svg width={width} height={height}>
      <polyline fill="none" stroke={color} strokeWidth="1" points={points} />
    </svg>
  );
}

export default function MarketcapPage(): JSX.Element {
  const [trendingCoins, setTrendingCoins] = useState<TrendingCoin[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTrendingTokensData = async () => {
      try {
        setIsLoading(true);
        const tokens = await fetchTrendingTokens();
        console.log("returned", tokens);
        const updatedCoins: TrendingCoin[] = tokens.map((token) => ({
          name: token.name,
          price: token.price,
          volume_24h: token.volume_24h,
          symbol: token.symbol,
          change: `${
            token.price_change_24h >= 0 ? "+" : ""
          }${token.price_change_24h.toFixed(2)}%`,
          marketCap: token.marketcap?.toString() || "0",
          volume: token.volume_24h.toString(),
          image: token.image_url,
          address: token.address,
          listed: "Recently",
          sparklineData: [1, 1, 1, 1, 1, 1, 1],
          holders: `${token.active_users_24h}`,
          transactions: `${token.transactions_24h}`,
        }));
        setTrendingCoins(updatedCoins);
        console.log("data", updatedCoins);
      } catch (error) {
        console.error("Error fetching trending tokens:", error);
        // setTrendingCoins(exampleTrendingCoins);
      } finally {
        setIsLoading(false);
      }
    };

    // Fetch immediately on mount
    fetchTrendingTokensData();

    // Set up interval to fetch every minute
    const interval = setInterval(fetchTrendingTokensData, 60000);

    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, []);

  return (
    <AppLayout showFooter={false}>
      <GridBackground />
      <div className="relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="container py-8"
        >
          <h1 className="mb-2 text-4xl font-bold">
            Today's Meme Coin Prices by{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-500">
              Market Cap
            </span>
          </h1>
          <p className="mb-8 text-muted-foreground">
            Track and analyze the latest meme coins across multiple chains
          </p>
          <MemeCoinMarketCap coins={trendingCoins} />
        </motion.div>
      </div>
    </AppLayout>
  );
}
