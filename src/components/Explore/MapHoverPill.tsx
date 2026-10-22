"use client";

import React, { ReactNode } from "react";

interface MapHoverPillProps {
  leading?: ReactNode;
  title: string;
  subtitle?: string;
  isNeighbor?: boolean;
}

export function MapHoverPill({
  leading,
  title,
  subtitle,
  isNeighbor,
}: MapHoverPillProps) {
  return (
    <div className="pointer-events-none flex items-center gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-[#0c101c]/95 border border-sky-400/40 shadow-2xl shadow-black/90 backdrop-blur-md text-xs whitespace-nowrap ring-1 ring-sky-500/20 select-none animate-in fade-in zoom-in-95 duration-100">
      {leading || (
        <span className="size-1.5 sm:size-2 rounded-full bg-sky-400 animate-pulse shrink-0" />
      )}
      <span className="font-bold text-white text-2xs sm:text-xs">{title}</span>
      {subtitle && (
        <span className="text-slate-400 text-2xs border-l border-white/10 pl-2 hidden sm:inline font-mono">
          {subtitle}
        </span>
      )}
      {isNeighbor && (
        <span className="text-3xs font-mono uppercase px-1.5 py-0.5 rounded-md bg-sky-500/20 text-sky-300 border border-sky-500/40">
          Neighbor
        </span>
      )}
    </div>
  );
}
