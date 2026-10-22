import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Explore World Map & Countries",
  description:
    "Interactive world map explorer: search and inspect 195 countries with capitals, flags, population, continent subregions, and territorial neighbors.",
  alternates: {
    canonical: "/explore/world",
  },
  openGraph: {
    title: "Explore World Map & 195 Countries | Shimana",
    description:
      "Interactive world map explorer: search and inspect 195 countries with capitals, flags, population, and territorial neighbors.",
    url: "/explore/world",
    images: ["/icon.svg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Explore World Map & 195 Countries | Shimana",
    description:
      "Interactive world map explorer: search and inspect 195 countries with capitals, flags, population, and territorial neighbors.",
    images: ["/icon.svg"],
  },
};

export default function ExploreWorldLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
