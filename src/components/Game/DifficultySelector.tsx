"use client";

import React from "react";
import { GameDifficulty } from "@/lib/store";

interface DifficultySelectorProps {
  selectedDifficulty: GameDifficulty;
  onSelectDifficulty: (difficulty: GameDifficulty) => void;
  isBD: boolean;
}

export function DifficultySelector({
  selectedDifficulty,
  onSelectDifficulty,
  isBD,
}: DifficultySelectorProps) {
  return (
    <div className="space-y-1.5 bg-accent/50 px-4 py-2 rounded-2xl">
      <label className="text-2xs font-mono font-semibold uppercase tracking-wider text-slate-400">
        Difficulty
      </label>
      <div className="grid grid-cols-3 gap-1.5 sm:gap-2 mt-1">
        {/* Easy */}
        <button
          type="button"
          onClick={() => onSelectDifficulty("easy")}
          className={`py-2 px-1.5 sm:py-2.5 sm:px-2 rounded-xl border text-center flex flex-col items-center justify-center gap-1 transition-all cursor-pointer min-h-13 ${
            selectedDifficulty === "easy"
              ? "bg-emerald-500/15 border-emerald-500 text-white shadow-sm ring-1 ring-emerald-500/50"
              : "bg-white/3 border-white/10 text-slate-400 hover:border-white/20 hover:text-slate-200"
          }`}
        >
          <div className="flex items-center gap-1">
            <span className="size-1.5 rounded-full bg-emerald-400" />
            <span className="font-semibold text-xs text-emerald-300 leading-none">
              Easy
            </span>
          </div>
          <span className="text-2xs text-slate-400 font-mono leading-none">
            8 guesses
          </span>
        </button>

        {/* Normal */}
        <button
          type="button"
          onClick={() => onSelectDifficulty("normal")}
          className={`py-2 px-1.5 sm:py-2.5 sm:px-2 rounded-xl border text-center flex flex-col items-center justify-center gap-1 transition-all cursor-pointer min-h-13 ${
            selectedDifficulty === "normal"
              ? "bg-amber-500/15 border-amber-500 text-white shadow-sm ring-1 ring-amber-500/50"
              : "bg-white/3 border-white/10 text-slate-400 hover:border-white/20 hover:text-slate-200"
          }`}
        >
          <div className="flex items-center gap-1">
            <span className="size-1.5 rounded-full bg-amber-400" />
            <span className="font-semibold text-xs text-amber-300 leading-none">
              Normal
            </span>
          </div>
          <span className="text-2xs text-slate-400 font-mono leading-none">
            6 guesses
          </span>
        </button>

        {/* Hard */}
        <button
          type="button"
          onClick={() => onSelectDifficulty("hard")}
          className={`py-2 px-1.5 sm:py-2.5 sm:px-2 rounded-xl border text-center flex flex-col items-center justify-center gap-1 transition-all cursor-pointer min-h-13 ${
            selectedDifficulty === "hard"
              ? "bg-rose-500/15 border-rose-500 text-white shadow-sm ring-1 ring-rose-500/50"
              : "bg-white/3 border-white/10 text-slate-400 hover:border-white/20 hover:text-slate-200"
          }`}
        >
          <div className="flex items-center gap-1">
            <span className="size-1.5 rounded-full bg-rose-400" />
            <span className="font-semibold text-xs text-rose-300 leading-none">
              Hard
            </span>
          </div>
          <span className="text-2xs text-slate-400 font-mono leading-none">
            5 guesses
          </span>
        </button>
      </div>
      <p className="text-xs text-slate-400 text-center leading-tight min-h-5">
        {selectedDifficulty === "easy" &&
          (isBD
            ? "8 guesses. Division revealed upfront + full inspection."
            : "8 guesses. Continent revealed upfront + full inspection.")}
        {selectedDifficulty === "normal" &&
          "6 guesses. Standard game with compass direction hints."}
        {selectedDifficulty === "hard" &&
          "5 guesses. Distance clues only (no compass arrow)."}
      </p>
    </div>
  );
}
