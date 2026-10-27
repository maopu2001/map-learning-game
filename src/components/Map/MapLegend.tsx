"use client";

import React from "react";

interface MapLegendProps {
  hotLabel: string;
  warmLabel: string;
}

export function MapLegend({ hotLabel, warmLabel }: MapLegendProps) {
  return (
    <div className="absolute bottom-2 left-2 right-2 sm:left-4 sm:right-auto z-10 flex flex-wrap items-center gap-1.5 sm:gap-3 bg-card/85 px-2.5 sm:px-3 py-1.5 rounded-xl border border-border text-2xs sm:text-xs text-muted-foreground backdrop-blur-md shadow-lg">
      <div className="flex items-center gap-1.5">
        <span className="size-2 sm:size-2.5 rounded-full bg-[var(--map-target)] border border-[var(--map-target-stroke)]" />
        <span>Target</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="size-2 sm:size-2.5 rounded-full bg-[var(--map-neighbor)] border border-[var(--map-neighbor-stroke)]" />
        <span>Neighbor</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="size-2 sm:size-2.5 rounded-full bg-[var(--map-hot)] border border-[var(--map-hot-stroke)]" />
        <span>{hotLabel}</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="size-2 sm:size-2.5 rounded-full bg-[var(--map-warm)] border border-[var(--map-warm-stroke)]" />
        <span>{warmLabel}</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="size-2 sm:size-2.5 rounded-full bg-[var(--map-wrong)] border border-[var(--map-wrong-stroke)]" />
        <span>Wrong</span>
      </div>
    </div>
  );
}
