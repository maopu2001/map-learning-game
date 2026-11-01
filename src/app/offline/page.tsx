"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { WifiOff, Globe, MapPin, ArrowRight } from "lucide-react";

export default function OfflinePage() {
  const router = useRouter();
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    // If user is online, redirect to home page immediately
    if (navigator.onLine) {
      router.replace("/");
      return;
    }

    setIsOffline(true);

    // If connection restores while viewing offline screen, return home
    const handleOnline = () => {
      router.replace("/");
    };

    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, [router]);

  if (!isOffline) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-card border border-border rounded-2xl p-6 sm:p-8 text-center shadow-lg space-y-6">
        <div className="w-16 h-16 rounded-full bg-muted/60 text-muted-foreground mx-auto flex items-center justify-center ring-8 ring-muted/20">
          <WifiOff className="w-8 h-8 text-amber-500 dark:text-amber-400" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">You&apos;re Offline</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            No internet connection detected, but Shimana is fully offline-ready! You can play downloaded game modes right now.
          </p>
        </div>

        <div className="space-y-3 pt-2">
          <Link
            href="/world"
            className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-background hover:bg-muted/50 transition-colors font-medium text-sm group"
          >
            <div className="flex items-center gap-3">
              <Globe className="w-5 h-5 text-primary" />
              <span>Play World Map</span>
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
          </Link>

          <Link
            href="/bangladesh"
            className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-background hover:bg-muted/50 transition-colors font-medium text-sm group"
          >
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-primary" />
              <span>Play Bangladesh Map</span>
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
          </Link>

          <Link
            href="/"
            className="block text-xs text-muted-foreground hover:text-foreground pt-2 transition-colors"
          >
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
