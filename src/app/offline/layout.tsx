import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Offline Mode",
  description: "You are currently offline, but you can continue playing Shimana maps from local cache.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function OfflineLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
