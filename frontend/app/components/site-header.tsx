"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
  Wallet,
} from "lucide-react";
import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { useWallet } from "../providers/WalletProvider";

// Matrix-style text scramble effect for the logo
class TextScramble {
  el: HTMLElement;
  chars: string;
  queue: Array<{
    from: string;
    to: string;
    start: number;
    end: number;
    char?: string;
  }>;
  frame: number;
  frameRequest: number;
  resolve: (value: void | PromiseLike<void>) => void;

  constructor(el: HTMLElement) {
    this.el = el;
    this.chars = "!<>-_\\/[]{}—=+*^?#₿Ξ◎Ð₳₮";
    this.queue = [];
    this.frame = 0;
    this.frameRequest = 0;
    this.resolve = () => {};
    this.update = this.update.bind(this);
  }

  setText(newText: string) {
    const oldText = this.el.innerText;
    const length = Math.max(oldText.length, newText.length);
    const promise = new Promise<void>((resolve) => (this.resolve = resolve));
    this.queue = [];

    for (let i = 0; i < length; i++) {
      const from = oldText[i] || "";
      const to = newText[i] || "";
      const start = Math.floor(Math.random() * 40);
      const end = start + Math.floor(Math.random() * 40);
      this.queue.push({ from, to, start, end });
    }

    cancelAnimationFrame(this.frameRequest);
    this.frame = 0;
    this.update();
    return promise;
  }

  update() {
    let output = "";
    let complete = 0;

    for (let i = 0, n = this.queue.length; i < n; i++) {
      let { from, to, start, end, char } = this.queue[i];
      if (this.frame >= end) {
        complete++;
        output += to;
      } else if (this.frame >= start) {
        if (!char || Math.random() < 0.28) {
          char = this.chars[Math.floor(Math.random() * this.chars.length)];
          this.queue[i].char = char;
        }
        output += `<span class="dud">${char}</span>`;
      } else {
        output += from;
      }
    }

    this.el.innerHTML = output;
    if (complete === this.queue.length) {
      this.resolve();
    } else {
      this.frameRequest = requestAnimationFrame(this.update);
      this.frame++;
    }
  }
}

// Matrix-style connect button for when not using RainbowKit
const MatrixConnectButton = () => {
  const router = useRouter();
  const { connect, isConnected } = useWallet();
  const [buttonHovered, setButtonHovered] = useState(false);

  const handleConnectClick = async () => {
    try {
      if (!isConnected) {
        await connect();
      } else {
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Failed to connect wallet:", error);
      router.push("/dashboard");
    }
  };

  return (
    <button
      onClick={handleConnectClick}
      onMouseEnter={() => setButtonHovered(true)}
      onMouseLeave={() => setButtonHovered(false)}
      className={`px-4 py-2 rounded-md text-sm font-bold transition-all duration-300 ${
        buttonHovered
          ? "bg-[#00ff00] text-black shadow-[0_0_10px_rgba(0,255,0,0.7)]"
          : "bg-transparent border border-[#00ff00] text-[#00ff00]"
      }`}
    >
      <div className="flex items-center">
        <Wallet className="mr-2 h-4 w-4" />
        <span>{isConnected ? "DASHBOARD" : "CONNECT"}</span>
      </div>
    </button>
  );
};

// Matrix-styled RainbowKit ConnectButton
const MatrixRainbowButton = () => {
  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        authenticationStatus,
        mounted,
      }) => {
        // Note: If your app doesn't use authentication, you
        // can remove all 'authenticationStatus' checks
        const ready = mounted && authenticationStatus !== "loading";
        const connected =
          ready &&
          account &&
          chain &&
          (!authenticationStatus || authenticationStatus === "authenticated");

        return (
          <div
            {...(!ready && {
              "aria-hidden": true,
              style: {
                opacity: 0,
                pointerEvents: "none",
                userSelect: "none",
              },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <button
                    onClick={openConnectModal}
                    type="button"
                    className="px-4 py-2 rounded-md text-sm font-bold transition-all duration-300 bg-transparent border border-[#00ff00] text-[#00ff00] hover:bg-[#00ff00] hover:text-black hover:shadow-[0_0_10px_rgba(0,255,0,0.7)]"
                  >
                    <div className="flex items-center">
                      <Wallet className="mr-2 h-4 w-4" />
                      <span>CONNECT</span>
                    </div>
                  </button>
                );
              }

              if (chain.unsupported) {
                return (
                  <button
                    onClick={openChainModal}
                    type="button"
                    className="px-4 py-2 rounded-md text-sm font-bold transition-all duration-300 bg-transparent border border-red-500 text-red-500 hover:bg-red-500 hover:text-black hover:shadow-[0_0_10px_rgba(255,0,0,0.7)]"
                  >
                    Wrong network
                  </button>
                );
              }

              return (
                <div className="flex items-center gap-2">
                  <button
                    onClick={openChainModal}
                    type="button"
                    className="px-4 py-2 rounded-md text-sm font-bold transition-all duration-300 bg-transparent border border-[#00ff00] text-[#00ff00] hover:bg-[#00ff00]/10 hover:shadow-[0_0_10px_rgba(0,255,0,0.3)]"
                  >
                    <div className="flex items-center">
                      {chain.hasIcon && (
                        <div
                          style={{
                            background: chain.iconBackground,
                            width: 16,
                            height: 16,
                            borderRadius: 999,
                            overflow: "hidden",
                            marginRight: 6,
                          }}
                        >
                          {chain.iconUrl && (
                            <img
                              alt={chain.name ?? "Chain icon"}
                              src={chain.iconUrl}
                              style={{ width: 16, height: 16 }}
                            />
                          )}
                        </div>
                      )}
                      {chain.name}
                    </div>
                  </button>

                  <button
                    onClick={openAccountModal}
                    type="button"
                    className="px-4 py-2 rounded-md text-sm font-bold transition-all duration-300 bg-transparent border border-[#00ff00] text-[#00ff00] hover:bg-[#00ff00]/10 hover:shadow-[0_0_10px_rgba(0,255,0,0.3)]"
                  >
                    <div className="flex items-center">
                      <Wallet className="mr-2 h-4 w-4" />
                      {account.displayName}
                      {account.displayBalance
                        ? ` (${account.displayBalance})`
                        : ""}
                    </div>
                  </button>
                </div>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
};

export function SiteHeader() {
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userAddress, setUserAddress] = useState<string | null>(null);
  const logoRef = useRef<HTMLSpanElement>(null);
  const scramblerRef = useRef<TextScramble | null>(null);
  const [mounted, setMounted] = useState(false);

  // Use wagmi account hook
  const { address, isConnected } = useAccount();

  // Use our wallet context
  const { disconnect } = useWallet();

  // Initialize text scramble effect for logo
  useEffect(() => {
    if (logoRef.current && !scramblerRef.current) {
      scramblerRef.current = new TextScramble(logoRef.current);
      setMounted(true);
    }
  }, []);

  // Apply text scramble effect on hover
  const handleLogoHover = () => {
    if (scramblerRef.current) {
      scramblerRef.current.setText("MEMETRON");
    }
  };

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
      { label: "Marketcap", href: "/marketcap" },
      { label: "Marketplace", href: "/marketplace" },
      { label: "Bets", href: "/bets" },
    ],
    []
  );

  // Additional menu items for authenticated users
  const authenticatedMenuItems = useMemo(
    (): NavItem[] => [
      { label: "Launch Tokens", href: "/launch" },
      { label: "Create Bets", href: "/bets/create" },
      { label: "Quick Swap", href: "/dashboard/quick-swap" },
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
    <header className="fixed top-0 z-50 w-full border-b border-[#00ff00]/20 bg-black/90 backdrop-blur supports-[backdrop-filter]:bg-black/60">
      <div className="flex h-20 items-center px-4 md:px-6 lg:px-8 w-full">
        <div className="flex items-center gap-6">
          <Link
            href="/dashboard"
            className="flex items-center space-x-2"
            onMouseEnter={handleLogoHover}
          >
            <span
              ref={logoRef}
              className="text-2xl font-bold text-[#00ff00] font-mono"
              style={{ textShadow: "0 0 5px rgba(0,255,0,0.7)" }}
            >
              MEMETRON
            </span>
          </Link>

          <NavigationMenu items={menuItems} />
        </div>

        <div className="ml-auto">
          <div className="flex items-center space-x-4">
            <MatrixRainbowButton />
          </div>
        </div>
      </div>

      <style jsx global>{`
        .dud {
          color: #0f0;
          opacity: 0.7;
        }
      `}</style>
    </header>
  );
}
