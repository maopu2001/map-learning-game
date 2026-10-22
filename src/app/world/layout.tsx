import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "World Countries — Daily Geography Game",
  description:
    "Find the mystery country on the world map! Zero in within 6 tries using distance in kilometers, compass bearings, and border hints.",
  alternates: {
    canonical: "/world",
  },
  openGraph: {
    title: "World Countries — Daily Geography Game | Shimana",
    description:
      "Find the mystery country on the world map! Zero in within 6 tries using distance in kilometers, compass bearings, and border hints.",
    url: "/world",
    images: ["/icon.svg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "World Countries — Daily Geography Game | Shimana",
    description:
      "Find the mystery country on the world map! 195 countries, distance in km, compass hints, and neighbor reveals.",
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
