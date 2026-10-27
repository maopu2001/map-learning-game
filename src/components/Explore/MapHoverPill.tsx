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
    <div className="pointer-events-none flex items-center gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-card/95 border border-border shadow-xl backdrop-blur-md text-xs whitespace-nowrap select-none animate-in fade-in zoom-in-95 duration-100">
      {leading || (
        <span className="size-1.5 sm:size-2 rounded-full bg-accent animate-pulse shrink-0" />
      )}
      <span className="font-bold text-foreground text-2xs sm:text-xs">{title}</span>
      {subtitle && (
        <span className="text-muted-foreground text-2xs border-l border-border pl-2 hidden sm:inline font-mono">
          {subtitle}
        </span>
      )}
      {isNeighbor && (
        <span className="text-3xs font-mono uppercase px-1.5 py-0.5 rounded-md bg-primary/20 text-primary border border-primary/40">
          Neighbor
        </span>
      )}
    </div>
  );
}
