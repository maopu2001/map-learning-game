"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useGameStore, getMaxGuesses } from "@/lib/store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  SlidersHorizontal,
  Trophy,
  HelpCircle,
  RotateCcw,
} from "lucide-react";
import { StatsDialog } from "@/components/Dialogs/StatsDialog";
import { HelpDialog } from "@/components/Dialogs/HelpDialog";
import { AbandonConfirmDialog } from "@/components/Dialogs/AbandonConfirmDialog";
import { GameTelemetry } from "@/components/Game/GameTelemetry";

interface GameHUDProps {
  scope: "bangladesh" | "world";
  onOpenBriefing: () => void;
}

export function GameHUD({ scope, onOpenBriefing }: GameHUDProps) {
  const router = useRouter();
  const mode = useGameStore((s) => s.mode);
  const difficulty = useGameStore((s) => s.difficulty);
  const stats = useGameStore((s) => s.stats);
  const guesses = useGameStore((s) => s.guesses);
  const blitzTimeLeft = useGameStore((s) => s.blitzTimeLeft);
  const gameStatus = useGameStore((s) => s.gameStatus);
  const resetGame = useGameStore((s) => s.resetGame);
  const forfeitAndSwitch = useGameStore((s) => s.forfeitAndSwitch);
  const unlockedHints = useGameStore((s) => s.unlockedHints);

  const [statsOpen, setStatsOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [abandonPending, setAbandonPending] = useState<"exit" | "reset" | null>(null);

  const maxGuesses = getMaxGuesses(difficulty);
  const isBD = scope === "bangladesh";
  const isMissionActive =
    gameStatus === "playing" &&
    (guesses.length > 0 || unlockedHints > 0 || (mode === "blitz" && blitzTimeLeft < 90));

  const handleExitClick = () => {
    if (isMissionActive) {
      setAbandonPending("exit");
    } else {
      router.push("/");
    }
  };

  const handleResetClick = () => {
    if (isMissionActive) {
      setAbandonPending("reset");
    } else {
      resetGame();
    }
  };

  const handleConfirmAbandon = () => {
    if (abandonPending === "exit") {
      forfeitAndSwitch({ reset: true });
      setAbandonPending(null);
      router.push("/");
    } else if (abandonPending === "reset") {
      forfeitAndSwitch({ reset: true });
      setAbandonPending(null);
    }
  };

  return (
    <>
      <header className="w-full flex flex-col sm:flex-row sm:items-center sm:justify-between px-3 py-2 rounded-2xl border border-white/10 bg-[#070a12]/95 backdrop-blur-xl shadow-lg gap-2 text-xs">
        {/* Row 1 on mobile, Left on desktop: Exit + Mission Details */}
        <div className="flex items-center justify-between sm:justify-start gap-2 w-full sm:w-auto">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleExitClick}
              className="h-8 px-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl flex items-center gap-1 cursor-pointer shrink-0"
              title="Back to Home"
            >
              <ArrowLeft className="size-3.5" />
              <span className="hidden sm:inline text-xs font-semibold">Home</span>
            </Button>

            <div className="h-4 w-px bg-white/10 shrink-0" />

            {/* Current Mission Badges */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-base leading-none shrink-0">{isBD ? "🇧🇩" : "🌍"}</span>
              <span className="font-bold text-white tracking-wide text-xs whitespace-nowrap">
                {isBD ? "Bangladesh" : "World"}
              </span>

              <Badge
                variant="outline"
                className={`text-2xs font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-lg border ${
                  mode === "daily"
                    ? "border-sky-500/40 text-sky-300 bg-sky-500/10"
                    : mode === "detective"
                      ? "border-amber-500/40 text-amber-300 bg-amber-500/10"
                      : "border-rose-500/40 text-rose-300 bg-rose-500/10"
                }`}
              >
                {mode === "daily"
                  ? "Daily"
                  : mode === "detective"
                    ? "Detective"
                    : "Blitz"}
              </Badge>

              <Badge
                variant="outline"
                className={`text-2xs font-mono uppercase px-2 py-0.5 rounded-lg border hidden md:inline-flex ${
                  difficulty === "easy"
                    ? "border-emerald-500/30 text-emerald-300 bg-emerald-500/10"
                    : difficulty === "normal"
                      ? "border-amber-500/30 text-amber-300 bg-amber-500/10"
                      : "border-rose-500/30 text-rose-300 bg-rose-500/10"
                }`}
              >
                {difficulty}
              </Badge>
            </div>
          </div>

          {/* Quick Actions (Mode & Reset) on mobile top right */}
          <div className="flex sm:hidden items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={onOpenBriefing}
              className="h-8 text-2xs border-white/10 bg-white/5 hover:bg-white/10 text-slate-200 px-2 rounded-xl flex items-center gap-1 cursor-pointer"
              title="Change Mode"
            >
              <SlidersHorizontal className="size-3 text-sky-400" />
              <span className="font-semibold">Mode</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setStatsOpen(true)}
              title="Stats"
              className="size-8 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 cursor-pointer"
            >
              <Trophy className="size-3.5 text-amber-400" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setHelpOpen(true)}
              title="How to Play"
              className="size-8 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 cursor-pointer"
            >
              <HelpCircle className="size-3.5 text-sky-400" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleResetClick}
              title={isMissionActive ? "Restart Round" : "New Round"}
              className="size-8 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 cursor-pointer"
            >
              <RotateCcw className="size-3.5" />
            </Button>
          </div>
        </div>

        {/* Row 2 on mobile, Center + Right on desktop: Telemetry & Actions */}
        <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto pt-1 sm:pt-0 border-t border-white/5 sm:border-t-0">
          <GameTelemetry
            mode={mode}
            blitzTimeLeft={blitzTimeLeft}
            streak={stats.streak}
            guessCount={guesses.length}
            maxGuesses={maxGuesses}
          />

          {/* Desktop Right Actions */}
          <div className="hidden sm:flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              onClick={onOpenBriefing}
              className="h-8 text-2xs border-white/10 bg-white/5 hover:bg-white/10 text-slate-200 px-2.5 rounded-xl flex items-center gap-1.5 cursor-pointer"
              title="Change Mode or Difficulty"
            >
              <SlidersHorizontal className="size-3 text-sky-400" />
              <span className="hidden sm:inline font-semibold">Mode</span>
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setStatsOpen(true)}
              title="Stats"
              className="size-8 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 cursor-pointer"
            >
              <Trophy className="size-4 text-amber-400" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setHelpOpen(true)}
              title="How to Play"
              className="size-8 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 cursor-pointer"
            >
              <HelpCircle className="size-4 text-sky-400" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={handleResetClick}
              title={isMissionActive ? "Restart Round" : "New Round"}
              className="size-8 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 cursor-pointer"
            >
              <RotateCcw className="size-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Abandon Confirmation Dialog */}
      <AbandonConfirmDialog
        open={Boolean(abandonPending)}
        onOpenChange={(open) => {
          if (!open) setAbandonPending(null);
        }}
        guessesCount={guesses.length}
        unlockedHints={unlockedHints}
        isStreakMode={mode === "detective"}
        currentStreak={stats.streak}
        onConfirm={handleConfirmAbandon}
      />

      {/* Career Record Modal */}
      <StatsDialog open={statsOpen} onOpenChange={setStatsOpen} />

      {/* Mission Directives Modal */}
      <HelpDialog open={helpOpen} onOpenChange={setHelpOpen} />
    </>
  );
}
