"use client";

import React from "react";

export function HowItWorksSection() {
  return (
    <section className="space-y-6">
      <div className="text-center space-y-1">
        <span className="text-xs font-mono uppercase tracking-widest text-accent font-semibold">
          How It Works
        </span>
        <h2 className="text-2xl sm:text-3xl font-black text-foreground">
          Three Clues on Every Guess
        </h2>
        <p className="text-xs text-muted-foreground max-w-md mx-auto">
          Each guess brings you closer with distance, color, and neighbor hints.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl border border-border bg-card space-y-3">
          <div className="size-9 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-bold font-mono text-sm">
            01
          </div>
          <h3 className="font-bold text-foreground text-base">
            Distance & Direction
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            See straight-line distance in kilometers and an 8-point compass arrow pointing toward the target.
          </p>
        </div>

        <div className="p-5 rounded-2xl border border-border bg-card space-y-3">
          <div className="size-9 rounded-xl bg-accent/10 border border-accent/20 text-accent flex items-center justify-center font-bold font-mono text-sm">
            02
          </div>
          <h3 className="font-bold text-foreground text-base">
            Warmer & Colder Colors
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Guessed territories glow hot when you are close, warm at medium distance, and neutral slate when far away.
          </p>
        </div>

        <div className="p-5 rounded-2xl border border-border bg-card space-y-3">
          <div className="size-9 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-bold font-mono text-sm">
            03
          </div>
          <h3 className="font-bold text-foreground text-base">
            Neighbor Hints
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Unlock bordering areas right on the map to narrow down which division or region the mystery place is in.
          </p>
        </div>
      </div>
    </section>
  );
}
