import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Explore Bangladesh Map & Districts",
  description:
    "Interactive map of Bangladesh: inspect all 64 districts across Dhaka, Chattogram, Rajshahi, Khulna, Barishal, Sylhet, Rangpur, and Mymensingh divisions.",
  alternates: {
    canonical: "/explore/bangladesh",
  },
  openGraph: {
    title: "Explore Bangladesh Map & 64 Districts | Shimana",
    description:
      "Interactive map of Bangladesh: inspect all 64 districts with division, area, headquarters, and neighboring borders.",
    url: "/explore/bangladesh",
    images: ["/icon.svg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Explore Bangladesh Map & 64 Districts | Shimana",
    description:
      "Interactive map of Bangladesh: inspect all 64 districts with division, area, headquarters, and neighboring borders.",
    images: ["/icon.svg"],
  },
};

export default function ExploreBangladeshLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
