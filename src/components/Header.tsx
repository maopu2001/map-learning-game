"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useGameStore } from "@/lib/store";
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
  Globe2,
  MapPin,
  BookOpen,
  Home,
  ShieldAlert,
  Menu,
  X,
  Play,
} from "lucide-react";

export function Header() {
  const pathname = usePathname();
  const stats = useGameStore((s) => s.stats);

  const [statsOpen, setStatsOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isExplore = pathname.startsWith("/explore");
  const isPlayBD = pathname === "/bangladesh";
  const isPlayWorld = pathname === "/world";
  const isExploreBD = pathname === "/explore/bangladesh";
  const isExploreWorld = pathname === "/explore/world";

  return (
    <>
      <header className="sticky top-2 sm:top-2.5 z-40 w-full px-2 sm:px-3 pointer-events-none">
        <div className="w-full pointer-events-auto rounded-2xl border border-white/10 bg-[#070a12]/90 backdrop-blur-2xl px-3 sm:px-4 py-2 shadow-2xl shadow-black/80 flex items-center justify-between gap-2.5">
          {/* Brand + Mobile Toggle */}
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
                </div>
                <p className="text-2xs text-slate-400 leading-none">
                  Map Guessing Game
                </p>
              </div>
            </Link>

            {/* Mobile Actions: Stats, Help, Menu */}
            <div className="flex items-center gap-1.5 md:hidden">
              <button
                onClick={() => setStatsOpen(true)}
                className="size-9 rounded-xl border border-white/10 bg-white/5 text-amber-400 flex items-center justify-center hover:bg-white/10 transition-colors"
                aria-label="Your Stats"
                title="Your Stats"
              >
                <Trophy className="size-4" />
              </button>
              <button
                onClick={() => setHelpOpen(true)}
                className="size-9 rounded-xl border border-white/10 bg-white/5 text-sky-400 flex items-center justify-center hover:bg-white/10 transition-colors"
                aria-label="How to Play"
                title="How to Play"
              >
                <HelpCircle className="size-4" />
              </button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="size-9 rounded-xl border border-white/10 bg-white/5 text-slate-300 flex items-center justify-center hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Toggle Navigation Menu"
              >
                {mobileMenuOpen ? (
                  <X className="size-4" />
                ) : (
                  <Menu className="size-4" />
                )}
              </button>
            </div>
          </div>

          {/* Desktop Navigation */}
          {isExplore ? (
            /* Context-Aware Explorer Nav: Switch between BD and World Explorers */
            <nav className="hidden md:flex items-center gap-1.5 bg-black/40 border border-white/5 p-1 rounded-xl">
              <span className="text-2xs font-mono uppercase tracking-wider text-slate-500 px-2 flex items-center gap-1">
                <BookOpen className="size-3 text-purple-400" />
                <span>Explorer:</span>
              </span>
              <Link
                href="/explore/bangladesh"
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all duration-150 flex items-center gap-1.5 ${
                  isExploreBD
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <span>🇧🇩</span>
                <span>Bangladesh</span>
              </Link>
              <Link
                href="/explore/world"
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all duration-150 flex items-center gap-1.5 ${
                  isExploreWorld
                    ? "bg-sky-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Globe2 className="size-3.5 text-sky-400" />
                <span>World</span>
              </Link>

              <div className="h-3.5 w-px bg-white/10 mx-1" />

              <Link
                href={isExploreBD ? "/bangladesh" : "/world"}
                className="px-2.5 py-1 rounded-lg text-xs font-medium text-slate-400 hover:text-emerald-300 hover:bg-white/5 flex items-center gap-1 transition-colors"
                title="Play the guessing game"
              >
                <Play className="size-3 fill-current" />
                <span>Play Game</span>
              </Link>
            </nav>
          ) : (
            /* Standard Dual-Group Navigation (Play Games & Reference Explorers) */
            <nav className="hidden md:flex items-center gap-2 bg-black/40 border border-white/5 px-2 py-1 rounded-xl text-xs">
              <Link
                href="/"
                className={`px-2.5 py-1 rounded-lg font-medium transition-all duration-150 flex items-center gap-1 ${
                  pathname === "/"
                    ? "bg-sky-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Home className="size-3" />
                <span>Home</span>
              </Link>

              <div className="h-3.5 w-px bg-white/10" />

              {/* Play Games Segment */}
              <div className="flex items-center gap-1">
                <span className="text-3xs font-mono uppercase tracking-wider text-slate-500 px-1">
                  Play:
                </span>
                <Link
                  href="/bangladesh"
                  className={`px-2.5 py-1 rounded-lg font-medium transition-all duration-150 flex items-center gap-1 ${
                    isPlayBD
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "text-slate-300 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <span>🇧🇩</span>
                  <span>BD</span>
                </Link>
                <Link
                  href="/world"
                  className={`px-2.5 py-1 rounded-lg font-medium transition-all duration-150 flex items-center gap-1 ${
                    isPlayWorld
                      ? "bg-sky-600 text-white shadow-sm"
                      : "text-slate-300 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Globe2 className="size-3 text-sky-400" />
                  <span>World</span>
                </Link>
              </div>

              <div className="h-3.5 w-px bg-white/10" />

              {/* Explore Reference Segment */}
              <div className="flex items-center gap-1">
                <span className="text-3xs font-mono uppercase tracking-wider text-slate-500 px-1">
                  Explore:
                </span>
                <Link
                  href="/explore/bangladesh"
                  className={`px-2.5 py-1 rounded-lg font-medium transition-all duration-150 flex items-center gap-1 ${
                    isExploreBD
                      ? "bg-purple-600 text-white shadow-sm"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <span>🇧🇩</span>
                  <span>BD</span>
                </Link>
                <Link
                  href="/explore/world"
                  className={`px-2.5 py-1 rounded-lg font-medium transition-all duration-150 flex items-center gap-1 ${
                    isExploreWorld
                      ? "bg-purple-600 text-white shadow-sm"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Globe2 className="size-3 text-purple-400" />
                  <span>World</span>
                </Link>
              </div>
            </nav>
          )}

          {/* Right Action Icons */}
          <div className="hidden md:flex items-center gap-1.5">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setStatsOpen(true)}
              title="Your Stats"
              aria-label="Your Stats"
              className="size-7 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 cursor-pointer"
            >
              <Trophy className="size-3.5 text-amber-400" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setHelpOpen(true)}
              title="How to Play"
              aria-label="How to Play"
              className="size-7 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 cursor-pointer"
            >
              <HelpCircle className="size-3.5 text-sky-400" />
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden pointer-events-auto mt-2 w-full rounded-2xl border border-white/10 bg-[#070a12]/98 backdrop-blur-2xl p-3 shadow-2xl space-y-3 animate-in fade-in zoom-in-95">
            {/* Section 1: Home */}
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className={`p-3 min-h-[44px] rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-colors ${
                pathname === "/"
                  ? "bg-sky-600 text-white shadow-md shadow-sky-950/50"
                  : "bg-white/5 text-slate-200 hover:bg-white/10"
              }`}
            >
              <Home className="size-4 shrink-0" />
              <span>Home</span>
            </Link>

            {/* Section 2: Play Games */}
            <div className="space-y-1.5 pt-1">
              <span className="text-3xs font-mono uppercase tracking-wider text-slate-400 px-1 font-semibold flex items-center gap-1">
                <Play className="size-3 fill-sky-400 text-sky-400" />
                <span>Play Games (Daily & Streak)</span>
              </span>
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/bangladesh"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`p-3 min-h-[44px] rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors ${
                    isPlayBD
                      ? "bg-emerald-600 text-white shadow-md shadow-emerald-950/50"
                      : "bg-white/5 text-slate-200 hover:bg-white/10"
                  }`}
                >
                  <span className="text-base shrink-0">🇧🇩</span>
                  <span>Play Bangladesh</span>
                </Link>
                <Link
                  href="/world"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`p-3 min-h-[44px] rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors ${
                    isPlayWorld
                      ? "bg-sky-600 text-white shadow-md shadow-sky-950/50"
                      : "bg-white/5 text-slate-200 hover:bg-white/10"
                  }`}
                >
                  <Globe2 className="size-4 text-sky-400 shrink-0" />
                  <span>Play World</span>
                </Link>
              </div>
            </div>

            {/* Section 3: Reference Explorers */}
            <div className="space-y-1.5 pt-1">
              <span className="text-3xs font-mono uppercase tracking-wider text-slate-400 px-1 font-semibold flex items-center gap-1">
                <BookOpen className="size-3 text-purple-400" />
                <span>Map Explorers (No Timers)</span>
              </span>
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/explore/bangladesh"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`p-3 min-h-[44px] rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors ${
                    isExploreBD
                      ? "bg-purple-600 text-white shadow-md shadow-purple-950/50"
                      : "bg-white/5 text-slate-200 hover:bg-white/10"
                  }`}
                >
                  <span className="text-base shrink-0">🇧🇩</span>
                  <span>Explore BD</span>
                </Link>
                <Link
                  href="/explore/world"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`p-3 min-h-[44px] rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors ${
                    isExploreWorld
                      ? "bg-purple-600 text-white shadow-md shadow-purple-950/50"
                      : "bg-white/5 text-slate-200 hover:bg-white/10"
                  }`}
                >
                  <Globe2 className="size-4 text-purple-400 shrink-0" />
                  <span>Explore World</span>
                </Link>
              </div>
            </div>

            {/* Section 4: Utilities */}
            <div className="pt-2 border-t border-white/5 grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setStatsOpen(true);
                }}
                className="p-2.5 min-h-[44px] rounded-xl bg-white/5 border border-white/5 text-slate-300 hover:text-white flex items-center justify-center gap-2 text-xs font-medium cursor-pointer"
              >
                <Trophy className="size-3.5 text-amber-400" />
                <span>Stats</span>
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setHelpOpen(true);
                }}
                className="p-2.5 min-h-[44px] rounded-xl bg-white/5 border border-white/5 text-slate-300 hover:text-white flex items-center justify-center gap-2 text-xs font-medium cursor-pointer"
              >
                <HelpCircle className="size-3.5 text-sky-400" />
                <span>How to Play</span>
              </button>
            </div>
          </div>
        )}
      </header>

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
              <div className="text-xl font-bold font-mono text-white">
                {stats.played}
              </div>
              <div className="text-2xs text-slate-400 uppercase tracking-wider mt-0.5">
                Played
              </div>
            </div>
            <div className="p-3 rounded-2xl bg-black/40 border border-white/5">
              <div className="text-xl font-bold font-mono text-emerald-400">
                {stats.played > 0
                  ? Math.round((stats.won / stats.played) * 100)
                  : 0}
                %
              </div>
              <div className="text-2xs text-slate-400 uppercase tracking-wider mt-0.5">
                Win Rate
              </div>
            </div>
            <div className="p-3 rounded-2xl bg-black/40 border border-white/5">
              <div className="text-xl font-bold font-mono text-amber-400">
                {stats.streak}
              </div>
              <div className="text-2xs text-slate-400 uppercase tracking-wider mt-0.5">
                Streak
              </div>
            </div>
            <div className="p-3 rounded-2xl bg-black/40 border border-white/5">
              <div className="text-xl font-bold font-mono text-sky-400">
                {stats.maxStreak}
              </div>
              <div className="text-2xs text-slate-400 uppercase tracking-wider mt-0.5">
                Best
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* How to Play Modal */}
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
              <div className="font-semibold text-sky-300">
                1. Distance & Compass Direction
              </div>
              <p className="text-slate-400">
                Every guess calculates the distance in kilometers and an 8-point
                compass arrow pointing toward the secret target.
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-black/40 border border-white/5 space-y-1">
              <div className="font-semibold text-emerald-300">
                2. Proximity Colors
              </div>
              <p className="text-slate-400">
                Guessed territories glow by distance:{" "}
                <strong>Orange (Very Close)</strong>,{" "}
                <strong>Purple (Medium)</strong>, and{" "}
                <strong>Navy (Far)</strong>. Neighbor hints light up on the map
                to show which places border the target!
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-black/40 border border-white/5 space-y-2">
              <div className="font-semibold text-amber-300 flex items-center gap-1.5">
                <ShieldAlert className="size-4" />
                3. Difficulty Levels
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-black/50 border border-emerald-500/20">
                  <strong className="text-emerald-400">
                    🟢 Easy (8 Guesses)
                  </strong>
                  <p className="text-slate-400 mt-1">
                    Free map inspection. 8 guesses allowed. Division or
                    continent revealed upfront.
                  </p>
                </div>
                <div className="p-2.5 rounded-xl bg-black/50 border border-amber-500/20">
                  <strong className="text-amber-400">
                    🟡 Normal (6 Guesses)
                  </strong>
                  <p className="text-slate-400 mt-1">
                    Standard challenge with compass arrows. Unrevealed areas
                    stay hidden.
                  </p>
                </div>
                <div className="p-2.5 rounded-xl bg-black/50 border border-rose-500/20">
                  <strong className="text-rose-400">🔴 Hard (5 Guesses)</strong>
                  <p className="text-slate-400 mt-1">
                    Distance only! Compass arrow is disabled. 5 guesses max.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
