"use client";

import React from "react";
import { Flame } from "lucide-react";

interface GameOverStatsGridProps {
  streak: number;
  played: number;
  won: number;
  maxStreak: number;
}

export function GameOverStatsGrid({
  streak,
  played,
  won,
  maxStreak,
}: GameOverStatsGridProps) {
  const winRate = played > 0 ? Math.round((won / played) * 100) : 0;

  return (
    <div className="grid grid-cols-3 gap-2 text-center">
      <div className="p-2.5 rounded-xl border border-white/10 bg-black/40">
        <div className="text-xl font-bold font-mono text-white">{streak}</div>
        <div className="text-2xs text-slate-400 flex items-center justify-center gap-1 font-mono uppercase tracking-wider mt-0.5">
          <Flame className="size-3 text-amber-500" /> Streak
        </div>
      </div>
      <div className="p-2.5 rounded-xl border border-white/10 bg-black/40">
        <div className="text-xl font-bold font-mono text-emerald-400">
          {winRate}%
        </div>
        <div className="text-2xs text-slate-400 uppercase font-mono tracking-wider mt-0.5">
          Win Rate
        </div>
      </div>
      <div className="p-2.5 rounded-xl border border-white/10 bg-black/40">
        <div className="text-xl font-bold font-mono text-sky-400">
          {maxStreak}
        </div>
        <div className="text-2xs text-slate-400 uppercase font-mono tracking-wider mt-0.5">
          Best Streak
        </div>
      </div>
    </div>
  );
}
