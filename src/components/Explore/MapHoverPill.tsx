"use client";

import React, { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface MapHoverPillProps {
  leading?: ReactNode;
  title: string;
  subtitle?: string;
  isNeighbor?: boolean;
  badgeLabel?: string;
  isHovering?: boolean;
  className?: string;
}

export function MapHoverPill({
  leading,
  title,
  subtitle,
  isNeighbor,
  badgeLabel,
  isHovering,
  className,
}: MapHoverPillProps) {
  return (
    <div
      className={cn(
        "pointer-events-none flex items-center gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full backdrop-blur-md text-xs whitespace-nowrap select-none transition-all duration-150",
        isHovering
          ? "bg-card/95 border border-primary/50 text-foreground shadow-2xl ring-1 ring-primary/25"
          : "bg-card/90 border border-accent/30 text-foreground shadow-lg",
        className,
      )}
    >
      {leading || (
        <span
          className={cn(
            "size-1.5 sm:size-2 rounded-full shrink-0 animate-pulse",
            isHovering ? "bg-primary" : "bg-accent",
          )}
        />
      )}
      <span className="font-bold text-foreground text-2xs sm:text-xs">
        {title}
      </span>
      {subtitle && (
        <span
          className={cn(
            "text-2xs font-mono border-l border-border pl-2",
            isHovering ? "text-muted-foreground" : "text-accent",
          )}
        >
          {subtitle}
        </span>
      )}
      {(isNeighbor || badgeLabel) && (
        <span className="text-3xs font-mono uppercase px-1.5 py-0.5 rounded-md bg-accent/20 text-accent border border-accent/40">
          {badgeLabel || "Neighbor"}
        </span>
      )}
    </div>
  );
}
