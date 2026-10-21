"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import {
  Globe2,
  BookOpen,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  ChevronDown,
  Play,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Mandatory B11 Tagline Reveal Component
function TaglineReveal() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [revealedCount, setRevealedCount] = useState(0);

  const taglineWords = [
    "Don't",
    "just",
    "memorize",
    "names",
    "on",
    "a",
    "list.",
    "Learn",
    "where",
    "places",
    "actually",
    "are",
    "by",
    "following",
    "distance,",
    "direction,",
    "and",
    "shared",
    "borders.",
  ];

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let frameId: number;
    const handleScroll = () => {
      frameId = requestAnimationFrame(() => {
        const rect = el.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        // Progress from top 80% to top 30% of window
        const start = windowHeight * 0.85;
        const end = windowHeight * 0.35;
        const progress = Math.min(
          1,
          Math.max(0, (start - rect.top) / (start - end)),
        );
        const targetRevealed = Math.floor(progress * taglineWords.length);
        setRevealedCount(targetRevealed);
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      cancelAnimationFrame(frameId);
    };
  }, [taglineWords.length]);

  return (
    <section
      ref={containerRef}
      className="py-16 sm:py-24 border-y border-white/5 bg-[#0c101c]/40"
    >
      <div className="max-w-4xl mx-auto px-4 text-center space-y-4">
        <span className="text-xs font-mono uppercase tracking-widest text-sky-400 font-semibold">
          The Idea
        </span>
        <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-snug sm:leading-tight">
          {taglineWords.map((word, idx) => {
            const isRevealed = idx <= revealedCount;
            return (
              <span
                key={idx}
                className="inline-block mx-1 transition-all duration-700 ease-spring"
                style={{
                  color: isRevealed ? "#ffffff" : "rgba(255, 255, 255, 0.25)",
                  transform: isRevealed ? "translateY(0)" : "translateY(2px)",
                }}
              >
                {word}
              </span>
            );
          })}
        </h2>
      </div>
    </section>
  );
}

// Interactive Live Triangulation Simulator Widget
function TriangulationDemo() {
  const [target] = useState({ name: "Sylhet", x: 74, y: 32 });
  const [guess, setGuess] = useState<{
    name: string;
    x: number;
    y: number;
  } | null>(null);
  const [distanceKm, setDistanceKm] = useState<number | null>(null);
  const [bearingDir, setBearingDir] = useState<string | null>(null);

  const samplePoints = [
    { name: "Dhaka", x: 50, y: 55, km: 198, dir: "↗️ NE" },
    { name: "Khulna", x: 35, y: 72, km: 312, dir: "↗️ NE" },
    { name: "Rajshahi", x: 25, y: 44, km: 278, dir: "➡️ E" },
    { name: "Chattogram", x: 68, y: 78, km: 260, dir: "⬆️ N" },
  ];

  const handleSelectSample = (pt: (typeof samplePoints)[0]) => {
    setGuess(pt);
    setDistanceKm(pt.km);
    setBearingDir(pt.dir);
  };

  return (
    <div className="w-full max-w-xl mx-auto rounded-2xl border border-white/10 bg-[#0c101c] p-4 sm:p-5 shadow-2xl space-y-4">
      <div className="flex items-center justify-between border-b border-white/5 pb-3">
        <div className="flex items-center gap-2">
          <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-white">
            Interactive Demo
          </h3>
        </div>
        <span className="text-2xs text-slate-400">
          Pick a sample guess
        </span>
      </div>

      {/* Mini Radar Screen */}
      <div className="relative w-full h-44 rounded-xl border border-white/5 bg-[#070a12] overflow-hidden flex items-center justify-center">
        {/* Radar Rings */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="size-32 rounded-full border border-sky-500/10" />
          <div className="size-20 rounded-full border border-sky-500/15" />
          <div className="size-8 rounded-full border border-sky-500/20" />
        </div>

        {/* Secret Target Amber Pulse */}
        <div
          className="absolute -translate-x-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none"
          style={{ left: `${target.x}%`, top: `${target.y}%` }}
        >
          <div className="size-6 rounded-full border border-amber-400/80 animate-ping" />
          <div className="size-3 rounded-full bg-amber-400 shadow-lg shadow-amber-400/50" />
          <span className="absolute top-4 text-3xs font-mono text-amber-300 font-bold whitespace-nowrap">
            Secret Target (Sylhet)
          </span>
        </div>

        {/* Guess Vector Line */}
        {guess && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            <line
              x1={`${guess.x}%`}
              y1={`${guess.y}%`}
              x2={`${target.x}%`}
              y2={`${target.y}%`}
              stroke="#38bdf8"
              strokeWidth="1.5"
              strokeDasharray="4 4"
            />
          </svg>
        )}

        {/* Selected Guess Point */}
        {guess && (
          <div
            className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none"
            style={{ left: `${guess.x}%`, top: `${guess.y}%` }}
          >
            <div className="size-3.5 rounded-full bg-sky-500 ring-2 ring-white" />
            <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-3xs font-bold text-white whitespace-nowrap bg-black/80 px-1 rounded">
              {guess.name}
            </span>
          </div>
        )}
      </div>

      {/* Test Launch Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {samplePoints.map((pt) => {
          const isSelected = guess?.name === pt.name;
          return (
            <button
              key={pt.name}
              onClick={() => handleSelectSample(pt)}
              className={`p-2.5 sm:p-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                isSelected
                  ? "bg-sky-600 border-sky-400 text-white shadow-md shadow-sky-950/60"
                  : "bg-white/5 border-white/5 text-slate-300 hover:bg-white/10 hover:text-white"
              }`}
            >
              {pt.name}
            </button>
          );
        })}
      </div>

      {/* Telemetry Output */}
      {distanceKm !== null ? (
        <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between text-xs font-mono">
          <span className="text-slate-400">Clue:</span>
          <span className="font-bold text-sky-300 flex items-center gap-1.5">
            <span>{distanceKm} km away</span>
            <span>{bearingDir}</span>
          </span>
        </div>
      ) : (
        <div className="text-center text-xs text-slate-500 py-1 font-mono">
          Click any district above to see how distance and direction clues work
        </div>
      )}
    </div>
  );
}

// 6-Question Accordion FAQ Component
function FAQSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs = [
    {
      q: "How do clues work without a compass in Hard Mode?",
      a: "In Hard Mode, the directional arrow is disabled, so you work with distance alone. Your first guess gives you a distance circle. A second guess creates another circle that narrows down the possibilities to two intersections, and a third guess pinpoints the target location.",
    },
    {
      q: "Are the Bangladesh district boundaries accurate?",
      a: "Yes. All 64 districts across all 8 divisions (Dhaka, Chattogram, Rajshahi, Khulna, Barishal, Sylhet, Rangpur, Mymensingh) use accurate, detailed boundary data.",
    },
    {
      q: "How do island countries work if they don't have land borders?",
      a: "For island nations like Japan, Iceland, New Zealand, Sri Lanka, and Madagascar, the game calculates straight-line distances to find their closest maritime neighbors as hints.",
    },
    {
      q: "Can I pinch to zoom on phones and trackpads?",
      a: "Yes. Touchscreen pinch-to-zoom and laptop trackpad pinch gestures zoom the map smoothly without hijacking your page scrolling.",
    },
    {
      q: "When does the daily puzzle reset?",
      a: "A new daily puzzle goes live every day at midnight. Everyone around the world receives the exact same mystery location each day.",
    },
    {
      q: "Is Borderline free to play?",
      a: "Yes, 100% free with no sign-up, no ads, and no paywalls. It's great for casual fun or studying for geography and competitive exams like the BCS.",
    },
  ];

  return (
    <section className="space-y-4 max-w-3xl mx-auto">
      <div className="text-center space-y-1">
        <span className="text-xs font-mono uppercase tracking-widest text-sky-400 font-semibold">
          Got Questions?
        </span>
        <h2 className="text-2xl sm:text-3xl font-black text-white">
          Frequently Asked Questions
        </h2>
      </div>

      <div className="space-y-2 pt-2">
        {faqs.map((faq, idx) => {
          const isOpen = openIdx === idx;
          return (
            <div
              key={idx}
              className="rounded-xl border border-white/10 bg-[#0c101c] overflow-hidden transition-all duration-200"
            >
              <button
                onClick={() => setOpenIdx(isOpen ? null : idx)}
                className="w-full p-4 text-left flex items-center justify-between text-xs sm:text-sm font-semibold text-white hover:text-sky-300"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`size-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                    isOpen ? "rotate-180 text-sky-400" : ""
                  }`}
                />
              </button>
              {isOpen && (
                <div className="px-4 pb-4 text-xs text-slate-400 leading-relaxed border-t border-white/5 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#070a12] text-slate-100 selection:bg-sky-500 selection:text-white">
      <Header />

      <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-8 sm:py-16 space-y-16 sm:space-y-24">
        {/* ================================================================= */}
        {/* SECTION 1: HERO (Above the fold per /landing-page-design B5)      */}
        {/* ================================================================= */}
        <section className="text-center space-y-6 pt-4 sm:pt-8">
          <Badge
            variant="outline"
            className="border-sky-500/30 bg-sky-500/10 text-sky-400 px-3 py-1 text-xs rounded-full inline-flex items-center gap-1.5 font-mono"
          >
            <Sparkles className="size-3.5" /> Daily Map Guessing Game
          </Badge>

          {/* Heading with left-to-right #FFFFFF -> #9B9B9B gradient */}
          <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight leading-tight bg-gradient-to-r from-white to-neutral-400 bg-clip-text text-transparent">
              Find the mystery place on the map
            </h1>
          </div>

          <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto leading-relaxed">
            Guess the secret Bangladesh district or world country in 6 tries.
            Every guess reveals distance, direction, and neighbor clues to help you zero in.
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
                <span>Play World 🌍</span>
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

          {/* Live Mini Triangulation Preview */}
          <div className="pt-4">
            <TriangulationDemo />
          </div>
        </section>

        {/* ================================================================= */}
        {/* SECTION 2: MANDATORY B11 TAGLINE REVEAL (Word-by-word scroll)     */}
        {/* ================================================================= */}
        <TaglineReveal />

        {/* ================================================================= */}
        {/* SECTION 3: THREE TACTICAL PILLARS (How It Works)                 */}
        {/* ================================================================= */}
        <section className="space-y-6">
          <div className="text-center space-y-1">
            <span className="text-xs font-mono uppercase tracking-widest text-sky-400 font-semibold">
              How It Works
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              Three Clues on Every Guess
            </h2>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Each guess brings you closer with distance, color, and neighbor hints.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl border border-white/10 bg-[#0c101c] space-y-3">
              <div className="size-9 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center font-bold font-mono text-sm">
                01
              </div>
              <h3 className="font-bold text-white text-base">
                Distance & Direction
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                See straight-line distance in kilometers and an 8-point compass arrow pointing toward the target.
              </p>
            </div>

            <div className="p-5 rounded-2xl border border-white/10 bg-[#0c101c] space-y-3">
              <div className="size-9 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center font-bold font-mono text-sm">
                02
              </div>
              <h3 className="font-bold text-white text-base">
                Warmer & Colder Colors
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Guessed areas glow orange when you are close, purple at medium distance, and navy when far away.
              </p>
            </div>

            <div className="p-5 rounded-2xl border border-white/10 bg-[#0c101c] space-y-3">
              <div className="size-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold font-mono text-sm">
                03
              </div>
              <h3 className="font-bold text-white text-base">
                Neighbor Hints
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Unlock bordering areas right on the map to narrow down which region the mystery place is in.
              </p>
            </div>
          </div>
        </section>

        {/* ================================================================= */}
        {/* SECTION 4: REALM SHOWCASE CARDS (Nested Radius Formula B3)        */}
        {/* ================================================================= */}
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
                    <span>District Streak Mode</span>
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
                    <span>Country Streak Mode</span>
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

              <div className="pt-6">
                <Link href="/explore" className="block w-full">
                  <Button className="w-full bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs py-2 rounded-xl gap-2 shadow-lg shadow-purple-950/40">
                    <span>Open Map Explorer</span>
                    <ArrowRight className="size-3.5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================= */}
        {/* SECTION 5: DIFFICULTY MATRIX                                      */}
        {/* ================================================================= */}
        <section className="space-y-4">
          <div className="text-center space-y-1">
            <span className="text-xs font-mono uppercase tracking-widest text-amber-400 font-semibold">
              Difficulty Levels
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              Choose Your Challenge
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-2xl border border-emerald-500/30 bg-[#0c101c] space-y-2">
              <div className="font-bold text-emerald-400 text-sm">
                🟢 Easy (8 Guesses)
              </div>
              <p className="text-slate-400 leading-relaxed">
                Division or continent revealed right away. You can hover or click any territory on the map to inspect its details.
              </p>
            </div>

            <div className="p-4 rounded-2xl border border-amber-500/30 bg-[#0c101c] space-y-2">
              <div className="font-bold text-amber-400 text-sm">
                🟡 Normal (6 Guesses)
              </div>
              <p className="text-slate-400 leading-relaxed">
                The standard game. Compass arrow shows direction. Unrevealed areas stay hidden until guessed.
              </p>
            </div>

            <div className="p-4 rounded-2xl border border-rose-500/30 bg-[#0c101c] space-y-2">
              <div className="font-bold text-rose-400 text-sm">
                🔴 Hard (5 Guesses)
              </div>
              <p className="text-slate-400 leading-relaxed">
                Compass disabled! Distance clues only. A true test for geography lovers.
              </p>
            </div>
          </div>
        </section>

        {/* ================================================================= */}
        {/* SECTION 6: FAQ ACCORDION                                          */}
        {/* ================================================================= */}
        <FAQSection />

        {/* ================================================================= */}
        {/* SECTION 7: RISK REVERSAL & FINAL CTA BANNER                       */}
        {/* ================================================================= */}
        <section className="p-8 sm:p-12 rounded-3xl border border-white/10 bg-gradient-to-b from-[#0c101c] to-[#070a12] text-center space-y-5 shadow-2xl">
          <div className="space-y-2 max-w-lg mx-auto">
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Ready to test your geography?
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Free to play · No registration needed · Play directly in your browser.
            </p>
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <Link href="/bangladesh">
              <Button className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm px-6 py-2.5 rounded-xl gap-2 shadow-xl shadow-emerald-950/60">
                <Play className="size-4 fill-white" />
                <span>Play Today&apos;s Puzzle</span>
              </Button>
            </Link>
          </div>
        </section>
      </main>

      {/* Semantic Footer */}
      <footer className="border-t border-white/5 py-8 text-center text-xs text-slate-500 space-y-2 mt-16 bg-[#070a12]">
        <p>
          Borderline • A map guessing game for Bangladesh & the world
        </p>
        <p className="text-slate-600">
          Built with Next.js, React, Tailwind CSS & open map data
        </p>
      </footer>
    </div>
  );
}
