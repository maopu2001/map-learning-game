"use client";

import React from "react";
import { DistrictData } from "@/data/bangladesh";
import { GuessResult, GameStatus, GameDifficulty, GameMode } from "@/lib/store";
import { Target, ShieldCheck, ShieldAlert, X } from "lucide-react";
import { DirectionIcon } from "@/components/ui/direction-icon";

interface DistrictReconSheetProps {
  mode?: GameMode;
  inspectedDistrict: DistrictData | null;
  onClose: () => void;
  isTargetInspected: boolean;
  gameStatus: GameStatus;
  difficulty: GameDifficulty;
  guessedDistrictsMap: Map<string, GuessResult>;
  activeNeighbors: string[];
  targetDistrict: DistrictData | null;
  unlockedHints: number;
}

export function DistrictReconSheet({
  mode = "daily",
  inspectedDistrict,
  onClose,
  isTargetInspected,
  gameStatus,
  difficulty,
  guessedDistrictsMap,
  activeNeighbors,
  targetDistrict,
  unlockedHints,
}: DistrictReconSheetProps) {
  if (!inspectedDistrict) return null;

  const isPlaying = gameStatus === "playing";
  const nameKey = inspectedDistrict.name.toLowerCase();
  const guessedInfo = guessedDistrictsMap.get(nameKey);
  const isGuessed = Boolean(guessedInfo);
  const isNeighbor = activeNeighbors.includes(inspectedDistrict.name);
  const isGameOver = !isPlaying;

  // In Detective mode, names are never visible on unrevealed territories, even on Easy!
  const isNameVisible =
    isGameOver ||
    isGuessed ||
    isNeighbor ||
    (mode !== "detective" && difficulty === "easy");

  return (
    <div className="md:hidden absolute bottom-2 left-2 right-2 z-30 rounded-2xl border border-border bg-card/98 p-3 shadow-2xl backdrop-blur-xl text-xs text-foreground space-y-2 animate-in fade-in zoom-in-95">
      {/* Header Row */}
      <div className="flex items-center justify-between pb-1.5 border-b border-border">
        <div className="flex items-center gap-2 min-w-0">
          {isTargetInspected && isPlaying ? (
            <div>
              <div className="flex items-center gap-1.5">
                <Target className="size-3.5 text-accent shrink-0" />
                <h4 className="font-bold text-accent text-sm leading-tight truncate">
                  Mystery Target
                </h4>
              </div>
              <p className="text-2xs text-accent/80">Secret Location</p>
            </div>
          ) : !isNameVisible && isPlaying ? (
            <div>
              <div className="flex items-center gap-1.5">
                <ShieldAlert className="size-3.5 text-muted-foreground shrink-0" />
                <h4 className="font-bold text-foreground text-sm leading-tight truncate">
                  Unrevealed District
                </h4>
              </div>
              <p className="text-2xs text-muted-foreground font-mono">
                {mode === "detective" ? "Detective" : `${difficulty.toUpperCase()}`}
              </p>
            </div>
          ) : (
            <div>
              <h4 className="font-bold text-foreground text-sm leading-tight truncate">
                {inspectedDistrict.name}
              </h4>
              <p className="text-2xs text-bd-primary">
                {inspectedDistrict.division} Division
              </p>
            </div>
          )}
        </div>
        <button
          onClick={onClose}
          className="size-7 rounded-lg bg-muted/50 border border-border text-muted-foreground hover:text-foreground flex items-center justify-center shrink-0 cursor-pointer"
          aria-label="Close Inspector"
        >
          <X className="size-3.5" />
        </button>
      </div>

      {/* Body Content */}
      {isTargetInspected && isPlaying ? (
        <div className="space-y-1">
          <p className="text-xs text-accent leading-snug">
            Accent outline. Follow distance & compass clues to guess this mystery district!
          </p>
          {targetDistrict && (
            <div className="text-2xs font-semibold pt-1 border-t border-border">
              {difficulty === "easy" || unlockedHints >= 1 ? (
                <span className="text-bd-primary">
                  Hint 1: Division: {targetDistrict.division}
                </span>
              ) : (
                <span className="text-muted-foreground font-normal">
                  Hint 1: 🔒 Locked (Unlock in Hints)
                </span>
              )}
            </div>
          )}
        </div>
      ) : !isNameVisible && isPlaying ? (
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground leading-snug">
            {mode === "detective"
              ? "Hidden until guessed. Follow distance and compass clues to find it."
              : "Hidden until guessed or revealed through hints."}
          </p>
          <p className="text-2xs text-muted-foreground font-mono">
            Type name in search box to guess.
          </p>
        </div>
      ) : isGuessed ? (
        <div className="pt-0.5">
          {guessedInfo?.isCorrect ? (
            <span className="text-bd-primary font-semibold flex items-center gap-1">
              <ShieldCheck className="size-3.5" /> Target Found!
            </span>
          ) : (
            <div className="flex items-center justify-between text-xs">
              <span>
                Distance:{" "}
                <strong className="text-accent">
                  {guessedInfo?.distanceKm} km
                </strong>
              </span>
              <span className="font-mono text-xs text-accent flex items-center gap-1">
                <DirectionIcon
                  direction={guessedInfo?.direction}
                  isCorrect={guessedInfo?.isCorrect}
                  className="size-3.5 inline text-accent"
                />
                <span>{guessedInfo?.direction}</span>
              </span>
            </div>
          )}
        </div>
      ) : isNeighbor ? (
        <p className="text-xs text-bd-primary font-semibold">
          Borders the secret target (Revealed Hint)
        </p>
      ) : (
        <p className="text-2xs text-muted-foreground">
          Not guessed yet. Type in the search box to make a guess.
        </p>
      )}
    </div>
  );
}
