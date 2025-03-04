"use client";

import { motion } from "framer-motion";
import { AppLayout } from "../../components/app-layout";
import GridBackground from "../../components/GridBackground";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DashboardOverview } from "./components/dashboard-overview";
import { AutoShillSettings } from "./components/auto-shill-settings";
import { ReplyAutomation } from "./components/reply-automation";
import { AICustomization } from "./components/ai-customization";
import { ConversationTracking } from "./components/conversation-tracking";
import { LogsAnalytics } from "./components/logs-analytics";
import { Badge } from "@/components/ui/badge";
import {
  Bot,
  Settings,
  MessageSquare,
  Wand2,
  Users,
  BarChart2,
} from "lucide-react";

export default function ShillManagerPage() {
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
              AI Shill Manager
            </Badge>
            <h1 className="text-4xl font-bold">
              Automate Your{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-500">
                Meme Coin Marketing
              </span>
            </h1>
            <p className="text-muted-foreground max-w-2xl">
              Let AI handle your social media presence while you focus on
              building. Our advanced shill bot uses natural language processing
              to engage with your community and promote your token.
            </p>
          </div>
        </motion.div>

        {/* Main Content */}
        <Tabs defaultValue="dashboard" className="space-y-8">
          <TabsList className="grid grid-cols-2 lg:grid-cols-6 gap-4">
            <TabsTrigger value="dashboard" className="gap-2">
              <Bot className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="h-4 w-4" />
              Auto-Shill
            </TabsTrigger>
            <TabsTrigger value="automation" className="gap-2">
              <MessageSquare className="h-4 w-4" />
              Replies
            </TabsTrigger>
            <TabsTrigger value="ai" className="gap-2">
              <Wand2 className="h-4 w-4" />
              AI Config
            </TabsTrigger>
            <TabsTrigger value="conversations" className="gap-2">
              <Users className="h-4 w-4" />
              Tracking
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2">
              <BarChart2 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-4">
            <DashboardOverview />
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <AutoShillSettings />
          </TabsContent>

          <TabsContent value="automation" className="space-y-4">
            <ReplyAutomation />
          </TabsContent>

          <TabsContent value="ai" className="space-y-4">
            <AICustomization />
          </TabsContent>

          <TabsContent value="conversations" className="space-y-4">
            <ConversationTracking />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <LogsAnalytics />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
