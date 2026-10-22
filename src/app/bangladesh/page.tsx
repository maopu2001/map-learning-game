"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { GameHUD } from "@/components/Game/GameHUD";
import { MissionBriefingModal } from "@/components/Game/MissionBriefingModal";
import { GuessInput } from "@/components/Controls/GuessInput";
import { GuessHistory } from "@/components/Controls/GuessHistory";
import { ClueDrawer } from "@/components/Clues/ClueDrawer";
import { GameOverModal } from "@/components/Dialogs/GameOverModal";
import { useGameStore, getMaxGuesses } from "@/lib/store";
import { Map, Crosshair, ArrowRight } from "lucide-react";

const BangladeshMap = dynamic(
  () => import("@/components/Map/BangladeshMap").then((mod) => mod.BangladeshMap),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-112 sm:h-136 lg:h-[calc(100vh-80px)] min-h-120 rounded-3xl border border-white/10 bg-[#0c101c] flex items-center justify-center text-slate-500 animate-pulse">
        <div className="flex flex-col items-center gap-2">
          <div className="size-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
          <span className="text-xs font-mono">Loading Bangladesh map...</span>
        </div>
      </div>
    ),
  }
);

export default function BangladeshPage() {
  const initRouteScope = useGameStore((s) => s.initRouteScope);
  const mode = useGameStore((s) => s.mode);
  const tickBlitzTimer = useGameStore((s) => s.tickBlitzTimer);
  const gameStatus = useGameStore((s) => s.gameStatus);
  const guesses = useGameStore((s) => s.guesses);
  const unlockedHints = useGameStore((s) => s.unlockedHints);

  const difficulty = useGameStore((s) => s.difficulty);
  const maxGuesses = getMaxGuesses(difficulty);

  const [briefingOpen, setBriefingOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState<"map" | "intel">("map");

  const lastGuess = guesses.length > 0 ? guesses[guesses.length - 1] : null;

  useEffect(() => {
    initRouteScope("bangladesh");
  }, [initRouteScope]);

  // Open briefing automatically when starting fresh (no guesses and no hints unlocked)
  useEffect(() => {
    if (guesses.length === 0 && unlockedHints === 0) {
      setBriefingOpen(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Blitz timer ticker
  useEffect(() => {
    if (mode !== "blitz" || gameStatus !== "playing") return;
    const interval = setInterval(() => {
      tickBlitzTimer();
    }, 1000);
    return () => clearInterval(interval);
  }, [mode, gameStatus, tickBlitzTimer]);

  return (
    <div className="flex flex-col min-h-screen bg-[#070a12] text-slate-100 selection:bg-emerald-500 selection:text-white p-2 sm:p-3 gap-2 sm:gap-2.5">
      {/* Sleek In-Game HUD (Replaces bloated header) */}
      <GameHUD
        scope="bangladesh"
        onOpenBriefing={() => setBriefingOpen(true)}
      />

      {/* Mobile-only Segmented Control Bar (Map vs Guesses & Hints) */}
      <div className="lg:hidden flex items-center gap-1.5 p-1 rounded-2xl bg-black/40 border border-white/10 text-xs font-semibold">
        <button
          onClick={() => setMobileTab("map")}
          className={`flex-1 py-2 px-3 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
            mobileTab === "map"
              ? "bg-emerald-600 text-white shadow-md shadow-emerald-950/60"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Map className="size-3.5" />
          <span>Map</span>
        </button>
        <button
          onClick={() => setMobileTab("intel")}
          className={`flex-1 py-2 px-3 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
            mobileTab === "intel"
              ? "bg-sky-600 text-white shadow-md shadow-sky-950/60"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Crosshair className="size-3.5" />
          <span>
            Guesses & Hints ({guesses.length}/{maxGuesses})
          </span>
          {unlockedHints > 0 && (
            <span className="size-1.5 rounded-full bg-amber-400" />
          )}
        </button>
      </div>

      {/* Search Input always pinned above on mobile for immediate access */}
      <div className="lg:hidden w-full">
        <GuessInput />
      </div>

      {/* Main Arena: Map (Left 7-8 cols) & Controls (Right 4-5 cols) */}
      <main className="flex-1 w-full grid grid-cols-1 lg:grid-cols-12 gap-2.5 sm:gap-3 items-start">
        {/* Left Column: Interactive Map Canvas */}
        <section
          className={`w-full lg:col-span-7 xl:col-span-8 flex flex-col gap-2 ${
            mobileTab === "map" ? "block" : "hidden lg:block"
          }`}
        >
          <BangladeshMap />

          {/* On Mobile Map View: Latest Guess Banner */}
          {lastGuess && (
            <div className="lg:hidden p-3 rounded-2xl bg-[#0c101c] border border-white/10 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <div>
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <span>{lastGuess.country.name}</span>
                    <span className="font-mono text-sky-300">
                      {lastGuess.distanceKm} km {lastGuess.directionEmoji}
                    </span>
                  </div>
                  <span className="text-2xs text-slate-400 font-mono">
                    Match: {lastGuess.proximityScore}%
                  </span>
                </div>
              </div>

              <button
                onClick={() => setMobileTab("intel")}
                className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-sky-400 flex items-center gap-1 cursor-pointer shrink-0"
              >
                <span>View all</span>
                <ArrowRight className="size-3" />
              </button>
            </div>
          )}
        </section>

        {/* Right Column: Searchbox & Controls Panel */}
        <aside
          className={`w-full lg:col-span-5 xl:col-span-4 flex flex-col gap-2.5 lg:h-[calc(100vh-80px)] lg:overflow-y-auto pr-0 lg:pr-1 ${
            mobileTab === "intel" ? "block" : "hidden lg:flex"
          }`}
        >
          {/* Search Input on Desktop (on mobile rendered above) */}
          <section className="hidden lg:block w-full">
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
      </main>

      {/* Mission Deployment / Mode Select Briefing Modal */}
      <MissionBriefingModal
        open={briefingOpen}
        onOpenChange={setBriefingOpen}
        scope="bangladesh"
      />

      {/* End Game Modal */}
      <GameOverModal onChangeMode={() => setBriefingOpen(true)} />
    </div>
  );
}
