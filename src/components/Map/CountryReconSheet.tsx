"use client";

import React from "react";
import { CountryData } from "@/data/world";
import { GuessResult, GameStatus, GameDifficulty } from "@/lib/store";
import { Target, ShieldCheck, ShieldAlert, X } from "lucide-react";

interface CountryReconSheetProps {
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
  const isGuessed = guessedCountriesMap.has(inspectedCountry.id);
  const isNeighbor = activeNeighbors.includes(inspectedCountry.id);

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
          ) : difficulty === "hard" && !isGuessed && !isNeighbor && isPlaying ? (
            <div>
              <div className="flex items-center gap-1.5">
                <ShieldAlert className="size-3.5 text-rose-400 shrink-0" />
                <h4 className="font-bold text-rose-400 text-sm leading-tight truncate">
                  Hidden Country
                </h4>
              </div>
              <p className="text-2xs text-slate-400">Hard Mode</p>
            </div>
          ) : difficulty === "normal" && !isGuessed && !isNeighbor && isPlaying ? (
            <div>
              <h4 className="font-bold text-slate-300 text-sm leading-tight truncate">
                Unrevealed Country
              </h4>
              <p className="text-2xs text-slate-400">Normal Mode</p>
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
      ) : difficulty === "hard" && !isGuessed && !isNeighbor && isPlaying ? (
        <p className="text-xs text-slate-400 leading-snug">
          Countries stay hidden on tap in Hard Mode. Unlock Hints or guess to reveal!
        </p>
      ) : difficulty === "normal" && !isGuessed && !isNeighbor && isPlaying ? (
        <p className="text-xs text-slate-400 leading-snug">
          Hidden until guessed or revealed through neighbor hints.
        </p>
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
