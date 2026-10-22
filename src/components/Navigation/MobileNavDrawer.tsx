"use client";

import React from "react";
import Link from "next/link";
import { Home, Play, Globe2, BookOpen, Trophy, HelpCircle } from "lucide-react";

interface MobileNavDrawerProps {
  open: boolean;
  onClose: () => void;
  pathname: string;
  onOpenStats: () => void;
  onOpenHelp: () => void;
}

export function MobileNavDrawer({
  open,
  onClose,
  pathname,
  onOpenStats,
  onOpenHelp,
}: MobileNavDrawerProps) {
  if (!open) return null;

  const isPlayBD = pathname === "/bangladesh";
  const isPlayWorld = pathname === "/world";
  const isExploreBD = pathname === "/explore/bangladesh";
  const isExploreWorld = pathname === "/explore/world";

  return (
    <>
      <div className="lg:hidden absolute top-14 left-2 right-2 z-50 pointer-events-auto mt-2 rounded-2xl border border-white/10 bg-[#070a12]/98 backdrop-blur-2xl p-3 shadow-2xl space-y-3 animate-in fade-in zoom-in-95">
        {/* Section 1: Home */}
        <Link
          href="/"
          onClick={onClose}
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
              onClick={onClose}
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
              onClick={onClose}
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
              onClick={onClose}
              className={`p-3 min-h-[44px] rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors ${
                isExploreBD
                  ? "bg-purple-600 text-white shadow-md shadow-purple-950/50"
                  : "bg-white/5 text-slate-200 hover:bg-white/10"
              }`}
            >
              <span className="text-base shrink-0">🇧🇩</span>
              <span>Explore Bangladesh</span>
            </Link>
            <Link
              href="/explore/world"
              onClick={onClose}
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
              onClose();
              onOpenStats();
            }}
            className="p-2.5 min-h-[44px] rounded-xl bg-white/5 border border-white/5 text-slate-300 hover:text-white flex items-center justify-center gap-2 text-xs font-medium cursor-pointer"
          >
            <Trophy className="size-3.5 text-amber-400" />
            <span>Stats</span>
          </button>
          <button
            onClick={() => {
              onClose();
              onOpenHelp();
            }}
            className="p-2.5 min-h-[44px] rounded-xl bg-white/5 border border-white/5 text-slate-300 hover:text-white flex items-center justify-center gap-2 text-xs font-medium cursor-pointer"
          >
            <HelpCircle className="size-3.5 text-sky-400" />
            <span>How to Play</span>
          </button>
        </div>
      </div>

      {/* Backdrop */}
      <div
        className="fixed inset-0 top-12 z-40 bg-black/60 backdrop-blur-xs lg:hidden pointer-events-auto transition-opacity animate-in fade-in duration-150 select-none touch-none"
        onTouchStart={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onTouchEnd={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onClose();
        }}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onClose();
        }}
        aria-hidden="true"
      />
    </>
  );
}
