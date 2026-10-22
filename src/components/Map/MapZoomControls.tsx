"use client";

import React from "react";
import { ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MapZoomControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  resetTitle?: string;
  className?: string;
}

export function MapZoomControls({
  onZoomIn,
  onZoomOut,
  onResetZoom,
  resetTitle = "Reset Zoom",
  className = "absolute top-3 right-3 sm:top-4 sm:right-4 z-10",
}: MapZoomControlsProps) {
  return (
    <div
      className={`flex flex-col gap-1.5 bg-[#0c101c]/90 p-1.5 rounded-xl border border-white/10 backdrop-blur-md shadow-lg ${className}`}
    >
      <Button
        variant="ghost"
        size="icon"
        onClick={onZoomIn}
        title="Zoom In"
        aria-label="Zoom In"
        className="size-8 rounded-lg hover:bg-white/10 text-slate-300 cursor-pointer"
      >
        <ZoomIn className="size-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={onZoomOut}
        title="Zoom Out"
        aria-label="Zoom Out"
        className="size-8 rounded-lg hover:bg-white/10 text-slate-300 cursor-pointer"
      >
        <ZoomOut className="size-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={onResetZoom}
        title={resetTitle}
        aria-label={resetTitle}
        className="size-8 rounded-lg hover:bg-white/10 text-slate-300 cursor-pointer"
      >
        <RotateCcw className="size-4" />
      </Button>
    </div>
  );
}
