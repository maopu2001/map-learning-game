"use client";

import React from "react";

export function HowItWorksSection() {
  return (
    <section className="space-y-6">
      <div className="text-center space-y-1">
        <span className="text-xs font-mono uppercase tracking-widest text-sky-400 font-semibold">
          How It Works
        </span>
        <h2 className="text-2xl sm:text-3xl font-black text-white">
          Three Clues on Every Guess
        </h2>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          Each guess brings you closer with distance, color, and neighbor hints.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl border border-white/10 bg-[#0c101c] space-y-3">
          <div className="size-9 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center font-bold font-mono text-sm">
            01
          </div>
          <h3 className="font-bold text-white text-base">
            Distance & Direction
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            See straight-line distance in kilometers and an 8-point compass arrow pointing toward the target.
          </p>
        </div>

        <div className="p-5 rounded-2xl border border-white/10 bg-[#0c101c] space-y-3">
          <div className="size-9 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center font-bold font-mono text-sm">
            02
          </div>
          <h3 className="font-bold text-white text-base">
            Warmer & Colder Colors
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Guessed areas glow orange when you are close, purple at medium distance, and navy when far away.
          </p>
        </div>

        <div className="p-5 rounded-2xl border border-white/10 bg-[#0c101c] space-y-3">
          <div className="size-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold font-mono text-sm">
            03
          </div>
          <h3 className="font-bold text-white text-base">
            Neighbor Hints
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Unlock bordering areas right on the map to narrow down which continent or subregion the mystery place is in.
          </p>
        </div>
      </div>
    </section>
  );
}
