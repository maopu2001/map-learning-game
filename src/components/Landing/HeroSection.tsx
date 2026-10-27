"use client";

import Link from "next/link";
import { Play, Globe2, ChevronDownCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section className="text-center space-y-6 pt-4 sm:pt-8">
      {/* Hero Brand Logo & Ambient Glow */}
      <div className="flex flex-col items-center justify-center gap-3.5">
        <div className="relative inline-flex items-center justify-center group">
          {/* Atmospheric Ambient Glow */}
          <div className="absolute -inset-3 sm:-inset-4 rounded-3xl bg-linear-to-tr from-primary/25 via-accent/20 to-primary/25 blur-2xl opacity-70 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

          {/* Logo Card Container */}
          <div className="relative size-20 sm:size-24 rounded-2xl sm:rounded-3xl p-1 bg-card border border-border shadow-xl backdrop-blur-md group-hover:scale-105 transition-all duration-300">
            <img
              src="/icon.svg"
              alt="Shimana Logo"
              width={96}
              height={96}
              className="size-full object-contain rounded-[14px] sm:rounded-[20px]"
            />
          </div>
        </div>

        {/* Brand Kicker Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-card border border-border text-xs font-mono text-muted-foreground shadow-sm">
          <span className="size-2 rounded-full bg-primary animate-pulse" />
          <span className="font-semibold text-foreground tracking-wide">
            SHIMANA
          </span>
          <span className="text-muted-foreground/60">•</span>
          <span className="text-accent font-sans font-medium">সীমানা</span>
          <span className="text-muted-foreground/60">•</span>
          <span className="text-muted-foreground">Daily Map Game</span>
        </div>
      </div>

      {/* Heading */}
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight leading-tight text-foreground">
          Find the mystery place on the map
        </h1>
      </div>

      <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
        Guess the secret Bangladesh district or world country in 6 tries. Every
        guess reveals distance, direction, and neighbor clues to help you zero
        in.
      </p>

      {/* Primary Action Button Pair */}
      <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-md mx-auto sm:max-w-none">
        <Link href="/bangladesh" className="w-full sm:w-auto">
          <Button className="w-full sm:w-auto bg-bd-primary hover:bg-bd-primary-hover text-bd-primary-foreground font-semibold text-sm sm:text-base px-6 py-3 sm:py-2.5 h-auto rounded-xl gap-2 shadow-lg">
            <Play className="size-4 fill-current" />
            <span>Play Bangladesh</span>
            <span className="flag-shadow">🇧🇩</span>
          </Button>
        </Link>

        <Link href="/world" className="w-full sm:w-auto">
          <Button
            variant="outline"
            className="w-full sm:w-auto bg-card hover:bg-muted text-foreground font-semibold text-sm sm:text-base px-5 py-3 sm:py-2.5 h-auto rounded-xl gap-2 border-border shadow-sm"
          >
            <Globe2 className="size-4 text-accent" />
            <span>Play World</span>
          </Button>
        </Link>
      </div>

      {/* Organic Proof Strip */}
      <div className="pt-4 flex flex-wrap items-center justify-center gap-4 text-xs font-mono text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-bd-primary" />
          <span>64 Bangladesh Districts</span>
        </div>
        <span className="text-border">•</span>
        <div className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-accent" />
          <span>195 World Countries</span>
        </div>
        <span className="text-border">•</span>
        <div className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-primary" />
          <span>Free Daily Puzzles</span>
        </div>
      </div>

      {/* Dataset Exploration Link */}
      <div className="text-sm text-primary flex gap-1 flex-wrap items-center justify-center font-semibold">
        <span>Curious about the data behind the game?</span>
        <button
          onClick={() =>
            document.getElementById("dataset")?.scrollIntoView({
              behavior: "smooth",
              block: "center",
            })
          }
          className="text-accent hover:underline inline-flex items-center gap-1 cursor-pointer"
        >
          Explore the data quest{" "}
          <ChevronDownCircle className="size-3.5 inline-block" />
        </button>
      </div>
    </section>
  );
}
