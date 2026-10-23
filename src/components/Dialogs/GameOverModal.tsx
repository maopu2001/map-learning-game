"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
  Clock,
  Compass,
  Globe,
} from "lucide-react";
import { TargetRevealCard } from "@/components/Game/TargetRevealCard";

interface GameOverModalProps {
  onPlayAgain?: () => void;
  onChangeMode?: () => void;
}

function getTimeUntilMidnightUTC(): string {
  const now = new Date();
  const midnight = new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate() + 1,
      0,
      0,
      0,
      0,
    ),
  );
  const diff = Math.max(0, midnight.getTime() - now.getTime());
  const h = Math.floor(diff / (1000 * 60 * 60));
  const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const s = Math.floor((diff % (1000 * 60)) / 1000);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function GameOverModal({
  onPlayAgain,
  onChangeMode,
}: GameOverModalProps = {}) {
  const router = useRouter();
  const scope = useGameStore((s) => s.scope);
  const gameStatus = useGameStore((s) => s.gameStatus);
  const targetCountry = useGameStore((s) => s.targetCountry);
  const targetDistrict = useGameStore((s) => s.targetDistrict);
  const guesses = useGameStore((s) => s.guesses);
  const mode = useGameStore((s) => s.mode);
  const isGameOverOpen = useGameStore((s) => s.isGameOverOpen);
  const setGameOverOpen = useGameStore((s) => s.setGameOverOpen);
  const nextDetectiveRound = useGameStore((s) => s.nextDetectiveRound);
  const resetGame = useGameStore((s) => s.resetGame);
  const forfeitAndSwitch = useGameStore((s) => s.forfeitAndSwitch);

  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState(getTimeUntilMidnightUTC());

  const isWon = gameStatus === "won";
  const isBD = scope === "bangladesh";
  const currentTarget = isBD ? targetDistrict : targetCountry;

  // Confetti when winning dialog opens
  useEffect(() => {
    if (isGameOverOpen && isWon) {
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
    }
  }, [isGameOverOpen, isWon]);

  useEffect(() => {
    if (mode !== "daily") return;
    const interval = setInterval(() => {
      setTimeLeft(getTimeUntilMidnightUTC());
    }, 1000);
    return () => clearInterval(interval);
  }, [mode]);

  const handleShare = async () => {
    const text = generateShareText(
      mode === "daily"
        ? new Date().toISOString().slice(5, 10)
        : mode === "detective"
          ? "Shimana Detective"
          : "Blitz",
      guesses,
      isWon,
      isBD ? "Bangladesh Shimana" : "Shimana",
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
    setGameOverOpen(false);
    if (mode === "detective" && isWon) {
      nextDetectiveRound();
    } else {
      resetGame();
      if (onPlayAgain) onPlayAgain();
    }
  };

  const handleClose = (isOpen: boolean) => {
    setGameOverOpen(isOpen);
  };

  if (!currentTarget || gameStatus === "playing") return null;

  return (
    <Dialog open={isGameOverOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-surface-card border-white/10 text-white p-5 sm:p-6 rounded-2xl shadow-2xl max-h-[90dvh] overflow-y-auto">
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

        {mode === "daily" && (
          <div className="rounded-xl border border-white/10 bg-white/5 p-3 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-slate-300">
                <Clock className="size-3.5 text-sky-400" />
                <span className="font-semibold">Next Daily Puzzle</span>
              </div>
              <span className="font-mono font-bold text-sky-400">
                {timeLeft}
              </span>
            </div>
            <p className="text-2xs text-slate-400 leading-relaxed">
              Daily puzzles can be played only once per day (win or loss). Play
              the other mode or practice in Detective mode!
            </p>
          </div>
        )}

        <DialogFooter className="flex flex-col gap-2 mt-2 sm:flex-col">
          <div className="flex flex-col sm:flex-row gap-2 w-full">
            <Button
              variant="outline"
              onClick={handleShare}
              className="w-full sm:w-1/2 border-white/10 bg-white/5 hover:bg-white/10 text-slate-200 cursor-pointer"
            >
              {copied ? (
                <>
                  <CheckCircle2 className="size-4 mr-2 text-emerald-400" />{" "}
                  Copied!
                </>
              ) : (
                <>
                  <Share2 className="size-4 mr-2 text-sky-400" /> Share Result
                </>
              )}
            </Button>

            {mode === "daily" ? (
              <Button
                variant="default"
                onClick={() => {
                  handleClose(false);
                  router.push(isBD ? "/world" : "/bangladesh");
                }}
                className="w-full sm:w-1/2 bg-sky-600 hover:bg-sky-500 text-white font-semibold shadow-lg shadow-sky-950/50 cursor-pointer"
              >
                {isBD ? (
                  <span className="flex items-center justify-center gap-1.5">
                    <span>Play World Daily</span>
                    <Globe className="size-4 text-sky-300" />
                  </span>
                ) : (
                  <span>Play BD Daily 🇧🇩</span>
                )}
              </Button>
            ) : (
              <Button
                variant="default"
                onClick={handleNextAction}
                className="w-full sm:w-1/2 bg-sky-600 hover:bg-sky-500 text-white font-semibold shadow-lg shadow-sky-950/50 cursor-pointer"
              >
                {mode === "detective" && isWon ? (
                  <>
                    Next Round <ArrowRight className="size-4 ml-1" />
                  </>
                ) : (
                  "Play Again"
                )}
              </Button>
            )}
          </div>

          {mode === "daily" && (
            <Button
              variant="ghost"
              onClick={() => {
                handleClose(false);
                forfeitAndSwitch({ mode: "detective", reset: true });
              }}
              className="w-full h-8 text-2xs text-slate-400 hover:text-white hover:bg-white/5 cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Compass className="size-3.5 text-amber-400" />
              <span>Practice in Detective Mode (Unlimited)</span>
            </Button>
          )}
        </DialogFooter>

        {onChangeMode && mode !== "daily" && (
          <div className="pt-2 text-center">
            <button
              onClick={() => {
                handleClose(false);
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
