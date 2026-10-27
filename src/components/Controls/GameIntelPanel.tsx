"use client";

import React, { useState } from "react";
import { useGameStore, getMaxGuesses } from "@/lib/store";
import { GuessInput } from "@/components/Controls/GuessInput";
import { GuessHistory } from "@/components/Controls/GuessHistory";
import { ClueDrawer } from "@/components/Clues/ClueDrawer";
import { DetectiveDossier } from "@/components/Controls/DetectiveDossier";
import { Lightbulb, Crosshair, Layers } from "lucide-react";

interface GameIntelPanelProps {
  scope?: "bangladesh" | "world";
  defaultTab?: "both" | "guesses" | "hints";
}

export function GameIntelPanel({ scope, defaultTab = "both" }: GameIntelPanelProps) {
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
        <GuessInput scope={scope} />
      </div>

      {/* Section Switcher Tabs (Never scrolls) */}
      <div className="shrink-0 flex items-center gap-1 p-1 rounded-xl bg-card border border-border text-xs">
        <button
          type="button"
          onClick={() => setTab("both")}
          className={`flex-1 py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 font-semibold transition-all cursor-pointer ${
            tab === "both"
              ? "bg-muted text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
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
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
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
              ? "bg-accent text-accent-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
          }`}
        >
          <Lightbulb className="size-3.5" />
          <span>Hints ({unlockedHints}/3)</span>
          {unlockedHints > 0 && (
            <span className="size-1.5 rounded-full bg-accent" />
          )}
        </button>
      </div>

      {/* ONLY THIS CONTAINER SCROLLS */}
      <div className="flex-1 min-h-0 overflow-y-auto pr-1 space-y-2.5 overscroll-contain">
        {mode === "detective" && <DetectiveDossier scope={scope} />}

        {tab === "hints" ? (
          <ClueDrawer scope={scope} />
        ) : tab === "guesses" ? (
          <GuessHistory scope={scope} />
        ) : (
          <>
            <ClueDrawer scope={scope} />
            <GuessHistory scope={scope} />
          </>
        )}
      </div>
    </div>
  );
}
