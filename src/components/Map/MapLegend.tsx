"use client";

import React from "react";

interface MapLegendProps {
  hotLabel: string;
  warmLabel: string;
}

export function MapLegend({ hotLabel, warmLabel }: MapLegendProps) {
  return (
    <div className="absolute bottom-2 left-2 right-2 sm:left-4 sm:right-auto z-10 flex flex-wrap items-center gap-1.5 sm:gap-3 bg-slate-900/85 px-2.5 sm:px-3 py-1.5 rounded-xl border border-slate-800 text-2xs sm:text-xs text-slate-300 backdrop-blur-md shadow-lg">
      <div className="flex items-center gap-1.5">
        <span className="size-2 sm:size-2.5 rounded-full bg-amber-500 ring-2 ring-amber-500/20" />
        <span>Target</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="size-2 sm:size-2.5 rounded-full bg-orange-500 ring-2 ring-orange-500/20" />
        <span>{hotLabel}</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="size-2 sm:size-2.5 rounded-full bg-purple-500 ring-2 ring-purple-500/20" />
        <span>{warmLabel}</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="size-2 sm:size-2.5 rounded-full bg-sky-500 ring-2 ring-sky-500/20" />
        <span>Neighbor</span>
      </div>
    </div>
  );
}
