"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  useGameStore,
  GameScope,
  GameMode,
  GameDifficulty,
  getTodayDateStr,
} from "@/lib/store";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Play,
  SlidersHorizontal,
  AlertTriangle,
  Trophy,
  Globe,
} from "lucide-react";
import { ModeSelector } from "@/components/Game/ModeSelector";
import { DifficultySelector } from "@/components/Game/DifficultySelector";
import { getDailyDistrict, getDailyCountry } from "@/lib/engine";
import { BANGLADESH_DISTRICTS } from "@/data/bangladesh";
import { COUNTRIES } from "@/data/world";
import { updateGameUrl } from "@/hooks/useGameUrlSync";
import { cn } from "@/lib/utils";

interface MissionBriefingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  scope: "bangladesh" | "world";
}

export function MissionBriefingModal({
  open,
  onOpenChange,
  scope,
}: MissionBriefingModalProps) {
  const router = useRouter();
  const currentMode = useGameStore((s) => s.mode);
  const currentDifficulty = useGameStore((s) => s.difficulty);
  const forfeitAndSwitch = useGameStore((s) => s.forfeitAndSwitch);
  const guesses = useGameStore((s) => s.guesses);
  const unlockedHints = useGameStore((s) => s.unlockedHints);
  const gameStatus = useGameStore((s) => s.gameStatus);
  const dailyHistory = useGameStore((s) => s.dailyHistory);
  const setGameOverOpen = useGameStore((s) => s.setGameOverOpen);

  const [selectedScope, setSelectedScope] = useState<GameScope>(scope);
  const [selectedMode, setSelectedMode] = useState<GameMode>(currentMode);
  const [selectedDifficulty, setSelectedDifficulty] =
    useState<GameDifficulty>(currentDifficulty);
  const [isSwitchingModal, setIsSwitchingModal] = useState(false);
  const switchTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (switchTimeoutRef.current) clearTimeout(switchTimeoutRef.current);
    };
  }, []);

  const today = getTodayDateStr();
  const isBD = selectedScope === "bangladesh";
  const dailyRecord = dailyHistory?.[selectedScope];
  const isDailyCompleted =
    dailyRecord?.date === today && dailyRecord?.gameStatus !== "playing";
  const isMidGame =
    gameStatus === "playing" && (guesses.length > 0 || unlockedHints > 0);

  useEffect(() => {
    if (open) {
      setSelectedScope(scope);
      setSelectedMode(currentMode);
      const rec = dailyHistory?.[scope];
      if (
        currentMode === "daily" &&
        rec?.date === today &&
        rec?.difficulty
      ) {
        setSelectedDifficulty(rec.difficulty);
      } else {
        setSelectedDifficulty(currentDifficulty);
      }
    }
  }, [open, scope, currentMode, currentDifficulty, dailyHistory, today]);

  const handleSelectScope = (newScope: GameScope) => {
    setSelectedScope(newScope);
    const rec = dailyHistory?.[newScope];
    if (
      selectedMode === "daily" &&
      rec?.date === today &&
      rec?.difficulty
    ) {
      setSelectedDifficulty(rec.difficulty);
    }
  };

  const handleSelectMode = (mode: GameMode) => {
    setSelectedMode(mode);
    if (
      mode === "daily" &&
      dailyRecord?.date === today &&
      dailyRecord?.difficulty
    ) {
      setSelectedDifficulty(dailyRecord.difficulty);
    }
  };

  const handleStartGame = () => {
    if (selectedScope !== scope) {
      if (isMidGame) {
        forfeitAndSwitch({ reset: true });
      }
      onOpenChange(false);
      router.push(
        `/${selectedScope}?mode=${selectedMode}&difficulty=${selectedDifficulty}`
      );
      return;
    }

    if (selectedMode === "daily" && isDailyCompleted) {
      if (dailyRecord && dailyRecord.date === today) {
        useGameStore.setState({
          scope,
          mode: "daily",
          difficulty: dailyRecord.difficulty ?? selectedDifficulty,
          guesses: dailyRecord.guesses,
          gameStatus: dailyRecord.gameStatus,
          unlockedHints: dailyRecord.unlockedHints,
          extraNeighborsRevealed: dailyRecord.extraNeighborsRevealed,
          targetDistrict: getDailyDistrict(BANGLADESH_DISTRICTS, today),
          targetCountry: getDailyCountry(COUNTRIES, today),
          isGameOverOpen: true,
        });
      } else {
        setGameOverOpen(true);
      }
      updateGameUrl("daily", dailyRecord?.difficulty ?? selectedDifficulty, true);
      setIsSwitchingModal(true);
      switchTimeoutRef.current = setTimeout(() => {
        onOpenChange(false);
        setIsSwitchingModal(false);
      }, 250);
      return;
    }

    forfeitAndSwitch({
      mode: selectedMode,
      difficulty: selectedDifficulty,
      reset: true,
    });
    updateGameUrl(selectedMode, selectedDifficulty, true);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "w-[calc(100vw-2rem)] max-w-md bg-card border border-border text-foreground rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-2xl backdrop-blur-2xl transition-all duration-150",
          isSwitchingModal && "opacity-0 pointer-events-none scale-95"
        )}
      >
        <DialogHeader className="space-y-0.5 text-left">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-accent/15 border border-accent/30 text-accent">
              <SlidersHorizontal className="size-3.5" />
            </span>
            <DialogTitle className="text-base sm:text-lg font-bold tracking-tight text-foreground">
              Game Settings
            </DialogTitle>
          </div>
          <DialogDescription className="text-2xs sm:text-xs text-muted-foreground">
            {isBD ? "Bangladesh • 64 Districts" : "World • 195 Countries"}
          </DialogDescription>
        </DialogHeader>

        {isMidGame && (
          <div className="flex items-center justify-between gap-2 px-3 py-1.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs">
            <div className="flex items-center gap-1.5 min-w-0">
              <AlertTriangle className="size-3.5 shrink-0 text-destructive" />
              <span className="truncate text-2xs sm:text-xs">
                Forfeits current round
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-2xs text-destructive/80 font-mono shrink-0">
              <span>
                {guesses.length} {guesses.length === 1 ? "guess" : "guesses"}
              </span>
              <span>•</span>
              <span>
                {unlockedHints} {unlockedHints === 1 ? "hint" : "hints"}
              </span>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {/* Map / Scope Tab Options */}
          <div className="space-y-1.5 bg-muted/40 border border-border px-4 py-2 rounded-2xl">
            <label className="text-2xs font-mono font-semibold uppercase tracking-wider text-muted-foreground">
              Region / Map
            </label>
            <div
              role="tablist"
              aria-label="Select Game Region"
              className="grid grid-cols-2 gap-1.5 sm:gap-2 mt-1 p-1 bg-card/60 border border-border/80 rounded-xl"
            >
              <button
                type="button"
                role="tab"
                aria-selected={selectedScope === "bangladesh"}
                onClick={() => handleSelectScope("bangladesh")}
                className={`py-2 px-2.5 rounded-lg font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 ${
                  selectedScope === "bangladesh"
                    ? "bg-bd-primary text-bd-primary-foreground shadow-sm ring-1 ring-bd-primary/50"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                <span className="text-sm leading-none">🇧🇩</span>
                <span>Bangladesh</span>
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={selectedScope === "world"}
                onClick={() => handleSelectScope("world")}
                className={`py-2 px-2.5 rounded-lg font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 ${
                  selectedScope === "world"
                    ? "bg-primary text-primary-foreground shadow-sm ring-1 ring-primary/50"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                <Globe className="size-3.5 text-current shrink-0" />
                <span>World</span>
              </button>
            </div>
          </div>

          <ModeSelector
            selectedMode={selectedMode}
            onSelectMode={handleSelectMode}
            isBD={isBD}
          />
          <DifficultySelector
            selectedDifficulty={selectedDifficulty}
            onSelectDifficulty={setSelectedDifficulty}
            isBD={isBD}
            selectedMode={selectedMode}
          />
        </div>

        {/* Start / View Result Button */}
        <div className="pt-1">
          {selectedMode === "daily" && isDailyCompleted ? (
            <Button
              onClick={handleStartGame}
              className="w-full h-10 rounded-xl font-bold text-xs sm:text-sm tracking-wide gap-1.5 shadow-lg cursor-pointer bg-accent hover:bg-accent/90 text-accent-foreground"
            >
              <Trophy className="size-3.5 text-accent-foreground" />
              <span>VIEW TODAY&apos;S RESULT</span>
            </Button>
          ) : (
            <Button
              onClick={handleStartGame}
              className={`w-full h-10 rounded-xl font-bold text-xs sm:text-sm tracking-wide gap-1.5 shadow-lg cursor-pointer ${
                isBD
                  ? "bg-bd-primary hover:bg-bd-primary-hover text-bd-primary-foreground"
                  : "bg-primary hover:bg-primary/90 text-primary-foreground"
              }`}
            >
              <Play className="size-3.5 fill-current" />
              <span>{isMidGame ? "START NEW ROUND" : "PLAY NOW"}</span>
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
