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
import { AlertTriangle } from "lucide-react";

interface AbandonConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  guessesCount: number;
  unlockedHints: number;
  onConfirm: () => void;
}

export function AbandonConfirmDialog({
  open,
  onOpenChange,
  guessesCount,
  unlockedHints,
  onConfirm,
}: AbandonConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border border-border text-foreground rounded-3xl shadow-2xl backdrop-blur-xl max-h-[90dvh] overflow-y-auto">
        <DialogHeader className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-xl bg-accent/15 border border-accent/30 flex items-center justify-center text-accent">
              <AlertTriangle className="size-4" />
            </div>
            <DialogTitle className="text-base font-bold text-foreground">
              Leave current game?
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
            You have a game in progress (
            {guessesCount > 0 && `${guessesCount} guesses`}
            {guessesCount > 0 && unlockedHints > 0 && " · "}
            {unlockedHints > 0 && `${unlockedHints} hints unlocked`}
            {guessesCount === 0 && unlockedHints === 0 && "timer running"}
            ). Quitting or restarting now counts as a forfeit.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-end gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="text-xs h-8 border-border hover:bg-muted text-foreground rounded-xl"
          >
            Keep Playing
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={onConfirm}
            className="text-xs h-8 rounded-xl"
          >
            Forfeit & Quit
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
