import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bangladesh Districts - Map Guessing Game",
  description:
    "Can you guess today's secret Bangladesh district in 6 tries? Explore all 64 districts with distance, compass directions, and neighboring district clues.",
  alternates: {
    canonical: "/bangladesh",
  },
  openGraph: {
    title: "Bangladesh Districts - Map Guessing Game | Shimana",
    description:
      "Can you guess today's secret Bangladesh district in 6 tries? Explore all 64 districts with distance, compass directions, and neighboring district clues.",
    url: "/bangladesh",
    images: ["/icon.svg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Bangladesh Districts - Map Guessing Game | Shimana",
    description:
      "Can you guess today's secret Bangladesh district in 6 tries? Explore all 64 districts with distance, compass directions, and neighboring district clues.",
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
