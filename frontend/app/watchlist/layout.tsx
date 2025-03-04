import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Watchlist | HedgeFi",
  description: "Track your favorite meme coins in one place",
};

export default function WatchlistLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
