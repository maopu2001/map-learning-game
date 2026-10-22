"use client";

import React from "react";

export function DifficultyMatrixSection() {
  return (
    <section className="space-y-4">
      <div className="text-center space-y-1">
        <span className="text-xs font-mono uppercase tracking-widest text-amber-400 font-semibold">
          Difficulty Levels
        </span>
        <h2 className="text-2xl sm:text-3xl font-black text-white">
          Choose Your Challenge
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        <div className="p-4 rounded-2xl border border-emerald-500/30 bg-[#0c101c] space-y-2">
          <div className="font-bold text-emerald-400 text-sm">
            🟢 Easy (8 Guesses)
          </div>
          <p className="text-slate-400 leading-relaxed">
            Division or continent revealed right away. You can hover or click any territory on the map to inspect its details.
          </p>
        </div>

        <div className="p-4 rounded-2xl border border-amber-500/30 bg-[#0c101c] space-y-2">
          <div className="font-bold text-amber-400 text-sm">
            🟡 Normal (6 Guesses)
          </div>
          <p className="text-slate-400 leading-relaxed">
            The standard game. Compass arrow shows direction. Unrevealed areas stay hidden until guessed.
          </p>
        </div>

        <div className="p-4 rounded-2xl border border-rose-500/30 bg-[#0c101c] space-y-2">
          <div className="font-bold text-rose-400 text-sm">
            🔴 Hard (5 Guesses)
          </div>
          <p className="text-slate-400 leading-relaxed">
            5 guesses max. Territories locked from map inspection until guessed or revealed. High stakes!
          </p>
        </div>
      </div>
    </section>
  );
}
