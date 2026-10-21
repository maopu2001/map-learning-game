import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#070a12",
};

export const metadata: Metadata = {
  title: "Borderline — Daily Map & Geography Game",
  description:
    "Guess the secret country or Bangladesh district in 6 tries. Use distance, compass directions, and neighbor hints to zero in.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-[#070a12] text-slate-100 font-sans antialiased selection:bg-sky-500 selection:text-white`}
      >
        {children}
      </body>
    </html>
  );
}
