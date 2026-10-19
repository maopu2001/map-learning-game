"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useGameStore, GameMode, GameDifficulty } from "@/lib/store";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Compass,
  Trophy,
  HelpCircle,
  RotateCcw,
  Timer,
  Flame,
  Globe2,
  MapPin,
  BookOpen,
  Home,
  ShieldAlert,
  Menu,
  X,
  Lock,
  AlertTriangle,
} from "lucide-react";

export function Header() {
  const pathname = usePathname();
  const scope = useGameStore((s) => s.scope);
  const mode = useGameStore((s) => s.mode);
  const setMode = useGameStore((s) => s.setMode);
  const difficulty = useGameStore((s) => s.difficulty);
  const setDifficulty = useGameStore((s) => s.setDifficulty);
  const stats = useGameStore((s) => s.stats);
  const resetGame = useGameStore((s) => s.resetGame);
  const blitzTimeLeft = useGameStore((s) => s.blitzTimeLeft);
  const guesses = useGameStore((s) => s.guesses);
  const gameStatus = useGameStore((s) => s.gameStatus);
  const unlockedHints = useGameStore((s) => s.unlockedHints);
  const forfeitAndSwitch = useGameStore((s) => s.forfeitAndSwitch);

  const [statsOpen, setStatsOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [abandonPending, setAbandonPending] = useState<{
    type: "difficulty" | "mode" | "reset";
    value?: string;
  } | null>(null);

  const isGameRoute = pathname === "/bangladesh" || pathname === "/world";

  const isMissionActive =
    isGameRoute &&
    gameStatus === "playing" &&
    (guesses.length > 0 ||
      unlockedHints > 0 ||
      (mode === "blitz" && blitzTimeLeft < 90));

  const handleDifficultyClick = (val: string) => {
    if (val === difficulty) return;
    if (isMissionActive) {
      setAbandonPending({ type: "difficulty", value: val });
    } else {
      setDifficulty(val as GameDifficulty);
    }
  };

  const handleModeClick = (val: string) => {
    if (val === mode) return;
    if (isMissionActive) {
      setAbandonPending({ type: "mode", value: val });
    } else {
      setMode(val as GameMode);
    }
  };

  const handleResetClick = () => {
    if (isMissionActive) {
      setAbandonPending({ type: "reset" });
    } else {
      resetGame();
    }
  };

  return (
    <>
      <header className="sticky top-2 sm:top-2.5 z-40 w-full px-2 sm:px-3 pointer-events-none">
        <div className="w-full pointer-events-auto rounded-2xl border border-white/10 bg-[#070a12]/90 backdrop-blur-2xl px-3 sm:px-4 py-2 shadow-2xl shadow-black/80 flex flex-col md:flex-row items-center justify-between gap-2.5">
          {/* Top Bar on Mobile: Brand + Mobile Toggles */}
          <div className="flex items-center justify-between w-full md:w-auto gap-3">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="flex size-8 items-center justify-center rounded-xl bg-gradient-to-tr from-sky-600 to-emerald-500 text-white shadow-md shadow-sky-600/30 group-hover:scale-105 transition-transform duration-200">
                <Compass className="size-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm sm:text-base font-black tracking-wider text-white">
                    BORDERLINE
                  </span>
                  <span className="text-3xs font-mono font-bold uppercase tracking-widest bg-sky-500/15 text-sky-400 px-1 py-0.5 rounded border border-sky-500/30">
                    v2.0
                  </span>
                </div>
                <p className="text-2xs text-slate-400 leading-none">Tactical Geography Arena</p>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1 bg-black/40 border border-white/5 p-1 rounded-xl ml-2">
              <Link
                href="/"
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all duration-150 flex items-center gap-1.5 ${
                  pathname === "/"
                    ? "bg-sky-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Home className="size-3.5" />
                <span>Home</span>
              </Link>
              <Link
                href="/bangladesh"
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all duration-150 flex items-center gap-1.5 ${
                  pathname === "/bangladesh"
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <span>🇧🇩</span>
                <span>Bangladesh</span>
              </Link>
              <Link
                href="/world"
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all duration-150 flex items-center gap-1.5 ${
                  pathname === "/world"
                    ? "bg-sky-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Globe2 className="size-3.5 text-sky-400" />
                <span>World</span>
              </Link>
              <Link
                href="/explore"
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all duration-150 flex items-center gap-1.5 ${
                  pathname === "/explore"
                    ? "bg-purple-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <BookOpen className="size-3.5 text-purple-400" />
                <span>Atlas</span>
              </Link>
            </nav>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden size-8 rounded-lg border border-white/10 bg-white/5 text-slate-300 flex items-center justify-center hover:text-white"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="size-4" /> : <Menu className="size-4" />}
            </button>
          </div>

          {/* Controls: Difficulty + Game Mode + Actions */}
          <div className="flex flex-wrap items-center justify-between w-full md:w-auto gap-2">
            {/* Active Mission Lock Badge */}
            {isMissionActive && (
              <div
                title="Active mission in progress. Changing parameters counts as a forfeit."
                className="hidden xl:flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-400 text-2xs font-mono tracking-tight"
              >
                <Lock className="size-2.5 animate-pulse" />
                <span>IN MISSION</span>
              </div>
            )}

            {/* Difficulty Pills */}
            <Tabs
              value={difficulty}
              onValueChange={handleDifficultyClick}
              className="w-auto"
            >
              <TabsList className="bg-black/40 border border-white/5 h-7 p-0.5 rounded-lg">
                <TabsTrigger
                  value="easy"
                  className="text-2xs px-2 py-0.5 rounded-md data-[state=active]:bg-emerald-600 data-[state=active]:text-white font-medium flex items-center gap-1"
                >
                  {isMissionActive && difficulty !== "easy" && (
                    <Lock className="size-2 text-slate-400" />
                  )}
                  <span>Easy</span>
                </TabsTrigger>
                <TabsTrigger
                  value="normal"
                  className="text-2xs px-2 py-0.5 rounded-md data-[state=active]:bg-amber-600 data-[state=active]:text-white font-medium flex items-center gap-1"
                >
                  {isMissionActive && difficulty !== "normal" && (
                    <Lock className="size-2 text-slate-400" />
                  )}
                  <span>Normal</span>
                </TabsTrigger>
                <TabsTrigger
                  value="hard"
                  className="text-2xs px-2 py-0.5 rounded-md data-[state=active]:bg-rose-600 data-[state=active]:text-white font-medium flex items-center gap-1"
                >
                  {isMissionActive && difficulty !== "hard" && (
                    <Lock className="size-2 text-slate-400" />
                  )}
                  <span>Hard</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Mode Selector (only on game routes) */}
            {isGameRoute && (
              <Tabs
                value={mode}
                onValueChange={handleModeClick}
                className="w-auto"
              >
                <TabsList className="bg-black/40 border border-white/5 h-7 p-0.5 rounded-lg">
                  <TabsTrigger
                    value="daily"
                    className="text-2xs px-2 py-0.5 rounded-md flex items-center gap-1"
                  >
                    {isMissionActive && mode !== "daily" && (
                      <Lock className="size-2 text-slate-400" />
                    )}
                    <span>Daily</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="streak"
                    className="text-2xs px-2 py-0.5 rounded-md flex items-center gap-1"
                  >
                    {isMissionActive && mode !== "streak" && (
                      <Lock className="size-2 text-slate-400" />
                    )}
                    <Flame className="size-2.5 text-amber-500" />
                    <span>{scope === "bangladesh" ? "Hop" : "Border"}</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="blitz"
                    className="text-2xs px-2 py-0.5 rounded-md flex items-center gap-1"
                  >
                    {isMissionActive && mode !== "blitz" && (
                      <Lock className="size-2 text-slate-400" />
                    )}
                    <Timer className="size-2.5 text-sky-400" />
                    <span>Blitz</span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            )}

            {/* Blitz Countdown */}
            {isGameRoute && mode === "blitz" && (
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-rose-950/50 border border-rose-500/40 text-rose-300 text-xs font-mono font-bold">
                <Timer className="size-3 animate-pulse" />
                <span>{blitzTimeLeft}s</span>
              </div>
            )}

            {/* Streak Counter */}
            {isGameRoute && mode === "streak" && (
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-950/50 border border-amber-500/40 text-amber-300 text-xs font-bold">
                <Flame className="size-3 text-amber-400" />
                <span>{stats.streak}</span>
              </div>
            )}

            {/* Modals & New Round */}
            <div className="flex items-center gap-1.5 border-l border-white/10 pl-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setStatsOpen(true)}
                title="Career Record Dossier"
                aria-label="Career Record Dossier"
                className="size-7 rounded-lg text-slate-400 hover:text-white hover:bg-white/5"
              >
                <Trophy className="size-3.5 text-amber-400" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setHelpOpen(true)}
                title="Mission Directives"
                aria-label="Mission Directives"
                className="size-7 rounded-lg text-slate-400 hover:text-white hover:bg-white/5"
              >
                <HelpCircle className="size-3.5 text-sky-400" />
              </Button>

              {isGameRoute && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleResetClick}
                  title={isMissionActive ? "Abandon & Restart Mission" : "New Recon Round"}
                  aria-label={isMissionActive ? "Abandon & Restart Mission" : "New Recon Round"}
                  className="size-7 rounded-lg text-slate-400 hover:text-white hover:bg-white/5"
                >
                  <RotateCcw className="size-3.5" />
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden pointer-events-auto mt-2 w-full rounded-2xl border border-white/10 bg-[#070a12]/95 backdrop-blur-2xl p-3 shadow-2xl space-y-2">
            <div className="grid grid-cols-2 gap-1.5">
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className={`p-2.5 rounded-xl text-xs font-medium flex items-center gap-2 ${
                  pathname === "/"
                    ? "bg-sky-600 text-white"
                    : "bg-white/5 text-slate-300 hover:bg-white/10"
                }`}
              >
                <Home className="size-4" />
                <span>Home Hub</span>
              </Link>
              <Link
                href="/bangladesh"
                onClick={() => setMobileMenuOpen(false)}
                className={`p-2.5 rounded-xl text-xs font-medium flex items-center gap-2 ${
                  pathname === "/bangladesh"
                    ? "bg-emerald-600 text-white"
                    : "bg-white/5 text-slate-300 hover:bg-white/10"
                }`}
              >
                <span>🇧🇩</span>
                <span>Bangladesh 64</span>
              </Link>
              <Link
                href="/world"
                onClick={() => setMobileMenuOpen(false)}
                className={`p-2.5 rounded-xl text-xs font-medium flex items-center gap-2 ${
                  pathname === "/world"
                    ? "bg-sky-600 text-white"
                    : "bg-white/5 text-slate-300 hover:bg-white/10"
                }`}
              >
                <Globe2 className="size-4 text-sky-400" />
                <span>World Nations</span>
              </Link>
              <Link
                href="/explore"
                onClick={() => setMobileMenuOpen(false)}
                className={`p-2.5 rounded-xl text-xs font-medium flex items-center gap-2 ${
                  pathname === "/explore"
                    ? "bg-purple-600 text-white"
                    : "bg-white/5 text-slate-300 hover:bg-white/10"
                }`}
              >
                <BookOpen className="size-4 text-purple-400" />
                <span>Free Atlas</span>
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Abandon Mission Confirmation Dialog */}
      <Dialog
        open={Boolean(abandonPending)}
        onOpenChange={(open) => {
          if (!open) setAbandonPending(null);
        }}
      >
        <DialogContent className="sm:max-w-md bg-[#0a0f1d] border border-amber-500/30 text-white rounded-2xl shadow-2xl backdrop-blur-xl">
          <DialogHeader className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="size-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <AlertTriangle className="size-4" />
              </div>
              <DialogTitle className="text-base font-bold text-white">
                Abandon Active Mission?
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs text-slate-400 leading-relaxed">
              You are currently engaged in an active mission. Changing game parameters or resetting mid-round counts as an immediate forfeit to preserve fair records.
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-xl bg-black/40 border border-white/5 p-3 text-xs space-y-2 my-2">
            <div className="flex items-center justify-between pb-1.5 border-b border-white/5">
              <span className="text-slate-400">Current Progress:</span>
              <span className="font-semibold text-slate-200">
                {guesses.length} {guesses.length === 1 ? "guess" : "guesses"} logged
              </span>
            </div>

            {mode === "streak" && stats.streak > 0 && (
              <div className="flex items-center justify-between pb-1.5 border-b border-white/5">
                <span className="text-amber-400 flex items-center gap-1">
                  <Flame className="size-3" /> Streak at Risk:
                </span>
                <span className="font-bold text-amber-300">
                  {stats.streak} {stats.streak === 1 ? "win" : "wins"} (resets to 0)
                </span>
              </div>
            )}

            {mode === "blitz" && blitzTimeLeft < 90 && (
              <div className="flex items-center justify-between pb-1.5 border-b border-white/5">
                <span className="text-sky-400 flex items-center gap-1">
                  <Timer className="size-3" /> Blitz Timer:
                </span>
                <span className="font-bold text-sky-300">
                  {blitzTimeLeft}s remaining
                </span>
              </div>
            )}

            <div className="flex items-center justify-between pt-0.5 text-xs">
              <span className="text-slate-400">Requested Action:</span>
              <span className="font-medium text-sky-400">
                {abandonPending?.type === "difficulty" &&
                  `Switch to ${abandonPending.value?.toUpperCase()} Difficulty`}
                {abandonPending?.type === "mode" &&
                  `Switch to ${abandonPending.value?.toUpperCase()} Mode`}
                {abandonPending?.type === "reset" && "Forfeit & Restart Mission"}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAbandonPending(null)}
              className="text-xs h-8 border-slate-700 hover:bg-slate-800 text-slate-200"
            >
              Keep Playing
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                if (!abandonPending) return;
                if (abandonPending.type === "difficulty") {
                  forfeitAndSwitch({ difficulty: abandonPending.value as GameDifficulty });
                } else if (abandonPending.type === "mode") {
                  forfeitAndSwitch({ mode: abandonPending.value as GameMode });
                } else if (abandonPending.type === "reset") {
                  forfeitAndSwitch({ reset: true });
                }
                setAbandonPending(null);
              }}
              className="text-xs h-8 bg-rose-600 hover:bg-rose-500 text-white font-medium shadow-md shadow-rose-950/40"
            >
              Forfeit & Switch
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Career Record Modal */}
      <Dialog open={statsOpen} onOpenChange={setStatsOpen}>
        <DialogContent className="sm:max-w-md bg-[#0c101c] border-white/10 text-white rounded-2xl shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2 text-white">
              <Trophy className="size-5 text-amber-400" />
              Cartography Career Dossier
            </DialogTitle>
            <DialogDescription className="text-slate-400 text-xs">
              Verified performance record across all territorial reconnaissance operations.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-4 gap-2 text-center my-3">
            <div className="p-3 rounded-xl bg-black/40 border border-white/5">
              <div className="text-xl font-bold font-mono text-white">{stats.played}</div>
              <div className="text-2xs text-slate-400 uppercase tracking-wider mt-0.5">Played</div>
            </div>
            <div className="p-3 rounded-xl bg-black/40 border border-white/5">
              <div className="text-xl font-bold font-mono text-emerald-400">
                {stats.played > 0 ? Math.round((stats.won / stats.played) * 100) : 0}%
              </div>
              <div className="text-2xs text-slate-400 uppercase tracking-wider mt-0.5">Win Rate</div>
            </div>
            <div className="p-3 rounded-xl bg-black/40 border border-white/5">
              <div className="text-xl font-bold font-mono text-amber-400">{stats.streak}</div>
              <div className="text-2xs text-slate-400 uppercase tracking-wider mt-0.5">Streak</div>
            </div>
            <div className="p-3 rounded-xl bg-black/40 border border-white/5">
              <div className="text-xl font-bold font-mono text-sky-400">{stats.maxStreak}</div>
              <div className="text-2xs text-slate-400 uppercase tracking-wider mt-0.5">Best</div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Mission Directives Modal */}
      <Dialog open={helpOpen} onOpenChange={setHelpOpen}>
        <DialogContent className="sm:max-w-lg bg-[#0c101c] border-white/10 text-white rounded-2xl shadow-2xl max-h-screen overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2 text-white">
              <MapPin className="size-5 text-sky-400" />
              Mission Directives & Difficulty System
            </DialogTitle>
            <DialogDescription className="text-slate-400 text-xs">
              How to deduce mystery territories through spatial feedback.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 text-xs text-slate-300 leading-relaxed mt-2">
            <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
              <div className="font-semibold text-sky-300">1. Spatial Geodesic Vector</div>
              <p className="text-slate-400">
                Each guess calculates true geodesic distance in kilometers and 8-point compass bearing from your guess centroid to the secret target.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
              <div className="font-semibold text-emerald-300">2. Proximity Radar Colors</div>
              <p className="text-slate-400">
                Guessed territories glow by distance: <strong>Hot Orange (&lt;60km BD / &lt;1500km World)</strong>, <strong>Warm Purple</strong>, and <strong>Cold Navy</strong>. Unlocked neighbor hints reveal their true names on the map!
              </p>
            </div>

            <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-2">
              <div className="font-semibold text-amber-300 flex items-center gap-1.5">
                <ShieldAlert className="size-4" />
                3. Difficulty Tiers
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                <div className="p-2 rounded-lg bg-black/50 border border-emerald-500/20">
                  <strong className="text-emerald-400">🟢 Easy (8 Guesses)</strong>
                  <p className="text-slate-400 mt-1">Full territory inspection. 8 guesses allowed. Clues available on demand.</p>
                </div>
                <div className="p-2 rounded-lg bg-black/50 border border-amber-500/20">
                  <strong className="text-amber-400">🟡 Normal (6 Guesses)</strong>
                  <p className="text-slate-400 mt-1">Standard mystery challenge. Compass arrow active. Neighbor inspection.</p>
                </div>
                <div className="p-2 rounded-lg bg-black/50 border border-rose-500/20">
                  <strong className="text-rose-400">🔴 Hard (5 Guesses)</strong>
                  <p className="text-slate-400 mt-1">Distance only! No compass arrow. Blind triangulation.</p>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
