"use client";

import React from "react";
import { CountryData } from "@/data/world";
import { GuessResult, GameStatus, GameDifficulty, GameMode } from "@/lib/store";
import { Target, ShieldCheck, ShieldAlert, X } from "lucide-react";

interface CountryReconSheetProps {
  mode?: GameMode;
  inspectedCountry: CountryData | null;
  onClose: () => void;
  isTargetInspected: boolean;
  gameStatus: GameStatus;
  difficulty: GameDifficulty;
  guessedCountriesMap: Map<string, GuessResult>;
  activeNeighbors: string[];
  targetCountry: CountryData | null;
  unlockedHints: number;
}

export function CountryReconSheet({
  mode = "daily",
  inspectedCountry,
  onClose,
  isTargetInspected,
  gameStatus,
  difficulty,
  guessedCountriesMap,
  activeNeighbors,
  targetCountry,
  unlockedHints,
}: CountryReconSheetProps) {
  if (!inspectedCountry) return null;

  const isPlaying = gameStatus === "playing";
  const guessedInfo = guessedCountriesMap.get(inspectedCountry.id);
  const isGuessed = Boolean(guessedInfo);
  const isNeighbor = activeNeighbors.includes(inspectedCountry.id);
  const isGameOver = !isPlaying;

  // In Detective mode, names are never visible on unrevealed territories, even on Easy!
  const isNameVisible =
    isGameOver ||
    isGuessed ||
    isNeighbor ||
    (mode !== "detective" && difficulty === "easy");

  return (
    <div className="md:hidden absolute bottom-2 left-2 right-2 z-30 rounded-2xl border border-slate-700/90 bg-slate-900/98 p-3 shadow-2xl backdrop-blur-xl text-xs text-slate-200 space-y-2 animate-in fade-in zoom-in-95">
      {/* Header Row */}
      <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
        <div className="flex items-center gap-2 min-w-0">
          {isTargetInspected && isPlaying ? (
            <div>
              <div className="flex items-center gap-1.5">
                <Target className="size-3.5 text-amber-400 shrink-0" />
                <h4 className="font-bold text-amber-400 text-sm leading-tight truncate">
                  Mystery Target
                </h4>
              </div>
              <p className="text-2xs text-amber-300/80">Secret Location</p>
            </div>
          ) : !isNameVisible && isPlaying ? (
            <div>
              <div className="flex items-center gap-1.5">
                <ShieldAlert className="size-3.5 text-slate-400 shrink-0" />
                <h4 className="font-bold text-slate-300 text-sm leading-tight truncate">
                  Unrevealed Country
                </h4>
              </div>
              <p className="text-2xs text-slate-500 font-mono">
                {mode === "detective" ? "Detective" : `${difficulty.toUpperCase()}`}
              </p>
            </div>
          ) : (
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-xl leading-none shrink-0">
                {inspectedCountry.flagEmoji}
              </span>
              <div className="min-w-0">
                <h4 className="font-bold text-white text-sm leading-tight truncate">
                  {inspectedCountry.name}
                </h4>
                <p className="text-2xs text-sky-400">
                  {inspectedCountry.region}
                </p>
              </div>
            </div>
          )}
        </div>
        <button
          onClick={onClose}
          className="size-7 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-white flex items-center justify-center shrink-0 cursor-pointer"
          aria-label="Close Inspector"
        >
          <X className="size-3.5" />
        </button>
      </div>

      {/* Body Content */}
      {isTargetInspected && isPlaying ? (
        <div className="space-y-1">
          <p className="text-xs text-amber-300 leading-snug">
            Amber outline. Follow distance & compass clues to guess this mystery country!
          </p>
          {targetCountry && (
            <div className="text-2xs font-semibold pt-1 border-t border-slate-800">
              {difficulty === "easy" || unlockedHints >= 1 ? (
                <span className="text-sky-400">
                  Hint 1: Continent: {targetCountry.region}
                </span>
              ) : (
                <span className="text-slate-500 font-normal">
                  Hint 1: 🔒 Locked (Unlock in Hints)
                </span>
              )}
            </div>
          )}
        </div>
      ) : !isNameVisible && isPlaying ? (
        <div className="space-y-1">
          <p className="text-xs text-slate-400 leading-snug">
            {mode === "detective"
              ? "Hidden until guessed. Follow distance and compass clues to find it."
              : "Hidden until guessed or revealed through hints."}
          </p>
          <p className="text-2xs text-slate-500 font-mono">
            Type name in search box to guess.
          </p>
        </div>
      ) : isGuessed ? (
        <div className="pt-0.5">
          {guessedInfo?.isCorrect ? (
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <ShieldCheck className="size-3.5" /> Target Found!
            </span>
          ) : (
            <div className="flex items-center justify-between text-xs">
              <span>
                Distance:{" "}
                <strong className="text-amber-400">
                  {guessedInfo?.distanceKm.toLocaleString()} km
                </strong>
              </span>
              <span className="font-mono text-xs text-sky-300">
                {guessedInfo?.directionEmoji} {guessedInfo?.direction}
              </span>
            </div>
          )}
        </div>
      ) : isNeighbor ? (
        <p className="text-xs text-sky-300 font-semibold">
          {targetCountry && targetCountry.borders.length === 0
            ? "Closest neighbor to secret target (Revealed Hint)"
            : "Borders the secret target (Revealed Hint)"}
        </p>
      ) : (
        <p className="text-2xs text-slate-400">
          Not guessed yet. Type in the search box to make a guess.
        </p>
      )}
    </div>
  );
}
