"use client";

import { motion } from "framer-motion";
import { AppLayout } from "../../components/app-layout";
import GridBackground from "../../components/GridBackground";
import { PortfolioOverview } from "./components/portfolio-overview";
import { PortfolioChart } from "./components/portfolio-chart";
import { AssetTable } from "./components/asset-table";
import { QuickActions } from "./components/quick-actions";
import { PortfolioAnalytics } from "./components/portfolio-analytics";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useState } from "react";

export default function PortfolioPage() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <AppLayout>
      <GridBackground />
      <div className="container max-w-7xl pt-10 mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold">
            Portfolio{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-[#00ff00]">
              Overview
            </span>
          </h1>
          <p className="text-muted-foreground">
            Track and manage your crypto assets
          </p>
        </motion.div>

        <div className="flex items-center justify-between mb-4">
          <QuickActions />
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search assets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
        <AssetTable searchQuery={searchQuery} />
      </div>
    </AppLayout>
  );
}
