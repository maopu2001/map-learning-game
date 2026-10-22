"use client";

import React from "react";
import { Timer, FileText } from "lucide-react";
import { GameMode } from "@/lib/store";
import { Badge } from "../ui/badge";

interface GameTelemetryProps {
  mode: GameMode;
  blitzTimeLeft: number;
  guessCount: number;
  difficulty: "easy" | "normal" | "hard";
  maxGuesses: number;
}

export function GameTelemetry({
  mode,
  difficulty,
  blitzTimeLeft,
  guessCount,
  maxGuesses,
}: GameTelemetryProps) {
  return (
    <div className="flex items- justify-between w-full gap-2 font-mono">
      {/* Guesses Pip Tracker */}
      <div className="flex items-center gap-1.5 bg-black/40 px-2.5 py-1 rounded-xl border border-white/5 text-2xs text-slate-300">
        <span className="text-slate-400">Guesses:</span>
        <span className="font-bold text-white text-xs">{guessCount}</span>
        <span className="text-slate-500">/ {maxGuesses}</span>
      </div>

      {/* Mode Specific Telemetry */}
      {mode === "blitz" && (
        <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 font-bold text-xs">
          <Timer className="size-3.5 animate-pulse text-rose-400" />
          <span>{blitzTimeLeft}s</span>
        </div>
      )}

      {/* Mode and Difficulty Badges */}
      <div className="flex items-center lg:hidden border rounded-2xl border-white/10 bg-white/5 py-0.5 text-2xs font-mono font-bold uppercase">
        <span
          className={`tracking-wider border-r border-white/10 px-2 ${
            mode === "daily"
              ? "text-sky-300"
              : mode === "detective"
                ? "text-amber-300"
                : "text-rose-300"
          }`}
        >
          {mode === "daily"
            ? "Daily"
            : mode === "detective"
              ? "Detective"
              : "Blitz"}
        </span>

        <span
          className={`px-2 ${
            difficulty === "easy"
              ? "text-emerald-300"
              : difficulty === "normal"
                ? "text-amber-300"
                : "text-rose-300"
          }`}
        >
          {difficulty}
        </span>
      </div>
    </div>
  );
}
