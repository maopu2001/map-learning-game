"use client";

import React from "react";
import { useGameStore, getMaxGuesses } from "@/lib/store";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { Target } from "lucide-react";
import { DirectionIcon } from "@/components/ui/direction-icon";
import { CountryData } from "@/data/world";
import { DistrictData } from "@/data/bangladesh";

export function GuessHistory() {
  const scope = useGameStore((s) => s.scope);
  const guesses = useGameStore((s) => s.guesses);
  const difficulty = useGameStore((s) => s.difficulty);

  const isBD = scope === "bangladesh";
  const maxGuesses = getMaxGuesses(difficulty);

  if (guesses.length === 0) {
    return (
      <div className="w-full rounded-2xl border border-white/10 bg-[#0c101c] p-5 text-center text-slate-500 shadow-xl">
        <Target className="size-8 mx-auto mb-2 text-slate-600 opacity-80" />
        <p className="text-sm font-semibold text-slate-300">
          No guesses yet
        </p>
        <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
          {isBD
            ? "Type any Bangladesh district above to see distance and compass direction to the secret district."
            : "Type any country above to see distance and compass direction to the secret country."}
        </p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-2.5">
      <div className="flex items-center justify-between text-xs font-mono font-semibold text-slate-400 px-2 uppercase tracking-wider">
        <span>
          Guesses ({guesses.length}/{maxGuesses})
        </span>
        <span>Closeness</span>
      </div>

      <div className="space-y-2">
        <AnimatePresence initial={false}>
          {guesses.map((g, idx) => {
            const isWinner = g.isCorrect;
            const hotThreshold = isBD ? 70 : 1500;
            const closeThreshold = isBD ? 150 : 3500;
            const isVeryClose = g.distanceKm < hotThreshold;
            const isClose = g.distanceKm < closeThreshold;

            const isDistrict = "division" in g.country;
            const districtItem = isDistrict
              ? (g.country as DistrictData)
              : null;
            const countryItem = !isDistrict ? (g.country as CountryData) : null;

            return (
              <motion.div
                key={`${g.country.id}-${idx}`}
                initial={{ opacity: 0, y: 8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className={`flex flex-col gap-2 p-3.5 rounded-xl border transition-all ${
                  isWinner
                    ? "bg-emerald-950/50 border-emerald-500/50 shadow-lg shadow-emerald-950/40"
                    : isVeryClose
                      ? "bg-orange-950/30 border-orange-500/30"
                      : isClose
                        ? "bg-purple-950/30 border-purple-500/30"
                        : "bg-[#0c101c] border-white/10"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    {!isDistrict && countryItem && (
                      <span className="text-2xl shrink-0">{countryItem.flagEmoji}</span>
                    )}
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-xs sm:text-sm text-white truncate">
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
                            variant="amber"
                            className="text-2xs px-1.5 py-0 shrink-0"
                          >
                            VERY CLOSE 🔥
                          </Badge>
                        )}
                      </div>
                      <span className="text-2xs sm:text-xs text-slate-400 block truncate">
                        {districtItem
                          ? `${districtItem.division} Division`
                          : `${countryItem?.capital} • ${countryItem?.region}`}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-right shrink-0">
                    <div className="flex flex-col items-end">
                      <span className="font-bold font-mono text-xs sm:text-sm text-white flex items-center gap-1">
                        {g.isCorrect
                          ? "0 km"
                          : `${g.distanceKm.toLocaleString()} km`}
                        <DirectionIcon
                          direction={g.direction}
                          isCorrect={g.isCorrect}
                          className="size-3.5 sm:size-4 text-sky-400"
                        />
                      </span>
                      <span className="text-3xs sm:text-2xs text-slate-400 font-mono">
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
                        ? "[&>[data-slot=progress-indicator]]:bg-emerald-500"
                        : isVeryClose
                          ? "[&>[data-slot=progress-indicator]]:bg-orange-500"
                          : isClose
                            ? "[&>[data-slot=progress-indicator]]:bg-purple-500"
                            : "[&>[data-slot=progress-indicator]]:bg-slate-700"
                    }`}
                  />
                  <span className="text-xs font-mono text-slate-400 shrink-0 w-8 text-right">
                    {g.proximityScore}%
                  </span>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
