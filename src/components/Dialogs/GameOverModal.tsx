"use client";

import React, { useEffect, useState } from "react";
import confetti from "canvas-confetti";
import { useGameStore } from "@/lib/store";
import { generateShareText } from "@/lib/engine";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Trophy,
  Share2,
  CheckCircle2,
  XCircle,
  ArrowRight,
} from "lucide-react";
import { TargetRevealCard } from "@/components/Game/TargetRevealCard";
import { GameOverStatsGrid } from "@/components/Game/GameOverStatsGrid";

interface GameOverModalProps {
  onPlayAgain?: () => void;
  onChangeMode?: () => void;
}

export function GameOverModal({
  onPlayAgain,
  onChangeMode,
}: GameOverModalProps = {}) {
  const scope = useGameStore((s) => s.scope);
  const gameStatus = useGameStore((s) => s.gameStatus);
  const targetCountry = useGameStore((s) => s.targetCountry);
  const targetDistrict = useGameStore((s) => s.targetDistrict);
  const guesses = useGameStore((s) => s.guesses);
  const stats = useGameStore((s) => s.stats);
  const mode = useGameStore((s) => s.mode);
  const nextStreakRound = useGameStore((s) => s.nextStreakRound);
  const resetGame = useGameStore((s) => s.resetGame);

  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);

  const isWon = gameStatus === "won";
  const isBD = scope === "bangladesh";
  const currentTarget = isBD ? targetDistrict : targetCountry;

  useEffect(() => {
    if (gameStatus === "won") {
      setOpen(true);
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#10b981", "#38bdf8", "#f59e0b", "#ec4899"],
        });
      } catch {
        // Confetti gracefully skipped if canvas not loaded
      }
    } else if (gameStatus === "lost") {
      setOpen(true);
    } else {
      setOpen(false);
    }
  }, [gameStatus]);

  const handleShare = async () => {
    const text = generateShareText(
      mode === "daily"
        ? new Date().toISOString().slice(5, 10)
        : mode === "detective"
          ? "Borderline Detective"
          : "Blitz",
      guesses,
      isWon,
      stats.streak,
      isBD ? "Bangladesh Borderline" : "Borderline"
    );
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handleNextAction = () => {
    setOpen(false);
    if (mode === "detective" && isWon) {
      nextStreakRound();
    } else {
      resetGame();
      if (onPlayAgain) onPlayAgain();
    }
  };

  if (!currentTarget || gameStatus === "playing") return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md bg-[#0c101c] border-white/10 text-white p-5 sm:p-6 rounded-2xl shadow-2xl max-h-[90dvh] overflow-y-auto">
        <DialogHeader className="text-center sm:text-center space-y-3">
          <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-black/40 border border-white/10">
            {isWon ? (
              <Trophy className="size-8 text-amber-400 animate-bounce" />
            ) : (
              <XCircle className="size-8 text-rose-500" />
            )}
          </div>

          <DialogTitle className="text-2xl font-black tracking-tight text-white">
            {isWon ? "You got it!" : "Game Over"}
          </DialogTitle>

          <DialogDescription className="text-slate-400 text-xs">
            {isWon
              ? `You found the secret ${isBD ? "district" : "country"} in ${guesses.length} ${
                  guesses.length === 1 ? "guess" : "guesses"
                }!`
              : `The secret ${isBD ? "district" : "country"} was ${currentTarget.name}. Better luck next round!`}
          </DialogDescription>
        </DialogHeader>

        {/* Target Country or District Reveal Card */}
        <TargetRevealCard
          isBD={isBD}
          targetCountry={targetCountry}
          targetDistrict={targetDistrict}
        />

        {/* Stats Row */}
        <GameOverStatsGrid
          streak={stats.streak}
          played={stats.played}
          won={stats.won}
          maxStreak={stats.maxStreak}
        />

        <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-2">
          <Button
            variant="outline"
            onClick={handleShare}
            className="w-full sm:w-1/2 border-white/10 bg-white/5 hover:bg-white/10 text-slate-200"
          >
            {copied ? (
              <>
                <CheckCircle2 className="size-4 mr-2 text-emerald-400" /> Copied!
              </>
            ) : (
              <>
                <Share2 className="size-4 mr-2 text-sky-400" /> Share Result
              </>
            )}
          </Button>

          <Button
            variant="default"
            onClick={handleNextAction}
            className="w-full sm:w-1/2 bg-sky-600 hover:bg-sky-500 text-white font-semibold shadow-lg shadow-sky-950/50"
          >
            {mode === "detective" && isWon ? (
              <>
                Next Round <ArrowRight className="size-4 ml-1" />
              </>
            ) : (
              "Play Again"
            )}
          </Button>
        </DialogFooter>

        {onChangeMode && (
          <div className="pt-2 text-center">
            <button
              onClick={() => {
                setOpen(false);
                onChangeMode();
              }}
              className="text-2xs text-slate-400 hover:text-white underline underline-offset-4 cursor-pointer font-mono"
            >
              Change mode or difficulty ↗
            </button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
