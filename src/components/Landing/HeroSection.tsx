"use client";

import Link from "next/link";
import { Play, Globe2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function HeroSection() {
  return (
    <section className="text-center space-y-6 pt-4 sm:pt-8">
      {/* Heading with left-to-right #FFFFFF -> #9B9B9B gradient */}
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight leading-tight bg-gradient-to-r from-white to-neutral-400 bg-clip-text text-transparent">
          Find the mystery place on the map
        </h1>
      </div>

      <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto leading-relaxed">
        Guess the secret Bangladesh district or world country in 6 tries. Every
        guess reveals distance, direction, and neighbor clues to help you zero
        in.
      </p>

      {/* Primary Action Button Pair */}
      <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-md mx-auto sm:max-w-none">
        <Link href="/bangladesh" className="w-full sm:w-auto">
          <Button className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm sm:text-base px-6 py-3 sm:py-2.5 h-auto rounded-xl gap-2 shadow-xl shadow-emerald-950/60 border border-emerald-400/30">
            <Play className="size-4 fill-white" />
            <span>Play Bangladesh 🇧🇩</span>
          </Button>
        </Link>

        <Link href="/world" className="w-full sm:w-auto">
          <Button
            variant="outline"
            className="w-full sm:w-auto bg-white/5 hover:bg-white/10 text-white font-semibold text-sm sm:text-base px-5 py-3 sm:py-2.5 h-auto rounded-xl gap-2 border-white/10"
          >
            <Globe2 className="size-4 text-sky-400" />
            <span>Play World</span>
          </Button>
        </Link>
      </div>

      {/* Organic Proof Strip */}
      <div className="pt-4 flex flex-wrap items-center justify-center gap-4 text-xs font-mono text-slate-400">
        <div className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-emerald-400" />
          <span>64 Bangladesh Districts</span>
        </div>
        <span className="text-slate-700">•</span>
        <div className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-sky-400" />
          <span>195 Countries</span>
        </div>
        <span className="text-slate-700">•</span>
        <div className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-purple-400" />
          <span>Free to Play</span>
        </div>
      </div>
    </section>
  );
}
