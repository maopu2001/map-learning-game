"use client";

import React from "react";
import { useGameStore } from "@/lib/store";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Trophy } from "lucide-react";

interface StatsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function StatsDialog({ open, onOpenChange }: StatsDialogProps) {
  const stats = useGameStore((s) => s.stats);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-[#0c101c] border-white/10 text-white rounded-3xl shadow-2xl max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold flex items-center gap-2 text-white">
            <Trophy className="size-5 text-amber-400" />
            Your Stats
          </DialogTitle>
          <DialogDescription className="text-slate-400 text-xs">
            Your overall record across all games played.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-4 gap-2 text-center my-3">
          <div className="p-3 rounded-2xl bg-black/40 border border-white/5">
            <div className="text-xl font-bold font-mono text-white">
              {stats.played}
            </div>
            <div className="text-2xs text-slate-400 uppercase tracking-wider mt-0.5">
              Played
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-black/40 border border-white/5">
            <div className="text-xl font-bold font-mono text-emerald-400">
              {stats.played > 0
                ? Math.round((stats.won / stats.played) * 100)
                : 0}
              %
            </div>
            <div className="text-2xs text-slate-400 uppercase tracking-wider mt-0.5">
              Win Rate
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-black/40 border border-white/5">
            <div className="text-xl font-bold font-mono text-amber-400">
              {stats.streak}
            </div>
            <div className="text-2xs text-slate-400 uppercase tracking-wider mt-0.5">
              Streak
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-black/40 border border-white/5">
            <div className="text-xl font-bold font-mono text-sky-400">
              {stats.maxStreak}
            </div>
            <div className="text-2xs text-slate-400 uppercase tracking-wider mt-0.5">
              Best
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
