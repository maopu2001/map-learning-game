"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useGameStore, getMaxGuesses } from "@/lib/store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  SlidersHorizontal,
  Trophy,
  HelpCircle,
  RotateCcw,
  Timer,
  Flame,
  AlertTriangle,
  MapPin,
  ShieldAlert,
} from "lucide-react";

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

  const [statsOpen, setStatsOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [abandonPending, setAbandonPending] = useState<"exit" | "reset" | null>(null);

  const maxGuesses = getMaxGuesses(difficulty);
  const isBD = scope === "bangladesh";
  const unlockedHints = useGameStore((s) => s.unlockedHints);
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
                    : mode === "streak"
                      ? "border-amber-500/40 text-amber-300 bg-amber-500/10"
                      : "border-rose-500/40 text-rose-300 bg-rose-500/10"
                }`}
              >
                {mode === "daily"
                  ? "Daily"
                  : mode === "streak"
                    ? isBD
                      ? "Hop Streak"
                      : "Border Streak"
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
        <div className="flex items-center justify-between sm:justify-end gap-2 font-mono w-full sm:w-auto pt-1 sm:pt-0 border-t border-white/5 sm:border-t-0">
          <div className="flex items-center gap-2">
            {mode === "blitz" && (
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 font-bold text-xs">
                <Timer className="size-3.5 animate-pulse text-rose-400" />
                <span>{blitzTimeLeft}s</span>
              </div>
            )}

            {mode === "streak" && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-950/60 border border-amber-500/40 text-amber-300 font-bold text-xs">
                <Flame className="size-3.5 text-amber-400" />
                <span>Streak: {stats.streak}</span>
              </div>
            )}

            {/* Guesses Pip Tracker */}
            <div className="flex items-center gap-1.5 bg-black/40 px-2.5 py-1 rounded-xl border border-white/5 text-2xs text-slate-300">
              <span className="text-slate-400">Guesses:</span>
              <span className="font-bold text-white text-xs">{guesses.length}</span>
              <span className="text-slate-500">/ {maxGuesses}</span>
            </div>
          </div>

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
      <Dialog
        open={Boolean(abandonPending)}
        onOpenChange={(open) => {
          if (!open) setAbandonPending(null);
        }}
      >
        <DialogContent className="sm:max-w-md bg-[#0a0f1d] border border-amber-500/30 text-white rounded-3xl shadow-2xl backdrop-blur-xl max-h-[90dvh] overflow-y-auto">
          <DialogHeader className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="size-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <AlertTriangle className="size-4" />
              </div>
              <DialogTitle className="text-base font-bold text-white">
                Leave current game?
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs text-slate-400 leading-relaxed">
              You have a game in progress (
              {guesses.length > 0 && `${guesses.length} guesses`}
              {guesses.length > 0 && unlockedHints > 0 && " · "}
              {unlockedHints > 0 && `${unlockedHints} hints unlocked`}
              {guesses.length === 0 && unlockedHints === 0 && "timer running"}
              ). Quitting or restarting now counts as a forfeit.
            </DialogDescription>
          </DialogHeader>

          {mode === "streak" && stats.streak > 0 && (
            <div className="p-3 rounded-2xl bg-amber-950/30 border border-amber-500/20 text-xs text-amber-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Flame className="size-3.5 text-amber-400" /> Current Streak:
              </span>
              <span className="font-bold">{stats.streak} wins (will reset to 0)</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAbandonPending(null)}
              className="text-xs h-8 border-slate-700 hover:bg-slate-800 text-slate-200 rounded-xl"
            >
              Keep Playing
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleConfirmAbandon}
              className="text-xs h-8 bg-rose-600 hover:bg-rose-500 text-white font-medium shadow-md shadow-rose-950/40 rounded-xl"
            >
              Forfeit & Quit
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Career Record Modal */}
      <Dialog open={statsOpen} onOpenChange={setStatsOpen}>
        <DialogContent className="sm:max-w-md bg-[#0c101c] border-white/10 text-white rounded-3xl shadow-2xl max-h-[90dvh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2 text-white">
              <Trophy className="size-5 text-amber-400" />
              Your Stats
            </DialogTitle>
            <DialogDescription className="text-slate-400 text-xs">
              Your overall record across all games played.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-4 gap-2 text-center my-3">
            <div className="p-3 rounded-2xl bg-black/40 border border-white/5">
              <div className="text-xl font-bold font-mono text-white">{stats.played}</div>
              <div className="text-2xs text-slate-400 uppercase tracking-wider mt-0.5">Played</div>
            </div>
            <div className="p-3 rounded-2xl bg-black/40 border border-white/5">
              <div className="text-xl font-bold font-mono text-emerald-400">
                {stats.played > 0 ? Math.round((stats.won / stats.played) * 100) : 0}%
              </div>
              <div className="text-2xs text-slate-400 uppercase tracking-wider mt-0.5">Win Rate</div>
            </div>
            <div className="p-3 rounded-2xl bg-black/40 border border-white/5">
              <div className="text-xl font-bold font-mono text-amber-400">{stats.streak}</div>
              <div className="text-2xs text-slate-400 uppercase tracking-wider mt-0.5">Streak</div>
            </div>
            <div className="p-3 rounded-2xl bg-black/40 border border-white/5">
              <div className="text-xl font-bold font-mono text-sky-400">{stats.maxStreak}</div>
              <div className="text-2xs text-slate-400 uppercase tracking-wider mt-0.5">Best</div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Mission Directives Modal */}
      <Dialog open={helpOpen} onOpenChange={setHelpOpen}>
        <DialogContent className="sm:max-w-lg bg-[#0c101c] border-white/10 text-white rounded-3xl shadow-2xl max-h-[90dvh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2 text-white">
              <MapPin className="size-5 text-sky-400" />
              How to Play & Difficulty Rules
            </DialogTitle>
            <DialogDescription className="text-slate-400 text-xs">
              Find the secret location using distance and direction clues.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 text-xs text-slate-300 leading-relaxed mt-2">
            <div className="p-3 rounded-2xl bg-black/40 border border-white/5 space-y-1">
              <div className="font-semibold text-sky-300">1. Distance & Compass Direction</div>
              <p className="text-slate-400">
                Every guess calculates the distance in kilometers and an 8-point compass arrow pointing toward the secret target.
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-black/40 border border-white/5 space-y-1">
              <div className="font-semibold text-emerald-300">2. Proximity Colors</div>
              <p className="text-slate-400">
                Guessed territories glow by distance: <strong>Orange (Very Close)</strong>, <strong>Purple (Medium)</strong>, and <strong>Navy (Far)</strong>. Neighbor hints light up on the map to show which places border the target!
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-black/40 border border-white/5 space-y-2">
              <div className="font-semibold text-amber-300 flex items-center gap-1.5">
                <ShieldAlert className="size-4" />
                3. Difficulty Levels
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-black/50 border border-emerald-500/20">
                  <strong className="text-emerald-400">🟢 Easy (8 Guesses)</strong>
                  <p className="text-slate-400 mt-1">Free map inspection. 8 guesses allowed. Division or continent revealed upfront.</p>
                </div>
                <div className="p-2.5 rounded-xl bg-black/50 border border-amber-500/20">
                  <strong className="text-amber-400">🟡 Normal (6 Guesses)</strong>
                  <p className="text-slate-400 mt-1">Standard challenge with compass arrows. Unrevealed areas stay hidden.</p>
                </div>
                <div className="p-2.5 rounded-xl bg-black/50 border border-rose-500/20">
                  <strong className="text-rose-400">🔴 Hard (5 Guesses)</strong>
                  <p className="text-slate-400 mt-1">Distance only! Compass arrow is disabled. 5 guesses max.</p>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
