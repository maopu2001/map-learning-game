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
    "Memorizing",
    "lists",
    "of",
    "names",
    "creates",
    "fragile",
    "recall.",
    "Borderline",
    "develops",
    "an",
    "enduring",
    "mental",
    "atlas",
    "through",
    "geodesic",
    "distance,",
    "bearing",
    "vectors,",
    "and",
    "contiguous",
    "border",
    "spatial",
    "intelligence.",
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
        const progress = Math.min(1, Math.max(0, (start - rect.top) / (start - end)));
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
      className="py-16 sm:py-24 border-y border-white/[0.06] bg-[#0c101c]/40"
    >
      <div className="max-w-4xl mx-auto px-4 text-center space-y-4">
        <span className="text-[11px] font-mono uppercase tracking-widest text-sky-400 font-semibold">
          Pedagogical Philosophy
        </span>
        <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-snug sm:leading-tight">
          {taglineWords.map((word, idx) => {
            const isRevealed = idx <= revealedCount;
            return (
              <span
                key={idx}
                className="inline-block mx-1 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]"
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
  const [guess, setGuess] = useState<{ name: string; x: number; y: number } | null>(null);
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
    <div className="w-full max-w-xl mx-auto rounded-2xl border border-white/[0.08] bg-[#0c101c] p-4 sm:p-5 shadow-2xl space-y-4">
      <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
        <div className="flex items-center gap-2">
          <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-white">
            Live Triangulation Radar Demo
          </h3>
        </div>
        <span className="text-[10px] text-slate-400">Click a test launch site</span>
      </div>

      {/* Mini Radar Screen */}
      <div className="relative w-full h-44 rounded-xl border border-white/[0.06] bg-[#070a12] overflow-hidden flex items-center justify-center">
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
          <span className="absolute top-4 text-[9px] font-mono text-amber-300 font-bold whitespace-nowrap">
            Secret Target
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
            <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-[9px] font-bold text-white whitespace-nowrap bg-black/80 px-1 rounded">
              {guess.name}
            </span>
          </div>
        )}
      </div>

      {/* Test Launch Buttons */}
      <div className="grid grid-cols-4 gap-2">
        {samplePoints.map((pt) => {
          const isSelected = guess?.name === pt.name;
          return (
            <button
              key={pt.name}
              onClick={() => handleSelectSample(pt)}
              className={`p-2 rounded-xl text-xs font-semibold border transition-all ${
                isSelected
                  ? "bg-sky-600 border-sky-400 text-white shadow-md shadow-sky-950/60"
                  : "bg-white/[0.03] border-white/[0.06] text-slate-300 hover:bg-white/[0.08] hover:text-white"
              }`}
            >
              {pt.name}
            </button>
          );
        })}
      </div>

      {/* Telemetry Output */}
      {distanceKm !== null ? (
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between text-xs font-mono">
          <span className="text-slate-400">Telemetry Vector:</span>
          <span className="font-bold text-sky-300 flex items-center gap-1.5">
            <span>{distanceKm} km away</span>
            <span>{bearingDir}</span>
          </span>
        </div>
      ) : (
        <div className="text-center text-[11px] text-slate-500 py-1 font-mono">
          Select any district above to calculate vector coordinates
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
      q: "How does distance triangulation work without compass in Hard Mode?",
      a: "In Hard Mode, the directional compass arrow is disabled, requiring mathematical distance triangulation. Your first guess gives a distance radius (a circle around that guess). Your second guess gives another circle that intersects the first at two points. A third guess definitively pinpoints the exact territory centroid.",
    },
    {
      q: "Are all 64 Bangladesh districts up to date with official borders?",
      a: "Yes. The map uses authoritative GeoJSON topological coordinates for all 64 districts across all 8 administrative divisions (Dhaka, Chattogram, Rajshahi, Khulna, Barishal, Sylhet, Rangpur, Mymensingh), corrected for right-hand polygon winding rules.",
    },
    {
      q: "How does the game handle island nations with no direct land borders?",
      a: "For sovereign island states such as Japan, Australia, Iceland, New Zealand, Sri Lanka, and Madagascar, the engine automatically calculates great-circle geodesic distances between centroids to identify the nearest neighbor nations as contiguous border clues, connected by dashed nautical arcs.",
    },
    {
      q: "Does Borderline support pinch-to-zoom on mobile and touchpads?",
      a: "Yes. Standard mouse-wheel and 2-finger scroll gestures do not hijack your page scroll. True 2-finger touchpad pinch (on macOS and Windows) and touch-screen pinch gestures zoom the map smoothly without layout jitter.",
    },
    {
      q: "How are the daily mystery targets generated?",
      a: "Daily puzzles are calculated deterministically using an antipodal date-seeded hash string. Every player in the world receives the exact same secret territory each calendar day at midnight local time.",
    },
    {
      q: "Is Borderline free for educational institutions and classroom training?",
      a: "Yes, 100% free with no registration, no advertisements, and zero account barriers. It is widely used by students preparing for competitive exams like BCS and academic geography curricula.",
    },
  ];

  return (
    <section className="space-y-4 max-w-3xl mx-auto">
      <div className="text-center space-y-1">
        <span className="text-[11px] font-mono uppercase tracking-widest text-sky-400 font-semibold">
          Frequently Answered
        </span>
        <h2 className="text-2xl sm:text-3xl font-black text-white">Tactical FAQ</h2>
      </div>

      <div className="space-y-2 pt-2">
        {faqs.map((faq, idx) => {
          const isOpen = openIdx === idx;
          return (
            <div
              key={idx}
              className="rounded-xl border border-white/[0.08] bg-[#0c101c] overflow-hidden transition-all duration-200"
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
                <div className="px-4 pb-4 text-xs text-slate-400 leading-relaxed border-t border-white/[0.04] pt-3">
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
            className="border-sky-500/30 bg-sky-500/10 text-sky-400 px-3 py-1 text-[11px] rounded-full inline-flex items-center gap-1.5 font-mono"
          >
            <Sparkles className="size-3.5" /> Client-Side Cartography Arena v2.0
          </Badge>

          {/* Heading with left-to-right #FFFFFF -> #9B9B9B gradient, max 680px */}
          <div className="max-w-[680px] mx-auto">
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[1.1] bg-gradient-to-r from-white to-[#9B9B9B] bg-clip-text text-transparent">
              Deduce any territory through spatial triangulation
            </h1>
          </div>

          <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto leading-relaxed">
            Pinpoint mystery Bangladesh districts or sovereign nations in 6 guesses using true geodesic distance, 8-point compass vectors, and contiguous border intelligence.
          </p>

          {/* Primary Action Button Pair */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <Link href="/bangladesh">
              <Button className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm sm:text-base px-6 py-2.5 h-auto rounded-xl gap-2 shadow-xl shadow-emerald-950/60 border border-emerald-400/30">
                <Play className="size-4 fill-white" />
                <span>Launch Bangladesh Mission 🇧🇩</span>
              </Button>
            </Link>

            <Link href="/world">
              <Button
                variant="outline"
                className="bg-white/[0.04] hover:bg-white/[0.08] text-white font-semibold text-sm sm:text-base px-5 py-2.5 h-auto rounded-xl gap-2 border-white/10"
              >
                <Globe2 className="size-4 text-sky-400" />
                <span>Explore World Map 🌍</span>
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
              <span>195 Sovereign Nations</span>
            </div>
            <span className="text-slate-700">•</span>
            <div className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-purple-400" />
              <span>100% Offline Ready</span>
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
            <span className="text-[11px] font-mono uppercase tracking-widest text-sky-400 font-semibold">
              Tactical Workflow
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white">How Deduction Works</h2>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Three sensory feedback layers turn dry facts into permanent mental maps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl border border-white/[0.08] bg-[#0c101c] space-y-3">
              <div className="size-9 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center font-bold font-mono text-sm">
                01
              </div>
              <h3 className="font-bold text-white text-base">Geodesic Triangulation</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Each guess calculates exact great-circle distance in kilometers and 8-point compass bearing from your guess centroid to the secret target.
              </p>
            </div>

            <div className="p-5 rounded-2xl border border-white/[0.08] bg-[#0c101c] space-y-3">
              <div className="size-9 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center font-bold font-mono text-sm">
                02
              </div>
              <h3 className="font-bold text-white text-base">Proximity Radar Heatmap</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Polygons glow Hot Orange (&lt;60km BD / &lt;1500km World), Warm Purple, or Cold Navy directly on the map canvas. Clean shapes with zero label overlap.
              </p>
            </div>

            <div className="p-5 rounded-2xl border border-white/[0.08] bg-[#0c101c] space-y-3">
              <div className="size-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold font-mono text-sm">
                03
              </div>
              <h3 className="font-bold text-white text-base">Contiguous Border Intel</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Progressive clues illuminate adjacent neighboring borders on the map in vibrant cyan, enabling tactical contiguity elimination.
              </p>
            </div>
          </div>
        </section>

        {/* ================================================================= */}
        {/* SECTION 4: REALM SHOWCASE CARDS (Nested Radius Formula B3)        */}
        {/* ================================================================= */}
        <section className="space-y-6">
          <div className="text-center space-y-1">
            <span className="text-[11px] font-mono uppercase tracking-widest text-emerald-400 font-semibold">
              Cartographic Arenas
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white">Choose Your Operational Realm</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Bangladesh Card */}
            <div className="rounded-2xl border border-white/[0.08] bg-[#0c101c] p-5 flex flex-col justify-between hover:border-emerald-500/40 transition-colors shadow-xl">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-3xl">🇧🇩</span>
                  <Badge variant="outline" className="text-[10px] border-emerald-500/30 text-emerald-300 bg-emerald-500/10">
                    National Hub
                  </Badge>
                </div>
                <h3 className="text-lg font-bold text-white">Bangladesh 64 Districts</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  All 64 districts across 8 divisions. Master riverine networks, district headquarter borders, and regional layout.
                </p>
                <div className="space-y-1.5 text-xs text-slate-300 pt-2 border-t border-white/[0.06]">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="size-3.5 text-emerald-400 shrink-0" />
                    <span>Daily Mystery District</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="size-3.5 text-emerald-400 shrink-0" />
                    <span>District Hop Streak Mode</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="size-3.5 text-emerald-400 shrink-0" />
                    <span>BCS / Curriculum Optimized</span>
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
            <div className="rounded-2xl border border-white/[0.08] bg-[#0c101c] p-5 flex flex-col justify-between hover:border-sky-500/40 transition-colors shadow-xl">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Globe2 className="size-8 text-sky-400" />
                  <Badge variant="outline" className="text-[10px] border-sky-500/30 text-sky-300 bg-sky-500/10">
                    Global Hub
                  </Badge>
                </div>
                <h3 className="text-lg font-bold text-white">World 195 Nations</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Every sovereign nation on Earth. Microstate zoom auto-magnification, continent clues, and nearest neighbor tethers.
                </p>
                <div className="space-y-1.5 text-xs text-slate-300 pt-2 border-t border-white/[0.06]">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="size-3.5 text-sky-400 shrink-0" />
                    <span>Global Daily Puzzle</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="size-3.5 text-sky-400 shrink-0" />
                    <span>Border Hop Streak Mode</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="size-3.5 text-sky-400 shrink-0" />
                    <span>Island Nautical Fallback</span>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <Link href="/world" className="block w-full">
                  <Button className="w-full bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs py-2 rounded-xl gap-2 shadow-lg shadow-sky-950/40">
                    <span>Play World Map</span>
                    <ArrowRight className="size-3.5" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Free Atlas Card */}
            <div className="rounded-2xl border border-white/[0.08] bg-[#0c101c] p-5 flex flex-col justify-between hover:border-purple-500/40 transition-colors shadow-xl">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <BookOpen className="size-8 text-purple-400" />
                  <Badge variant="outline" className="text-[10px] border-purple-500/30 text-purple-300 bg-purple-500/10">
                    Study Desk
                  </Badge>
                </div>
                <h3 className="text-lg font-bold text-white">Free-Roam Atlas</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Zero time limits or guess caps. Click any territory to open full demographic dossiers with interactive pan-to-border buttons.
                </p>
                <div className="space-y-1.5 text-xs text-slate-300 pt-2 border-t border-white/[0.06]">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="size-3.5 text-purple-400 shrink-0" />
                    <span>Territorial Dossier Cards</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="size-3.5 text-purple-400 shrink-0" />
                    <span>Division Filter Chips</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="size-3.5 text-purple-400 shrink-0" />
                    <span>Interactive Border Panning</span>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <Link href="/explore" className="block w-full">
                  <Button className="w-full bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs py-2 rounded-xl gap-2 shadow-lg shadow-purple-950/40">
                    <span>Open Free Atlas</span>
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
            <span className="text-[11px] font-mono uppercase tracking-widest text-amber-400 font-semibold">
              Gameplay Tiers
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white">Three Calibrated Difficulties</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-2xl border border-emerald-500/30 bg-[#0c101c] space-y-2">
              <div className="font-bold text-emerald-400 text-sm">🟢 Easy Mode (8 Guesses)</div>
              <p className="text-slate-400 leading-relaxed">
                Target division or continent revealed immediately. Full territory inspection on hover and click (except the secret target).
              </p>
            </div>

            <div className="p-4 rounded-2xl border border-amber-500/30 bg-[#0c101c] space-y-2">
              <div className="font-bold text-amber-400 text-sm">🟡 Normal Mode (6 Guesses)</div>
              <p className="text-slate-400 leading-relaxed">
                Standard tactical challenge. 8-point compass arrows active. Only highlighted adjacent borders and guesses show info.
              </p>
            </div>

            <div className="p-4 rounded-2xl border border-rose-500/30 bg-[#0c101c] space-y-2">
              <div className="font-bold text-rose-400 text-sm">🔴 Hard Mode (5 Guesses)</div>
              <p className="text-slate-400 leading-relaxed">
                Compass disabled! Pure distance triangulation. Unrevealed territories remain completely blinded.
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
        <section className="p-8 sm:p-12 rounded-3xl border border-white/[0.08] bg-gradient-to-b from-[#0c101c] to-[#070a12] text-center space-y-5 shadow-2xl">
          <div className="space-y-2 max-w-lg mx-auto">
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Ready to test your spatial perception?
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              100% free · Zero registration required · Instant client-side play in your browser.
            </p>
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <Link href="/bangladesh">
              <Button className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm px-6 py-2.5 rounded-xl gap-2 shadow-xl shadow-emerald-950/60">
                <Play className="size-4 fill-white" />
                <span>Begin Today&apos;s Mission</span>
              </Button>
            </Link>
          </div>
        </section>
      </main>

      {/* Semantic Footer */}
      <footer className="border-t border-white/[0.06] py-8 text-center text-xs text-slate-500 space-y-2 mt-16 bg-[#070a12]">
        <p>Borderline • Tactical Cartography Arena & Educational Geography Platform</p>
        <p className="text-slate-600">Built with Next.js 16, React 19, Tailwind CSS & TopoJSON Cartography</p>
      </footer>
    </div>
  );
}
