"use client";

import React, { ReactNode } from "react";

interface MapHoverPillProps {
  mousePos: { x: number; y: number } | null;
  leading?: ReactNode;
  title: string;
  subtitle?: string;
}

export function MapHoverPill({
  mousePos,
  leading,
  title,
  subtitle,
}: MapHoverPillProps) {
  return (
    <div
      className="pointer-events-none absolute z-30 transition-all duration-75 ease-out select-none"
      style={
        mousePos
          ? {
              left: mousePos.x,
              top: mousePos.y < 50 ? mousePos.y + 18 : mousePos.y - 12,
              transform:
                mousePos.y < 50
                  ? "translate(-50%, 0)"
                  : "translate(-50%, -100%)",
            }
          : {
              left: "50%",
              top: 16,
              transform: "translateX(-50%)",
            }
      }
    >
      <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0c101c]/95 border border-sky-400/40 shadow-2xl shadow-black/90 backdrop-blur-md text-xs whitespace-nowrap ring-1 ring-sky-500/20">
        {leading}
        <span className="font-bold text-white">{title}</span>
        {subtitle && (
          <span className="text-slate-400 text-2xs border-l border-white/10 pl-2">
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );
}
