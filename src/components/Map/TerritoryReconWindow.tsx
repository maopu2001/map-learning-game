"use client";

import React from "react";
import { CountryData } from "@/data/world";
import { DistrictData } from "@/data/bangladesh";
import { GuessResult, GameStatus, GameDifficulty, GameMode } from "@/lib/store";
import { Target, ShieldCheck, ShieldAlert, X } from "lucide-react";
import { DirectionIcon } from "@/components/ui/direction-icon";

export type ReconTerritory = CountryData | DistrictData;

export function getTerritorySubtitle(item: ReconTerritory): string {
  if ("division" in item) {
    return `${item.division}${item.divisionBn ? ` (${item.divisionBn})` : ""} Division`;
  }
  const parts = [`${item.continent}${item.continentBn ? ` (${item.continentBn})` : ""}`];
  if (item.subregion) {
    parts.push(`${item.subregion}${item.subregionBn ? ` (${item.subregionBn})` : ""}`);
  }
  return parts.join(" • ");
}

export function getHint1Text(item: ReconTerritory): string {
  if ("division" in item) {
    return `Division: ${item.division}${item.divisionBn ? ` (${item.divisionBn})` : ""}`;
  }
  return `Continent: ${item.continent}${item.continentBn ? ` (${item.continentBn})` : ""}`;
}

export function getGuessedResult(
  item: ReconTerritory | null | undefined,
  guessedMap: Map<string, GuessResult>,
): GuessResult | undefined {
  if (!item) return undefined;
  return (
    guessedMap.get(item.id) ||
    guessedMap.get(item.id.toUpperCase()) ||
    guessedMap.get(item.id.toLowerCase()) ||
    guessedMap.get(item.name.toLowerCase()) ||
    guessedMap.get(item.name)
  );
}

export interface TerritoryReconProps {
  mode?: GameMode;
  difficulty: GameDifficulty;
  inspectedTerritory: ReconTerritory | null;
  activeNeighbors: string[];
  guessedMap: Map<string, GuessResult>;
  lastGuess?: GuessResult | null;
  isTargetInspected: boolean;
  gameStatus: GameStatus;
  targetTerritory: ReconTerritory | null;
  unlockedHints: number;
  onClose?: () => void;
}

export function TerritoryReconBody({
  mode = "daily",
  difficulty,
  inspectedTerritory,
  activeNeighbors,
  guessedMap,
  lastGuess,
  isTargetInspected,
  gameStatus,
  targetTerritory,
  unlockedHints,
  onClose,
}: TerritoryReconProps) {
  const isPlaying = gameStatus === "playing";
  const isBD = Boolean(
    (inspectedTerritory && "division" in inspectedTerritory) ||
      (targetTerritory && "division" in targetTerritory),
  );
  const guessedResult = getGuessedResult(inspectedTerritory, guessedMap);
  const isGuessed = Boolean(guessedResult);
  const isNeighbor = Boolean(
    inspectedTerritory &&
      (activeNeighbors.includes(inspectedTerritory.id) ||
        activeNeighbors.includes(inspectedTerritory.name)),
  );
  const isGameOver = !isPlaying;
  const isNameVisible =
    isGameOver || isGuessed || isNeighbor || (mode !== "detective" && difficulty === "easy");
  const accentTextClass = isBD ? "text-bd-primary" : "text-primary";

  if (difficulty === "hard" && (!inspectedTerritory || (!isNeighbor && !isGuessed))) {
    return (
      <div className="space-y-1.5">
        <div className="flex items-center justify-between pb-1 border-b border-destructive/30 text-xs">
          <span className="font-semibold text-destructive flex items-center gap-1.5">
            <ShieldAlert className="size-3.5" /> Hard Mode
          </span>
          <span className="text-2xs text-muted-foreground">Map Hidden</span>
          {onClose && (
            <button
              onClick={onClose}
              className="size-6 rounded flex items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer"
              aria-label="Close"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          {isBD ? "Districts" : "Countries"} stay hidden on hover or click. Unlock Hints to reveal neighboring {isBD ? "districts" : "countries"}!
        </p>
        {lastGuess && (
          <div className="text-xs flex items-center justify-between pt-1 border-t border-border">
            <span className="text-muted-foreground">Last Guess:</span>
            <span className="font-semibold text-foreground">
              {lastGuess.country.name} ({lastGuess.distanceKm.toLocaleString()}km)
            </span>
          </div>
        )}
      </div>
    );
  }

  if (!inspectedTerritory) {
    return (
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
          Click or hover any {isBD ? "district" : "country"} to inspect
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      {/* Header Row */}
      <div className="flex items-center justify-between pb-1 border-b border-border text-xs">
        {isTargetInspected && isPlaying ? (
          <div className="flex items-center gap-1.5">
            <Target className="size-3.5 text-accent shrink-0" />
            <span className="font-bold text-accent text-sm leading-tight">Secret Target</span>
          </div>
        ) : !isNameVisible && isPlaying ? (
          <div className="flex items-center gap-1.5">
            <ShieldAlert className="size-3.5 text-muted-foreground shrink-0" />
            <span className="font-bold text-foreground text-sm leading-tight">
              Unrevealed {isBD ? "District" : "Country"}
            </span>
            <span className="text-2xs text-muted-foreground font-mono ml-1">
              ({mode === "detective" ? "Detective" : difficulty.toUpperCase()})
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 min-w-0">
            {!isBD &&
              !("division" in inspectedTerritory) &&
              "flagEmoji" in inspectedTerritory &&
              Boolean(inspectedTerritory.flagEmoji) && (
                <span className="text-base leading-none">
                  {inspectedTerritory.flagEmoji}
                </span>
              )}
            <span className="font-bold text-foreground text-sm truncate">
              {inspectedTerritory.name}
              {inspectedTerritory.nameBn && (
                <span className="ml-1 text-muted-foreground font-medium text-xs">
                  ({inspectedTerritory.nameBn})
                </span>
              )}
            </span>
          </div>
        )}
        {onClose && (
          <button
            onClick={onClose}
            className="size-6 rounded flex items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer"
            aria-label="Close"
          >
            <X className="size-3.5" />
          </button>
        )}
      </div>

      {/* Subtitle / Details */}
      {isTargetInspected && isPlaying ? (
        <div className="space-y-1">
          <p className="text-xs text-accent leading-snug">
            Accent outline. Follow distance & compass clues to guess this mystery {isBD ? "district" : "country"}!
          </p>
          {targetTerritory && (
            <div className="text-2xs font-semibold pt-1 border-t border-border">
              {difficulty === "easy" || unlockedHints >= 1 ? (
                <span className={accentTextClass}>Hint 1: {getHint1Text(targetTerritory)}</span>
              ) : (
                <span className="text-muted-foreground font-normal">Hint 1: 🔒 Locked (Unlock in Hints)</span>
              )}
            </div>
          )}
        </div>
      ) : !isNameVisible && isPlaying ? (
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground leading-relaxed">
            {mode === "detective"
              ? "Hidden until guessed. Follow distance and compass clues to find it."
              : "Hidden until guessed or revealed through hints."}
          </p>
          <p className="text-2xs text-muted-foreground font-mono">Type name in search box to guess.</p>
        </div>
      ) : (
        <div>
          <p className="text-2xs text-muted-foreground pb-1">
            {getTerritorySubtitle(inspectedTerritory)}
          </p>
          {isGuessed ? (
            <div className="text-xs pt-1 border-t border-border">
              {guessedResult?.isCorrect ? (
                <span className={`${accentTextClass} font-semibold flex items-center gap-1`}>
                  <ShieldCheck className="size-3.5" /> Target Found!
                </span>
              ) : (
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>
                    Dist: <strong className="text-accent">{guessedResult?.distanceKm.toLocaleString()} km</strong>
                  </span>
                  <span className="font-mono text-xs flex items-center gap-1 text-accent">
                    <DirectionIcon
                      direction={guessedResult?.direction}
                      isCorrect={guessedResult?.isCorrect}
                      className="size-3.5 inline text-accent"
                    />
                    <span>{guessedResult?.direction}</span>
                  </span>
                </div>
              )}
            </div>
          ) : isNeighbor ? (
            <p className={`text-xs ${accentTextClass} font-semibold pt-1 border-t border-border`}>
              {targetTerritory && "borders" in targetTerritory && targetTerritory.borders.length === 0
                ? "Closest neighbor to secret target"
                : "Borders the secret target"}
            </p>
          ) : (
            <p className="text-2xs text-muted-foreground pt-1 border-t border-border">Not guessed yet</p>
          )}
        </div>
      )}
    </div>
  );
}

export type TerritoryReconWindowProps = TerritoryReconProps;

export function TerritoryReconWindow(props: TerritoryReconWindowProps) {
  return (
    <div className="hidden md:block absolute top-4 left-4 z-20 max-w-sm w-80 rounded-xl border border-border bg-card/95 p-3 shadow-2xl backdrop-blur-md text-xs text-foreground space-y-2">
      <TerritoryReconBody {...props} />
    </div>
  );
}
