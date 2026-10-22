"use client";

import React from "react";
import Link from "next/link";
import { BookOpen, Play } from "lucide-react";
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
  accentColor?: "sky" | "emerald";
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
  accentColor = "sky",
}: ExploreHeaderProps) {
  const isEmerald = accentColor === "emerald";

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl border border-white/10 bg-[#0c101c] shadow-lg">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span
            className={`p-1.5 rounded-xl ${
              isEmerald
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                : "bg-sky-500/10 text-sky-400 border border-sky-500/20"
            }`}
          >
            <BookOpen className="size-4" />
          </span>
          <h1 className="text-lg sm:text-xl font-bold text-white tracking-wide">
            {title}
          </h1>
          <Badge
            variant="outline"
            className={`text-2xs font-mono ${
              isEmerald
                ? "border-emerald-500/30 text-emerald-300 bg-emerald-500/10"
                : "border-sky-500/30 text-sky-300 bg-sky-500/10"
            }`}
          >
            {badgeText}
          </Badge>
        </div>
        <p className="text-xs text-slate-400">{description}</p>
      </div>

      <div className="flex items-center gap-2">
        <Link
          href={playHref}
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 text-white shadow-md transition-colors ${
            isEmerald
              ? "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-950/60"
              : "bg-sky-600 hover:bg-sky-500 shadow-sky-950/60"
          }`}
        >
          <Play className="size-3.5 fill-white" />
          <span>{playLabel}</span>
        </Link>
        <Link
          href={switchHref}
          className="px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
        >
          <span>{switchEmoji}</span>
          <span className="hidden sm:inline">{switchLabel}</span>
          <span className="sm:hidden">{switchShortLabel}</span>
        </Link>
      </div>
    </div>
  );
}
