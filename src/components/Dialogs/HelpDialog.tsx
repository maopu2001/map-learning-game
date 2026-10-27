"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { MapPin, ShieldAlert } from "lucide-react";

interface HelpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function HelpDialog({ open, onOpenChange }: HelpDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-card border-border text-foreground rounded-3xl shadow-2xl max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold flex items-center gap-2 text-foreground">
            <MapPin className="size-5 text-accent" />
            How to Play & Difficulty Rules
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-xs">
            Find the secret location using distance and direction clues.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 text-xs text-foreground/90 leading-relaxed mt-2">
          <div className="p-3 rounded-2xl bg-muted/40 border border-border space-y-1">
            <div className="font-semibold text-primary">
              1. Distance & Compass Direction
            </div>
            <p className="text-muted-foreground">
              Every guess calculates the distance in kilometers and an 8-point
              compass arrow pointing toward the secret target.
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-muted/40 border border-border space-y-1">
            <div className="font-semibold text-primary">
              2. Proximity Colors
            </div>
            <p className="text-muted-foreground">
              Guessed territories glow by distance:{" "}
              <strong className="text-foreground">Hot / Terracotta (Very Close)</strong>,{" "}
              <strong className="text-foreground">Warm / Clay (Medium)</strong>, and{" "}
              <strong className="text-foreground">Wrong / Slate (Far)</strong>. Target and neighbor hints light up on the map
              to show which places border the mystery location!
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-muted/40 border border-border space-y-2">
            <div className="font-semibold text-accent flex items-center gap-1.5">
              <ShieldAlert className="size-4" />
              3. Difficulty Levels
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-card border border-primary/30">
                <strong className="text-primary flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-primary inline-block" /> Easy (8 Guesses)
                </strong>
                <p className="text-muted-foreground mt-1">
                  Free map inspection. 8 guesses allowed. Division or
                  continent revealed upfront.
                </p>
              </div>
              <div className="p-2.5 rounded-xl bg-card border border-accent/30">
                <strong className="text-accent flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-accent inline-block" /> Normal (6 Guesses)
                </strong>
                <p className="text-muted-foreground mt-1">
                  Standard challenge with compass arrows. Unrevealed areas
                  stay hidden.
                </p>
              </div>
              <div className="p-2.5 rounded-xl bg-card border border-destructive/30">
                <strong className="text-destructive flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-destructive inline-block" /> Hard (5 Guesses)
                </strong>
                <p className="text-muted-foreground mt-1">
                  5 guesses max. Territories locked from map inspection. High stakes!
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
