"use client";

import React from "react";
import { DistrictData } from "@/data/bangladesh";
import { GuessResult, GameStatus, GameDifficulty, GameMode } from "@/lib/store";
import { Target, ShieldCheck, ShieldAlert } from "lucide-react";

interface DistrictReconWindowProps {
  mode?: GameMode;
  difficulty: GameDifficulty;
  inspectedDistrict: DistrictData | null;
  activeNeighbors: string[];
  guessedDistrictsMap: Map<string, GuessResult>;
  lastGuess?: GuessResult | null;
  isTargetInspected: boolean;
  gameStatus: GameStatus;
  targetDistrict: DistrictData | null;
  unlockedHints: number;
  guesses: GuessResult[];
}

export function DistrictReconWindow({
  mode = "daily",
  difficulty,
  inspectedDistrict,
  activeNeighbors,
  guessedDistrictsMap,
  lastGuess,
  isTargetInspected,
  gameStatus,
  targetDistrict,
  unlockedHints,
  guesses,
}: DistrictReconWindowProps) {
  const isPlaying = gameStatus === "playing";
  const nameKey = inspectedDistrict?.name.toLowerCase() || "";
  const isGuessed = Boolean(inspectedDistrict && guessedDistrictsMap.has(nameKey));
  const isNeighbor = Boolean(
    inspectedDistrict && activeNeighbors.includes(inspectedDistrict.name),
  );
  const isGameOver = !isPlaying;

  // In Detective mode, names are never visible on unrevealed territories, even on Easy!
  const isNameVisible =
    isGameOver ||
    isGuessed ||
    isNeighbor ||
    (mode !== "detective" && difficulty === "easy");

  return (
    <div className="hidden md:block absolute top-4 left-4 z-20 w-64 max-w-xs rounded-xl border border-slate-700/80 bg-slate-900/95 p-3 shadow-2xl backdrop-blur-md text-xs text-slate-200 space-y-2">
      {difficulty === "hard" &&
      (!inspectedDistrict || (!isNeighbor && !isGuessed)) ? (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between pb-1 border-b border-rose-500/30 text-xs">
            <span className="font-semibold text-rose-400 flex items-center gap-1.5">
              <ShieldAlert className="size-3.5" /> Hard Mode
            </span>
            <span className="text-2xs text-slate-400">Map Hidden</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Districts stay hidden on hover or click. Unlock Hints to reveal
            neighboring districts!
          </p>
          {lastGuess && (
            <div className="text-xs flex items-center justify-between pt-1 border-t border-slate-800">
              <span className="text-slate-400">Last Guess:</span>
              <span className="font-semibold text-white">
                {lastGuess.country.name} ({lastGuess.distanceKm}km)
              </span>
            </div>
          )}
        </div>
      ) : inspectedDistrict ? (
        <div>
          {/* Target inspection during active play (only shown when target outline is visible in Daily/Blitz) */}
          {isTargetInspected && isPlaying ? (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between pb-1 border-b border-amber-500/30">
                <span className="font-bold text-amber-400 text-sm flex items-center gap-1.5">
                  <Target className="size-4" /> Secret Target
                </span>
                <span className="text-2xs text-amber-300 bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-500/30">
                  Target
                </span>
              </div>
              <div className="text-xs text-slate-300 leading-relaxed">
                Amber outline. Follow your distance clues to guess this mystery
                district!
              </div>
              {targetDistrict && (
                <div className="text-2xs text-emerald-400 font-semibold pt-1 border-t border-slate-800">
                  {difficulty === "easy" || unlockedHints >= 1 ? (
                    `Hint 1: Division: ${targetDistrict.division}`
                  ) : (
                    <span className="text-slate-500 font-normal">
                      Hint 1: 🔒 Locked (Unlock in Hints drawer)
                    </span>
                  )}
                </div>
              )}
            </div>
          ) : !isNameVisible && isPlaying ? (
            /* Unrevealed territory in Detective / Normal mode */
            <div className="space-y-1.5">
              <div className="flex items-center justify-between pb-1 border-b border-slate-800 text-xs">
                <span className="font-semibold text-slate-300">
                  Unrevealed District
                </span>
                <span className="text-2xs text-slate-400 font-mono">
                  {mode === "detective" ? "Detective" : `${difficulty.toUpperCase()}`}
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                {mode === "detective"
                  ? "Hidden until guessed. Follow distance and compass clues to find it."
                  : "Hidden until guessed or revealed through hints."}
              </p>
              <p className="text-2xs text-slate-500 font-mono pt-0.5">
                Type name in search box to guess.
              </p>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between pb-1 border-b border-slate-800">
                <span className="font-bold text-white text-sm flex items-center gap-1.5">
                  {inspectedDistrict.name}
                </span>
                <span className="text-2xs text-slate-400">
                  {inspectedDistrict.division} Division
                </span>
              </div>

              {isGuessed ? (
                <div className="text-xs pt-1.5 space-y-1">
                  {guessedDistrictsMap.get(nameKey)?.isCorrect ? (
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      <ShieldCheck className="size-3.5" /> Target Found!
                    </span>
                  ) : (
                    <div className="flex items-center justify-between text-slate-300">
                      <span>
                        Dist:{" "}
                        <strong className="text-amber-400">
                          {guessedDistrictsMap.get(nameKey)?.distanceKm} km
                        </strong>
                      </span>
                      <span className="font-mono text-xs text-sky-300">
                        {guessedDistrictsMap.get(nameKey)?.directionEmoji}{" "}
                        {guessedDistrictsMap.get(nameKey)?.direction}
                      </span>
                    </div>
                  )}
                </div>
              ) : isNeighbor ? (
                <div className="text-xs text-sky-300 font-semibold pt-1">
                  Borders the secret target (Revealed Hint)
                </div>
              ) : (
                <div className="text-2xs text-slate-400 pt-1 flex items-center justify-between">
                  <span>Not guessed yet</span>
                  <span className="text-slate-500">Type or click to guess</span>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between pb-1 border-b border-slate-800 text-xs">
            <span className="text-slate-400 font-medium flex items-center gap-1">
              <Target className="size-3 text-amber-400" /> Target
            </span>
            <span className="text-amber-400 font-semibold">
              {mode === "detective" ? "Hidden on map" : "Amber outline"}
            </span>
          </div>

          {lastGuess ? (
            <div className="text-xs flex items-center justify-between">
              <span className="text-slate-400">Last:</span>
              <span className="font-semibold text-white">
                {lastGuess.country.name} ({lastGuess.distanceKm}km{" "}
                {lastGuess.directionEmoji})
              </span>
            </div>
          ) : (
            <div className="text-xs text-slate-400">
              Click or hover any district to inspect or guess
            </div>
          )}

          <div className="text-2xs text-slate-500 pt-1 border-t border-slate-800/80 flex items-center justify-between">
            <span>Map Mode:</span>
            <span className="text-slate-400">
              {mode === "detective" ? "Detective Mode" : "Clean Map"}
            </span>
          </div>
        </div>
      )}

      {/* Guessed dots row */}
      {guesses.length > 0 && (
        <div className="pt-1 border-t border-slate-800/80 flex items-center gap-1 overflow-x-auto">
          {guesses.map((g, i) => (
            <span
              key={i}
              title={`${g.country.name}: ${g.distanceKm}km`}
              className={`size-2.5 rounded-full shrink-0 ${
                g.isCorrect
                  ? "bg-emerald-500"
                  : g.distanceKm < 60
                    ? "bg-orange-500"
                    : g.distanceKm < 130
                      ? "bg-purple-500"
                      : "bg-slate-600"
              }`}
            />
          ))}
          <span className="text-2xs text-slate-500 ml-auto">
            {guesses.length}/6
          </span>
        </div>
      )}
    </div>
  );
}
