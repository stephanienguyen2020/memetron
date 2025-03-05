"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useWallet } from "./providers/WalletProvider";
import { AppLayout } from "./components/app-layout";
import RainingLetters from "./components/RainingLetters";

export default function Home(): JSX.Element {
  const router = useRouter();
  const { isConnected, connect } = useWallet();

  // Check authentication status
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const savedAuth = localStorage.getItem("isAuthenticated") === "true";
    setIsAuthenticated(isConnected || savedAuth);

    // If authenticated, redirect to dashboard
    if (isConnected || savedAuth) {
      router.push("/dashboard");
    }
  }, [isConnected, router]);

  // Function to handle the "Connect Wallet" button click
  const handleConnectWallet = async () => {
    try {
      // If not connected, try to connect wallet
      if (!isConnected) {
        await connect();
        // The WalletProvider will handle redirection to dashboard after successful connection
      } else {
        // If already connected, just navigate to dashboard
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Failed to connect wallet:", error);
      router.push("/dashboard");
    }
  };

  return (
    <AppLayout showFooter={false}>
      <div className="min-h-screen bg-black">
        <RainingLetters onConnectWallet={handleConnectWallet} />
      </div>
    </AppLayout>
  );
}
