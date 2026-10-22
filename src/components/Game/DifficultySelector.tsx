"use client";

import React from "react";
import { Check, X } from "lucide-react";
import { GameDifficulty, GameMode, useGameStore, getTodayDateStr } from "@/lib/store";

interface DifficultySelectorProps {
  selectedDifficulty: GameDifficulty;
  onSelectDifficulty: (difficulty: GameDifficulty) => void;
  isBD: boolean;
  selectedMode?: GameMode;
}

export function DifficultySelector({
  selectedDifficulty,
  onSelectDifficulty,
  isBD,
  selectedMode = "daily",
}: DifficultySelectorProps) {
  const dailyHistory = useGameStore((s) => s.dailyHistory);
  const today = getTodayDateStr();
  const scopeKey = isBD ? "bangladesh" : "world";
  const dailyRecord = dailyHistory?.[scopeKey];
  const isDailyCompleted =
    selectedMode === "daily" &&
    dailyRecord?.date === today &&
    dailyRecord?.gameStatus !== "playing";
  const dailyDiff = dailyRecord?.difficulty || "normal";
  const isDailyWon = isDailyCompleted && dailyRecord?.gameStatus === "won";

  return (
    <div className="space-y-1.5 bg-accent/50 px-4 py-2 rounded-2xl">
      <label className="text-2xs font-mono font-semibold uppercase tracking-wider text-slate-400">
        Difficulty
      </label>
      <div className="grid grid-cols-3 gap-1.5 sm:gap-2 mt-1">
        {/* Easy */}
        <button
          type="button"
          disabled={isDailyCompleted && dailyDiff !== "easy"}
          onClick={() => onSelectDifficulty("easy")}
          className={`py-2 px-1.5 sm:py-2.5 sm:px-2 rounded-xl border text-center flex flex-col items-center justify-center gap-1 transition-all min-h-13 ${
            isDailyCompleted && dailyDiff !== "easy"
              ? "opacity-40 cursor-not-allowed bg-white/2 border-white/5 text-slate-500"
              : "cursor-pointer " +
                (selectedDifficulty === "easy"
                  ? "bg-emerald-500/15 border-emerald-500 text-white shadow-sm ring-1 ring-emerald-500/50"
                  : "bg-white/3 border-white/10 text-slate-400 hover:border-white/20 hover:text-slate-200")
          }`}
        >
          <div className="flex items-center gap-1">
            <span className="size-1.5 rounded-full bg-emerald-400" />
            <span className="font-semibold text-xs text-emerald-300 leading-none">
              Easy
            </span>
            {isDailyCompleted && dailyDiff === "easy" && (
              isDailyWon ? (
                <Check className="size-3 text-emerald-400 stroke-[3]" />
              ) : (
                <X className="size-3 text-rose-500 stroke-[3]" />
              )
            )}
          </div>
          <span className="text-2xs text-slate-400 font-mono leading-none">
            8 guesses
          </span>
        </button>

        {/* Normal */}
        <button
          type="button"
          disabled={isDailyCompleted && dailyDiff !== "normal"}
          onClick={() => onSelectDifficulty("normal")}
          className={`py-2 px-1.5 sm:py-2.5 sm:px-2 rounded-xl border text-center flex flex-col items-center justify-center gap-1 transition-all min-h-13 ${
            isDailyCompleted && dailyDiff !== "normal"
              ? "opacity-40 cursor-not-allowed bg-white/2 border-white/5 text-slate-500"
              : "cursor-pointer " +
                (selectedDifficulty === "normal"
                  ? "bg-amber-500/15 border-amber-500 text-white shadow-sm ring-1 ring-amber-500/50"
                  : "bg-white/3 border-white/10 text-slate-400 hover:border-white/20 hover:text-slate-200")
          }`}
        >
          <div className="flex items-center gap-1">
            <span className="size-1.5 rounded-full bg-amber-400" />
            <span className="font-semibold text-xs text-amber-300 leading-none">
              Normal
            </span>
            {isDailyCompleted && dailyDiff === "normal" && (
              isDailyWon ? (
                <Check className="size-3 text-emerald-400 stroke-[3]" />
              ) : (
                <X className="size-3 text-rose-500 stroke-[3]" />
              )
            )}
          </div>
          <span className="text-2xs text-slate-400 font-mono leading-none">
            6 guesses
          </span>
        </button>

        {/* Hard */}
        <button
          type="button"
          disabled={isDailyCompleted && dailyDiff !== "hard"}
          onClick={() => onSelectDifficulty("hard")}
          className={`py-2 px-1.5 sm:py-2.5 sm:px-2 rounded-xl border text-center flex flex-col items-center justify-center gap-1 transition-all min-h-13 ${
            isDailyCompleted && dailyDiff !== "hard"
              ? "opacity-40 cursor-not-allowed bg-white/2 border-white/5 text-slate-500"
              : "cursor-pointer " +
                (selectedDifficulty === "hard"
                  ? "bg-rose-500/15 border-rose-500 text-white shadow-sm ring-1 ring-rose-500/50"
                  : "bg-white/3 border-white/10 text-slate-400 hover:border-white/20 hover:text-slate-200")
          }`}
        >
          <div className="flex items-center gap-1">
            <span className="size-1.5 rounded-full bg-rose-400" />
            <span className="font-semibold text-xs text-rose-300 leading-none">
              Hard
            </span>
            {isDailyCompleted && dailyDiff === "hard" && (
              isDailyWon ? (
                <Check className="size-3 text-emerald-400 stroke-[3]" />
              ) : (
                <X className="size-3 text-rose-500 stroke-[3]" />
              )
            )}
          </div>
          <span className="text-2xs text-slate-400 font-mono leading-none">
            5 guesses
          </span>
        </button>
      </div>
      <p className="text-xs text-slate-400 text-center leading-tight min-h-5">
        {isDailyCompleted ? (
          <span className="text-slate-300 font-mono">
            Daily puzzle played on {dailyDiff.toUpperCase()} mode (
            {isDailyWon ? "Won ✓" : "Lost ✗"}).
          </span>
        ) : selectedMode === "detective" ? (
          selectedDifficulty === "easy" ? (
            isBD ? (
              "8 guesses · Full clue · Division confirmed upfront."
            ) : (
              "8 guesses · Full clue · Continent confirmed upfront."
            )
          ) : selectedDifficulty === "normal" ? (
            "6 guesses · Full clue · Target hidden on map."
          ) : (
            "5 guesses · Masked clue (████) · Hints reveal names."
          )
        ) : selectedDifficulty === "easy" ? (
          isBD ? (
            "8 guesses · Division confirmed upfront · Free map inspection."
          ) : (
            "8 guesses · Continent confirmed upfront · Free map inspection."
          )
        ) : selectedDifficulty === "normal" ? (
          "6 guesses · Standard game · Unrevealed map areas."
        ) : (
          "5 guesses · Map inspection locked until guessed."
        )}
      </p>
    </div>
  );
}
