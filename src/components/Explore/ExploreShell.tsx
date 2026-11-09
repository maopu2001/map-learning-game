"use client";

import React, { useState } from "react";
import { Header } from "@/components/Header";
import { Map, Info } from "lucide-react";

export interface ExploreShellProps {
  selectedTitle: string;
  mobileTabMapClass?: string;
  mobileTabInfoClass?: string;
  filterBar: React.ReactNode;
  mobileSearch: React.ReactNode;
  mapCanvas: React.ReactNode;
  mobileCallout?: React.ReactNode;
  desktopSearch: React.ReactNode;
  profileCard: React.ReactNode;
  mobileTab?: "map" | "info";
  onMobileTabChange?: (tab: "map" | "info") => void;
}

export function ExploreShell({
  selectedTitle,
  mobileTabMapClass = "bg-accent text-accent-foreground shadow-md",
  mobileTabInfoClass = "bg-primary text-primary-foreground shadow-md",
  filterBar,
  mobileSearch,
  mapCanvas,
  mobileCallout,
  desktopSearch,
  profileCard,
  mobileTab: controlledTab,
  onMobileTabChange,
}: ExploreShellProps) {
  const [internalTab, setInternalTab] = useState<"map" | "info">("map");
  const mobileTab = controlledTab ?? internalTab;
  const setMobileTab = (tab: "map" | "info") => {
    if (onMobileTabChange) onMobileTabChange(tab);
    else setInternalTab(tab);
  };

  return (
    <div className="h-dvh max-h-dvh w-full overflow-hidden flex flex-col bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      <Header />

      <main className="flex-1 min-h-0 w-full mx-auto p-2 sm:px-4 sm:py-3 flex flex-col gap-2 overflow-hidden">
        {/* Mobile Tab Switcher */}
        <div className="lg:hidden grid grid-cols-2 items-center gap-1.5 p-1 rounded-2xl bg-card border border-border shrink-0 text-xs font-semibold">
          <button
            onClick={() => setMobileTab("map")}
            className={`flex-1 py-1.5 px-3 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
              mobileTab === "map"
                ? mobileTabMapClass
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Map className="size-3.5" />
            <span>Map</span>
          </button>
          <button
            onClick={() => setMobileTab("info")}
            className={`flex-1 py-1.5 px-3 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
              mobileTab === "info"
                ? mobileTabInfoClass
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Info className="size-3.5" />
            <span className="truncate">{selectedTitle || "Info"}</span>
          </button>
        </div>

        {/* 2-Column Responsive Layout: Map + Profile Panel */}
        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-2 lg:gap-3 items-stretch overflow-hidden">
          {/* Left Column: Interactive Map Canvas */}
          <div
            className={`lg:col-span-7 xl:col-span-8 flex flex-col gap-2 h-full min-h-0 overflow-hidden ${
              mobileTab === "map" ? "flex flex-1" : "hidden lg:flex"
            }`}
          >
            {/* Filter Bar */}
            <div className="shrink-0">{filterBar}</div>

            {/* Mobile Search Input pinned directly above map */}
            <div className="lg:hidden shrink-0 z-30">{mobileSearch}</div>

            {/* Map Canvas */}
            {mapCanvas}

            {/* Mobile Selection Callout */}
            {mobileCallout}
          </div>

          {/* Right Column: Search Box & Profile */}
          <div
            className={`lg:col-span-5 xl:col-span-4 h-full min-h-0 flex flex-col gap-2 overflow-hidden ${
              mobileTab === "info" ? "flex flex-1" : "hidden lg:flex"
            }`}
          >
            {/* Pinned Search Box */}
            <div className="shrink-0 z-30">{desktopSearch}</div>

            {/* Scrollable Profile container */}
            <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain pr-1">
              {profileCard}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
