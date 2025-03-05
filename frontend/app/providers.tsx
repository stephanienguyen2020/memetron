"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WalletProvider } from "./providers/WalletProvider";
import { AuthGuard } from "./providers/AuthGuard";
import { WagmiProvider, createConfig, http } from "wagmi";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";

// Configure custom Aurora Testnet
const auroraTestnet = {
  id: 1313161555,
  name: "Aurora Testnet",
  network: "aurora-testnet",
  nativeCurrency: {
    decimals: 18,
    name: "ETH",
    symbol: "ETH",
  },
  rpcUrls: {
    public: { http: ["https://testnet.aurora.dev"] },
    default: { http: ["https://testnet.aurora.dev"] },
  },
  blockExplorers: {
    default: {
      name: "Aurora Explorer",
      url: "https://explorer.testnet.aurora.dev",
    },
  },
  testnet: true,
};

const electroneumTestnet = {
  id: 5201420,
  name: "Electroneum Testnet",
  network: "electroneum-testnet",
  nativeCurrency: {
    decimals: 18,
    name: "ETN",
    symbol: "ETN",
  },
  rpcUrls: {
    public: {
      http: [
        "https://rpc.ankr.com/electroneum_testnet/a37dd6e77e11f999c0ca58d263db0f160cd081bb788feecd4c256902084993b9",
      ],
    },
    default: {
      http: [
        "https://rpc.ankr.com/electroneum_testnet/a37dd6e77e11f999c0ca58d263db0f160cd081bb788feecd4c256902084993b9",
      ],
    },
  },
  blockExplorers: {
    default: {
      name: "Electroneum Explorer",
      url: "https://blockexplorer.thesecurityteam.rocks/",
    },
  },
  testnet: true,
};

// Configure custom Sonic Blaze Testnet
const sonicBlazeTestnet = {
  id: 57054,
  name: "Sonic Blaze Testnet",
  network: "sonic-blaze-testnet",
  nativeCurrency: {
    decimals: 18,
    name: "S",
    symbol: "S",
  },
  rpcUrls: {
    public: { http: ["https://rpc.blaze.soniclabs.com"] },
    default: { http: ["https://rpc.blaze.soniclabs.com"] },
  },
  blockExplorers: {
    default: {
      name: "Sonic Blaze Explorer",
      url: "https://explorer.blaze.soniclabs.com", // Placeholder, update if needed
    },
  },
  testnet: true,
};

// Create wagmi config
const config = createConfig({
  chains: [auroraTestnet, sonicBlazeTestnet, electroneumTestnet],
  transports: {
    [auroraTestnet.id]: http(),
    [sonicBlazeTestnet.id]: http(),
    [electroneumTestnet.id]: http(),
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <NextThemesProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <WalletProvider>
              <AuthGuard>{children}</AuthGuard>
            </WalletProvider>
          </NextThemesProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
