"use client";

import React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Globe2, BookOpen, ArrowRight, CheckCircle2, Globe } from "lucide-react";

export function GameModesSection() {
  return (
    <section className="space-y-6">
      <div className="text-center space-y-1">
        <span className="text-xs font-mono uppercase tracking-widest text-accent font-semibold">
          Game Modes
        </span>
        <h2 className="text-2xl sm:text-3xl font-black text-foreground">
          Two Arenas, Unlimited Replayability
        </h2>
        <p className="text-xs text-muted-foreground max-w-md mx-auto">
          Play Bangladesh districts, test your world geography, or study the interactive map.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Bangladesh Card */}
        <div className="rounded-2xl border border-border bg-card p-5 flex flex-col justify-between hover:border-bd-primary/50 transition-colors shadow-xl">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-3xl">🇧🇩</span>
              <Badge
                variant="outline"
                className="text-2xs border-bd-primary/30 text-bd-primary bg-bd-subtle"
              >
                Bangladesh
              </Badge>
            </div>
            <h3 className="text-lg font-bold text-foreground">
              Bangladesh Districts
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              All 64 districts across 8 divisions. Great for students, BCS preparation, and anyone who loves local geography.
            </p>
            <div className="space-y-1.5 text-xs text-foreground/90 pt-2 border-t border-border">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-3.5 text-bd-primary shrink-0" />
                <span>Daily Mystery District</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-3.5 text-bd-primary shrink-0" />
                <span>Detective Mode</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-3.5 text-bd-primary shrink-0" />
                <span>Division & Neighbor Hints</span>
              </div>
            </div>
          </div>

          <div className="pt-6">
            <Link href="/bangladesh" className="block w-full">
              <Button className="w-full bg-bd-primary hover:bg-bd-primary-hover text-bd-primary-foreground font-semibold text-xs py-2 rounded-xl gap-2 shadow-lg">
                <span>Play Bangladesh</span>
                <ArrowRight className="size-3.5" />
              </Button>
            </Link>
          </div>
        </div>

        {/* World Card */}
        <div className="rounded-2xl border border-border bg-card p-5 flex flex-col justify-between hover:border-accent/50 transition-colors shadow-xl">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Globe2 className="size-8 text-accent" />
              <Badge
                variant="outline"
                className="text-2xs border-accent/30 text-accent bg-accent/10"
              >
                World
              </Badge>
            </div>
            <h3 className="text-lg font-bold text-foreground">
              World Countries
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              195 countries across every continent. Distance indicators and neighbor hints help guide your way.
            </p>
            <div className="space-y-1.5 text-xs text-foreground/90 pt-2 border-t border-border">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-3.5 text-accent shrink-0" />
                <span>Daily Mystery Country</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-3.5 text-accent shrink-0" />
                <span>Detective Mode</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-3.5 text-accent shrink-0" />
                <span>Maritime Neighbor Clues for Islands</span>
              </div>
            </div>
          </div>

          <div className="pt-6">
            <Link href="/world" className="block w-full">
              <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold text-xs py-2 rounded-xl gap-2 shadow-lg">
                <span>Play World</span>
                <ArrowRight className="size-3.5" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Free Atlas Card */}
        <div className="rounded-2xl border border-border bg-card p-5 flex flex-col justify-between hover:border-primary/50 transition-colors shadow-xl">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <BookOpen className="size-8 text-primary" />
              <Badge
                variant="outline"
                className="text-2xs border-primary/30 text-primary bg-primary/10"
              >
                Explore
              </Badge>
            </div>
            <h3 className="text-lg font-bold text-foreground">
              Map Explorer
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              No timers or guess limits. Click any place on the map to browse capitals, populations, facts, and bordering nations.
            </p>
            <div className="space-y-1.5 text-xs text-foreground/90 pt-2 border-t border-border">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-3.5 text-primary shrink-0" />
                <span>District & Country Profiles</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-3.5 text-primary shrink-0" />
                <span>Division, Continent & Subregion Filters</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-3.5 text-primary shrink-0" />
                <span>Click to Pan to Neighbors</span>
              </div>
            </div>
          </div>

          <div className="pt-6 grid grid-cols-2 gap-2">
            <Link href="/explore/bangladesh" className="block w-full">
              <Button className="w-full bg-bd-primary hover:bg-bd-primary-hover text-bd-primary-foreground font-semibold text-xs py-2 rounded-xl gap-1.5 shadow-lg">
                <span className="flag-shadow">🇧🇩</span>
                <span>Bangladesh</span>
                <ArrowRight className="size-3" />
              </Button>
            </Link>
            <Link href="/explore/world" className="block w-full">
              <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold text-xs py-2 rounded-xl gap-1.5 shadow-lg">
                <Globe className="size-3.5 text-accent-foreground" />
                <span>World</span>
                <ArrowRight className="size-3" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
