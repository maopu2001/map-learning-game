"use client";

import React from "react";
import { useGameStore, getMaxGuesses } from "@/lib/store";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { Target } from "lucide-react";
import { CountryData } from "@/data/world";
import { DistrictData } from "@/data/bangladesh";

export function GuessHistory() {
  const scope = useGameStore((s) => s.scope);
  const guesses = useGameStore((s) => s.guesses);
  const difficulty = useGameStore((s) => s.difficulty);

  const isBD = scope === "bangladesh";
  const maxGuesses = getMaxGuesses(difficulty);
  const showDirection = difficulty !== "hard";

  if (guesses.length === 0) {
    return (
      <div className="w-full rounded-2xl border border-white/[0.08] bg-[#0c101c] p-5 text-center text-slate-500 shadow-xl">
        <Target className="size-8 mx-auto mb-2 text-slate-600 opacity-80" />
        <p className="text-sm font-semibold text-slate-300">
          No reconnaissance guesses yet
        </p>
        <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
          {isBD
            ? `Type any Bangladesh district above to calculate geodesic distance${
                showDirection ? " and compass direction" : ""
              } to the secret district.`
            : `Type any sovereign country above to calculate geodesic distance${
                showDirection ? " and compass direction" : ""
              } to the secret nation.`}
        </p>
        {difficulty === "hard" && (
          <p className="text-[11px] text-rose-400 mt-2 font-mono bg-rose-950/30 border border-rose-500/20 py-1 px-2.5 rounded-lg inline-block">
            Hard Mode: Compass bearing disabled — calculate target via distance
            triangulation!
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="w-full space-y-2.5">
      <div className="flex items-center justify-between text-[11px] font-mono font-semibold text-slate-400 px-2 uppercase tracking-wider">
        <span>
          Reconnaissance Log ({guesses.length}/{maxGuesses})
        </span>
        <span>Proximity Score</span>
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
                        : "bg-[#0c101c] border-white/[0.08]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{g.country.flagEmoji}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white">
                          {g.country.name}
                        </span>
                        {isWinner && (
                          <Badge
                            variant="success"
                            className="text-[10px] px-2 py-0"
                          >
                            TARGET FOUND
                          </Badge>
                        )}
                        {!isWinner && isVeryClose && (
                          <Badge
                            variant="amber"
                            className="text-[10px] px-2 py-0"
                          >
                            HOT 🔥
                          </Badge>
                        )}
                      </div>
                      <span className="text-xs text-slate-400">
                        {districtItem
                          ? `${districtItem.division} Division`
                          : `${countryItem?.capital} • ${countryItem?.region}`}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-right">
                    <div className="flex flex-col items-end">
                      <span className="font-bold font-mono text-sm text-white flex items-center gap-1.5">
                        {g.isCorrect
                          ? "0 km"
                          : `${g.distanceKm.toLocaleString()} km`}
                        {showDirection ? (
                          <span className="text-base">{g.directionEmoji}</span>
                        ) : (
                          <span className="text-xs text-slate-500">📏</span>
                        )}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {g.isCorrect
                          ? "Direct Hit"
                          : showDirection
                            ? `Bearing: ${g.bearing}° ${g.direction}`
                            : "Distance triangulated"}
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
                  <span className="text-[11px] font-mono text-slate-400 shrink-0 w-8 text-right">
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
