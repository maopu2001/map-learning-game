"use client";

import React from "react";
import Link from "next/link";
import { Globe2, BookOpen, CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function GameModesSection() {
  return (
    <section className="space-y-6">
      <div className="text-center space-y-1">
        <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-semibold">
          Game Modes
        </span>
        <h2 className="text-2xl sm:text-3xl font-black text-white">
          Where Do You Want to Play?
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Bangladesh Card */}
        <div className="rounded-2xl border border-white/10 bg-[#0c101c] p-5 flex flex-col justify-between hover:border-emerald-500/40 transition-colors shadow-xl">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-3xl">🇧🇩</span>
              <Badge
                variant="outline"
                className="text-2xs border-emerald-500/30 text-emerald-300 bg-emerald-500/10"
              >
                Bangladesh
              </Badge>
            </div>
            <h3 className="text-lg font-bold text-white">
              Bangladesh Districts
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              All 64 districts across 8 divisions. Great for students, BCS preparation, and anyone who loves local geography.
            </p>
            <div className="space-y-1.5 text-xs text-slate-300 pt-2 border-t border-white/5">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-3.5 text-emerald-400 shrink-0" />
                <span>Daily Mystery District</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-3.5 text-emerald-400 shrink-0" />
                <span>Detective Mode</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-3.5 text-emerald-400 shrink-0" />
                <span>Division & Neighbor Hints</span>
              </div>
            </div>
          </div>

          <div className="pt-6">
            <Link href="/bangladesh" className="block w-full">
              <Button className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs py-2 rounded-xl gap-2 shadow-lg shadow-emerald-950/40">
                <span>Play Bangladesh</span>
                <ArrowRight className="size-3.5" />
              </Button>
            </Link>
          </div>
        </div>

        {/* World Card */}
        <div className="rounded-2xl border border-white/10 bg-[#0c101c] p-5 flex flex-col justify-between hover:border-sky-500/40 transition-colors shadow-xl">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Globe2 className="size-8 text-sky-400" />
              <Badge
                variant="outline"
                className="text-2xs border-sky-500/30 text-sky-300 bg-sky-500/10"
              >
                World
              </Badge>
            </div>
            <h3 className="text-lg font-bold text-white">
              World Countries
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              195 countries across every continent. Distance indicators and neighbor hints help guide your way.
            </p>
            <div className="space-y-1.5 text-xs text-slate-300 pt-2 border-t border-white/5">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-3.5 text-sky-400 shrink-0" />
                <span>Daily Mystery Country</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-3.5 text-sky-400 shrink-0" />
                <span>Detective Mode</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-3.5 text-sky-400 shrink-0" />
                <span>Maritime Neighbor Clues for Islands</span>
              </div>
            </div>
          </div>

          <div className="pt-6">
            <Link href="/world" className="block w-full">
              <Button className="w-full bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs py-2 rounded-xl gap-2 shadow-lg shadow-sky-950/40">
                <span>Play World</span>
                <ArrowRight className="size-3.5" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Free Atlas Card */}
        <div className="rounded-2xl border border-white/10 bg-[#0c101c] p-5 flex flex-col justify-between hover:border-purple-500/40 transition-colors shadow-xl">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <BookOpen className="size-8 text-purple-400" />
              <Badge
                variant="outline"
                className="text-2xs border-purple-500/30 text-purple-300 bg-purple-500/10"
              >
                Explore
              </Badge>
            </div>
            <h3 className="text-lg font-bold text-white">
              Map Explorer
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              No timers or guess limits. Click any place on the map to browse capitals, populations, facts, and bordering regions.
            </p>
            <div className="space-y-1.5 text-xs text-slate-300 pt-2 border-t border-white/5">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-3.5 text-purple-400 shrink-0" />
                <span>District & Country Profiles</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-3.5 text-purple-400 shrink-0" />
                <span>Division & Region Filters</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-3.5 text-purple-400 shrink-0" />
                <span>Click to Pan to Neighbors</span>
              </div>
            </div>
          </div>

          <div className="pt-6 grid grid-cols-2 gap-2">
            <Link href="/explore/bangladesh" className="block w-full">
              <Button className="w-full bg-emerald-600/80 hover:bg-emerald-500 text-white font-semibold text-xs py-2 rounded-xl gap-1.5 shadow-lg shadow-emerald-950/40">
                <span>🇧🇩 Bangladesh</span>
                <ArrowRight className="size-3" />
              </Button>
            </Link>
            <Link href="/explore/world" className="block w-full">
              <Button className="w-full bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs py-2 rounded-xl gap-1.5 shadow-lg shadow-purple-950/40">
                <span>🌍 World</span>
                <ArrowRight className="size-3" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
