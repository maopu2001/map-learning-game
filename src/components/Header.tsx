"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  HelpCircle,
  Globe2,
  BookOpen,
  Home,
  Menu,
  X,
  Play,
} from "lucide-react";
import { HelpDialog } from "@/components/Dialogs/HelpDialog";
import { MobileNavDrawer } from "@/components/Navigation/MobileNavDrawer";

export function Header() {
  const pathname = usePathname();

  const [helpOpen, setHelpOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isExplore = pathname.startsWith("/explore");
  const isPlayBD = pathname === "/bangladesh";
  const isPlayWorld = pathname === "/world";
  const isExploreBD = pathname === "/explore/bangladesh";
  const isExploreWorld = pathname === "/explore/world";

  return (
    <>
      <header className="sticky top-0 z-50 w-full pointer-events-none">
        <div className="w-full pointer-events-auto border-b border-white/20 bg-surface-base/90 backdrop-blur-2xl px-3 sm:px-4 py-2 shadow-2xl shadow-black/80 flex items-center justify-between gap-2.5">
          {/* Brand + Mobile Toggle */}
          <div className="flex items-center justify-between w-full lg:w-auto gap-3">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="size-8 rounded-xl overflow-hidden border border-white/15 shadow-md shadow-sky-600/30 group-hover:scale-105 transition-transform duration-200 shrink-0 bg-[#0b1329]">
                <img
                  src="/icon.svg"
                  alt="Shimana Logo"
                  width={32}
                  height={32}
                  className="size-full object-cover"
                />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm sm:text-base font-black tracking-wider text-white">
                    SHIMANA
                  </span>
                  <span className="text-2xs font-mono px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20 font-medium hidden sm:inline-block">
                    সীমানা
                  </span>
                </div>
                <p className="text-2xs text-slate-400 leading-none">
                  Map Guessing Game
                </p>
              </div>
            </Link>

            {/* Mobile Actions: Help, Menu */}
            <div className="flex items-center gap-1.5 lg:hidden">
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
            <nav className="hidden lg:flex items-center gap-1.5 bg-black/40 border border-white/5 p-1 rounded-xl">
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
            <nav className="hidden lg:flex items-center gap-2 bg-black/40 border border-white/5 px-2 py-1 rounded-xl text-xs">
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
                  <span>Bangladesh</span>
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
                  <span>Bangladesh</span>
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
          <div className="hidden lg:flex items-center gap-1.5">
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
        <MobileNavDrawer
          open={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
          pathname={pathname}
          onOpenHelp={() => setHelpOpen(true)}
        />
      </header>

      {/* Modals */}
      <HelpDialog open={helpOpen} onOpenChange={setHelpOpen} />
    </>
  );
}
