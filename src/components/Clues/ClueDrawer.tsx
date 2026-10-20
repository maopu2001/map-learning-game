"use client";

import React from "react";
import { useGameStore } from "@/lib/store";
import { COUNTRIES_BY_ID, getEffectiveBorders } from "@/data/world";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Lightbulb,
  Building,
  Flag,
  Globe2,
  KeyRound,
  Hash,
  Layers,
} from "lucide-react";

export function ClueDrawer() {
  const scope = useGameStore((s) => s.scope);
  const difficulty = useGameStore((s) => s.difficulty);
  const targetCountry = useGameStore((s) => s.targetCountry);
  const targetDistrict = useGameStore((s) => s.targetDistrict);
  const unlockedHints = useGameStore((s) => s.unlockedHints);
  const unlockNextHint = useGameStore((s) => s.unlockNextHint);
  const gameStatus = useGameStore((s) => s.gameStatus);

  const isBD = scope === "bangladesh";
  if (isBD && !targetDistrict) return null;
  if (!isBD && !targetCountry) return null;

  // Prepare World Mode Neighbor names for Hard Mode (falls back to nearest countries if island)
  const effectiveWorldBorders = !isBD ? getEffectiveBorders(targetCountry) : [];
  const hasLandBorders = !isBD && targetCountry.borders.length > 0;
  const neighbor1Country =
    !isBD && effectiveWorldBorders[0]
      ? COUNTRIES_BY_ID.get(effectiveWorldBorders[0])
      : null;
  const neighbor2Country =
    !isBD && effectiveWorldBorders[1]
      ? COUNTRIES_BY_ID.get(effectiveWorldBorders[1])
      : null;

  return (
    <div className="w-full rounded-2xl border border-white/10 bg-[#0c101c] p-4 sm:p-5 shadow-xl space-y-3.5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between border-b border-white/5 pb-2.5 gap-2">
        <div className="flex items-center gap-2">
          <Lightbulb className="size-4 text-amber-400 shrink-0" />
          <h3 className="text-sm font-semibold text-white">Hints & Clues</h3>
          <span className="text-2xs text-slate-400 uppercase tracking-wider font-mono">
            ({isBD ? "Bangladesh" : "World"} • {difficulty})
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className="text-xs text-slate-300 border-slate-700 font-mono"
          >
            Hints Unlocked: {unlockedHints}/3
          </Badge>
        </div>
      </div>

      {/* 3 Hint Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* ============================================================ */}
        {/* HINT 1 */}
        {/* BD: Division name (e.g. "Division: Dhaka") */}
        {/* World: Continent name (e.g. "Continent: Asia") */}
        {/* ============================================================ */}
        <div className="flex flex-col justify-between p-3 rounded-xl border border-slate-800/80 bg-slate-950/40 min-h-28">
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
              {isBD ? (
                <Building className="size-3.5 text-sky-400" />
              ) : (
                <Globe2 className="size-3.5 text-sky-400" />
              )}
              <span>Hint 1: {isBD ? "Division" : "Continent"}</span>
            </div>

            <div className="text-sm font-semibold text-slate-200 min-h-6 flex items-center">
              {unlockedHints >= 1 ? (
                isBD ? (
                  <span className="text-sky-300">
                    Division: {targetDistrict.division}
                  </span>
                ) : (
                  <span className="text-sky-300">
                    Continent: {targetCountry.region}
                  </span>
                )
              ) : (
                <span className="text-slate-600 font-mono tracking-widest">
                  •••••••••
                </span>
              )}
            </div>
          </div>

          {unlockedHints < 1 ? (
            <Button
              variant="outline"
              size="sm"
              onClick={unlockNextHint}
              disabled={gameStatus !== "playing"}
              className="mt-3 text-xs h-8 sm:h-7 w-full border-slate-700 hover:bg-slate-800 text-sky-300"
            >
              Reveal
            </Button>
          ) : (
            <div className="text-2xs text-emerald-400 font-medium mt-2">
              ✓ Unlocked
            </div>
          )}
        </div>

        {/* ============================================================ */}
        {/* HINT 2 */}
        {/* BD Easy/Normal: Starting letter (e.g. "Starts with: G") */}
        {/* BD Hard: 1st neighboring border district name (Highlighted on map) */}
        {/* World Easy/Normal: National flag */}
        {/* World Hard: 1st neighboring border country name (Highlighted on map) */}
        {/* ============================================================ */}
        <div className="flex flex-col justify-between p-3 rounded-xl border border-slate-800/80 bg-slate-950/40 min-h-28">
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
              {difficulty === "hard" ? (
                <Layers className="size-3.5 text-amber-400" />
              ) : isBD ? (
                <KeyRound className="size-3.5 text-amber-400" />
              ) : (
                <Flag className="size-3.5 text-amber-400" />
              )}
              <span>
                Hint 2:{" "}
                {difficulty === "hard"
                  ? isBD
                    ? "1st Border District"
                    : hasLandBorders
                      ? "1st Border Country"
                      : "Nearest Country"
                  : isBD
                    ? "Starting Letter"
                    : "National Flag"}
              </span>
            </div>

            <div className="text-sm font-semibold text-slate-200 min-h-6 flex flex-col justify-center">
              {unlockedHints >= 2 ? (
                difficulty === "hard" ? (
                  isBD ? (
                    <div>
                      <span className="text-amber-300 font-bold">
                        1st Border: {targetDistrict.borders[0] || "None"}
                      </span>
                      <p className="text-2xs text-sky-400 font-normal">
                        Highlighted on map
                      </p>
                    </div>
                  ) : (
                    <div>
                      <span className="text-amber-300 font-bold flex items-center gap-1">
                        {neighbor1Country?.flagEmoji}{" "}
                        {hasLandBorders ? "1st Border" : "Nearest Country"}:{" "}
                        {neighbor1Country?.name || "None"}
                      </span>
                      <p className="text-2xs text-sky-400 font-normal">
                        Highlighted on map
                      </p>
                    </div>
                  )
                ) : isBD ? (
                  <span className="text-amber-300 font-bold font-mono">
                    Starts with: {targetDistrict.name.charAt(0).toUpperCase()}
                  </span>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{targetCountry.flagEmoji}</span>
                    <span className="text-xs text-slate-300">
                      National Flag
                    </span>
                  </div>
                )
              ) : (
                <span className="text-slate-600 font-mono tracking-widest">
                  •••••••••
                </span>
              )}
            </div>
          </div>

          {unlockedHints === 1 ? (
            <Button
              variant="outline"
              size="sm"
              onClick={unlockNextHint}
              disabled={gameStatus !== "playing"}
              className="mt-3 text-xs h-8 sm:h-7 w-full border-slate-700 hover:bg-slate-800 text-amber-300"
            >
              Reveal
            </Button>
          ) : unlockedHints >= 2 ? (
            <div className="text-2xs text-emerald-400 font-medium mt-2">
              ✓ Unlocked
            </div>
          ) : (
            <span className="text-2xs text-slate-500 mt-2 text-center">
              Locked (Unlock Hint 1)
            </span>
          )}
        </div>

        {/* ============================================================ */}
        {/* HINT 3 */}
        {/* BD Easy/Normal: Total letter count (e.g. "Length: 8 letters") */}
        {/* BD Hard: 2nd neighboring border district name (Highlighted on map) */}
        {/* World Easy/Normal: Starting letter (e.g. "Starts with: J") */}
        {/* World Hard: 2nd neighboring border country name (Highlighted on map) */}
        {/* ============================================================ */}
        <div className="flex flex-col justify-between p-3 rounded-xl border border-slate-800/80 bg-slate-950/40 min-h-28">
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
              {difficulty === "hard" ? (
                <Layers className="size-3.5 text-emerald-400" />
              ) : isBD ? (
                <Hash className="size-3.5 text-emerald-400" />
              ) : (
                <KeyRound className="size-3.5 text-emerald-400" />
              )}
              <span>
                Hint 3:{" "}
                {difficulty === "hard"
                  ? isBD
                    ? "2nd Border District"
                    : hasLandBorders
                      ? "2nd Border Country"
                      : "2nd Nearest Country"
                  : isBD
                    ? "Letter Count"
                    : "Starting Letter"}
              </span>
            </div>

            <div className="text-sm font-semibold text-slate-200 min-h-6 flex flex-col justify-center">
              {unlockedHints >= 3 ? (
                difficulty === "hard" ? (
                  isBD ? (
                    <div>
                      <span className="text-emerald-300 font-bold">
                        2nd Border:{" "}
                        {targetDistrict.borders[1] ||
                          targetDistrict.borders[0] ||
                          "None"}
                      </span>
                      <p className="text-2xs text-sky-400 font-normal">
                        Highlighted on map
                      </p>
                    </div>
                  ) : (
                    <div>
                      <span className="text-emerald-300 font-bold flex items-center gap-1">
                        {neighbor2Country?.flagEmoji}{" "}
                        {hasLandBorders ? "2nd Border" : "2nd Nearest Country"}:{" "}
                        {neighbor2Country?.name || "None"}
                      </span>
                      <p className="text-2xs text-sky-400 font-normal">
                        Highlighted on map
                      </p>
                    </div>
                  )
                ) : isBD ? (
                  <span className="text-emerald-300 font-bold font-mono">
                    Length: {targetDistrict.name.replace(/\s+/g, "").length}{" "}
                    letters
                  </span>
                ) : (
                  <span className="text-emerald-300 font-bold font-mono">
                    Starts with: {targetCountry.name.charAt(0).toUpperCase()}
                  </span>
                )
              ) : (
                <span className="text-slate-600 font-mono tracking-widest">
                  •••••••••
                </span>
              )}
            </div>
          </div>

          {unlockedHints === 2 ? (
            <Button
              variant="outline"
              size="sm"
              onClick={unlockNextHint}
              disabled={gameStatus !== "playing"}
              className="mt-3 text-xs h-8 sm:h-7 w-full border-slate-700 hover:bg-slate-800 text-emerald-300"
            >
              Reveal
            </Button>
          ) : unlockedHints >= 3 ? (
            <div className="text-2xs text-emerald-400 font-medium mt-2">
              ✓ Unlocked
            </div>
          ) : (
            <span className="text-2xs text-slate-500 mt-2 text-center">
              Locked (Unlock Hint 2)
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
