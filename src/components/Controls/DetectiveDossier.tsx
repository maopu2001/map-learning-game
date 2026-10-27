"use client";

import React, { useMemo } from "react";
import { useGameStore } from "@/lib/store";
import { redactTrivia } from "@/lib/redact";
import { Badge } from "@/components/ui/badge";
import { FileText, ShieldAlert, MapPin, Eye } from "lucide-react";

interface DetectiveDossierProps {
  scope?: "bangladesh" | "world";
}

export function DetectiveDossier({ scope: propScope }: DetectiveDossierProps = {}) {
  const storeScope = useGameStore((s) => s.scope);
  const scope = propScope || storeScope;
  const difficulty = useGameStore((s) => s.difficulty);
  const targetCountry = useGameStore((s) => s.targetCountry);
  const targetDistrict = useGameStore((s) => s.targetDistrict);
  const unlockedHints = useGameStore((s) => s.unlockedHints);
  const gameStatus = useGameStore((s) => s.gameStatus);

  const isBD = scope === "bangladesh";
  const target = isBD ? targetDistrict : targetCountry;

  // Compute redacted trivia based on difficulty and unlocked hints
  const displayText = useMemo(() => {
    if (!target?.triviaFact) return "";

    // In Easy & Normal mode, show trivia fact unredacted
    if (difficulty !== "hard" || gameStatus !== "playing") {
      return target.triviaFact;
    }

    // In Hard mode:
    // 0 hints = ratio 0 (fully redacted)
    // 1 hint = ratio 0.5 (half unmasked)
    // 2+ hints = ratio 1 (full unmasked)
    const ratio = unlockedHints >= 2 ? 1 : unlockedHints === 1 ? 0.5 : 0;

    const targetWords = isBD
      ? [
          targetDistrict?.name,
          targetDistrict?.division,
          ...(targetDistrict?.aliases || []),
        ]
      : [
          targetCountry?.name,
          targetCountry?.capital,
          targetCountry?.officialName,
          ...(targetCountry?.aliases || []),
        ];

    return redactTrivia(target.triviaFact, targetWords, ratio);
  }, [
    target,
    difficulty,
    unlockedHints,
    gameStatus,
    isBD,
    targetDistrict,
    targetCountry,
  ]);

  if (!target) return null;

  const isHard = difficulty === "hard";
  const isEasy = difficulty === "easy";

  return (
    <div className="w-full rounded-2xl border border-border bg-card p-3.5 sm:p-4 shadow-xl space-y-2.5 backdrop-blur-md">
      {/* Dossier Header */}
      <div className="flex items-center justify-between pb-2 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="size-6 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
            <FileText className="size-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
              Detective Clue
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {isHard && gameStatus === "playing" && (
            <Badge
              variant="outline"
              className="text-3xs font-mono border-destructive/30 text-destructive bg-destructive/10 flex items-center gap-1 px-1.5 py-0.5"
            >
              <ShieldAlert className="size-3" />
              <span>Masked Names</span>
            </Badge>
          )}

          {isEasy && (
            <Badge
              variant="outline"
              className="text-3xs font-mono border-primary/30 text-primary bg-primary/10 flex items-center gap-1 px-1.5 py-0.5"
            >
              <MapPin className="size-3" />
              <span>
                {isBD ? targetDistrict.division : targetCountry.continent}
              </span>
            </Badge>
          )}
        </div>
      </div>

      {/* Description Body */}
      <div className="p-3 rounded-xl bg-muted/40 border border-border text-xs text-foreground leading-relaxed font-sans select-text">
        <p className="tracking-wide">
          {displayText.split(/(█+)/g).map((part, i) => {
            if (part.startsWith("█")) {
              return (
                <span
                  key={i}
                  title="Masked name (unlock hints to reveal)"
                  className="inline-block bg-muted text-accent font-mono text-xs px-1 py-0.5 mx-0.5 rounded border border-border select-none shadow-inner"
                >
                  {part}
                </span>
              );
            }
            return <span key={i}>{part}</span>;
          })}
        </p>
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between text-2xs text-muted-foreground pt-0.5">
        {isHard && unlockedHints < 2 && gameStatus === "playing" && (
          <span className="text-3xs text-destructive font-mono flex items-center gap-1">
            <Eye className="size-2.5" />
            <span>
              {unlockedHints === 1
                ? "Hint 2 reveals remaining masked words"
                : "Hints 1 & 2 reveal masked words"}
            </span>
          </span>
        )}
      </div>
    </div>
  );
}
