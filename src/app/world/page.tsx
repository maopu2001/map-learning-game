"use client";

import React, { useEffect } from "react";
import dynamic from "next/dynamic";
import { Header } from "@/components/Header";
import { GuessInput } from "@/components/Controls/GuessInput";
import { GuessHistory } from "@/components/Controls/GuessHistory";
import { ClueDrawer } from "@/components/Clues/ClueDrawer";
import { GameOverModal } from "@/components/Dialogs/GameOverModal";
import { useGameStore } from "@/lib/store";
import { Globe2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const WorldMap = dynamic(
  () => import("@/components/Map/WorldMap").then((mod) => mod.WorldMap),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-112 sm:h-136 lg:h-[calc(100vh-125px)] min-h-120 rounded-2xl border border-white/10 bg-[#0c101c] flex items-center justify-center text-slate-500 animate-pulse">
        <div className="flex flex-col items-center gap-2">
          <div className="size-8 rounded-full border-2 border-sky-500 border-t-transparent animate-spin" />
          <span className="text-xs font-mono">Loading World Topography...</span>
        </div>
      </div>
    ),
  }
);

export default function WorldPage() {
  const initRouteScope = useGameStore((s) => s.initRouteScope);
  const mode = useGameStore((s) => s.mode);
  const difficulty = useGameStore((s) => s.difficulty);
  const tickBlitzTimer = useGameStore((s) => s.tickBlitzTimer);
  const gameStatus = useGameStore((s) => s.gameStatus);

  useEffect(() => {
    initRouteScope("world");
  }, [initRouteScope]);

  // Blitz timer ticker
  useEffect(() => {
    if (mode !== "blitz" || gameStatus !== "playing") return;
    const interval = setInterval(() => {
      tickBlitzTimer();
    }, 1000);
    return () => clearInterval(interval);
  }, [mode, gameStatus, tickBlitzTimer]);

  return (
    <div className="flex flex-col min-h-screen bg-[#070a12] text-slate-100 selection:bg-sky-500 selection:text-white">
      <Header />

      <main className="flex-1 w-full px-2 sm:px-3 py-2 sm:py-2.5 space-y-2.5">
        {/* Cockpit Status Strip */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 rounded-xl border border-white/10 bg-[#0c101c] shadow-lg">
          <div className="flex items-center gap-2.5">
            <Globe2 className="size-5 text-sky-400" />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xs sm:text-sm font-bold text-white">
                  World Sovereign Nations Reconnaissance
                </h2>
                <Badge variant="outline" className="text-3xs font-mono border-sky-500/30 text-sky-300 bg-sky-500/10 px-1.5 py-0">
                  {difficulty.toUpperCase()}
                </Badge>
              </div>
              <p className="text-2xs text-slate-400">
                Identify the secret mystery nation within {difficulty === "easy" ? "8" : difficulty === "hard" ? "5" : "6"} guesses
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <span className="flex items-center gap-1.5 bg-black/40 px-2 py-0.5 rounded-lg border border-white/5">
              <span className="size-2 rounded-full bg-amber-400 animate-pulse" />
              <span>Target Border Highlighted</span>
            </span>
          </div>
        </div>

        {/* Side-by-Side Arena: Map (Left) & Searchbox/Controls (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5 sm:gap-3 items-start">
          {/* Left Column: Interactive World Map Canvas */}
          <section className="lg:col-span-7 xl:col-span-8 w-full">
            <WorldMap />
          </section>

          {/* Right Column: Searchbox & Controls Panel */}
          <aside className="lg:col-span-5 xl:col-span-4 w-full flex flex-col gap-2.5 lg:h-[calc(100vh-125px)] lg:overflow-y-auto pr-0 lg:pr-1">
            {/* Search Input on Top */}
            <section className="w-full">
              <GuessInput />
            </section>

            {/* Clues & Intelligence Drawer */}
            <section className="w-full">
              <ClueDrawer />
            </section>

            {/* Guess History Proximity Feedback */}
            <section className="w-full flex-1 pb-4">
              <GuessHistory />
            </section>
          </aside>
        </div>
      </main>

      {/* End Game Modal */}
      <GameOverModal />

      {/* Footer */}
      <footer className="border-t border-white/5 py-3 text-center text-xs text-slate-500">
        <p>Borderline • World Sovereign States Cartography • Powered by Next.js 16</p>
      </footer>
    </div>
  );
}
