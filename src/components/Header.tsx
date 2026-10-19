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

  const [statsOpen, setStatsOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isGameRoute = pathname === "/bangladesh" || pathname === "/world";

  return (
    <>
      <header className="sticky top-2 sm:top-2.5 z-40 w-full px-2 sm:px-3 pointer-events-none">
        <div className="w-full pointer-events-auto rounded-2xl border border-white/[0.08] bg-[#070a12]/90 backdrop-blur-2xl px-3 sm:px-4 py-2 shadow-2xl shadow-black/80 flex flex-col md:flex-row items-center justify-between gap-2.5">
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
                  <span className="text-[9px] font-mono font-bold uppercase tracking-widest bg-sky-500/15 text-sky-400 px-1 py-0.2 rounded border border-sky-500/30">
                    v2.0
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 leading-none">Tactical Geography Arena</p>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1 bg-black/40 border border-white/[0.06] p-1 rounded-xl ml-2">
              <Link
                href="/"
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all duration-150 flex items-center gap-1.5 ${
                  pathname === "/"
                    ? "bg-sky-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-white hover:bg-white/[0.05]"
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
                    : "text-slate-400 hover:text-white hover:bg-white/[0.05]"
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
                    : "text-slate-400 hover:text-white hover:bg-white/[0.05]"
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
                    : "text-slate-400 hover:text-white hover:bg-white/[0.05]"
                }`}
              >
                <BookOpen className="size-3.5 text-purple-400" />
                <span>Atlas</span>
              </Link>
            </nav>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden size-8 rounded-lg border border-white/10 bg-white/[0.04] text-slate-300 flex items-center justify-center hover:text-white"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="size-4" /> : <Menu className="size-4" />}
            </button>
          </div>

          {/* Controls: Difficulty + Game Mode + Actions */}
          <div className="flex flex-wrap items-center justify-between w-full md:w-auto gap-2">
            {/* Difficulty Pills */}
            <Tabs
              value={difficulty}
              onValueChange={(val) => setDifficulty(val as GameDifficulty)}
              className="w-auto"
            >
              <TabsList className="bg-black/40 border border-white/[0.06] h-7 p-0.5 rounded-lg">
                <TabsTrigger
                  value="easy"
                  className="text-[10px] px-2 py-0.5 rounded-md data-[state=active]:bg-emerald-600 data-[state=active]:text-white font-medium"
                >
                  Easy
                </TabsTrigger>
                <TabsTrigger
                  value="normal"
                  className="text-[10px] px-2 py-0.5 rounded-md data-[state=active]:bg-amber-600 data-[state=active]:text-white font-medium"
                >
                  Normal
                </TabsTrigger>
                <TabsTrigger
                  value="hard"
                  className="text-[10px] px-2 py-0.5 rounded-md data-[state=active]:bg-rose-600 data-[state=active]:text-white font-medium"
                >
                  Hard
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Mode Selector (only on game routes) */}
            {isGameRoute && (
              <Tabs
                value={mode}
                onValueChange={(val) => setMode(val as GameMode)}
                className="w-auto"
              >
                <TabsList className="bg-black/40 border border-white/[0.06] h-7 p-0.5 rounded-lg">
                  <TabsTrigger value="daily" className="text-[10px] px-2 py-0.5 rounded-md">
                    Daily
                  </TabsTrigger>
                  <TabsTrigger value="streak" className="text-[10px] px-2 py-0.5 rounded-md flex items-center gap-1">
                    <Flame className="size-2.5 text-amber-500" />
                    <span>{scope === "bangladesh" ? "Hop" : "Border"}</span>
                  </TabsTrigger>
                  <TabsTrigger value="blitz" className="text-[10px] px-2 py-0.5 rounded-md flex items-center gap-1">
                    <Timer className="size-2.5 text-sky-400" />
                    <span>Blitz</span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            )}

            {/* Blitz Countdown */}
            {isGameRoute && mode === "blitz" && (
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-rose-950/50 border border-rose-500/40 text-rose-300 text-[11px] font-mono font-bold">
                <Timer className="size-3 animate-pulse" />
                <span>{blitzTimeLeft}s</span>
              </div>
            )}

            {/* Streak Counter */}
            {isGameRoute && mode === "streak" && (
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-950/50 border border-amber-500/40 text-amber-300 text-[11px] font-bold">
                <Flame className="size-3 text-amber-400" />
                <span>{stats.streak}</span>
              </div>
            )}

            {/* Modals & New Round */}
            <div className="flex items-center gap-1.5 border-l border-white/[0.08] pl-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setStatsOpen(true)}
                title="Career Record Dossier"
                aria-label="Career Record Dossier"
                className="size-7 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06]"
              >
                <Trophy className="size-3.5 text-amber-400" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setHelpOpen(true)}
                title="Mission Directives"
                aria-label="Mission Directives"
                className="size-7 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06]"
              >
                <HelpCircle className="size-3.5 text-sky-400" />
              </Button>

              {isGameRoute && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={resetGame}
                  title="New Recon Round"
                  aria-label="New Recon Round"
                  className="size-7 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06]"
                >
                  <RotateCcw className="size-3.5" />
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden pointer-events-auto mt-2 w-full rounded-2xl border border-white/[0.08] bg-[#070a12]/95 backdrop-blur-2xl p-3 shadow-2xl space-y-2">
            <div className="grid grid-cols-2 gap-1.5">
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className={`p-2.5 rounded-xl text-xs font-medium flex items-center gap-2 ${
                  pathname === "/"
                    ? "bg-sky-600 text-white"
                    : "bg-white/[0.03] text-slate-300 hover:bg-white/[0.06]"
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
                    : "bg-white/[0.03] text-slate-300 hover:bg-white/[0.06]"
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
                    : "bg-white/[0.03] text-slate-300 hover:bg-white/[0.06]"
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
                    : "bg-white/[0.03] text-slate-300 hover:bg-white/[0.06]"
                }`}
              >
                <BookOpen className="size-4 text-purple-400" />
                <span>Free Atlas</span>
              </Link>
            </div>
          </div>
        )}
      </header>

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
            <div className="p-3 rounded-xl bg-black/40 border border-white/[0.06]">
              <div className="text-xl font-bold font-mono text-white">{stats.played}</div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider mt-0.5">Played</div>
            </div>
            <div className="p-3 rounded-xl bg-black/40 border border-white/[0.06]">
              <div className="text-xl font-bold font-mono text-emerald-400">
                {stats.played > 0 ? Math.round((stats.won / stats.played) * 100) : 0}%
              </div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider mt-0.5">Win Rate</div>
            </div>
            <div className="p-3 rounded-xl bg-black/40 border border-white/[0.06]">
              <div className="text-xl font-bold font-mono text-amber-400">{stats.streak}</div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider mt-0.5">Streak</div>
            </div>
            <div className="p-3 rounded-xl bg-black/40 border border-white/[0.06]">
              <div className="text-xl font-bold font-mono text-sky-400">{stats.maxStreak}</div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider mt-0.5">Best</div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Mission Directives Modal */}
      <Dialog open={helpOpen} onOpenChange={setHelpOpen}>
        <DialogContent className="sm:max-w-lg bg-[#0c101c] border-white/10 text-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
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
            <div className="p-3 rounded-xl bg-black/40 border border-white/[0.06] space-y-1">
              <div className="font-semibold text-sky-300">1. Spatial Geodesic Vector</div>
              <p className="text-slate-400">
                Each guess calculates true geodesic distance in kilometers and 8-point compass bearing from your guess centroid to the secret target.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-black/40 border border-white/[0.06] space-y-1">
              <div className="font-semibold text-emerald-300">2. Proximity Radar Colors</div>
              <p className="text-slate-400">
                Guessed territories glow by distance: <strong>Hot Orange (&lt;60km BD / &lt;1500km World)</strong>, <strong>Warm Purple</strong>, and <strong>Cold Navy</strong>. Unlocked neighbor hints reveal their true names on the map!
              </p>
            </div>

            <div className="p-3 rounded-xl bg-black/40 border border-white/[0.06] space-y-2">
              <div className="font-semibold text-amber-300 flex items-center gap-1.5">
                <ShieldAlert className="size-4" />
                3. Difficulty Tiers
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
                <div className="p-2 rounded-lg bg-black/50 border border-emerald-500/20">
                  <strong className="text-emerald-400">🟢 Easy (8 Guesses)</strong>
                  <p className="text-slate-400 mt-1">Full territory inspection. Opening division/continent hint active.</p>
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
