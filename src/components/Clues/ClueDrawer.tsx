"use client";

import React from "react";
import { useGameStore } from "@/lib/store";
import { COUNTRIES_BY_ID, getEffectiveBorders } from "@/data/world";
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
import { HintCard } from "@/components/Clues/HintCard";

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

  const isPlaying = gameStatus === "playing";

  return (
    <div className="w-full rounded-2xl border border-white/10 bg-[#0c101c] p-4 sm:p-5 shadow-xl space-y-3.5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between border-b border-white/5 pb-2.5 gap-2">
        <div className="flex items-center gap-2">
          <Lightbulb className="size-4 text-amber-400 shrink-0" />
          <h3 className="text-sm font-semibold text-white">Hints</h3>
          <span className="text-2xs text-slate-400 uppercase tracking-wider font-mono">
            ({isBD ? "Bangladesh" : "World"} • {difficulty})
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className="text-xs text-slate-300 border-slate-700 font-mono"
          >
            Hints: {unlockedHints} of 3
          </Badge>
        </div>
      </div>

      {/* 3 Hint Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Hint 1: Division / Continent */}
        <HintCard
          icon={
            isBD ? (
              <Building className="size-3.5 text-sky-400" />
            ) : (
              <Globe2 className="size-3.5 text-sky-400" />
            )
          }
          title={`Hint 1: ${isBD ? "Division" : "Continent"}`}
          isUnlocked={unlockedHints >= 1}
          canUnlock={unlockedHints < 1}
          isLocked={false}
          accentColor="sky"
          disabled={!isPlaying}
          onReveal={unlockNextHint}
          content={
            isBD ? (
              <span className="text-sky-300">
                Division: {targetDistrict.division}
              </span>
            ) : (
              <span className="text-sky-300">
                Continent: {targetCountry.region}
              </span>
            )
          }
        />

        {/* Hint 2: Starting letter / Flag / 1st Neighbor */}
        <HintCard
          icon={
            difficulty === "hard" ? (
              <Layers className="size-3.5 text-amber-400" />
            ) : isBD ? (
              <KeyRound className="size-3.5 text-amber-400" />
            ) : (
              <Flag className="size-3.5 text-amber-400" />
            )
          }
          title={`Hint 2: ${
            difficulty === "hard"
              ? isBD
                ? "1st Neighboring District"
                : hasLandBorders
                  ? "1st Neighboring Country"
                  : "Nearest Country"
              : isBD
                ? "Starting Letter"
                : "National Flag"
          }`}
          isUnlocked={unlockedHints >= 2}
          canUnlock={unlockedHints === 1}
          isLocked={unlockedHints < 1}
          lockMessage="Locked (Unlock Hint 1)"
          accentColor="amber"
          disabled={!isPlaying}
          onReveal={unlockNextHint}
          content={
            difficulty === "hard" ? (
              isBD ? (
                <div>
                  <span className="text-amber-300 font-bold">
                    Neighbor 1: {targetDistrict.borders[0] || "None"}
                  </span>
                  <p className="text-2xs text-sky-400 font-normal">
                    Highlighted on map
                  </p>
                </div>
              ) : (
                <div>
                  <span className="text-amber-300 font-bold flex items-center gap-1">
                    {neighbor1Country?.flagEmoji}{" "}
                    {hasLandBorders ? "Neighbor 1" : "Nearest Country"}:{" "}
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
                <span className="text-xs text-slate-300">National Flag</span>
              </div>
            )
          }
        />

        {/* Hint 3: Letter count / Starting letter / 2nd Neighbor */}
        <HintCard
          icon={
            difficulty === "hard" ? (
              <Layers className="size-3.5 text-emerald-400" />
            ) : isBD ? (
              <Hash className="size-3.5 text-emerald-400" />
            ) : (
              <KeyRound className="size-3.5 text-emerald-400" />
            )
          }
          title={`Hint 3: ${
            difficulty === "hard"
              ? isBD
                ? "2nd Neighboring District"
                : hasLandBorders
                  ? "2nd Neighboring Country"
                  : "2nd Nearest Country"
              : isBD
                ? "Letter Count"
                : "Starting Letter"
          }`}
          isUnlocked={unlockedHints >= 3}
          canUnlock={unlockedHints === 2}
          isLocked={unlockedHints < 2}
          lockMessage="Locked (Unlock Hint 2)"
          accentColor="emerald"
          disabled={!isPlaying}
          onReveal={unlockNextHint}
          content={
            difficulty === "hard" ? (
              isBD ? (
                <div>
                  <span className="text-emerald-300 font-bold">
                    Neighbor 2:{" "}
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
                    {hasLandBorders ? "Neighbor 2" : "2nd Nearest Country"}:{" "}
                    {neighbor2Country?.name || "None"}
                  </span>
                  <p className="text-2xs text-sky-400 font-normal">
                    Highlighted on map
                  </p>
                </div>
              )
            ) : isBD ? (
              <span className="text-emerald-300 font-bold font-mono">
                Length: {targetDistrict.name.replace(/\s+/g, "").length} letters
              </span>
            ) : (
              <span className="text-emerald-300 font-bold font-mono">
                Starts with: {targetCountry.name.charAt(0).toUpperCase()}
              </span>
            )
          }
        />
      </div>
    </div>
  );
}
