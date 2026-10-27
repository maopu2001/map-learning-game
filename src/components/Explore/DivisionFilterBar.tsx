"use client";

import React from "react";
import { Layers } from "lucide-react";

export const BD_DIVISIONS = [
  "All",
  "Dhaka",
  "Chattogram",
  "Rajshahi",
  "Khulna",
  "Barishal",
  "Sylhet",
  "Rangpur",
  "Mymensingh",
];

interface DivisionFilterBarProps {
  selectedDivision: string;
  onSelectDivision: (division: string) => void;
}

export function DivisionFilterBar({
  selectedDivision,
  onSelectDivision,
}: DivisionFilterBarProps) {
  return (
    <div className="flex items-center gap-1.5 min-w-0">
      <span className="text-xs font-mono text-muted-foreground font-medium shrink-0 flex items-center gap-1 mr-1 select-none">
        <Layers className="size-3 text-primary" /> Division:
      </span>
      <div className="flex-1 min-w-0 flex items-center gap-1.5 overflow-x-auto pb-1 text-xs scrollbar-none">
        {BD_DIVISIONS.map((div) => (
          <button
            key={div}
            type="button"
            onClick={() => onSelectDivision(div)}
            className={`px-3 py-1.5 min-h-[32px] rounded-lg shrink-0 text-xs font-medium border transition-colors cursor-pointer ${
              selectedDivision === div
                ? "bg-primary/20 text-primary border-primary/40 shadow-sm"
                : "bg-card text-muted-foreground border-border hover:text-foreground hover:bg-muted"
            }`}
          >
            {div}
          </button>
        ))}
      </div>
    </div>
  );
}
