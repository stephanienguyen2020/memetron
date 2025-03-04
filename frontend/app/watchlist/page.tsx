"use client";

import { motion } from "framer-motion";
import { AppLayout } from "../components/app-layout";
import GridBackground from "../components/GridBackground";
import { MemeCoinMarketCap } from "../components/MemeCoinMarketCap";

export default function WatchlistPage() {
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
          <h1 className="text-4xl font-bold mb-8">
            Your{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-500">
              Watchlist
            </span>
          </h1>
          <MemeCoinMarketCap watchlistOnly={true} />
        </motion.div>
      </div>
    </AppLayout>
  );
}
