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
import { Play, SlidersHorizontal, AlertTriangle } from "lucide-react";
import { ModeSelector } from "@/components/Game/ModeSelector";
import { DifficultySelector } from "@/components/Game/DifficultySelector";

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
              <span>
                {guesses.length} {guesses.length === 1 ? "guess" : "guesses"}
              </span>
              <span>•</span>
              <span>
                {unlockedHints} {unlockedHints === 1 ? "hint" : "hints"}
              </span>
            </div>
          </div>
        )}

        <div className="space-y-3">
          <ModeSelector
            selectedMode={selectedMode}
            onSelectMode={setSelectedMode}
            isBD={isBD}
          />
          <DifficultySelector
            selectedDifficulty={selectedDifficulty}
            onSelectDifficulty={setSelectedDifficulty}
            isBD={isBD}
            selectedMode={selectedMode}
          />
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
