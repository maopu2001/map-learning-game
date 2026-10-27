"use client";

import React from "react";
import { Timer } from "lucide-react";
import { GameMode } from "@/lib/store";

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
    <div className="flex items-center justify-between w-full gap-2 font-mono">
      {/* Guesses Pip Tracker */}
      <div className="flex items-center gap-1.5 bg-card px-2.5 py-1 rounded-xl border border-border text-2xs text-muted-foreground">
        <span className="text-muted-foreground">Guesses:</span>
        <span className="font-bold text-foreground text-xs">{guessCount}</span>
        <span className="text-muted-foreground">/ {maxGuesses}</span>
      </div>

      {/* Mode Specific Telemetry */}
      {mode === "blitz" && (
        <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-destructive/20 border border-destructive/40 text-destructive font-bold text-xs">
          <Timer className="size-3.5 animate-pulse text-destructive" />
          <span>{blitzTimeLeft}s</span>
        </div>
      )}

      {/* Mode and Difficulty Badges */}
      <div className="flex items-center lg:hidden border rounded-2xl border-border bg-muted/40 py-0.5 text-2xs font-mono font-bold uppercase">
        <span
          className={`tracking-wider border-r border-border px-2 ${
            mode === "daily"
              ? "text-primary"
              : mode === "detective"
                ? "text-accent"
                : "text-destructive"
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
              ? "text-primary"
              : difficulty === "normal"
                ? "text-accent"
                : "text-destructive"
          }`}
        >
          {difficulty}
        </span>
      </div>
    </div>
  );
}
