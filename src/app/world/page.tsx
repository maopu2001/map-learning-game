"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { GameHUD } from "@/components/Game/GameHUD";
import { MissionBriefingModal } from "@/components/Game/MissionBriefingModal";
import { GuessInput } from "@/components/Controls/GuessInput";
import { GuessHistory } from "@/components/Controls/GuessHistory";
import { ClueDrawer } from "@/components/Clues/ClueDrawer";
import { GameOverModal } from "@/components/Dialogs/GameOverModal";
import { useGameStore } from "@/lib/store";

const WorldMap = dynamic(
  () => import("@/components/Map/WorldMap").then((mod) => mod.WorldMap),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-112 sm:h-136 lg:h-[calc(100vh-80px)] min-h-120 rounded-3xl border border-white/10 bg-[#0c101c] flex items-center justify-center text-slate-500 animate-pulse">
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
  const tickBlitzTimer = useGameStore((s) => s.tickBlitzTimer);
  const gameStatus = useGameStore((s) => s.gameStatus);
  const guesses = useGameStore((s) => s.guesses);
  const unlockedHints = useGameStore((s) => s.unlockedHints);

  const [briefingOpen, setBriefingOpen] = useState(false);

  useEffect(() => {
    initRouteScope("world");
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
    <div className="flex flex-col min-h-screen bg-[#070a12] text-slate-100 selection:bg-sky-500 selection:text-white p-2 sm:p-3 gap-2.5">
      {/* Sleek In-Game HUD (Replaces bloated header) */}
      <GameHUD
        scope="world"
        onOpenBriefing={() => setBriefingOpen(true)}
      />

      {/* Main Arena: Map (Left 7-8 cols) & Tactical Controls (Right 4-5 cols) */}
      <main className="flex-1 w-full grid grid-cols-1 lg:grid-cols-12 gap-2.5 sm:gap-3 items-start">
        {/* Left Column: Interactive World Map Canvas */}
        <section className="lg:col-span-7 xl:col-span-8 w-full">
          <WorldMap />
        </section>

        {/* Right Column: Searchbox & Controls Panel */}
        <aside className="lg:col-span-5 xl:col-span-4 w-full flex flex-col gap-2.5 lg:h-[calc(100vh-80px)] lg:overflow-y-auto pr-0 lg:pr-1">
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
      </main>

      {/* Mission Deployment / Mode Select Briefing Modal */}
      <MissionBriefingModal
        open={briefingOpen}
        onOpenChange={setBriefingOpen}
        scope="world"
      />

      {/* End Game Modal */}
      <GameOverModal onChangeMode={() => setBriefingOpen(true)} />
    </div>
  );
}
