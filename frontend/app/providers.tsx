"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WalletProvider } from "./providers/WalletProvider";
import { AuthGuard } from "./providers/AuthGuard";
import { WagmiProvider, createConfig, http } from "wagmi";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";

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

const ElectroneumMainnet = {
  id: 52014,
  name: "Electroneum Mainnet",
  network: "electroneum-mainnet",
  nativeCurrency: {
    decimals: 18,
    name: "ETN",
    symbol: "ETN",
  },
  rpcUrls: {
    public: { http: ["https://rpc.ankr.com/electroneum"] },
    default: { http: ["https://rpc.ankr.com/electroneum"] },
  },
  blockExplorers: {
    default: {
      name: "Electroneum Explorer",
      url: "https://blockexplorer.electroneum.com/",
    },
  },
};

// Create wagmi config
const config = createConfig({
  chains: [electroneumTestnet, ElectroneumMainnet],
  transports: {
    [electroneumTestnet.id]: http(),
    [ElectroneumMainnet.id]: http(),
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
