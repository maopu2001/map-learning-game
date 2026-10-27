"use client";

import React from "react";
import { CountryData } from "@/data/world";
import { GuessResult, GameStatus, GameDifficulty, GameMode } from "@/lib/store";
import { Target, ShieldCheck, ShieldAlert } from "lucide-react";
import { DirectionIcon } from "@/components/ui/direction-icon";

interface CountryReconWindowProps {
  mode?: GameMode;
  difficulty: GameDifficulty;
  inspectedCountry: CountryData | null;
  activeNeighbors: string[];
  guessedCountriesMap: Map<string, GuessResult>;
  lastGuess?: GuessResult | null;
  isTargetInspected: boolean;
  gameStatus: GameStatus;
  targetCountry: CountryData | null;
  unlockedHints: number;
  guesses?: GuessResult[];
}

export function CountryReconWindow({
  mode = "daily",
  difficulty,
  inspectedCountry,
  activeNeighbors,
  guessedCountriesMap,
  lastGuess,
  isTargetInspected,
  gameStatus,
  targetCountry,
  unlockedHints,
}: CountryReconWindowProps) {
  const isPlaying = gameStatus === "playing";
  const isGuessed = Boolean(
    inspectedCountry && guessedCountriesMap.has(inspectedCountry.id),
  );
  const isNeighbor = Boolean(
    inspectedCountry && activeNeighbors.includes(inspectedCountry.id),
  );
  const isGameOver = !isPlaying;

  // In Detective mode, names are never visible on unrevealed territories, even on Easy!
  const isNameVisible =
    isGameOver ||
    isGuessed ||
    isNeighbor ||
    (mode !== "detective" && difficulty === "easy");

  return (
    <div className="hidden md:block absolute top-4 left-4 z-20 max-w-sm w-100 rounded-xl border border-border bg-card/95 p-3 shadow-2xl backdrop-blur-md text-xs text-foreground space-y-2">
      {difficulty === "hard" &&
      (!inspectedCountry || (!isNeighbor && !isGuessed)) ? (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between pb-1 border-b border-destructive/30 text-xs">
            <span className="font-semibold text-destructive flex items-center gap-1.5">
              <ShieldAlert className="size-3.5" /> Hard Mode
            </span>
            <span className="text-2xs text-muted-foreground">Map Hidden</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Countries stay hidden on hover or click. Unlock Hints to reveal
            neighboring countries!
          </p>
          {lastGuess && (
            <div className="text-xs flex items-center justify-between pt-1 border-t border-border">
              <span className="text-muted-foreground">Last Guess:</span>
              <span className="font-semibold text-foreground">
                {lastGuess.country.name} (
                {lastGuess.distanceKm.toLocaleString()}km)
              </span>
            </div>
          )}
        </div>
      ) : inspectedCountry ? (
        <div>
          {/* Target inspection during active play (only shown when target outline is visible in Daily/Blitz) */}
          {isTargetInspected && isPlaying ? (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between pb-1 border-b border-accent/30">
                <span className="font-bold text-accent text-sm flex items-center gap-1.5">
                  <Target className="size-4" /> Secret Target
                </span>
                <span className="text-2xs text-accent bg-accent/15 px-1.5 py-0.5 rounded border border-accent/30">
                  Target
                </span>
              </div>
              <div className="text-xs text-muted-foreground leading-relaxed">
                Accent outline. Follow your distance clues to guess this mystery
                country!
              </div>
              {targetCountry && (
                <div className="text-2xs text-accent font-semibold pt-1 border-t border-border">
                  {difficulty === "easy" || unlockedHints >= 1 ? (
                    `Hint 1: Continent: ${targetCountry.continent}${targetCountry.continentBn ? ` (${targetCountry.continentBn})` : ""}`
                  ) : (
                    <span className="text-muted-foreground font-normal">
                      Hint 1: 🔒 Locked (Unlock in Hints drawer)
                    </span>
                  )}
                </div>
              )}
            </div>
          ) : !isNameVisible && isPlaying ? (
            /* Unrevealed country in Detective / Normal mode */
            <div className="space-y-1.5">
              <div className="flex items-center justify-between pb-1 border-b border-border text-xs">
                <span className="font-semibold text-foreground">
                  Unrevealed Country
                </span>
                <span className="text-2xs text-muted-foreground font-mono">
                  {mode === "detective"
                    ? "Detective"
                    : `${difficulty.toUpperCase()}`}
                </span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {mode === "detective"
                  ? "Hidden until guessed. Follow distance and compass clues to find it."
                  : "Hidden until guessed or revealed through hints."}
              </p>
              <p className="text-2xs text-muted-foreground font-mono pt-0.5">
                Type name in search box to guess.
              </p>
            </div>
          ) : (
            <div>
              <div className="flex flex-col items-start justify-center gap-1 pb-1 border-b border-border">
                <span className="font-bold text-foreground text-sm flex items-center gap-1.5 flex-wrap">
                  <span>{inspectedCountry.flagEmoji}</span>
                  <span>{inspectedCountry.name}</span>
                  {inspectedCountry.nameBn && (
                    <span className="text-xs text-muted-foreground font-medium">
                      ({inspectedCountry.nameBn})
                    </span>
                  )}
                </span>
                <span className="text-2xs text-muted-foreground">
                  {inspectedCountry.continent}
                  {inspectedCountry.continentBn
                    ? ` (${inspectedCountry.continentBn})`
                    : ""}
                  {inspectedCountry.subregion
                    ? ` • ${inspectedCountry.subregion}${inspectedCountry.subregionBn ? ` (${inspectedCountry.subregionBn})` : ""}`
                    : ""}
                </span>
              </div>

              {isGuessed ? (
                <div className="text-xs pt-1.5 space-y-1">
                  {guessedCountriesMap.get(inspectedCountry.id)?.isCorrect ? (
                    <span className="text-primary font-semibold flex items-center gap-1">
                      <ShieldCheck className="size-3.5" /> Country Found!
                    </span>
                  ) : (
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span>
                        Dist:{" "}
                        <strong className="text-accent">
                          {guessedCountriesMap
                            .get(inspectedCountry.id)
                            ?.distanceKm.toLocaleString()}{" "}
                          km
                        </strong>
                      </span>
                      <span className="font-mono text-xs flex items-center gap-1 text-accent">
                        <DirectionIcon
                          direction={
                            guessedCountriesMap.get(inspectedCountry.id)
                              ?.direction
                          }
                          isCorrect={
                            guessedCountriesMap.get(inspectedCountry.id)
                              ?.isCorrect
                          }
                          className="size-3.5 inline text-accent"
                        />
                        <span>
                          {
                            guessedCountriesMap.get(inspectedCountry.id)
                              ?.direction
                          }
                        </span>
                      </span>
                    </div>
                  )}
                </div>
              ) : isNeighbor ? (
                <div className="text-xs text-primary font-semibold pt-1">
                  {targetCountry?.borders.length === 0
                    ? "Closest neighbor to secret target"
                    : "Borders the secret target"}
                </div>
              ) : (
                <div className="text-2xs text-muted-foreground pt-1">
                  <span>Not guessed yet</span>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between pb-1 border-b border-border text-xs">
            <span className="text-muted-foreground font-medium flex items-center gap-1">
              <Target className="size-3 text-accent" /> Target
            </span>
            <span className="text-accent font-semibold">
              {mode === "detective" ? "Hidden on map" : "Accent outline"}
            </span>
          </div>

          <div className="text-xs text-muted-foreground">
            Click or hover any country to inspect
          </div>
        </div>
      )}
    </div>
  );
}
