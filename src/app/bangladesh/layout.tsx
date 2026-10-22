import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bangladesh Districts — Daily Map Challenge",
  description:
    "Can you guess today's secret Bangladesh district in 6 tries? Test your knowledge of all 64 districts across 8 divisions with distance and compass direction clues.",
  alternates: {
    canonical: "/bangladesh",
  },
  openGraph: {
    title: "Bangladesh Districts — Daily Map Challenge | Shimana",
    description:
      "Guess today's mystery Bangladesh district in 6 tries. Explore 64 districts with distance in km, compass directions, and neighboring district clues.",
    url: "/bangladesh",
    images: ["/icon.svg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Bangladesh Districts — Daily Map Challenge | Shimana",
    description:
      "Can you guess today's secret Bangladesh district in 6 tries? 64 districts, distance in km, and compass clues.",
    images: ["/icon.svg"],
  },
};

export default function BangladeshLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
