"use client";

import React from "react";
import { CountryData } from "@/data/world";
import { GuessResult, GameStatus, GameDifficulty } from "@/lib/store";
import { Target, ShieldCheck, ShieldAlert } from "lucide-react";

interface CountryReconWindowProps {
  difficulty: GameDifficulty;
  inspectedCountry: CountryData | null;
  activeNeighbors: string[];
  guessedCountriesMap: Map<string, GuessResult>;
  lastGuess?: GuessResult | null;
  isTargetInspected: boolean;
  gameStatus: GameStatus;
  targetCountry: CountryData | null;
  unlockedHints: number;
  guesses: GuessResult[];
}

export function CountryReconWindow({
  difficulty,
  inspectedCountry,
  activeNeighbors,
  guessedCountriesMap,
  lastGuess,
  isTargetInspected,
  gameStatus,
  targetCountry,
  unlockedHints,
  guesses,
}: CountryReconWindowProps) {
  return (
    <div className="hidden md:block absolute top-4 left-4 z-20 w-64 max-w-xs rounded-xl border border-slate-700/80 bg-slate-900/95 p-3 shadow-2xl backdrop-blur-md text-xs text-slate-200 space-y-2">
      {difficulty === "hard" &&
      (!inspectedCountry ||
        (!activeNeighbors.includes(inspectedCountry.id) &&
          !guessedCountriesMap.has(inspectedCountry.id))) ? (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between pb-1 border-b border-rose-500/30 text-xs">
            <span className="font-semibold text-rose-400 flex items-center gap-1.5">
              <ShieldAlert className="size-3.5" /> Hard Mode
            </span>
            <span className="text-2xs text-slate-400">Map Hidden</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Countries stay hidden on hover or click. Unlock Hints to reveal
            neighboring countries!
          </p>
          {lastGuess && (
            <div className="text-xs flex items-center justify-between pt-1 border-t border-slate-800">
              <span className="text-slate-400">Last Guess:</span>
              <span className="font-semibold text-white">
                {lastGuess.country.name} (
                {lastGuess.distanceKm.toLocaleString()}km)
              </span>
            </div>
          )}
        </div>
      ) : inspectedCountry ? (
        <div>
          {/* If inspecting the secret target during active play: NEVER show its name/identity! */}
          {isTargetInspected && gameStatus === "playing" ? (
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
                country!
              </div>
              {targetCountry && (
                <div className="text-2xs text-sky-400 font-semibold pt-1 border-t border-slate-800">
                  {difficulty === "easy" || unlockedHints >= 1 ? (
                    `Hint 1: Continent: ${targetCountry.region}`
                  ) : (
                    <span className="text-slate-500 font-normal">
                      Hint 1: 🔒 Locked (Unlock in Hints drawer)
                    </span>
                  )}
                </div>
              )}
            </div>
          ) : difficulty === "normal" &&
            !activeNeighbors.includes(inspectedCountry.id) &&
            !guessedCountriesMap.has(inspectedCountry.id) &&
            gameStatus === "playing" ? (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between pb-1 border-b border-slate-800 text-xs">
                <span className="font-semibold text-slate-400">
                  Unrevealed Country
                </span>
                <span className="text-2xs text-slate-500">Normal Mode</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Only guessed countries and revealed neighbors show details.
              </p>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between pb-1 border-b border-slate-800">
                <span className="font-bold text-white text-sm flex items-center gap-1.5">
                  <span>{inspectedCountry.flagEmoji}</span>
                  <span>{inspectedCountry.name}</span>
                </span>
                <span className="text-2xs text-slate-400">
                  {inspectedCountry.region}
                </span>
              </div>

              {/* If guessed */}
              {guessedCountriesMap.has(inspectedCountry.id) ? (
                <div className="text-xs pt-1.5 space-y-1">
                  {guessedCountriesMap.get(inspectedCountry.id)?.isCorrect ? (
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      <ShieldCheck className="size-3.5" /> Country Found!
                    </span>
                  ) : (
                    <div className="flex items-center justify-between text-slate-300">
                      <span>
                        Dist:{" "}
                        <strong className="text-amber-400">
                          {guessedCountriesMap
                            .get(inspectedCountry.id)
                            ?.distanceKm.toLocaleString()}{" "}
                          km
                        </strong>
                      </span>
                      <span className="font-mono text-xs">
                        {
                          guessedCountriesMap.get(inspectedCountry.id)
                            ?.directionEmoji
                        }{" "}
                        {
                          guessedCountriesMap.get(inspectedCountry.id)
                            ?.direction
                        }
                      </span>
                    </div>
                  )}
                </div>
              ) : activeNeighbors.includes(inspectedCountry.id) ? (
                <div className="text-xs text-sky-300 font-semibold pt-1">
                  {targetCountry?.borders.length === 0
                    ? "Closest neighbor to secret target"
                    : "Borders the secret target"}
                </div>
              ) : (
                <div className="text-2xs text-slate-400 pt-1 flex items-center justify-between">
                  <span>Not guessed yet</span>
                  <span className="text-slate-500">Type name to guess</span>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between pb-1 border-b border-slate-800 text-xs">
            <span className="text-slate-400 font-medium flex items-center gap-1">
              <Target className="size-3 text-amber-400" /> Secret Target
            </span>
            <span className="text-amber-400 font-semibold">Amber outline</span>
          </div>

          {lastGuess ? (
            <div className="text-xs flex items-center justify-between">
              <span className="text-slate-400">Last:</span>
              <span className="font-semibold text-white">
                {lastGuess.country.name} (
                {lastGuess.distanceKm.toLocaleString()}km{" "}
                {lastGuess.directionEmoji})
              </span>
            </div>
          ) : (
            <div className="text-xs text-slate-400">
              Click or hover any country to inspect info
            </div>
          )}

          <div className="text-2xs text-slate-500 pt-1 border-t border-slate-800/80 flex items-center justify-between">
            <span>Map Mode:</span>
            <span className="text-slate-400">Clean map (dots only)</span>
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
                  : g.distanceKm < 1500
                    ? "bg-orange-500"
                    : g.distanceKm < 4000
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
