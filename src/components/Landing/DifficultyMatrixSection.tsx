"use client";

import React from "react";

export function DifficultyMatrixSection() {
  return (
    <section className="space-y-4">
      <div className="text-center space-y-1">
        <span className="text-xs font-mono uppercase tracking-widest text-accent font-semibold">
          Difficulty Levels
        </span>
        <h2 className="text-2xl sm:text-3xl font-black text-foreground">
          Choose Your Challenge
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        <div className="p-4 rounded-2xl border border-primary/30 bg-card space-y-2">
          <div className="font-bold text-primary text-sm flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-primary inline-block" /> Easy (8 Guesses)
          </div>
          <p className="text-muted-foreground leading-relaxed">
            Division or continent revealed right away. You can hover or click any territory on the map to inspect its details.
          </p>
        </div>

        <div className="p-4 rounded-2xl border border-accent/30 bg-card space-y-2">
          <div className="font-bold text-accent text-sm flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-accent inline-block" /> Normal (6 Guesses)
          </div>
          <p className="text-muted-foreground leading-relaxed">
            The standard game. Compass arrow shows direction. Unrevealed areas stay hidden until guessed.
          </p>
        </div>

        <div className="p-4 rounded-2xl border border-destructive/30 bg-card space-y-2">
          <div className="font-bold text-destructive text-sm flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-destructive inline-block" /> Hard (5 Guesses)
          </div>
          <p className="text-muted-foreground leading-relaxed">
            5 guesses max. Territories locked from map inspection until guessed or revealed. High stakes!
          </p>
        </div>
      </div>
    </section>
  );
}
