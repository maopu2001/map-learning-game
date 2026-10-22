"use client";

import React from "react";
import { Timer, FileText } from "lucide-react";
import { GameMode } from "@/lib/store";

interface GameTelemetryProps {
  mode: GameMode;
  blitzTimeLeft: number;
  streak: number;
  guessCount: number;
  maxGuesses: number;
}

export function GameTelemetry({
  mode,
  blitzTimeLeft,
  streak,
  guessCount,
  maxGuesses,
}: GameTelemetryProps) {
  return (
    <div className="flex items-center gap-2 font-mono">
      {mode === "blitz" && (
        <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 font-bold text-xs">
          <Timer className="size-3.5 animate-pulse text-rose-400" />
          <span>{blitzTimeLeft}s</span>
        </div>
      )}

      {mode === "detective" && (
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-950/60 border border-amber-500/40 text-amber-300 font-bold text-xs">
          <FileText className="size-3.5 text-amber-400" />
          <span>Streak: {streak}</span>
        </div>
      )}

      {/* Guesses Pip Tracker */}
      <div className="flex items-center gap-1.5 bg-black/40 px-2.5 py-1 rounded-xl border border-white/5 text-2xs text-slate-300">
        <span className="text-slate-400">Guesses:</span>
        <span className="font-bold text-white text-xs">{guessCount}</span>
        <span className="text-slate-500">/ {maxGuesses}</span>
      </div>
    </div>
  );
}
