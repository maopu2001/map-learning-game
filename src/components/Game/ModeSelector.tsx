"use client";

import React from "react";
import { GameMode, useGameStore, getTodayDateStr } from "@/lib/store";
import { Calendar, FileText, Timer, Check, X } from "lucide-react";

interface ModeSelectorProps {
  selectedMode: GameMode;
  onSelectMode: (mode: GameMode) => void;
  isBD: boolean;
}

export function ModeSelector({
  selectedMode,
  onSelectMode,
  isBD,
}: ModeSelectorProps) {
  const dailyHistory = useGameStore((s) => s.dailyHistory);
  const today = getTodayDateStr();
  const scopeKey = isBD ? "bangladesh" : "world";
  const dailyRecord = dailyHistory?.[scopeKey];
  const isDailyCompleted =
    dailyRecord?.date === today && dailyRecord?.gameStatus !== "playing";
  const isDailyWon = isDailyCompleted && dailyRecord?.gameStatus === "won";
  const isDailyLost = isDailyCompleted && dailyRecord?.gameStatus === "lost";

  return (
    <div className="space-y-2 bg-muted/40 border border-border px-4 py-2 rounded-2xl">
      <label className="text-2xs font-mono font-semibold uppercase tracking-wider text-muted-foreground">
        Game Mode
      </label>
      <div className="grid grid-cols-3 gap-1.5 sm:gap-2 mt-1">
        {/* Daily */}
        <button
          type="button"
          onClick={() => onSelectMode("daily")}
          className={`py-2 px-1.5 sm:py-2.5 sm:px-2 rounded-xl border text-center flex flex-col items-center justify-center gap-1 transition-all cursor-pointer min-h-13 ${
            selectedMode === "daily"
              ? isBD
                ? "bg-bd-subtle border-bd-primary text-foreground shadow-sm ring-1 ring-bd-primary/50"
                : "bg-primary/15 border-primary text-foreground shadow-sm ring-1 ring-primary/50"
              : "bg-card border-border text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          <Calendar
            className={`size-3.5 sm:size-4 ${
              selectedMode === "daily"
                ? isBD
                  ? "text-bd-primary"
                  : "text-primary"
                : "text-muted-foreground"
            }`}
          />
          <span className="font-semibold text-xs leading-none flex items-center gap-1">
            <span>Daily</span>
            {isDailyWon && (
              <Check
                className={`size-3 stroke-[3] ${isBD ? "text-bd-primary" : "text-primary"}`}
                aria-label="Won today"
              />
            )}
            {isDailyLost && (
              <X
                className="size-3 text-destructive stroke-[3]"
                aria-label="Lost today"
              />
            )}
          </span>
        </button>

        {/* Detective */}
        <button
          type="button"
          onClick={() => onSelectMode("detective")}
          className={`py-2 px-1.5 sm:py-2.5 sm:px-2 rounded-xl border text-center flex flex-col items-center justify-center gap-1 transition-all cursor-pointer min-h-13 ${
            selectedMode === "detective"
              ? "bg-accent/15 border-accent text-foreground shadow-sm ring-1 ring-accent/50"
              : "bg-card border-border text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          <FileText
            className={`size-3.5 sm:size-4 ${
              selectedMode === "detective" ? "text-accent" : "text-muted-foreground"
            }`}
          />
          <span className="font-semibold text-xs leading-none">
            Detective
          </span>
        </button>

        {/* Blitz */}
        <button
          type="button"
          onClick={() => onSelectMode("blitz")}
          className={`py-2 px-1.5 sm:py-2.5 sm:px-2 rounded-xl border text-center flex flex-col items-center justify-center gap-1 transition-all cursor-pointer min-h-13 ${
            selectedMode === "blitz"
              ? "bg-destructive/15 border-destructive text-foreground shadow-sm ring-1 ring-destructive/50"
              : "bg-card border-border text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          <Timer
            className={`size-3.5 sm:size-4 ${
              selectedMode === "blitz" ? "text-destructive" : "text-muted-foreground"
            }`}
          />
          <span className="font-semibold text-xs leading-none">Blitz 90s</span>
        </button>
      </div>
      <p className="text-xs text-muted-foreground text-center leading-tight min-h-5">
        {selectedMode === "daily" &&
          (isDailyWon
            ? "Today's daily puzzle won! Next puzzle resets at midnight UTC."
            : isDailyLost
              ? "Today's daily puzzle lost. Next puzzle resets at midnight UTC."
              : "One daily puzzle shared worldwide (1 play per day).")}
        {selectedMode === "detective" &&
          (isBD
            ? "Target is hidden on the map. Find the secret district from its clue."
            : "Target is hidden on the map. Find the secret country from its clue.")}
        {selectedMode === "blitz" &&
          "Find the target location before the 90s timer runs out."}
      </p>
    </div>
  );
}
