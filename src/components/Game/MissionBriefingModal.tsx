"use client";

import React, { useState } from "react";
import { useGameStore, GameMode, GameDifficulty } from "@/lib/store";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Flame,
  Timer,
  Play,
  SlidersHorizontal,
  AlertTriangle,
} from "lucide-react";

interface MissionBriefingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  scope: "bangladesh" | "world";
}

export function MissionBriefingModal({
  open,
  onOpenChange,
  scope,
}: MissionBriefingModalProps) {
  const currentMode = useGameStore((s) => s.mode);
  const currentDifficulty = useGameStore((s) => s.difficulty);
  const forfeitAndSwitch = useGameStore((s) => s.forfeitAndSwitch);
  const guesses = useGameStore((s) => s.guesses);
  const unlockedHints = useGameStore((s) => s.unlockedHints);
  const gameStatus = useGameStore((s) => s.gameStatus);

  const [selectedMode, setSelectedMode] = useState<GameMode>(currentMode);
  const [selectedDifficulty, setSelectedDifficulty] =
    useState<GameDifficulty>(currentDifficulty);

  const isBD = scope === "bangladesh";
  const isMidGame =
    gameStatus === "playing" && (guesses.length > 0 || unlockedHints > 0);

  const handleStartGame = () => {
    forfeitAndSwitch({
      mode: selectedMode,
      difficulty: selectedDifficulty,
      reset: true,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-2rem)] max-w-md bg-[#090d18] border border-white/10 text-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-2xl backdrop-blur-2xl">
        <DialogHeader className="space-y-0.5 text-left">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400">
              <SlidersHorizontal className="size-3.5" />
            </span>
            <DialogTitle className="text-base sm:text-lg font-bold tracking-tight text-white">
              Game Settings
            </DialogTitle>
          </div>
          <DialogDescription className="text-2xs sm:text-xs text-slate-400">
            {isBD ? "Bangladesh • 64 Districts" : "World • 195 Countries"}
          </DialogDescription>
        </DialogHeader>

        {isMidGame && (
          <div className="flex items-center justify-between gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs">
            <div className="flex items-center gap-1.5 min-w-0">
              <AlertTriangle className="size-3.5 shrink-0 text-amber-400" />
              <span className="truncate text-2xs sm:text-xs">
                Forfeits current round
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-2xs text-amber-300/80 font-mono shrink-0">
              <span>{guesses.length} {guesses.length === 1 ? "guess" : "guesses"}</span>
              <span>•</span>
              <span>{unlockedHints} {unlockedHints === 1 ? "hint" : "hints"}</span>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {/* Mode Selector */}
          <div className="space-y-2 bg-accent/50 px-4 py-2 rounded-2xl">
            <label className="text-2xs font-mono font-semibold uppercase tracking-wider text-slate-400">
              Game Mode
            </label>
            <div className="grid grid-cols-3 gap-1.5 sm:gap-2 mt-1">
              {/* Daily */}
              <button
                type="button"
                onClick={() => setSelectedMode("daily")}
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
                <span className="font-semibold text-xs leading-none">Daily</span>
              </button>

              {/* Streak */}
              <button
                type="button"
                onClick={() => setSelectedMode("streak")}
                className={`py-2 px-1.5 sm:py-2.5 sm:px-2 rounded-xl border text-center flex flex-col items-center justify-center gap-1 transition-all cursor-pointer min-h-13 ${
                  selectedMode === "streak"
                    ? "bg-amber-500/15 border-amber-500 text-white shadow-sm ring-1 ring-amber-500/50"
                    : "bg-white/3 border-white/10 text-slate-400 hover:border-white/20 hover:text-slate-200"
                }`}
              >
                <Flame
                  className={`size-3.5 sm:size-4 ${
                    selectedMode === "streak" ? "text-amber-400" : "text-slate-400"
                  }`}
                />
                <span className="font-semibold text-xs leading-none">
                  {isBD ? "Hop Streak" : "Border Streak"}
                </span>
              </button>

              {/* Blitz */}
              <button
                type="button"
                onClick={() => setSelectedMode("blitz")}
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
                "One daily puzzle shared worldwide."}
              {selectedMode === "streak" &&
                (isBD
                  ? "Guess districts consecutively to build your streak."
                  : "Guess neighboring countries to build your streak.")}
              {selectedMode === "blitz" &&
                "Find the target location before the 90s timer runs out."}
            </p>
          </div>

          {/* Difficulty Selector */}
          <div className="space-y-1.5 bg-accent/50 px-4 py-2 rounded-2xl">
            <label className="text-2xs font-mono font-semibold uppercase tracking-wider text-slate-400">
              Difficulty
            </label>
            <div className="grid grid-cols-3 gap-1.5 sm:gap-2 mt-1">
              {/* Easy */}
              <button
                type="button"
                onClick={() => setSelectedDifficulty("easy")}
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
                onClick={() => setSelectedDifficulty("normal")}
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
                onClick={() => setSelectedDifficulty("hard")}
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
        </div>

        {/* Start Button */}
        <div className="pt-1">
          <Button
            onClick={handleStartGame}
            className={`w-full h-10 rounded-xl font-bold text-xs sm:text-sm tracking-wide gap-1.5 shadow-lg cursor-pointer ${
              isBD
                ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/60"
                : "bg-sky-600 hover:bg-sky-500 text-white shadow-sky-950/60"
            }`}
          >
            <Play className="size-3.5 fill-white" />
            <span>{isMidGame ? "START NEW ROUND" : "PLAY NOW"}</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
