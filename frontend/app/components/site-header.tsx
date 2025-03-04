"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { NavigationMenu, NavItem } from "@/app/components/ui/navigation-menu";
import {
  Search,
  LineChart,
  Swords,
  TrendingUp,
  Users,
  Rocket,
  Target,
  Settings2,
} from "lucide-react";
import { useState, useEffect, useMemo, useCallback } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { useWallet } from "../providers/WalletProvider";

// Simple connect button component that uses the standard ConnectButton
const SimpleConnectButton = () => {
  return <ConnectButton />;
};

export function SiteHeader() {
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userAddress, setUserAddress] = useState<string | null>(null);

  // Use wagmi account hook
  const { address, isConnected } = useAccount();

  // Use our wallet context
  const { disconnect } = useWallet();

  // Load authentication state and user data from localStorage on component mount
  useEffect(() => {
    // Check if connected via wagmi
    if (isConnected && address) {
      setIsAuthenticated(true);
      setUserAddress(address);
      return;
    }

    // Clear authentication if disconnected
    if (!isConnected) {
      setIsAuthenticated(false);
      setUserAddress(null);
      return;
    }

    // Only check localStorage if wagmi isn't connected
    const savedAuth = localStorage.getItem("isAuthenticated");
    const savedAddress = localStorage.getItem("userAddress");

    if (savedAuth === "true" && savedAddress) {
      setIsAuthenticated(true);
      setUserAddress(savedAddress);
    } else {
      setIsAuthenticated(false);
      setUserAddress(null);
    }
  }, [isConnected, address]);

  const publicMenuItems = useMemo(
    (): NavItem[] => [
      { label: "Marketcap", href: "/marketcap", icon: LineChart },
      { label: "Marketplace", href: "/marketplace", icon: Search },
      { label: "Bets", href: "/bets", icon: Swords },
    ],
    []
  );

  // Additional menu items for authenticated users
  const authenticatedMenuItems = useMemo(
    (): NavItem[] => [
      { label: "Launch Tokens", href: "/launch", icon: Rocket },
      { label: "Create Bets", href: "/bets/create", icon: Target },
      { label: "Quick Swap", href: "/dashboard/quick-swap", icon: LineChart },
    ],
    []
  );

  // Memoize the combined menu items to prevent recreation on every render
  const menuItems = useMemo(
    () => [
      ...publicMenuItems,
      ...(isAuthenticated ? authenticatedMenuItems : []),
    ],
    [publicMenuItems, authenticatedMenuItems, isAuthenticated]
  );

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
    >
      <div className="flex h-20 items-center px-4 md:px-6 lg:px-8 w-full">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-500"
            >
              HedgeFi
            </motion.span>
          </Link>

          <NavigationMenu items={menuItems} />
        </div>

        <div className="ml-auto">
          <div className="flex items-center space-x-4">
            <SimpleConnectButton />
          </div>
        </div>
      </div>
    </motion.header>
  );
}
