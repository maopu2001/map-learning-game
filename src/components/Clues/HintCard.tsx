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
  accentColor?: "primary" | "accent";
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
  accentColor = "primary",
}: HintCardProps) {
  const buttonColor =
    accentColor === "accent" ? "text-accent" : "text-primary";

  return (
    <div className="flex flex-col justify-between p-3 rounded-xl border border-border bg-card/60 min-h-28">
      <div className="space-y-1.5">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
          {icon}
          <span>{title}</span>
        </div>

        <div className="text-sm font-semibold text-foreground min-h-6 flex flex-col justify-center">
          {isUnlocked ? (
            content
          ) : (
            <span className="text-muted-foreground font-mono tracking-widest">
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
          className={`mt-3 text-xs h-8 sm:h-7 w-full border-border hover:bg-muted ${buttonColor}`}
        >
          Reveal
        </Button>
      ) : isUnlocked ? (
        <div className="text-2xs text-primary font-medium mt-2 flex items-center justify-center gap-1">
          <Check className="size-3 text-primary stroke-[3]" />
          <span>Unlocked</span>
        </div>
      ) : (
        <span className="text-2xs text-muted-foreground mt-2 text-center">
          {lockMessage}
        </span>
      )}
    </div>
  );
}
