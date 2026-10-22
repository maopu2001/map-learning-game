"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Flame } from "lucide-react";

interface AbandonConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  guessesCount: number;
  unlockedHints: number;
  isStreakMode: boolean;
  currentStreak: number;
  onConfirm: () => void;
}

export function AbandonConfirmDialog({
  open,
  onOpenChange,
  guessesCount,
  unlockedHints,
  isStreakMode,
  currentStreak,
  onConfirm,
}: AbandonConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-[#0a0f1d] border border-amber-500/30 text-white rounded-3xl shadow-2xl backdrop-blur-xl max-h-[90dvh] overflow-y-auto">
        <DialogHeader className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <AlertTriangle className="size-4" />
            </div>
            <DialogTitle className="text-base font-bold text-white">
              Leave current game?
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-slate-400 leading-relaxed">
            You have a game in progress (
            {guessesCount > 0 && `${guessesCount} guesses`}
            {guessesCount > 0 && unlockedHints > 0 && " · "}
            {unlockedHints > 0 && `${unlockedHints} hints unlocked`}
            {guessesCount === 0 && unlockedHints === 0 && "timer running"}
            ). Quitting or restarting now counts as a forfeit.
          </DialogDescription>
        </DialogHeader>

        {isStreakMode && currentStreak > 0 && (
          <div className="p-3 rounded-2xl bg-amber-950/30 border border-amber-500/20 text-xs text-amber-300 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Flame className="size-3.5 text-amber-400" /> Current Streak:
            </span>
            <span className="font-bold">{currentStreak} wins (will reset to 0)</span>
          </div>
        )}

        <div className="flex items-center justify-end gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="text-xs h-8 border-slate-700 hover:bg-slate-800 text-slate-200 rounded-xl"
          >
            Keep Playing
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={onConfirm}
            className="text-xs h-8 bg-rose-600 hover:bg-rose-500 text-white font-medium shadow-md shadow-rose-950/40 rounded-xl"
          >
            Forfeit & Quit
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
