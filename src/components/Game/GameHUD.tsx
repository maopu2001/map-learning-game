"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useGameStore, getMaxGuesses } from "@/lib/store";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  SlidersHorizontal,
  HelpCircle,
  RotateCcw,
  Trophy,
  Globe,
} from "lucide-react";
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
  const guesses = useGameStore((s) => s.guesses);
  const blitzTimeLeft = useGameStore((s) => s.blitzTimeLeft);
  const gameStatus = useGameStore((s) => s.gameStatus);
  const resetGame = useGameStore((s) => s.resetGame);
  const forfeitAndSwitch = useGameStore((s) => s.forfeitAndSwitch);
  const unlockedHints = useGameStore((s) => s.unlockedHints);
  const setGameOverOpen = useGameStore((s) => s.setGameOverOpen);

  const [helpOpen, setHelpOpen] = useState(false);
  const [abandonPending, setAbandonPending] = useState<"exit" | "reset" | null>(
    null,
  );

  const maxGuesses = getMaxGuesses(difficulty);
  const isBD = scope === "bangladesh";
  const isDaily = mode === "daily";
  const isMissionActive =
    gameStatus === "playing" &&
    (guesses.length > 0 ||
      unlockedHints > 0 ||
      (mode === "blitz" && blitzTimeLeft < 90));

  const handleExitClick = () => {
    if (isMissionActive) {
      setAbandonPending("exit");
    } else {
      router.push("/");
    }
  };

  const handleResetClick = () => {
    if (isDaily) return;
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
              <span className="hidden sm:inline text-xs font-semibold">
                Home
              </span>
            </Button>

            <div className="h-4 w-px bg-white/10 shrink-0" />

            {/* Current Mission Badges */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {isBD ? (
                <span className="text-base leading-none shrink-0">🇧🇩</span>
              ) : (
                <Globe className="size-4 text-sky-400 shrink-0" />
              )}
              <span className="font-bold text-white tracking-wide text-xs whitespace-nowrap">
                {isBD ? "Bangladesh" : "World"}
              </span>

              <div className="lg:flex hidden items-center border rounded-2xl border-white/10 bg-white/5 py-0.5 text-2xs font-mono font-bold uppercase">
                <span
                  className={`tracking-wider border-r border-white/10 px-2 ${
                    mode === "daily"
                      ? "text-sky-300"
                      : mode === "detective"
                        ? "text-amber-300"
                        : "text-rose-300"
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
                      ? "text-emerald-300"
                      : difficulty === "normal"
                        ? "text-amber-300"
                        : "text-rose-300"
                  }`}
                >
                  {difficulty}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions (Mode & Reset) on mobile top right */}
          <div className="flex sm:hidden items-center gap-1">
            {isDaily && gameStatus !== "playing" && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setGameOverOpen(true)}
                className="h-8 text-2xs border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 px-2 rounded-xl flex items-center gap-1 cursor-pointer"
                title="View Daily Result"
              >
                <Trophy className="size-3 text-emerald-400" />
                <span className="font-semibold">Result</span>
              </Button>
            )}
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
              onClick={() => setHelpOpen(true)}
              title="How to Play"
              className="size-8 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 cursor-pointer"
            >
              <HelpCircle className="size-3.5 text-sky-400" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              disabled={isDaily}
              onClick={handleResetClick}
              title={
                isDaily
                  ? "Daily puzzle cannot be restarted"
                  : isMissionActive
                    ? "Restart Round"
                    : "New Round"
              }
              className={`size-8 rounded-xl ${
                isDaily
                  ? "opacity-30 cursor-not-allowed text-slate-600"
                  : "text-slate-400 hover:text-white hover:bg-white/5 cursor-pointer"
              }`}
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
            guessCount={guesses.length}
            maxGuesses={maxGuesses}
            difficulty={difficulty}
          />

          {/* Desktop Right Actions */}
          <div className="hidden sm:flex items-center gap-1.5">
            {isDaily && gameStatus !== "playing" && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setGameOverOpen(true)}
                className="h-8 text-2xs border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 px-2.5 rounded-xl flex items-center gap-1.5 cursor-pointer"
                title="View Daily Result"
              >
                <Trophy className="size-3 text-emerald-400" />
                <span className="font-semibold">Result</span>
              </Button>
            )}

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
              onClick={() => setHelpOpen(true)}
              title="How to Play"
              className="size-8 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 cursor-pointer"
            >
              <HelpCircle className="size-4 text-sky-400" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              disabled={isDaily}
              onClick={handleResetClick}
              title={
                isDaily
                  ? "Daily puzzle cannot be restarted"
                  : isMissionActive
                    ? "Restart Round"
                    : "New Round"
              }
              className={`size-8 rounded-xl ${
                isDaily
                  ? "opacity-30 cursor-not-allowed text-slate-600"
                  : "text-slate-400 hover:text-white hover:bg-white/5 cursor-pointer"
              }`}
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
        onConfirm={handleConfirmAbandon}
      />

      {/* Mission Directives Modal */}
      <HelpDialog open={helpOpen} onOpenChange={setHelpOpen} />
    </>
  );
}
