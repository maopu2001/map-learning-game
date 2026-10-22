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
import { Badge } from "@/components/ui/badge";
import {
  Trophy,
  Share2,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Flame,
  Users,
  Maximize2,
  Compass,
  Layers,
} from "lucide-react";

interface GameOverModalProps {
  onPlayAgain?: () => void;
  onChangeMode?: () => void;
}

export function GameOverModal({ onPlayAgain, onChangeMode }: GameOverModalProps = {}) {
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
      mode === "daily" ? new Date().toISOString().slice(5, 10) : "Border Hop",
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
    if (mode === "streak" && isWon) {
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
        <div className="rounded-xl border border-white/10 bg-black/40 p-4 space-y-3">
          <div className="flex items-center gap-3">
            {!isBD && <span className="text-4xl">{targetCountry.flagEmoji}</span>}
            <div className="min-w-0 flex-1">
              <h4 className="text-lg font-bold text-white flex items-center gap-2 flex-wrap">
                <span>{currentTarget.name}</span>
                <Badge variant="outline" className="text-xs border-white/10 font-mono">
                  {isBD ? "District" : targetCountry.id}
                </Badge>
                {!isBD && targetCountry.isIsland && (
                  <Badge variant="outline" className="text-2xs border-sky-500/30 text-sky-400 font-sans">
                    Island Nation
                  </Badge>
                )}
                {isBD && targetDistrict.isCoastal && (
                  <Badge variant="outline" className="text-2xs border-emerald-500/30 text-emerald-400 font-sans">
                    Coastal
                  </Badge>
                )}
              </h4>
              {!isBD && targetCountry.officialName && targetCountry.officialName !== targetCountry.name && (
                <p className="text-2xs text-slate-400 italic truncate">
                  {targetCountry.officialName}
                </p>
              )}
              <p className="text-xs text-slate-300">
                {isBD
                  ? `${targetDistrict.division} Division`
                  : `Capital: ${targetCountry.capital} • ${targetCountry.subregion || targetCountry.region}`}
              </p>
            </div>
          </div>

          {/* Demographic & Spatial Metrics Row */}
          <div className="grid grid-cols-2 gap-2 text-2xs">
            {!isBD ? (
              <>
                <div className="px-2.5 py-1.5 rounded-lg bg-[#070a12] border border-white/5 flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Users className="size-3 text-sky-400" /> Population
                  </span>
                  <span className="font-mono font-semibold text-slate-200">
                    {targetCountry.population ? targetCountry.population.toLocaleString() : "N/A"}
                  </span>
                </div>
                <div className="px-2.5 py-1.5 rounded-lg bg-[#070a12] border border-white/5 flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Maximize2 className="size-3 text-emerald-400" /> Area
                  </span>
                  <span className="font-mono font-semibold text-slate-200">
                    {targetCountry.area ? `${targetCountry.area.toLocaleString()} km²` : "N/A"}
                  </span>
                </div>
                <div className="px-2.5 py-1.5 rounded-lg bg-[#070a12] border border-white/5 flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Compass className="size-3 text-purple-400" /> Coordinates
                  </span>
                  <span className="font-mono font-semibold text-slate-200">
                    {Math.abs(targetCountry.coordinates[0]).toFixed(1)}°{targetCountry.coordinates[0] >= 0 ? "N" : "S"}, {Math.abs(targetCountry.coordinates[1]).toFixed(1)}°{targetCountry.coordinates[1] >= 0 ? "E" : "W"}
                  </span>
                </div>
                <div className="px-2.5 py-1.5 rounded-lg bg-[#070a12] border border-white/5 flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Layers className="size-3 text-amber-400" /> {targetCountry.borders.length > 0 ? "Borders" : "Neighbors"}
                  </span>
                  <span className="font-mono font-semibold text-slate-200">
                    {targetCountry.borders.length > 0
                      ? `${targetCountry.borders.length} Land borders`
                      : `${targetCountry.maritimeNeighbors?.length || 0} Nearby`}
                  </span>
                </div>
              </>
            ) : (
              <>
                <div className="px-2.5 py-1.5 rounded-lg bg-[#070a12] border border-white/5 flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Compass className="size-3 text-sky-400" /> Coordinates
                  </span>
                  <span className="font-mono font-semibold text-slate-200">
                    {targetDistrict.coordinates[0].toFixed(2)}°N, {targetDistrict.coordinates[1].toFixed(2)}°E
                  </span>
                </div>
                <div className="px-2.5 py-1.5 rounded-lg bg-[#070a12] border border-white/5 flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Layers className="size-3 text-emerald-400" /> Borders
                  </span>
                  <span className="font-mono font-semibold text-slate-200">
                    {targetDistrict.borders.length} Neighbors
                  </span>
                </div>
              </>
            )}
          </div>

          <div className="p-3 rounded-lg bg-[#070a12] border border-white/5 text-xs text-slate-300 leading-relaxed">
            <span className="font-semibold text-amber-400">Did you know? </span>
            {currentTarget.triviaFact}
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2.5 rounded-xl border border-white/10 bg-black/40">
            <div className="text-xl font-bold font-mono text-white">{stats.streak}</div>
            <div className="text-2xs text-slate-400 flex items-center justify-center gap-1 font-mono uppercase tracking-wider mt-0.5">
              <Flame className="size-3 text-amber-500" /> Streak
            </div>
          </div>
          <div className="p-2.5 rounded-xl border border-white/10 bg-black/40">
            <div className="text-xl font-bold font-mono text-emerald-400">
              {stats.played > 0 ? Math.round((stats.won / stats.played) * 100) : 0}%
            </div>
            <div className="text-2xs text-slate-400 uppercase font-mono tracking-wider mt-0.5">Win Rate</div>
          </div>
          <div className="p-2.5 rounded-xl border border-white/10 bg-black/40">
            <div className="text-xl font-bold font-mono text-sky-400">{stats.maxStreak}</div>
            <div className="text-2xs text-slate-400 uppercase font-mono tracking-wider mt-0.5">Best Streak</div>
          </div>
        </div>

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
            {mode === "streak" && isWon ? (
              <>
                Next Hop <ArrowRight className="size-4 ml-1" />
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
