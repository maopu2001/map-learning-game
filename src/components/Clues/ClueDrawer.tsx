"use client";

import React from "react";
import { useGameStore } from "@/lib/store";
import { COUNTRIES_BY_ID, getEffectiveBorders, CountryData } from "@/data/world";
import { DistrictData } from "@/data/bangladesh";
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

interface ClueDrawerProps {
  scope?: "bangladesh" | "world";
}

interface HintConfig {
  icon: React.ReactNode;
  title: string;
  content: React.ReactNode;
  accentColor: "primary" | "accent";
}

const hintBuilders = {
  unmask: (step: 1 | 2): HintConfig => {
    const isP = step === 1;
    return {
      icon: <Eye className={`size-3.5 ${isP ? "text-primary" : "text-accent"}`} />,
      title: `Hint ${step}: Unmask Clue (Part ${step})`,
      content: (
        <span className={`${isP ? "text-primary" : "text-accent"} font-medium`}>
          {isP ? "Reveals 50% of masked names in clue" : "Reveals all masked names in clue"}
        </span>
      ),
      accentColor: isP ? "primary" : "accent",
    };
  },
  startingLetter: (num: 1 | 2 | 3, name: string, accentColor: "primary" | "accent"): HintConfig => {
    const isP = accentColor === "primary";
    return {
      icon: <KeyRound className={`size-3.5 ${isP ? "text-primary" : "text-accent"}`} />,
      title: `Hint ${num}: Starting Letter`,
      content: (
        <span className={`${isP ? "text-primary" : "text-accent"} font-bold font-mono`}>
          Starts with: {name.charAt(0).toUpperCase()}
        </span>
      ),
      accentColor,
    };
  },
  flag: (num: 1 | 2, flagEmoji: string, accentColor: "primary" | "accent"): HintConfig => {
    const isP = accentColor === "primary";
    return {
      icon: <Flag className={`size-3.5 ${isP ? "text-primary" : "text-accent"}`} />,
      title: `Hint ${num}: National Flag`,
      content: (
        <div className="flex items-center gap-2">
          <span className="text-2xl">{flagEmoji}</span>
          <span className="text-xs text-muted-foreground">National Flag</span>
        </div>
      ),
      accentColor,
    };
  },
  letterCount: (num: 2 | 3, name: string, accentColor: "primary" | "accent"): HintConfig => {
    const isP = accentColor === "primary";
    return {
      icon: <Hash className={`size-3.5 ${isP ? "text-primary" : "text-accent"}`} />,
      title: `Hint ${num}: Letter Count`,
      content: (
        <span className={`${isP ? "text-primary" : "text-accent"} font-bold font-mono`}>
          Length: {name.replace(/\s+/g, "").length} letters
        </span>
      ),
      accentColor,
    };
  },
  capital: (capital: string, capitalBn?: string): HintConfig => ({
    icon: <Building className="size-3.5 text-accent" />,
    title: "Hint 2: Capital City",
    content: (
      <span className="text-accent font-bold">
        Capital: {capital || "N/A"}{capitalBn ? ` (${capitalBn})` : ""}
      </span>
    ),
    accentColor: "accent",
  }),
  region: (isBD: boolean, target: CountryData | DistrictData): HintConfig => ({
    icon: isBD ? <Building className="size-3.5 text-primary" /> : <Globe2 className="size-3.5 text-primary" />,
    title: `Hint 1: ${isBD ? "Division" : "Continent"}`,
    content: (
      <span className="text-primary font-semibold">
        {isBD
          ? `Division: ${(target as DistrictData).division}${(target as DistrictData).divisionBn ? ` (${(target as DistrictData).divisionBn})` : ""}`
          : `Continent: ${(target as CountryData).continent}${(target as CountryData).continentBn ? ` (${(target as CountryData).continentBn})` : ""}`}
      </span>
    ),
    accentColor: "primary",
  }),
  neighbor: (
    num: 2 | 3,
    title: string,
    label: string,
    emoji?: string,
    accentColor: "primary" | "accent" = "primary",
  ): HintConfig => {
    const isP = accentColor === "primary";
    return {
      icon: <Layers className={`size-3.5 ${isP ? "text-primary" : "text-accent"}`} />,
      title: `Hint ${num}: ${title}`,
      content: (
        <div>
          <span className={`${isP ? "text-primary" : "text-accent"} font-bold flex items-center gap-1`}>
            {emoji && `${emoji} `}
            {label}
          </span>
          <p className="text-2xs text-muted-foreground font-normal">Highlighted on map</p>
        </div>
      ),
      accentColor,
    };
  },
};

export function ClueDrawer({ scope: propScope }: ClueDrawerProps = {}) {
  const storeScope = useGameStore((s) => s.scope);
  const scope = propScope || storeScope;
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

  const isPlaying = gameStatus === "playing";
  const isDetective = mode === "detective";
  const isEasy = difficulty === "easy";
  const isHard = difficulty === "hard";

  const effectiveWorldBorders = !isBD ? getEffectiveBorders(targetCountry) : [];
  const hasLandBorders = !isBD && targetCountry.borders.length > 0;
  const neighbor1Country =
    !isBD && effectiveWorldBorders[0] ? COUNTRIES_BY_ID.get(effectiveWorldBorders[0]) : null;
  const neighbor2Country =
    !isBD && effectiveWorldBorders[1] ? COUNTRIES_BY_ID.get(effectiveWorldBorders[1]) : null;

  const n1Title = isBD
    ? "1st Neighboring District"
    : hasLandBorders
      ? "1st Neighboring Country"
      : "Nearest Country";
  const n1Label = isBD
    ? `Neighbor${isDetective ? "" : " 1"}: ${targetDistrict.borders[0] || "None"}`
    : `${hasLandBorders ? `Neighbor${isDetective ? "" : " 1"}` : "Nearest Country"}: ${neighbor1Country?.name || "None"}`;

  const hint1 =
    isDetective && isHard
      ? hintBuilders.unmask(1)
      : isDetective && isEasy
        ? isBD
          ? hintBuilders.startingLetter(1, targetDistrict.name, "primary")
          : hintBuilders.flag(1, targetCountry.flagEmoji, "primary")
        : hintBuilders.region(isBD, isBD ? targetDistrict : targetCountry);

  const hint2 =
    isDetective && isHard
      ? hintBuilders.unmask(2)
      : isDetective && isEasy
        ? isBD
          ? hintBuilders.letterCount(2, targetDistrict.name, "accent")
          : hintBuilders.capital(targetCountry.capital, targetCountry.capitalBn)
        : !isDetective && isHard
          ? hintBuilders.neighbor(2, n1Title, n1Label, !isBD ? neighbor1Country?.flagEmoji : undefined, "accent")
          : isBD
            ? hintBuilders.startingLetter(2, targetDistrict.name, "accent")
            : hintBuilders.flag(2, targetCountry.flagEmoji, "accent");

  const n2Title = isBD
    ? "2nd Neighboring District"
    : hasLandBorders
      ? "2nd Neighboring Country"
      : "2nd Nearest Country";
  const n2Label = isBD
    ? `Neighbor 2: ${targetDistrict.borders[1] || targetDistrict.borders[0] || "None"}`
    : `${hasLandBorders ? "Neighbor 2" : "2nd Nearest Country"}: ${neighbor2Country?.name || "None"}`;

  const hint3 = isDetective
    ? hintBuilders.neighbor(3, n1Title, n1Label, !isBD ? neighbor1Country?.flagEmoji : undefined, "primary")
    : isHard
      ? hintBuilders.neighbor(3, n2Title, n2Label, !isBD ? neighbor2Country?.flagEmoji : undefined, "primary")
      : isBD
        ? hintBuilders.letterCount(3, targetDistrict.name, "primary")
        : hintBuilders.startingLetter(3, targetCountry.name, "primary");

  const hints: HintConfig[] = [hint1, hint2, hint3];

  return (
    <div className="w-full rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-xl space-y-3.5">
      <div className="flex flex-wrap items-center justify-between border-b border-border pb-2.5 gap-2">
        <div className="flex items-center gap-2">
          <Lightbulb className="size-4 text-accent shrink-0" />
          <h3 className="text-sm font-semibold text-foreground">Hints</h3>
          <span className="text-2xs text-muted-foreground uppercase tracking-wider font-mono">
            ({isBD ? "Bangladesh" : "World"} • {difficulty})
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs text-muted-foreground border-border font-mono">
            Hints: {unlockedHints} of 3
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {hints.map((hint, idx) => {
          const hintNum = idx + 1;
          return (
            <HintCard
              key={hintNum}
              icon={hint.icon}
              title={hint.title}
              isUnlocked={unlockedHints >= hintNum}
              canUnlock={unlockedHints === idx}
              isLocked={unlockedHints < idx}
              lockMessage={idx > 0 ? `Locked (Unlock Hint ${idx})` : undefined}
              accentColor={hint.accentColor}
              disabled={!isPlaying}
              onReveal={unlockNextHint}
              content={hint.content}
            />
          );
        })}
      </div>
    </div>
  );
}
