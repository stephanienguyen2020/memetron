"use client";

import { motion } from "framer-motion";
import { AppLayout } from "../components/app-layout";
import GridBackground from "../components/GridBackground";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileSettings } from "./components/profile-settings";
import { SocialSettings } from "./components/social-settings";
import { NotificationSettings } from "./components/notification-settings";
import { SecuritySettings } from "./components/security-settings";
import { AISettings } from "./components/ai-settings";
import { PreferenceSettings } from "./components/preference-settings";
import { WalletSettings } from "./components/wallet-settings";
import {
  User,
  Share2,
  Bell,
  Shield,
  Bot,
  Settings2,
  Wallet,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAccount } from "wagmi";
import { useWallet } from "../providers/WalletProvider";
import { useEffect, useState } from "react";

export default function SettingsPage() {
  const { address, isConnected } = useAccount();
  const { isAuthenticated } = useWallet();
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  // Update wallet address when connection status changes
  useEffect(() => {
    if (isConnected && address) {
      setWalletAddress(address);
    } else {
      // Try to get from localStorage as fallback
      const savedAddress = localStorage.getItem("userAddress");
      setWalletAddress(savedAddress);
    }
  }, [isConnected, address]);

  return (
    <AppLayout showFooter={false}>
      <GridBackground />
      <div className="container max-w-7xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex flex-col gap-4">
            <Badge
              variant="outline"
              className="w-fit bg-sky-500/10 text-sky-500 border-sky-500/20"
            >
              Settings & Preferences
            </Badge>
            <h1 className="text-4xl font-bold">
              Account{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-500">
                Settings
              </span>
            </h1>
            <p className="text-muted-foreground max-w-2xl">
              Customize your HedgeFi experience, manage integrations, and
              configure security preferences.
            </p>

            {/* Connected Wallet Display */}
            {walletAddress && (
              <div className="flex items-center gap-2 mt-2 p-3 rounded-md bg-sky-500/10 border border-sky-500/20 w-fit">
                <Wallet className="h-4 w-4 text-sky-500" />
                <span className="text-sm font-medium">Connected Wallet:</span>
                <span className="text-sm text-muted-foreground">
                  {walletAddress.substring(0, 6)}...
                  {walletAddress.substring(walletAddress.length - 4)}
                </span>
              </div>
            )}
          </div>
        </motion.div>

        {/* Settings Tabs */}
        <Tabs defaultValue="profile" className="space-y-8">
          <TabsList className="grid grid-cols-2 lg:grid-cols-7 gap-4">
            <TabsTrigger value="profile" className="gap-2">
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="wallet" className="gap-2">
              <Wallet className="h-4 w-4" />
              Wallet
            </TabsTrigger>
            <TabsTrigger value="social" className="gap-2">
              <Share2 className="h-4 w-4" />
              Social
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2">
              <Bell className="h-4 w-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-2">
              <Shield className="h-4 w-4" />
              Security
            </TabsTrigger>
            <TabsTrigger value="ai" className="gap-2">
              <Bot className="h-4 w-4" />
              AI Settings
            </TabsTrigger>
            <TabsTrigger value="preferences" className="gap-2">
              <Settings2 className="h-4 w-4" />
              Preferences
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <ProfileSettings />
          </TabsContent>

          <TabsContent value="wallet">
            <WalletSettings />
          </TabsContent>

          <TabsContent value="social">
            <SocialSettings />
          </TabsContent>

          <TabsContent value="notifications">
            <NotificationSettings />
          </TabsContent>

          <TabsContent value="security">
            <SecuritySettings />
          </TabsContent>

          <TabsContent value="ai">
            <AISettings />
          </TabsContent>

          <TabsContent value="preferences">
            <PreferenceSettings />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
