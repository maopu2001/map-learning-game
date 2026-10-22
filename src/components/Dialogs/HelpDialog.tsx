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
      <DialogContent className="sm:max-w-lg bg-[#0c101c] border-white/10 text-white rounded-3xl shadow-2xl max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold flex items-center gap-2 text-white">
            <MapPin className="size-5 text-sky-400" />
            How to Play & Difficulty Rules
          </DialogTitle>
          <DialogDescription className="text-slate-400 text-xs">
            Find the secret location using distance and direction clues.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 text-xs text-slate-300 leading-relaxed mt-2">
          <div className="p-3 rounded-2xl bg-black/40 border border-white/5 space-y-1">
            <div className="font-semibold text-sky-300">
              1. Distance & Compass Direction
            </div>
            <p className="text-slate-400">
              Every guess calculates the distance in kilometers and an 8-point
              compass arrow pointing toward the secret target.
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-black/40 border border-white/5 space-y-1">
            <div className="font-semibold text-emerald-300">
              2. Proximity Colors
            </div>
            <p className="text-slate-400">
              Guessed territories glow by distance:{" "}
              <strong>Orange (Very Close)</strong>,{" "}
              <strong>Purple (Medium)</strong>, and{" "}
              <strong>Navy (Far)</strong>. Neighbor hints light up on the map
              to show which places border the target!
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-black/40 border border-white/5 space-y-2">
            <div className="font-semibold text-amber-300 flex items-center gap-1.5">
              <ShieldAlert className="size-4" />
              3. Difficulty Levels
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-black/50 border border-emerald-500/20">
                <strong className="text-emerald-400">
                  🟢 Easy (8 Guesses)
                </strong>
                <p className="text-slate-400 mt-1">
                  Free map inspection. 8 guesses allowed. Division or
                  continent revealed upfront.
                </p>
              </div>
              <div className="p-2.5 rounded-xl bg-black/50 border border-amber-500/20">
                <strong className="text-amber-400">
                  🟡 Normal (6 Guesses)
                </strong>
                <p className="text-slate-400 mt-1">
                  Standard challenge with compass arrows. Unrevealed areas
                  stay hidden.
                </p>
              </div>
              <div className="p-2.5 rounded-xl bg-black/50 border border-rose-500/20">
                <strong className="text-rose-400">🔴 Hard (5 Guesses)</strong>
                <p className="text-slate-400 mt-1">
                  Distance only! Compass arrow is disabled. 5 guesses max.
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
