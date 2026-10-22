"use client";

import React, { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

interface HintCardProps {
  icon: ReactNode;
  title: string;
  isUnlocked: boolean;
  canUnlock: boolean;
  isLocked: boolean;
  lockMessage?: string;
  content: ReactNode;
  onReveal: () => void;
  disabled?: boolean;
  accentColor?: "sky" | "amber" | "emerald";
}

export function HintCard({
  icon,
  title,
  isUnlocked,
  canUnlock,
  lockMessage = "Locked",
  content,
  onReveal,
  disabled = false,
  accentColor = "sky",
}: HintCardProps) {
  const buttonColor =
    accentColor === "amber"
      ? "text-amber-300"
      : accentColor === "emerald"
        ? "text-emerald-300"
        : "text-sky-300";

  return (
    <div className="flex flex-col justify-between p-3 rounded-xl border border-slate-800/80 bg-slate-950/40 min-h-28">
      <div className="space-y-1.5">
        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
          {icon}
          <span>{title}</span>
        </div>

        <div className="text-sm font-semibold text-slate-200 min-h-6 flex flex-col justify-center">
          {isUnlocked ? (
            content
          ) : (
            <span className="text-slate-600 font-mono tracking-widest">
              •••••••••
            </span>
          )}
        </div>
      </div>

      {canUnlock ? (
        <Button
          variant="outline"
          size="sm"
          onClick={onReveal}
          disabled={disabled}
          className={`mt-3 text-xs h-8 sm:h-7 w-full border-slate-700 hover:bg-slate-800 ${buttonColor}`}
        >
          Reveal
        </Button>
      ) : isUnlocked ? (
        <div className="text-2xs text-emerald-400 font-medium mt-2 flex items-center justify-center gap-1">
          <Check className="size-3 text-emerald-400 stroke-[3]" />
          <span>Unlocked</span>
        </div>
      ) : (
        <span className="text-2xs text-slate-500 mt-2 text-center">
          {lockMessage}
        </span>
      )}
    </div>
  );
}
