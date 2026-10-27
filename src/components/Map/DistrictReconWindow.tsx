"use client";

import React from "react";
import { DistrictData } from "@/data/bangladesh";
import { GuessResult, GameStatus, GameDifficulty, GameMode } from "@/lib/store";
import { Target, ShieldCheck, ShieldAlert } from "lucide-react";
import { DirectionIcon } from "@/components/ui/direction-icon";

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
    <div className="hidden md:block absolute top-4 left-4 z-20 w-64 max-w-xs rounded-xl border border-border bg-card/95 p-3 shadow-2xl backdrop-blur-md text-xs text-foreground space-y-2">
      {difficulty === "hard" &&
      (!inspectedDistrict || (!isNeighbor && !isGuessed)) ? (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between pb-1 border-b border-destructive/30 text-xs">
            <span className="font-semibold text-destructive flex items-center gap-1.5">
              <ShieldAlert className="size-3.5" /> Hard Mode
            </span>
            <span className="text-2xs text-muted-foreground">Map Hidden</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Districts stay hidden on hover or click. Unlock Hints to reveal
            neighboring districts!
          </p>
          {lastGuess && (
            <div className="text-xs flex items-center justify-between pt-1 border-t border-border">
              <span className="text-muted-foreground">Last Guess:</span>
              <span className="font-semibold text-foreground">
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
                district!
              </div>
              {targetDistrict && (
                <div className="text-2xs text-bd-primary font-semibold pt-1 border-t border-border">
                  {difficulty === "easy" || unlockedHints >= 1 ? (
                    `Hint 1: Division: ${targetDistrict.division}`
                  ) : (
                    <span className="text-muted-foreground font-normal">
                      Hint 1: 🔒 Locked (Unlock in Hints drawer)
                    </span>
                  )}
                </div>
              )}
            </div>
          ) : !isNameVisible && isPlaying ? (
            /* Unrevealed territory in Detective / Normal mode */
            <div className="space-y-1.5">
              <div className="flex items-center justify-between pb-1 border-b border-border text-xs">
                <span className="font-semibold text-foreground">
                  Unrevealed District
                </span>
                <span className="text-2xs text-muted-foreground font-mono">
                  {mode === "detective" ? "Detective" : `${difficulty.toUpperCase()}`}
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
              <div className="flex items-center justify-between pb-1 border-b border-border">
                <span className="font-bold text-foreground text-sm flex items-center gap-1.5">
                  {inspectedDistrict.name}
                </span>
                <span className="text-2xs text-muted-foreground">
                  {inspectedDistrict.division} Division
                </span>
              </div>

              {isGuessed ? (
                <div className="text-xs pt-1.5 space-y-1">
                  {guessedDistrictsMap.get(nameKey)?.isCorrect ? (
                    <span className="text-bd-primary font-semibold flex items-center gap-1">
                      <ShieldCheck className="size-3.5" /> Target Found!
                    </span>
                  ) : (
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span>
                        Dist:{" "}
                        <strong className="text-accent">
                          {guessedDistrictsMap.get(nameKey)?.distanceKm} km
                        </strong>
                      </span>
                      <span className="font-mono text-xs text-accent flex items-center gap-1">
                        <DirectionIcon
                          direction={guessedDistrictsMap.get(nameKey)?.direction}
                          isCorrect={guessedDistrictsMap.get(nameKey)?.isCorrect}
                          className="size-3.5 inline text-accent"
                        />
                        <span>{guessedDistrictsMap.get(nameKey)?.direction}</span>
                      </span>
                    </div>
                  )}
                </div>
              ) : isNeighbor ? (
                <div className="text-xs text-bd-primary font-semibold pt-1">
                  Borders the secret target (Revealed Hint)
                </div>
              ) : (
                <div className="text-2xs text-muted-foreground pt-1 flex items-center justify-between">
                  <span>Not guessed yet</span>
                  <span className="text-muted-foreground">Type or click to guess</span>
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

          {lastGuess ? (
            <div className="text-xs flex items-center justify-between">
              <span className="text-muted-foreground">Last:</span>
              <span className="font-semibold text-foreground flex items-center gap-1">
                <span>{lastGuess.country.name}</span>
                <span className="text-muted-foreground">({lastGuess.distanceKm}km</span>
                <DirectionIcon
                  direction={lastGuess.direction}
                  isCorrect={lastGuess.isCorrect}
                  className="size-3 inline text-accent"
                />
                <span className="text-muted-foreground">)</span>
              </span>
            </div>
          ) : (
            <div className="text-xs text-muted-foreground">
              Click or hover any district to inspect or guess
            </div>
          )}

          <div className="text-2xs text-muted-foreground pt-1 border-t border-border flex items-center justify-between">
            <span>Map Mode:</span>
            <span className="text-muted-foreground">
              {mode === "detective" ? "Detective Mode" : "Clean Map"}
            </span>
          </div>
        </div>
      )}

      {/* Guessed dots row */}
      {guesses.length > 0 && (
        <div className="pt-1 border-t border-border flex items-center gap-1 overflow-x-auto">
          {guesses.map((g, i) => (
            <span
              key={i}
              title={`${g.country.name}: ${g.distanceKm}km`}
              className={`size-2.5 rounded-full shrink-0 ${
                g.isCorrect
                  ? "bg-bd-primary"
                  : g.distanceKm < 60
                    ? "bg-accent"
                    : g.distanceKm < 130
                      ? "bg-bd-primary/50"
                      : "bg-muted"
              }`}
            />
          ))}
          <span className="text-2xs text-muted-foreground ml-auto">
            {guesses.length}/6
          </span>
        </div>
      )}
    </div>
  );
}
