"use client";

import React from "react";
import { useGameStore, getMaxGuesses } from "@/lib/store";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Target } from "lucide-react";
import { DirectionIcon } from "@/components/ui/direction-icon";
import { CountryData } from "@/data/world";
import { DistrictData } from "@/data/bangladesh";

interface GuessHistoryProps {
  scope?: "bangladesh" | "world";
}

export function GuessHistory({ scope: propScope }: GuessHistoryProps = {}) {
  const storeScope = useGameStore((s) => s.scope);
  const scope = propScope || storeScope;
  const rawGuesses = useGameStore((s) => s.guesses);
  const difficulty = useGameStore((s) => s.difficulty);

  const isBD = scope === "bangladesh";
  const maxGuesses = getMaxGuesses(difficulty);

  const guesses = React.useMemo(() => {
    return rawGuesses.filter((g) =>
      isBD ? "division" in g.country : !("division" in g.country)
    );
  }, [rawGuesses, isBD]);

  if (guesses.length === 0) {
    return (
      <div className="w-full rounded-2xl border border-border bg-card p-5 text-center text-muted-foreground shadow-xl">
        <Target className="size-8 mx-auto mb-2 text-muted-foreground opacity-80" />
        <p className="text-sm font-semibold text-foreground">No guesses yet</p>
        <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
          {isBD
            ? "Type any Bangladesh district above to see distance and compass direction to the secret district."
            : "Type any country above to see distance and compass direction to the secret country."}
        </p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-2.5">
      <div className="flex items-center justify-between text-xs font-mono font-semibold text-muted-foreground px-2 uppercase tracking-wider">
        <span>
          Guesses ({guesses.length}/{maxGuesses})
        </span>
        <span>Closeness</span>
      </div>

      <div className="space-y-2">
        {guesses.map((g, idx) => {
          const isWinner = g.isCorrect;
          const hotThreshold = isBD ? 70 : 1500;
          const closeThreshold = isBD ? 150 : 3500;
          const isVeryClose = g.distanceKm < hotThreshold;
          const isClose = g.distanceKm < closeThreshold;

          const isDistrict = "division" in g.country;
          const districtItem = isDistrict ? (g.country as DistrictData) : null;
          const countryItem = !isDistrict ? (g.country as CountryData) : null;

          return (
            <div
              key={`${g.country.id}-${idx}`}
              className={`animate-guess-enter flex flex-col gap-2 p-3.5 rounded-xl border transition-all ${
                isWinner
                  ? "bg-primary/20 border-primary shadow-lg"
                  : isVeryClose
                    ? "bg-accent/25 border-accent"
                    : isClose
                      ? "bg-muted/60 border-border"
                      : "bg-card border-border"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  {!isDistrict && countryItem && (
                    <span className="text-2xl shrink-0">
                      {countryItem.flagEmoji}
                    </span>
                  )}
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-bold text-xs sm:text-sm text-foreground truncate">
                        {g.country.name}
                      </span>
                      {isWinner && (
                        <Badge
                          variant="success"
                          className="text-2xs px-1.5 py-0 shrink-0"
                        >
                          FOUND
                        </Badge>
                      )}
                      {!isWinner && isVeryClose && (
                        <Badge
                          variant="accent"
                          className="text-2xs px-1.5 py-0 shrink-0"
                        >
                          🔥
                        </Badge>
                      )}
                    </div>
                    <span className="text-2xs sm:text-xs text-muted-foreground block truncate">
                      {districtItem
                        ? `${districtItem.division} Division`
                        : `${countryItem?.capital} • ${countryItem?.continent}`}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-right shrink-0">
                  <div className="flex flex-col items-end">
                    <span className="font-bold font-mono text-xs sm:text-sm text-foreground flex items-center gap-1">
                      {g.isCorrect
                        ? "0 km"
                        : `${g.distanceKm.toLocaleString()} km`}
                      <DirectionIcon
                        direction={g.direction}
                        isCorrect={g.isCorrect}
                        className="size-3.5 sm:size-4 text-accent"
                      />
                    </span>
                    <span className="text-3xs sm:text-2xs text-muted-foreground font-mono">
                      {g.isCorrect
                        ? "Correct!"
                        : `${g.bearing}° ${g.direction}`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Hot / Cold Proximity Meter */}
              <div className="flex items-center gap-2 pt-1">
                <Progress
                  value={g.proximityScore}
                  className={`h-1.5 flex-1 ${
                    isWinner
                      ? "[&>[data-slot=progress-indicator]]:bg-primary"
                      : isVeryClose
                        ? "[&>[data-slot=progress-indicator]]:bg-accent"
                        : isClose
                          ? "[&>[data-slot=progress-indicator]]:bg-primary/50"
                          : "[&>[data-slot=progress-indicator]]:bg-muted"
                  }`}
                />
                <span className="text-xs font-mono text-muted-foreground shrink-0 w-8 text-right">
                  {g.proximityScore}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
