"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useGameStore, getMaxGuesses, getTodayDateStr } from "@/lib/store";
import { getDailyDistrict, getDailyCountry } from "@/lib/engine";
import { BANGLADESH_DISTRICTS } from "@/data/bangladesh";
import { COUNTRIES } from "@/data/world";
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
import { ThemeToggle } from "@/components/ThemeToggle";

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

  const dailyHistory = useGameStore((s) => s.dailyHistory);
  const today = getTodayDateStr();
  const dailyRecord = dailyHistory?.[scope];
  const isThisScopeDailyDone =
    isDaily &&
    dailyRecord?.date === today &&
    dailyRecord?.gameStatus !== "playing";

  const handleOpenResult = () => {
    if (dailyRecord && dailyRecord.date === today) {
      useGameStore.setState({
        scope,
        mode: "daily",
        difficulty: dailyRecord.difficulty ?? difficulty,
        guesses: dailyRecord.guesses,
        gameStatus: dailyRecord.gameStatus,
        unlockedHints: dailyRecord.unlockedHints,
        extraNeighborsRevealed: dailyRecord.extraNeighborsRevealed,
        targetDistrict: getDailyDistrict(BANGLADESH_DISTRICTS, today),
        targetCountry: getDailyCountry(COUNTRIES, today),
        isGameOverOpen: true,
      });
    } else {
      setGameOverOpen(true);
    }
  };

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
      <header className="w-full flex flex-col sm:flex-row sm:items-center sm:justify-between px-3 py-2 rounded-2xl border border-border bg-card/95 backdrop-blur-xl shadow-lg gap-2 text-xs">
        {/* Row 1 on mobile, Left on desktop: Exit + Mission Details */}
        <div className="flex items-center justify-between sm:justify-start gap-2 w-full sm:w-auto">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleExitClick}
              className="h-8 px-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl flex items-center gap-1 cursor-pointer shrink-0"
              title="Back to Home"
            >
              <ArrowLeft className="size-3.5" />
              <span className="hidden sm:inline text-xs font-semibold">
                Home
              </span>
            </Button>

            <div className="h-4 w-px bg-border shrink-0" />

            {/* Current Mission Badges */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {isBD ? (
                <span className="text-base leading-none shrink-0">🇧🇩</span>
              ) : (
                <Globe className="size-4 text-accent shrink-0" />
              )}
              <span className="font-bold text-foreground tracking-wide text-xs whitespace-nowrap">
                {isBD ? "Bangladesh" : "World"}
              </span>

              <div className="lg:flex hidden items-center border rounded-2xl border-border bg-muted/40 py-0.5 text-2xs font-mono font-bold uppercase">
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
          </div>

          {/* Quick Actions (Mode & Reset) on mobile top right */}
          <div className="flex sm:hidden items-center gap-1">
            <ThemeToggle className="size-8" />
            <Button
              variant="outline"
              size="sm"
              onClick={onOpenBriefing}
              className="h-8 text-2xs border-border bg-muted/50 hover:bg-muted text-foreground px-2 rounded-xl flex items-center gap-1 cursor-pointer"
              title="Change Mode"
            >
              <SlidersHorizontal className="size-3 text-accent" />
              <span className="font-semibold">Mode</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setHelpOpen(true)}
              title="How to Play"
              className="size-8 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
            >
              <HelpCircle className="size-3.5 text-accent" />
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
                  ? "opacity-30 cursor-not-allowed text-muted-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
              }`}
            >
              <RotateCcw className="size-3.5" />
            </Button>
          </div>
        </div>

        {/* Row 2 on mobile, Center + Right on desktop: Telemetry & Actions */}
        <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto pt-1 sm:pt-0 border-t border-border sm:border-t-0">
          <GameTelemetry
            mode={mode}
            blitzTimeLeft={blitzTimeLeft}
            guessCount={guesses.length}
            maxGuesses={maxGuesses}
            difficulty={difficulty}
          />

          {/* Desktop Right Actions */}
          <div className="hidden sm:flex items-center gap-1.5">
            <ThemeToggle className="size-8" />
            <Button
              variant="outline"
              size="sm"
              onClick={onOpenBriefing}
              className="h-8 text-2xs border-border bg-muted/50 hover:bg-muted text-foreground px-2.5 rounded-xl flex items-center gap-1.5 cursor-pointer"
              title="Change Mode or Difficulty"
            >
              <SlidersHorizontal className="size-3 text-accent" />
              <span className="hidden sm:inline font-semibold">Mode</span>
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setHelpOpen(true)}
              title="How to Play"
              className="size-8 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
            >
              <HelpCircle className="size-4 text-accent" />
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
                  ? "opacity-30 cursor-not-allowed text-muted-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
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
