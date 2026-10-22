"use client";

import React, { useState } from "react";
import { useGameStore, getMaxGuesses } from "@/lib/store";
import { GuessInput } from "@/components/Controls/GuessInput";
import { GuessHistory } from "@/components/Controls/GuessHistory";
import { ClueDrawer } from "@/components/Clues/ClueDrawer";
import { DetectiveDossier } from "@/components/Controls/DetectiveDossier";
import { Lightbulb, Crosshair, Layers } from "lucide-react";

interface GameIntelPanelProps {
  defaultTab?: "both" | "guesses" | "hints";
}

export function GameIntelPanel({ defaultTab = "both" }: GameIntelPanelProps) {
  const [tab, setTab] = useState<"both" | "guesses" | "hints">(defaultTab);
  const mode = useGameStore((s) => s.mode);
  const difficulty = useGameStore((s) => s.difficulty);
  const guesses = useGameStore((s) => s.guesses);
  const unlockedHints = useGameStore((s) => s.unlockedHints);
  const maxGuesses = getMaxGuesses(difficulty);

  return (
    <div className="w-full h-full min-h-0 flex flex-col gap-2 overflow-hidden">
      {/* Pinned Search Input (Never scrolls) */}
      <div className="shrink-0 z-30">
        <GuessInput />
      </div>

      {/* Section Switcher Tabs (Never scrolls) */}
      <div className="shrink-0 flex items-center gap-1 p-1 rounded-xl bg-black/40 border border-white/10 text-xs">
        <button
          type="button"
          onClick={() => setTab("both")}
          className={`flex-1 py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 font-semibold transition-all cursor-pointer ${
            tab === "both"
              ? "bg-slate-700/80 text-white shadow-sm"
              : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
          }`}
        >
          <Layers className="size-3.5" />
          <span>Both</span>
        </button>

        <button
          type="button"
          onClick={() => setTab("guesses")}
          className={`flex-1 py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 font-semibold transition-all cursor-pointer ${
            tab === "guesses"
              ? "bg-sky-600 text-white shadow-sm"
              : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
          }`}
        >
          <Crosshair className="size-3.5" />
          <span>
            Guesses ({guesses.length}/{maxGuesses})
          </span>
        </button>

        <button
          type="button"
          onClick={() => setTab("hints")}
          className={`flex-1 py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 font-semibold transition-all cursor-pointer ${
            tab === "hints"
              ? "bg-amber-600 text-white shadow-sm"
              : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
          }`}
        >
          <Lightbulb className="size-3.5" />
          <span>Hints ({unlockedHints}/3)</span>
          {unlockedHints > 0 && (
            <span className="size-1.5 rounded-full bg-amber-400" />
          )}
        </button>
      </div>

      {/* ONLY THIS CONTAINER SCROLLS */}
      <div className="flex-1 min-h-0 overflow-y-auto pr-1 space-y-2.5 overscroll-contain">
        {mode === "detective" && <DetectiveDossier />}

        {tab === "hints" ? (
          <ClueDrawer />
        ) : tab === "guesses" ? (
          <GuessHistory />
        ) : (
          <>
            <ClueDrawer />
            <GuessHistory />
          </>
        )}
      </div>
    </div>
  );
}
