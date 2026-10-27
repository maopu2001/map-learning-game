"use client";

import React from "react";
import { Check, X } from "lucide-react";
import { GameDifficulty, GameMode, useGameStore, getTodayDateStr } from "@/lib/store";

interface DifficultySelectorProps {
  selectedDifficulty: GameDifficulty;
  onSelectDifficulty: (difficulty: GameDifficulty) => void;
  isBD: boolean;
  selectedMode?: GameMode;
}

export function DifficultySelector({
  selectedDifficulty,
  onSelectDifficulty,
  isBD,
  selectedMode = "daily",
}: DifficultySelectorProps) {
  const dailyHistory = useGameStore((s) => s.dailyHistory);
  const today = getTodayDateStr();
  const scopeKey = isBD ? "bangladesh" : "world";
  const dailyRecord = dailyHistory?.[scopeKey];
  const isDailyCompleted =
    selectedMode === "daily" &&
    dailyRecord?.date === today &&
    dailyRecord?.gameStatus !== "playing";
  const dailyDiff = dailyRecord?.difficulty || "normal";
  const isDailyWon = isDailyCompleted && dailyRecord?.gameStatus === "won";

  return (
    <div className="space-y-1.5 bg-muted/40 border border-border px-4 py-2 rounded-2xl">
      <label className="text-2xs font-mono font-semibold uppercase tracking-wider text-muted-foreground">
        Difficulty
      </label>
      <div className="grid grid-cols-3 gap-1.5 sm:gap-2 mt-1">
        {/* Easy */}
        <button
          type="button"
          disabled={isDailyCompleted && dailyDiff !== "easy"}
          onClick={() => onSelectDifficulty("easy")}
          className={`py-2 px-1.5 sm:py-2.5 sm:px-2 rounded-xl border text-center flex flex-col items-center justify-center gap-1 transition-all min-h-13 ${
            isDailyCompleted && dailyDiff !== "easy"
              ? "opacity-40 cursor-not-allowed bg-muted/20 border-border text-muted-foreground"
              : "cursor-pointer " +
                (selectedDifficulty === "easy"
                  ? "bg-primary/15 border-primary text-foreground shadow-sm ring-1 ring-primary/50"
                  : "bg-card border-border text-muted-foreground hover:bg-muted hover:text-foreground")
          }`}
        >
          <div className="flex items-center gap-1">
            <span className="size-1.5 rounded-full bg-primary" />
            <span className="font-semibold text-xs text-primary leading-none">
              Easy
            </span>
            {isDailyCompleted && dailyDiff === "easy" && (
              isDailyWon ? (
                <Check className="size-3 text-primary stroke-[3]" />
              ) : (
                <X className="size-3 text-destructive stroke-[3]" />
              )
            )}
          </div>
          <span className="text-2xs text-muted-foreground font-mono leading-none">
            8 guesses
          </span>
        </button>

        {/* Normal */}
        <button
          type="button"
          disabled={isDailyCompleted && dailyDiff !== "normal"}
          onClick={() => onSelectDifficulty("normal")}
          className={`py-2 px-1.5 sm:py-2.5 sm:px-2 rounded-xl border text-center flex flex-col items-center justify-center gap-1 transition-all min-h-13 ${
            isDailyCompleted && dailyDiff !== "normal"
              ? "opacity-40 cursor-not-allowed bg-muted/20 border-border text-muted-foreground"
              : "cursor-pointer " +
                (selectedDifficulty === "normal"
                  ? "bg-accent/15 border-accent text-foreground shadow-sm ring-1 ring-accent/50"
                  : "bg-card border-border text-muted-foreground hover:bg-muted hover:text-foreground")
          }`}
        >
          <div className="flex items-center gap-1">
            <span className="size-1.5 rounded-full bg-accent" />
            <span className="font-semibold text-xs text-accent leading-none">
              Normal
            </span>
            {isDailyCompleted && dailyDiff === "normal" && (
              isDailyWon ? (
                <Check className="size-3 text-primary stroke-[3]" />
              ) : (
                <X className="size-3 text-destructive stroke-[3]" />
              )
            )}
          </div>
          <span className="text-2xs text-muted-foreground font-mono leading-none">
            6 guesses
          </span>
        </button>

        {/* Hard */}
        <button
          type="button"
          disabled={isDailyCompleted && dailyDiff !== "hard"}
          onClick={() => onSelectDifficulty("hard")}
          className={`py-2 px-1.5 sm:py-2.5 sm:px-2 rounded-xl border text-center flex flex-col items-center justify-center gap-1 transition-all min-h-13 ${
            isDailyCompleted && dailyDiff !== "hard"
              ? "opacity-40 cursor-not-allowed bg-muted/20 border-border text-muted-foreground"
              : "cursor-pointer " +
                (selectedDifficulty === "hard"
                  ? "bg-destructive/15 border-destructive text-foreground shadow-sm ring-1 ring-destructive/50"
                  : "bg-card border-border text-muted-foreground hover:bg-muted hover:text-foreground")
          }`}
        >
          <div className="flex items-center gap-1">
            <span className="size-1.5 rounded-full bg-destructive" />
            <span className="font-semibold text-xs text-destructive leading-none">
              Hard
            </span>
            {isDailyCompleted && dailyDiff === "hard" && (
              isDailyWon ? (
                <Check className="size-3 text-primary stroke-[3]" />
              ) : (
                <X className="size-3 text-destructive stroke-[3]" />
              )
            )}
          </div>
          <span className="text-2xs text-muted-foreground font-mono leading-none">
            5 guesses
          </span>
        </button>
      </div>
      <p className="text-xs text-muted-foreground text-center leading-tight min-h-5">
        {isDailyCompleted ? (
          <span className="text-foreground font-mono">
            Daily puzzle played on {dailyDiff.toUpperCase()} mode (
            {isDailyWon ? "Won ✓" : "Lost ✗"}).
          </span>
        ) : selectedMode === "detective" ? (
          selectedDifficulty === "easy" ? (
            isBD ? (
              "8 guesses · Full clue · Division confirmed upfront."
            ) : (
              "8 guesses · Full clue · Continent confirmed upfront."
            )
          ) : selectedDifficulty === "normal" ? (
            "6 guesses · Full clue · Target hidden on map."
          ) : (
            "5 guesses · Masked clue (████) · Hints reveal names."
          )
        ) : selectedDifficulty === "easy" ? (
          isBD ? (
            "8 guesses · Division confirmed upfront · Free map inspection."
          ) : (
            "8 guesses · Continent confirmed upfront · Free map inspection."
          )
        ) : selectedDifficulty === "normal" ? (
          "6 guesses · Standard game · Unrevealed map areas."
        ) : (
          "5 guesses · Map inspection locked until guessed."
        )}
      </p>
    </div>
  );
}
