"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import confetti from "canvas-confetti";
import { useGameStore, getTodayDateStr } from "@/lib/store";
import { generateShareText, getDailyDistrict, getDailyCountry } from "@/lib/engine";
import { BANGLADESH_DISTRICTS } from "@/data/bangladesh";
import { COUNTRIES } from "@/data/world";
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
  scope?: "bangladesh" | "world";
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

export function GameOverModal(props: GameOverModalProps = {}) {
  const { onPlayAgain, onChangeMode } = props;
  const router = useRouter();
  const storeScope = useGameStore((s) => s.scope);
  const scope = props.scope || storeScope;
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

  const isBD = scope === "bangladesh";
  const dailyHistory = useGameStore((s) => s.dailyHistory);
  const today = getTodayDateStr();
  const dailyRecord = dailyHistory?.[scope];
  const isDailyScopeDone =
    mode === "daily" &&
    dailyRecord?.date === today &&
    dailyRecord?.gameStatus !== "playing";

  const activeGuesses = isDailyScopeDone ? dailyRecord.guesses : guesses;
  const activeStatus = isDailyScopeDone ? dailyRecord.gameStatus : gameStatus;
  const isWon = activeStatus === "won";

  const resolvedTargetDistrict =
    mode === "daily"
      ? getDailyDistrict(BANGLADESH_DISTRICTS, today)
      : targetDistrict;
  const resolvedTargetCountry =
    mode === "daily" ? getDailyCountry(COUNTRIES, today) : targetCountry;
  const currentTarget = isBD ? resolvedTargetDistrict : resolvedTargetCountry;

  const isOpen = isGameOverOpen && (mode !== "daily" || isDailyScopeDone);

  // Confetti when winning dialog opens
  useEffect(() => {
    if (isOpen && isWon) {
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#77b493", "#b07563", "#0f766e", "#ce7069", "#fb923c"],
        });
      } catch {
        // Confetti gracefully skipped if canvas not loaded
      }
    }
  }, [isOpen, isWon]);

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
      activeGuesses,
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

  const handleClose = (openState: boolean) => {
    setGameOverOpen(openState);
  };

  if (!currentTarget || activeStatus === "playing" || !isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-card border-border text-foreground p-5 sm:p-6 rounded-2xl shadow-2xl max-h-[90dvh] overflow-y-auto">
        <DialogHeader className="text-center sm:text-center space-y-3">
          <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-muted/60 border border-border">
            {isWon ? (
              <Trophy className="size-8 text-accent animate-bounce" />
            ) : (
              <XCircle className="size-8 text-destructive" />
            )}
          </div>

          <DialogTitle className="text-2xl font-black tracking-tight text-foreground">
            {isWon ? "You got it!" : "Game Over"}
          </DialogTitle>

          <DialogDescription className="text-muted-foreground text-xs">
            {isWon
              ? `You found the secret ${isBD ? "district" : "country"} in ${activeGuesses.length} ${
                  activeGuesses.length === 1 ? "guess" : "guesses"
                }!`
              : `The secret ${isBD ? "district" : "country"} was ${currentTarget.name}. Better luck next round!`}
          </DialogDescription>
        </DialogHeader>

        {/* Target Country or District Reveal Card */}
        <TargetRevealCard
          isBD={isBD}
          scope={scope}
          targetCountry={resolvedTargetCountry}
          targetDistrict={resolvedTargetDistrict}
        />

        {mode === "daily" && (
          <div className="rounded-xl border border-border bg-muted/30 p-3 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-foreground">
                <Clock className="size-3.5 text-accent" />
                <span className="font-semibold">Next Daily Puzzle</span>
              </div>
              <span className="font-mono font-bold text-accent">
                {timeLeft}
              </span>
            </div>
            <p className="text-2xs text-muted-foreground leading-relaxed">
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
              className="w-full sm:w-1/2 border-border bg-muted/40 hover:bg-muted text-foreground cursor-pointer"
            >
              {copied ? (
                <>
                  <CheckCircle2 className="size-4 mr-2 text-primary" />{" "}
                  Copied!
                </>
              ) : (
                <>
                  <Share2 className="size-4 mr-2 text-accent" /> Share Result
                </>
              )}
            </Button>

            {mode === "daily" ? (
              <Button
                variant="default"
                onClick={() => {
                  handleClose(false);
                  const targetScope = isBD ? "world" : "bangladesh";
                  useGameStore.getState().initRouteScope(targetScope);
                  router.push(isBD ? "/world" : "/bangladesh");
                }}
                className={`w-full sm:w-1/2 font-semibold shadow-lg cursor-pointer ${
                  !isBD
                    ? "bg-bd-primary hover:bg-bd-primary-hover text-bd-primary-foreground"
                    : "bg-primary hover:bg-primary/90 text-primary-foreground"
                }`}
              >
                {isBD ? (
                  <span className="flex items-center justify-center gap-1.5">
                    <span>Play World Daily</span>
                    <Globe className="size-4 text-primary-foreground" />
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-1.5">
                    <span>Play BD Daily</span>
                    <span className="flag-shadow">🇧🇩</span>
                  </span>
                )}
              </Button>
            ) : (
              <Button
                variant="default"
                onClick={handleNextAction}
                className={`w-full sm:w-1/2 font-semibold shadow-lg cursor-pointer ${
                  isBD
                    ? "bg-bd-primary hover:bg-bd-primary-hover text-bd-primary-foreground"
                    : "bg-primary hover:bg-primary/90 text-primary-foreground"
                }`}
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
              className="w-full h-8 text-2xs text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Compass className="size-3.5 text-accent" />
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
              className="text-2xs text-muted-foreground hover:text-foreground underline underline-offset-4 cursor-pointer font-mono"
            >
              Change mode or difficulty ↗
            </button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
