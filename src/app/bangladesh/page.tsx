"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { GameHUD } from "@/components/Game/GameHUD";
import { MissionBriefingModal } from "@/components/Game/MissionBriefingModal";
import { GuessInput } from "@/components/Controls/GuessInput";
import { GameIntelPanel } from "@/components/Controls/GameIntelPanel";
import { GameOverModal } from "@/components/Dialogs/GameOverModal";
import { useGameStore, getMaxGuesses } from "@/lib/store";
import { useGameUrlSync } from "@/hooks/useGameUrlSync";
import { Map, Crosshair, ArrowRight } from "lucide-react";
import { DirectionIcon } from "@/components/ui/direction-icon";

const BangladeshMap = dynamic(
  () => import("@/components/Map/BangladeshMap").then((mod) => mod.BangladeshMap),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full min-h-0 flex-1 rounded-2xl border border-border bg-card flex items-center justify-center text-muted-foreground animate-pulse">
        <div className="flex flex-col items-center gap-2">
          <div className="size-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <span className="text-xs font-mono">Loading Bangladesh map...</span>
        </div>
      </div>
    ),
  }
);

export default function BangladeshPage() {
  const [briefingOpen, setBriefingOpen] = useState(false);

  useGameUrlSync("bangladesh", {
    onDailyDoneNoQuery: () => setBriefingOpen(true),
  });

  const mode = useGameStore((s) => s.mode);
  const tickBlitzTimer = useGameStore((s) => s.tickBlitzTimer);
  const gameStatus = useGameStore((s) => s.gameStatus);
  const guesses = useGameStore((s) => s.guesses);
  const unlockedHints = useGameStore((s) => s.unlockedHints);

  const difficulty = useGameStore((s) => s.difficulty);
  const maxGuesses = getMaxGuesses(difficulty);

  const [mobileTab, setMobileTab] = useState<"map" | "intel">("map");

  const lastGuess = guesses.length > 0 ? guesses[guesses.length - 1] : null;

  // Blitz timer ticker
  useEffect(() => {
    if (mode !== "blitz" || gameStatus !== "playing") return;
    const interval = setInterval(() => {
      tickBlitzTimer();
    }, 1000);
    return () => clearInterval(interval);
  }, [mode, gameStatus, tickBlitzTimer]);

  return (
    <div className="h-dvh max-h-dvh w-full overflow-hidden flex flex-col bg-background text-foreground selection:bg-primary selection:text-primary-foreground p-2 sm:p-2.5 gap-2">
      {/* Fixed HUD (Never scrolls) */}
      <div className="shrink-0">
        <GameHUD
          scope="bangladesh"
          onOpenBriefing={() => setBriefingOpen(true)}
        />
      </div>

      {/* Mobile-only Segmented Control Bar (Map vs Intel) */}
      <div className="lg:hidden shrink-0 flex items-center gap-1.5 p-1 rounded-2xl bg-card border border-border text-xs font-semibold">
        <button
          onClick={() => setMobileTab("map")}
          className={`flex-1 py-1.5 px-3 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
            mobileTab === "map"
              ? "bg-bd-primary text-bd-primary-foreground shadow-md"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Map className="size-3.5" />
          <span>Map</span>
        </button>
        <button
          onClick={() => setMobileTab("intel")}
          className={`flex-1 py-1.5 px-3 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
            mobileTab === "intel"
              ? "bg-accent text-accent-foreground shadow-md"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Crosshair className="size-3.5" />
          <span>
            Intel ({guesses.length}/{maxGuesses})
          </span>
          {unlockedHints > 0 && (
            <span className="size-1.5 rounded-full bg-accent" />
          )}
        </button>
      </div>

      {/* Main Game Arena */}
      <main className="flex-1 min-h-0 w-full overflow-hidden">
        {/* Mobile View: Map tab */}
        <div
          className={`lg:hidden h-full w-full min-h-0 flex flex-col gap-2 ${
            mobileTab === "map" ? "flex" : "hidden"
          }`}
        >
          {/* Mobile Search Input pinned above map */}
          <div className="shrink-0 z-30">
            <GuessInput scope="bangladesh" />
          </div>

          {/* Interactive Map (Takes full remaining space) */}
          <div className="flex-1 min-h-0 w-full overflow-hidden flex flex-col">
            <BangladeshMap className="relative w-full h-full min-h-0 flex-1 rounded-2xl overflow-hidden border border-border bg-card shadow-xl flex flex-col items-center justify-center select-none" />
          </div>

          {/* Latest Guess Banner on Mobile Map view */}
          {lastGuess && (
            <div className="shrink-0 p-2.5 rounded-2xl bg-card border border-border flex items-center justify-between text-xs">
              <div>
                <div className="font-bold text-foreground flex items-center gap-1.5">
                  <span>{lastGuess.country.name}</span>
                  <span className="font-mono text-primary flex items-center gap-1">
                    <span>{lastGuess.distanceKm} km</span>
                    <DirectionIcon
                      direction={lastGuess.direction}
                      isCorrect={lastGuess.isCorrect}
                      className="size-3 text-primary inline"
                    />
                  </span>
                </div>
                <span className="text-2xs text-muted-foreground font-mono">
                  Match: {lastGuess.proximityScore}%
                </span>
              </div>
              <button
                onClick={() => setMobileTab("intel")}
                className="px-2 py-1 rounded-xl bg-muted/50 hover:bg-muted border border-border text-xs font-semibold text-primary flex items-center gap-1 cursor-pointer shrink-0"
              >
                <span>Intel</span>
                <ArrowRight className="size-3" />
              </button>
            </div>
          )}
        </div>

        {/* Mobile View: Intel tab */}
        <div
          className={`lg:hidden h-full w-full min-h-0 flex flex-col ${
            mobileTab === "intel" ? "flex" : "hidden"
          }`}
        >
          <GameIntelPanel scope="bangladesh" defaultTab="both" />
        </div>

        {/* Desktop View: Dual column (Map on left, Intel on right) */}
        <div className="hidden lg:grid grid-cols-12 gap-3 h-full w-full min-h-0 overflow-hidden">
          {/* Left Column: Fixed Map Canvas */}
          <section className="col-span-7 xl:col-span-8 h-full min-h-0 flex flex-col overflow-hidden">
            <BangladeshMap className="relative w-full h-full min-h-0 flex-1 rounded-2xl overflow-hidden border border-border bg-card shadow-xl flex flex-col items-center justify-center select-none" />
          </section>

          {/* Right Column: Search + Scrollable Intel */}
          <aside className="col-span-5 xl:col-span-4 h-full min-h-0 flex flex-col overflow-hidden">
            <GameIntelPanel scope="bangladesh" defaultTab="both" />
          </aside>
        </div>
      </main>

      {/* Mission Deployment / Mode Select Briefing Modal */}
      <MissionBriefingModal
        open={briefingOpen}
        onOpenChange={setBriefingOpen}
        scope="bangladesh"
      />

      {/* End Game Modal */}
      <GameOverModal scope="bangladesh" onChangeMode={() => setBriefingOpen(true)} />
    </div>
  );
}
