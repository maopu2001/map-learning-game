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
  Eye,
} from "lucide-react";
import { HintCard } from "@/components/Clues/HintCard";

export function ClueDrawer() {
  const scope = useGameStore((s) => s.scope);
  const mode = useGameStore((s) => s.mode);
  const difficulty = useGameStore((s) => s.difficulty);
  const targetCountry = useGameStore((s) => s.targetCountry);
  const targetDistrict = useGameStore((s) => s.targetDistrict);
  const unlockedHints = useGameStore((s) => s.unlockedHints);
  const unlockNextHint = useGameStore((s) => s.unlockNextHint);
  const gameStatus = useGameStore((s) => s.gameStatus);

  const isBD = scope === "bangladesh";
  if (isBD && !targetDistrict) return null;
  if (!isBD && !targetCountry) return null;

  // Prepare World Mode Neighbor names (falls back to nearest countries if island)
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
  const isDetective = mode === "detective";
  const isEasy = difficulty === "easy";
  const isHard = difficulty === "hard";

  // --- HINT 1 ---
  let hint1Icon = isBD ? (
    <Building className="size-3.5 text-sky-400" />
  ) : (
    <Globe2 className="size-3.5 text-sky-400" />
  );
  let hint1Title = `Hint 1: ${isBD ? "Division" : "Continent"}`;
  let hint1Content: React.ReactNode = isBD ? (
    <span className="text-sky-300">Division: {targetDistrict.division}</span>
  ) : (
    <span className="text-sky-300">Continent: {targetCountry.region}</span>
  );

  if (isDetective) {
    if (isEasy) {
      if (isBD) {
        hint1Icon = <KeyRound className="size-3.5 text-sky-400" />;
        hint1Title = "Hint 1: Starting Letter";
        hint1Content = (
          <span className="text-sky-300 font-bold font-mono">
            Starts with: {targetDistrict.name.charAt(0).toUpperCase()}
          </span>
        );
      } else {
        hint1Icon = <Flag className="size-3.5 text-sky-400" />;
        hint1Title = "Hint 1: National Flag";
        hint1Content = (
          <div className="flex items-center gap-2">
            <span className="text-2xl">{targetCountry.flagEmoji}</span>
            <span className="text-xs text-slate-300">National Flag</span>
          </div>
        );
      }
    } else if (isHard) {
      hint1Icon = <Eye className="size-3.5 text-sky-400" />;
      hint1Title = "Hint 1: Unmask Clue (Part 1)";
      hint1Content = (
        <span className="text-sky-300 font-medium">
          Reveals 50% of masked names in clue
        </span>
      );
    }
  }

  // --- HINT 2 ---
  let hint2Icon =
    !isDetective && isHard ? (
      <Layers className="size-3.5 text-amber-400" />
    ) : isBD ? (
      <KeyRound className="size-3.5 text-amber-400" />
    ) : (
      <Flag className="size-3.5 text-amber-400" />
    );
  let hint2Title =
    !isDetective && isHard
      ? `Hint 2: ${
          isBD
            ? "1st Neighboring District"
            : hasLandBorders
              ? "1st Neighboring Country"
              : "Nearest Country"
        }`
      : `Hint 2: ${isBD ? "Starting Letter" : "National Flag"}`;
  let hint2Content: React.ReactNode =
    !isDetective && isHard ? (
      isBD ? (
        <div>
          <span className="text-amber-300 font-bold">
            Neighbor 1: {targetDistrict.borders[0] || "None"}
          </span>
          <p className="text-2xs text-sky-400 font-normal">Highlighted on map</p>
        </div>
      ) : (
        <div>
          <span className="text-amber-300 font-bold flex items-center gap-1">
            {neighbor1Country?.flagEmoji}{" "}
            {hasLandBorders ? "Neighbor 1" : "Nearest Country"}:{" "}
            {neighbor1Country?.name || "None"}
          </span>
          <p className="text-2xs text-sky-400 font-normal">Highlighted on map</p>
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
    );

  if (isDetective) {
    if (isEasy) {
      if (isBD) {
        hint2Icon = <Hash className="size-3.5 text-amber-400" />;
        hint2Title = "Hint 2: Letter Count";
        hint2Content = (
          <span className="text-amber-300 font-bold font-mono">
            Length: {targetDistrict.name.replace(/\s+/g, "").length} letters
          </span>
        );
      } else {
        hint2Icon = <Building className="size-3.5 text-amber-400" />;
        hint2Title = "Hint 2: Capital City";
        hint2Content = (
          <span className="text-amber-300 font-bold">
            Capital: {targetCountry.capital || "N/A"}
          </span>
        );
      }
    } else if (isHard) {
      hint2Icon = <Eye className="size-3.5 text-amber-400" />;
      hint2Title = "Hint 2: Unmask Clue (Part 2)";
      hint2Content = (
        <span className="text-amber-300 font-medium">
          Reveals all masked names in clue
        </span>
      );
    }
  }

  // --- HINT 3 ---
  let hint3Icon =
    isDetective || isHard ? (
      <Layers className="size-3.5 text-emerald-400" />
    ) : isBD ? (
      <Hash className="size-3.5 text-emerald-400" />
    ) : (
      <KeyRound className="size-3.5 text-emerald-400" />
    );

  let hint3Title = isDetective
    ? `Hint 3: ${
        isBD
          ? "1st Neighboring District"
          : hasLandBorders
            ? "1st Neighboring Country"
            : "Nearest Country"
      }`
    : isHard
      ? `Hint 3: ${
          isBD
            ? "2nd Neighboring District"
            : hasLandBorders
              ? "2nd Neighboring Country"
              : "2nd Nearest Country"
        }`
      : `Hint 3: ${isBD ? "Letter Count" : "Starting Letter"}`;

  let hint3Content: React.ReactNode = isDetective ? (
    isBD ? (
      <div>
        <span className="text-emerald-300 font-bold">
          Neighbor: {targetDistrict.borders[0] || "None"}
        </span>
        <p className="text-2xs text-sky-400 font-normal">Highlighted on map</p>
      </div>
    ) : (
      <div>
        <span className="text-emerald-300 font-bold flex items-center gap-1">
          {neighbor1Country?.flagEmoji}{" "}
          {hasLandBorders ? "Neighbor" : "Nearest"}: {neighbor1Country?.name || "None"}
        </span>
        <p className="text-2xs text-sky-400 font-normal">Highlighted on map</p>
      </div>
    )
  ) : isHard ? (
    isBD ? (
      <div>
        <span className="text-emerald-300 font-bold">
          Neighbor 2:{" "}
          {targetDistrict.borders[1] || targetDistrict.borders[0] || "None"}
        </span>
        <p className="text-2xs text-sky-400 font-normal">Highlighted on map</p>
      </div>
    ) : (
      <div>
        <span className="text-emerald-300 font-bold flex items-center gap-1">
          {neighbor2Country?.flagEmoji}{" "}
          {hasLandBorders ? "Neighbor 2" : "2nd Nearest Country"}:{" "}
          {neighbor2Country?.name || "None"}
        </span>
        <p className="text-2xs text-sky-400 font-normal">Highlighted on map</p>
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
  );

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
        {/* Hint 1 */}
        <HintCard
          icon={hint1Icon}
          title={hint1Title}
          isUnlocked={unlockedHints >= 1}
          canUnlock={unlockedHints < 1}
          isLocked={false}
          accentColor="sky"
          disabled={!isPlaying}
          onReveal={unlockNextHint}
          content={hint1Content}
        />

        {/* Hint 2 */}
        <HintCard
          icon={hint2Icon}
          title={hint2Title}
          isUnlocked={unlockedHints >= 2}
          canUnlock={unlockedHints === 1}
          isLocked={unlockedHints < 1}
          lockMessage="Locked (Unlock Hint 1)"
          accentColor="amber"
          disabled={!isPlaying}
          onReveal={unlockNextHint}
          content={hint2Content}
        />

        {/* Hint 3 */}
        <HintCard
          icon={hint3Icon}
          title={hint3Title}
          isUnlocked={unlockedHints >= 3}
          canUnlock={unlockedHints === 2}
          isLocked={unlockedHints < 2}
          lockMessage="Locked (Unlock Hint 2)"
          accentColor="emerald"
          disabled={!isPlaying}
          onReveal={unlockNextHint}
          content={hint3Content}
        />
      </div>
    </div>
  );
}
