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
    <div className="space-y-2 bg-accent/50 px-4 py-2 rounded-2xl">
      <label className="text-2xs font-mono font-semibold uppercase tracking-wider text-slate-400">
        Game Mode
      </label>
      <div className="grid grid-cols-3 gap-1.5 sm:gap-2 mt-1">
        {/* Daily */}
        <button
          type="button"
          onClick={() => onSelectMode("daily")}
          className={`py-2 px-1.5 sm:py-2.5 sm:px-2 rounded-xl border text-center flex flex-col items-center justify-center gap-1 transition-all cursor-pointer min-h-13 ${
            selectedMode === "daily"
              ? "bg-sky-500/15 border-sky-500 text-white shadow-sm ring-1 ring-sky-500/50"
              : "bg-white/3 border-white/10 text-slate-400 hover:border-white/20 hover:text-slate-200"
          }`}
        >
          <Calendar
            className={`size-3.5 sm:size-4 ${
              selectedMode === "daily" ? "text-sky-400" : "text-slate-400"
            }`}
          />
          <span className="font-semibold text-xs leading-none flex items-center gap-1">
            <span>Daily</span>
            {isDailyWon && (
              <Check
                className="size-3 text-emerald-400 stroke-[3]"
                aria-label="Won today"
              />
            )}
            {isDailyLost && (
              <X
                className="size-3 text-rose-500 stroke-[3]"
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
              ? "bg-amber-500/15 border-amber-500 text-white shadow-sm ring-1 ring-amber-500/50"
              : "bg-white/3 border-white/10 text-slate-400 hover:border-white/20 hover:text-slate-200"
          }`}
        >
          <FileText
            className={`size-3.5 sm:size-4 ${
              selectedMode === "detective" ? "text-amber-400" : "text-slate-400"
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
              ? "bg-rose-500/15 border-rose-500 text-white shadow-sm ring-1 ring-rose-500/50"
              : "bg-white/3 border-white/10 text-slate-400 hover:border-white/20 hover:text-slate-200"
          }`}
        >
          <Timer
            className={`size-3.5 sm:size-4 ${
              selectedMode === "blitz" ? "text-rose-400" : "text-slate-400"
            }`}
          />
          <span className="font-semibold text-xs leading-none">Blitz 90s</span>
        </button>
      </div>
      <p className="text-xs text-slate-400 text-center leading-tight min-h-5">
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
