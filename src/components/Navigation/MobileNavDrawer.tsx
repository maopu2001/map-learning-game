"use client";

import Link from "next/link";
import { Home, Play, Globe2, BookOpen, HelpCircle } from "lucide-react";

interface MobileNavDrawerProps {
  open: boolean;
  onClose: () => void;
  pathname: string;
  onOpenHelp: () => void;
}

export function MobileNavDrawer({
  open,
  onClose,
  pathname,
  onOpenHelp,
}: MobileNavDrawerProps) {
  if (!open) return null;

  const isPlayBD = pathname === "/bangladesh";
  const isPlayWorld = pathname === "/world";
  const isExploreBD = pathname === "/explore/bangladesh";
  const isExploreWorld = pathname === "/explore/world";

  return (
    <>
      <div className="lg:hidden absolute top-14 left-2 right-2 z-50 pointer-events-auto mt-2 rounded-2xl border border-border bg-card/98 backdrop-blur-2xl p-3 shadow-2xl space-y-3 animate-in fade-in zoom-in-95">
        {/* Section 1: Home */}
        <Link
          href="/"
          onClick={onClose}
          className={`p-3 min-h-11 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-colors ${
            pathname === "/"
              ? "bg-primary text-primary-foreground shadow-md"
              : "bg-muted/50 text-foreground hover:bg-muted"
          }`}
        >
          <Home className="size-4 shrink-0" />
          <span>Home</span>
        </Link>

        {/* Section 2: Play Games */}
        <div className="space-y-1.5 pt-1">
          <span className="text-3xs font-mono uppercase tracking-wider text-muted-foreground px-1 font-semibold flex items-center gap-1">
            <Play className="size-3 fill-accent text-accent" />
            <span>Play Games (Daily & Detective)</span>
          </span>
          <div className="grid grid-cols-2 gap-2">
            <Link
              href="/bangladesh"
              onClick={onClose}
              className={`p-3 min-h-11 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors ${
                isPlayBD
                  ? "bg-bd-primary text-bd-primary-foreground shadow-md"
                  : "bg-muted/50 text-foreground hover:bg-muted"
              }`}
            >
              <span className="text-base shrink-0 flag-shadow">🇧🇩</span>
              <span>Play Bangladesh</span>
            </Link>
            <Link
              href="/world"
              onClick={onClose}
              className={`p-3 min-h-11 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors ${
                isPlayWorld
                  ? "bg-accent text-accent-foreground shadow-md"
                  : "bg-muted/50 text-foreground hover:bg-muted"
              }`}
            >
              <Globe2 className="size-4 text-accent shrink-0" />
              <span>Play World</span>
            </Link>
          </div>
        </div>

        {/* Section 3: Reference Explorers */}
        <div className="space-y-1.5 pt-1">
          <span className="text-3xs font-mono uppercase tracking-wider text-muted-foreground px-1 font-semibold flex items-center gap-1">
            <BookOpen className="size-3 text-accent" />
            <span>Map Explorers (No Timers)</span>
          </span>
          <div className="grid grid-cols-2 gap-2">
            <Link
              href="/explore/bangladesh"
              onClick={onClose}
              className={`p-3 min-h-11 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors ${
                isExploreBD
                  ? "bg-bd-primary text-bd-primary-foreground shadow-md"
                  : "bg-muted/50 text-foreground hover:bg-muted"
              }`}
            >
              <span className="text-base shrink-0 flag-shadow">🇧🇩</span>
              <span>Explore Bangladesh</span>
            </Link>
            <Link
              href="/explore/world"
              onClick={onClose}
              className={`p-3 min-h-11 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors ${
                isExploreWorld
                  ? "bg-accent text-accent-foreground shadow-md"
                  : "bg-muted/50 text-foreground hover:bg-muted"
              }`}
            >
              <Globe2 className="size-4 text-accent shrink-0" />
              <span>Explore World</span>
            </Link>
          </div>
        </div>

        {/* Section 4: Utilities */}
        <div className="pt-2 border-t border-border text-xs">
          <button
            onClick={() => {
              onClose();
              onOpenHelp();
            }}
            className="w-full p-2.5 min-h-11 rounded-xl bg-muted/50 border border-border text-muted-foreground hover:text-foreground hover:bg-muted flex items-center justify-center gap-2 text-xs font-medium cursor-pointer"
          >
            <HelpCircle className="size-3.5 text-accent" />
            <span>How to Play</span>
          </button>
        </div>
      </div>

      {/* Backdrop */}
      <div
        className="fixed inset-0 top-13.25 z-40 bg-black/60 backdrop-blur-xs lg:hidden pointer-events-auto transition-opacity animate-in fade-in duration-150 select-none touch-none"
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
