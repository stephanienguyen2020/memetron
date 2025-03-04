"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  ChevronDown,
  ChevronRight,
  LayoutDashboard,
  Wallet,
  Dices,
  Coins,
  Share2,
  Bot,
  Settings,
  Search,
  MessageSquare,
  Clock,
  Bookmark,
  Plus,
} from "lucide-react";

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  href?: string;
  hasSubItems?: boolean;
  isActive?: boolean;
  isExpanded?: boolean;
  onToggle?: () => void;
}

const NavItem = ({
  icon,
  label,
  href,
  hasSubItems = false,
  isActive = false,
  isExpanded = false,
  onToggle,
}: NavItemProps) => {
  const router = useRouter();

  // Handle click on the main part of the nav item
  const handleMainClick = (e: React.MouseEvent) => {
    if (href) {
      router.push(href);
    }
    // If it has sub-items, also toggle the expansion
    if (hasSubItems && onToggle) {
      onToggle();
    }
  };

  // Handle click on the dropdown icon
  const handleToggleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onToggle) {
      onToggle();
    }
  };

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors cursor-pointer ${
        isActive
          ? "bg-gradient-to-r from-sky-500/20 to-blue-500/10 text-white"
          : "hover:bg-white/5 text-gray-300 hover:text-white"
      }`}
    >
      <div className="flex items-center flex-1" onClick={handleMainClick}>
        <span className="text-blue-400 mr-3">{icon}</span>
        <span>{label}</span>
      </div>
      {hasSubItems && (
        <span
          className="text-gray-500 hover:text-gray-300 p-1 rounded-full hover:bg-white/10"
          onClick={handleToggleClick}
        >
          {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </span>
      )}
    </div>
  );
};

interface SubNavItemProps {
  label: string;
  href: string;
  isActive?: boolean;
}

const SubNavItem = ({ label, href, isActive = false }: SubNavItemProps) => {
  return (
    <Link
      href={href}
      className={`flex items-center pl-11 pr-4 py-2 rounded-lg transition-colors ${
        isActive
          ? "bg-white/10 text-white"
          : "hover:bg-white/5 text-gray-400 hover:text-white"
      }`}
    >
      {label}
    </Link>
  );
};

interface ChatHistoryItemProps {
  title: string;
  date: string;
  href: string;
}

const ChatHistoryItem = ({ title, date, href }: ChatHistoryItemProps) => {
  return (
    <Link
      href={href}
      className="flex flex-col gap-1 pl-11 pr-4 py-2 rounded-lg hover:bg-white/5 transition-colors"
    >
      <span className="text-sm text-gray-300 truncate">{title}</span>
      <span className="text-xs text-gray-500 flex items-center gap-1">
        <Clock size={12} />
        {date}
      </span>
    </Link>
  );
};

export function SiteLeftbar() {
  const pathname = usePathname();
  const [activeSection, setActiveSection] = useState("dashboard");
  const [expandedSections, setExpandedSections] = useState<string[]>([
    "dashboard",
  ]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check authentication status
  useEffect(() => {
    const checkAuth = () => {
      const savedAuth = localStorage.getItem("isAuthenticated");
      setIsAuthenticated(savedAuth === "true");
    };

    // Check on initial load
    checkAuth();

    // Listen for storage changes (for cross-tab synchronization)
    window.addEventListener("storage", checkAuth);

    return () => {
      window.removeEventListener("storage", checkAuth);
    };
  }, []);

  // Determine active section and expanded sections based on current path
  useEffect(() => {
    if (pathname === "/" || pathname.includes("/dashboard")) {
      setActiveSection("dashboard");
      if (!expandedSections.includes("dashboard")) {
        setExpandedSections((prev) => [...prev, "dashboard"]);
      }
    } else if (
      pathname.includes("/chatbot") ||
      pathname.includes("/hedge-bot")
    ) {
      setActiveSection("hedge-bot");
      if (!expandedSections.includes("hedge-bot")) {
        setExpandedSections((prev) => [...prev, "hedge-bot"]);
      }
    } else if (pathname.includes("/coins")) {
      setActiveSection("coins");
      if (!expandedSections.includes("coins")) {
        setExpandedSections((prev) => [...prev, "coins"]);
      }
    } else if (pathname.includes("/settings")) {
      setActiveSection("settings");
    } else if (pathname.includes("/watchlist")) {
      setActiveSection("watchlist");
    }
  }, [pathname, expandedSections]);

  const toggleSection = (section: string) => {
    setActiveSection(section);

    // Toggle the expanded state
    if (expandedSections.includes(section)) {
      setExpandedSections(expandedSections.filter((s) => s !== section));
    } else {
      setExpandedSections([...expandedSections, section]);
    }
  };

  // Mock chat history data
  const chatHistory = [
    { title: "Meme coin analysis", date: "2h ago", href: "/chatbot" },
    {
      title: "Market trends research",
      date: "Yesterday",
      href: "/chatbot",
    },
    {
      title: "Portfolio optimization",
      date: "3 days ago",
      href: "/chatbot",
    },
    { title: "Risk assessment", date: "1 week ago", href: "/chatbot" },
    {
      title: "Token launch strategy",
      date: "2 weeks ago",
      href: "/chatbot",
    },
  ];

  // If not authenticated, don't render the sidebar
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="h-full overflow-y-auto bg-gray-900/50 backdrop-blur-sm border-r border-green-500/10 py-4">
      <nav className="space-y-1 px-2 pb-20">
        {/* Dashboard Section */}
        <NavItem
          icon={<LayoutDashboard size={20} />}
          label="Dashboard"
          href="/dashboard"
          hasSubItems={true}
          isActive={activeSection === "dashboard"}
          isExpanded={expandedSections.includes("dashboard")}
          onToggle={() => toggleSection("dashboard")}
        />

        <AnimatePresence>
          {expandedSections.includes("dashboard") && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="pt-1 pb-1">
                <SubNavItem
                  label="My Portfolio"
                  href="/dashboard/portfolio"
                  isActive={pathname === "/dashboard/portfolio"}
                />
                <SubNavItem
                  label="Quick Swap"
                  href="/dashboard/quick-swap"
                  isActive={pathname === "/dashboard/quick-swap"}
                />
                <SubNavItem
                  label="My Bets"
                  href="/dashboard/my-bets"
                  isActive={pathname === "/dashboard/my-bets"}
                />
                <SubNavItem
                  label="My Tokens"
                  href="/dashboard/my-tokens"
                  isActive={pathname === "/dashboard/my-tokens"}
                />
                <SubNavItem
                  label="Shill Manager"
                  href="/dashboard/shill-manager"
                  isActive={pathname === "/dashboard/shill-manager"}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hedge Bot Section */}
        <NavItem
          icon={<Bot size={20} />}
          label="Hedge Bot"
          href="/chatbot"
          hasSubItems={true}
          isActive={activeSection === "hedge-bot"}
          isExpanded={expandedSections.includes("hedge-bot")}
          onToggle={() => toggleSection("hedge-bot")}
        />

        <AnimatePresence>
          {expandedSections.includes("hedge-bot") && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="pt-1 pb-1">
                {/* Search Bar */}
                <div className="px-4 py-2">
                  <div className="relative">
                    <Search
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                      size={16}
                    />
                    <input
                      type="text"
                      placeholder="Search conversations..."
                      className="w-full bg-gray-800/50 border border-gray-700 rounded-lg py-2 pl-9 pr-3 text-sm text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* New Chat Button */}
                <div className="px-4 py-2">
                  <Link href={`/chatbot?new=true&t=${Date.now()}`}>
                    <Button
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2"
                      size="sm"
                    >
                      <Plus size={16} />
                      <span>New Chat</span>
                    </Button>
                  </Link>
                </div>

                {/* Chat History */}
                <div className="mt-2">
                  <div className="flex items-center justify-between px-4 py-2">
                    <span className="text-xs font-medium text-gray-500 uppercase">
                      Recent Chats
                    </span>
                  </div>
                  <div className="space-y-1">
                    {chatHistory.slice(0, 5).map((chat, index) => (
                      <ChatHistoryItem
                        key={index}
                        title={chat.title}
                        date={chat.date}
                        href={chat.href}
                      />
                    ))}
                    {chatHistory.length > 5 && (
                      <Link
                        href="/chatbot/history"
                        className="flex items-center justify-center py-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        View more
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        {/* Watchlist */}
        <NavItem
          icon={<Bookmark size={20} />}
          label="Watchlist"
          href="/watchlist"
          isActive={activeSection === "watchlist"}
          onToggle={() => setActiveSection("watchlist")}
        />
        {/* Settings */}
        <NavItem
          icon={<Settings size={20} />}
          label="Settings"
          href="/settings"
          isActive={activeSection === "settings"}
          onToggle={() => setActiveSection("settings")}
        />
      </nav>
    </div>
  );
}
