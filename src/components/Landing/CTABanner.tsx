"use client";

import React from "react";
import Link from "next/link";
import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CTABanner() {
  return (
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
  );
}
