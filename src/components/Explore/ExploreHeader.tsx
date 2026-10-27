"use client";

import React from "react";
import Link from "next/link";
import { BookOpen, Play, Globe } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ExploreHeaderProps {
  title: string;
  badgeText: string;
  description: string;
  playHref: string;
  playLabel: string;
  switchHref: string;
  switchLabel: string;
  switchShortLabel: string;
  switchEmoji: string;
  accentColor?: "bd" | "world" | "primary" | "accent";
}

export function ExploreHeader({
  title,
  badgeText,
  description,
  playHref,
  playLabel,
  switchHref,
  switchLabel,
  switchShortLabel,
  switchEmoji,
  accentColor = "accent",
}: ExploreHeaderProps) {
  const isBD = accentColor === "bd";

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 p-2.5 sm:p-4 rounded-2xl border border-border bg-card shadow-lg shrink-0">
      <div className="space-y-0.5 sm:space-y-1">
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
          <span
            className={`p-1 sm:p-1.5 rounded-lg sm:rounded-xl ${
              isBD
                ? "bg-bd-subtle text-bd-primary border border-bd-subtle-border"
                : "bg-accent/10 text-accent border border-accent/20"
            }`}
          >
            <BookOpen className="size-3.5 sm:size-4" />
          </span>
          <h1 className="text-sm sm:text-xl font-bold text-foreground tracking-wide">
            {title}
          </h1>
          <Badge
            variant="outline"
            className={`text-3xs sm:text-2xs font-mono px-1.5 py-0.5 ${
              isBD
                ? "border-bd-primary/30 text-bd-primary bg-bd-subtle"
                : "border-accent/30 text-accent bg-accent/10"
            }`}
          >
            {badgeText}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground hidden sm:block">{description}</p>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        <Link
          href={playHref}
          className={`px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-md transition-colors ${
            isBD
              ? "bg-bd-primary text-bd-primary-foreground hover:bg-bd-primary-hover"
              : "bg-accent text-accent-foreground hover:bg-accent/90"
          }`}
        >
          <Play className="size-3 sm:size-3.5 fill-current" />
          <span>{playLabel}</span>
        </Link>
        <Link
          href={switchHref}
          className="px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 bg-muted/50 border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          {switchEmoji === "🌍" ? (
            <Globe className="size-3.5 text-accent" />
          ) : (
            <span className="flag-shadow">{switchEmoji}</span>
          )}
          <span className="hidden sm:inline">{switchLabel}</span>
          <span className="sm:hidden">{switchShortLabel}</span>
        </Link>
      </div>
    </div>
  );
}
