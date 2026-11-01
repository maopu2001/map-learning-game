import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "World Countries - Map Guessing Game",
  description:
    "Find the secret country on the world map! Zero in within 6 tries across 195 countries using distance in kilometers, compass directions, and neighboring border clues.",
  alternates: {
    canonical: "/world",
  },
  openGraph: {
    title: "World Countries - Map Guessing Game | Shimana",
    description:
      "Find the secret country on the world map! Zero in within 6 tries across 195 countries using distance in kilometers, compass directions, and neighboring border clues.",
    url: "/world",
    images: ["/icon.svg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "World Countries - Map Guessing Game | Shimana",
    description:
      "Find the secret country on the world map! Zero in within 6 tries across 195 countries using distance in kilometers, compass directions, and neighboring border clues.",
    images: ["/icon.svg"],
  },
};

export default function WorldLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
