import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";
import { OfflineIndicator } from "@/components/OfflineIndicator";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const baseUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://shimana.maopu.com.bd";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fcf3f0" },
    { media: "(prefers-color-scheme: dark)", color: "#03160b" },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "Shimana (সীমানা) - Map Guessing Game",
    template: "%s | Shimana",
  },
  description:
    "Guess the secret Bangladesh district or world country in 6 tries. Use distance, compass directions, and neighbor clues to zero in. Daily challenges, Blitz speedruns, and Detective mode.",
  keywords: [
    "Shimana",
    "সীমানা",
    "geography game",
    "map game",
    "country guesser",
    "bangladesh district game",
    "wordle geography",
    "globle",
    "worldle",
    "daily map puzzle",
    "geoguessr alternative",
    "bcs geography",
    "bangladesh map",
    "interactive world map",
  ],
  applicationName: "Shimana",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Shimana",
  },
  authors: [{ name: "M. Aktaruzzaman Opu", url: "https://maopu.com.bd" }],
  creator: "M. Aktaruzzaman Opu",
  publisher: "Shimana",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: ["/icon.svg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: baseUrl,
    siteName: "Shimana",
    title: "Shimana (সীমানা) - Map Guessing Game",
    description:
      "Guess the secret Bangladesh district or world country in 6 tries with distance, compass directions, and neighbor clues.",
    images: [
      {
        url: "/icon.svg",
        width: 512,
        height: 512,
        alt: "Shimana Compass Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Shimana (সীমানা) - Map Guessing Game",
    description:
      "Guess the secret Bangladesh district or world country in 6 tries with distance, compass directions, and neighbor clues.",
    images: ["/icon.svg"],
  },
  category: "game",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          rel="preload"
          href="/data/world-countries-geo-50m.json"
          as="fetch"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/data/bangladesh-districts-topo.json"
          as="fetch"
          crossOrigin="anonymous"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-background text-foreground font-sans antialiased selection:bg-primary selection:text-primary-foreground`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "WebApplication",
                  "@id": `${baseUrl}/#app`,
                  name: "Shimana",
                  alternateName: ["সীমানা", "Shimana Map Guessing Game"],
                  url: baseUrl,
                  applicationCategory: "GameApplication",
                  softwareVersion: "2.0.0",
                  genre: ["Geography", "Trivia", "Puzzle", "Educational"],
                  operatingSystem: "All",
                  browserRequirements: "Requires JavaScript. Requires HTML5.",
                  description:
                    "Interactive map guessing game featuring 64 Bangladesh districts and 195 world countries.",
                  offers: {
                    "@type": "Offer",
                    price: "0",
                    priceCurrency: "USD",
                  },
                  author: {
                    "@type": "Person",
                    name: "M. Aktaruzzaman Opu",
                    url: "https://maopu.com.bd",
                  },
                },
                {
                  "@type": "WebSite",
                  "@id": `${baseUrl}/#website`,
                  url: baseUrl,
                  name: "Shimana",
                  description: "Map Guessing Game",
                  inLanguage: ["en", "bn"],
                },
              ],
            }),
          }}
        />
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <ServiceWorkerRegister />
          <OfflineIndicator />
        </ThemeProvider>
      </body>
    </html>
  );
}
