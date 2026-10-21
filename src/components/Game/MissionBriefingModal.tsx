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
  Crosshair,
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

  const handleDeploy = () => {
    forfeitAndSwitch({
      mode: selectedMode,
      difficulty: selectedDifficulty,
      reset: true,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl bg-[#090d18] border border-white/10 text-white rounded-3xl p-5 sm:p-6 shadow-2xl backdrop-blur-2xl max-h-[90dvh] overflow-y-auto">
        <DialogHeader className="space-y-1 text-left">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400">
              <Crosshair className="size-4" />
            </span>
            <DialogTitle className="text-lg font-black tracking-wide text-white uppercase">
              Game Settings
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-slate-400">
            {isBD
              ? "Playing: Bangladesh (64 Districts)"
              : "Playing: World (195 Countries)"}
          </DialogDescription>
        </DialogHeader>

        {isMidGame && (
          <div className="flex flex-col gap-2 p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs">
            <div className="flex justify-center gap-2 rounded-xl ">
              <AlertTriangle className="size-4 shrink-0" />
              <span>Starting a new game will forfeit your active round.</span>
            </div>
            <div className="grid grid-cols-2 gap-2 place-items-center text-amber-400">
              <span className="border p-1 w-full flex justify-center border-amber-500/20 rounded-lg">
                Guesses: {guesses.length}
              </span>
              <span className="border p-1 w-full flex justify-center border-amber-500/20 rounded-lg">
                Hints: {unlockedHints}
              </span>
            </div>
          </div>
        )}

        <div className="space-y-4 my-2">
          {/* Step 1: Mode Select */}
          <div className="space-y-2">
            <label className="text-2xs font-mono font-bold uppercase tracking-wider text-slate-400">
              1. Select Game Mode
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {/* Daily */}
              <button
                type="button"
                onClick={() => setSelectedMode("daily")}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                  selectedMode === "daily"
                    ? "bg-sky-600/20 border-sky-500 text-white shadow-lg shadow-sky-950/50"
                    : "bg-black/40 border-white/5 text-slate-400 hover:border-white/20 hover:text-slate-200"
                }`}
              >
                <div className="flex gap-2 items-center font-bold text-xs text-white">
                  <Calendar className="flex size-4 text-sky-400" />
                  Daily Puzzle
                </div>
                <div className="text-2xs text-slate-400 mt-0.5 leading-relaxed">
                  One new puzzle every day for everyone worldwide.
                </div>
              </button>

              {/* Streak */}
              <button
                type="button"
                onClick={() => setSelectedMode("streak")}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                  selectedMode === "streak"
                    ? "bg-amber-600/20 border-amber-500 text-white shadow-lg shadow-amber-950/50"
                    : "bg-black/40 border-white/5 text-slate-400 hover:border-white/20 hover:text-slate-200"
                }`}
              >
                <div className="flex gap-2 items-center font-bold text-xs text-white">
                  <Flame className="size-4 text-amber-400" />
                  {isBD ? "Hop Streak" : "Border Streak"}
                </div>
                <div className="text-2xs text-slate-400 mt-0.5 leading-relaxed">
                  Keep guessing correctly to build your longest streak.
                </div>
              </button>

              {/* Blitz */}
              <button
                type="button"
                onClick={() => setSelectedMode("blitz")}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                  selectedMode === "blitz"
                    ? "bg-rose-600/20 border-rose-500 text-white shadow-lg shadow-rose-950/50"
                    : "bg-black/40 border-white/5 text-slate-400 hover:border-white/20 hover:text-slate-200"
                }`}
              >
                <div className="flex gap-2 items-center font-bold text-xs text-white">
                  <Timer className="size-4 text-rose-400" />
                  Blitz 90s
                </div>
                <div className="text-2xs text-slate-400 mt-0.5 leading-relaxed">
                  Race against the 90-second countdown clock.
                </div>
              </button>
            </div>
          </div>

          {/* Step 2: Difficulty Select */}
          <div className="space-y-2">
            <label className="text-2xs font-mono font-bold uppercase tracking-wider text-slate-400">
              2. Select Difficulty
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {/* Easy */}
              <button
                type="button"
                onClick={() => setSelectedDifficulty("easy")}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                  selectedDifficulty === "easy"
                    ? "bg-emerald-600/20 border-emerald-500 text-white shadow-lg shadow-emerald-950/50"
                    : "bg-black/40 border-white/5 text-slate-400 hover:border-white/20 hover:text-slate-200"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-emerald-400">
                    🟢 Easy
                  </span>
                  <span className="text-2xs font-mono text-emerald-300">
                    8 Guesses
                  </span>
                </div>
                <div className="text-2xs text-slate-400 leading-relaxed">
                  Full map inspection. Division or continent revealed upfront.
                </div>
              </button>

              {/* Normal */}
              <button
                type="button"
                onClick={() => setSelectedDifficulty("normal")}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                  selectedDifficulty === "normal"
                    ? "bg-amber-600/20 border-amber-500 text-white shadow-lg shadow-amber-950/50"
                    : "bg-black/40 border-white/5 text-slate-400 hover:border-white/20 hover:text-slate-200"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-amber-400">
                    🟡 Normal
                  </span>
                  <span className="text-2xs font-mono text-amber-300">
                    6 Guesses
                  </span>
                </div>
                <div className="text-2xs text-slate-400 leading-relaxed">
                  Standard game. Compass arrow shows direction.
                </div>
              </button>

              {/* Hard */}
              <button
                type="button"
                onClick={() => setSelectedDifficulty("hard")}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                  selectedDifficulty === "hard"
                    ? "bg-rose-600/20 border-rose-500 text-white shadow-lg shadow-rose-950/50"
                    : "bg-black/40 border-white/5 text-slate-400 hover:border-white/20 hover:text-slate-200"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-rose-400">
                    🔴 Hard
                  </span>
                  <span className="text-2xs font-mono text-rose-300">
                    5 Guesses
                  </span>
                </div>
                <div className="text-2xs text-slate-400 leading-relaxed">
                  Distance clues only (no compass arrow). 5 guesses max.
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Deploy Action */}
        <div className="pt-2">
          <Button
            onClick={handleDeploy}
            className={`w-full h-11 rounded-2xl font-bold text-sm tracking-wide gap-2 shadow-xl cursor-pointer ${
              isBD
                ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/60"
                : "bg-sky-600 hover:bg-sky-500 text-white shadow-sky-950/60"
            }`}
          >
            <Play className="size-4 fill-white" />
            <span>START GAME</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
