"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import confetti from "canvas-confetti";
import { useGameStore, getTodayDateStr } from "@/lib/store";
import { cn } from "@/lib/utils";
import {
  generateShareText,
  getDailyDistrict,
  getDailyCountry,
} from "@/lib/engine";
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
import { Badge } from "@/components/ui/badge";
import {
  Trophy,
  Share2,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Clock,
  SlidersHorizontal,
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

  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState(getTimeUntilMidnightUTC());
  const [isSwitchingModal, setIsSwitchingModal] = useState(false);
  const switchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (switchTimeoutRef.current) clearTimeout(switchTimeoutRef.current);
    };
  }, []);

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
      <DialogContent
        className={cn(
          "sm:max-w-md bg-card border-border text-foreground p-3.5 sm:p-4 rounded-2xl shadow-2xl max-h-[90dvh] overflow-hidden flex flex-col gap-2.5 transition-all duration-150",
          isSwitchingModal && "opacity-0 pointer-events-none scale-95"
        )}
      >
        <DialogHeader className="flex flex-row items-center gap-2.5 text-left space-y-0 shrink-0 pr-6">
          <div
            className={`flex size-9 items-center justify-center rounded-xl border shrink-0 ${
              isWon
                ? "bg-accent/15 border-accent/30 text-accent"
                : "bg-destructive/15 border-destructive/30 text-destructive"
            }`}
          >
            {isWon ? (
              <Trophy className="size-4.5" />
            ) : (
              <XCircle className="size-4.5" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <DialogTitle className="text-base font-bold tracking-tight text-foreground">
                {isWon ? "You got it!" : "Game Over"}
              </DialogTitle>
              <Badge
                variant="outline"
                className={`text-2xs font-mono font-semibold py-0 px-1.5 h-4.5 border ${
                  isWon
                    ? "bg-accent/10 border-accent/30 text-accent"
                    : "bg-destructive/10 border-destructive/30 text-destructive"
                }`}
              >
                {isWon
                  ? `${activeGuesses.length} ${
                      activeGuesses.length === 1 ? "guess" : "guesses"
                    }`
                  : "Unsolved"}
              </Badge>
            </div>

            <DialogDescription className="text-muted-foreground text-xs truncate">
              {isWon
                ? `Congratulations! You found secret ${isBD ? "district" : "country"}.`
                : `Secret was ${currentTarget.name}`}
            </DialogDescription>
          </div>
        </DialogHeader>

        {/* Target Country or District Reveal Card */}
        <TargetRevealCard
          isBD={isBD}
          scope={scope}
          targetCountry={resolvedTargetCountry}
          targetDistrict={resolvedTargetDistrict}
        />

        {mode === "daily" && (
          <div className="rounded-xl border border-border/80 bg-muted/30 px-3 py-2 space-y-0.5 shrink-0">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Clock className="size-3.5 text-accent" />
                <span className="font-semibold text-foreground">
                  Next Daily Puzzle
                </span>
              </div>
              <span className="font-mono font-bold text-accent">
                {timeLeft}
              </span>
            </div>
            <p className="text-2xs text-muted-foreground leading-tight">
              1 attempt daily. Try the other map or practice in Detective mode!
            </p>
          </div>
        )}

        <DialogFooter className="flex flex-col gap-1.5 mt-1 sm:flex-col shrink-0">
          <div className="flex flex-col sm:flex-row gap-2 w-full">
            <Button
              variant="outline"
              onClick={handleShare}
              className="w-full sm:w-1/2 h-9 text-xs border-border bg-muted/40 hover:bg-muted text-foreground cursor-pointer"
            >
              {copied ? (
                <>
                  <CheckCircle2 className="size-3.5 mr-1.5 text-primary" />{" "}
                  Copied!
                </>
              ) : (
                <>
                  <Share2 className="size-3.5 mr-1.5 text-accent" /> Share
                  Result
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
                  router.push(isBD ? "/world?mode=daily" : "/bangladesh?mode=daily");
                }}
                className={`w-full sm:w-1/2 h-9 text-xs font-semibold shadow-lg cursor-pointer ${
                  !isBD
                    ? "bg-bd-primary hover:bg-bd-primary-hover text-bd-primary-foreground"
                    : "bg-primary hover:bg-primary/90 text-primary-foreground"
                }`}
              >
                {isBD ? (
                  <span className="flex items-center justify-center gap-1.5">
                    <span>Play World Daily</span>
                    <Globe className="size-3.5 text-primary-foreground" />
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
                className={`w-full sm:w-1/2 h-9 text-xs font-semibold shadow-lg cursor-pointer ${
                  isBD
                    ? "bg-bd-primary hover:bg-bd-primary-hover text-bd-primary-foreground"
                    : "bg-primary hover:bg-primary/90 text-primary-foreground"
                }`}
              >
                {mode === "detective" && isWon ? (
                  <>
                    Next Round <ArrowRight className="size-3.5 ml-1" />
                  </>
                ) : (
                  "Play Again"
                )}
              </Button>
            )}
          </div>

          {onChangeMode && (
            <Button
              variant="outline"
              onClick={() => {
                setIsSwitchingModal(true);
                onChangeMode();
                switchTimeoutRef.current = setTimeout(() => {
                  handleClose(false);
                  setIsSwitchingModal(false);
                }, 250);
              }}
              className="w-full h-8 text-xs font-semibold bg-accent/10 hover:bg-accent/20 border-accent/30 hover:border-accent/50 text-accent cursor-pointer flex items-center justify-center gap-2 transition-all shadow-xs"
            >
              <SlidersHorizontal className="size-3.5" />
              <span>Change Game Mode or Difficulty</span>
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
