"use client";

import React from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { HeroSection } from "@/components/Landing/HeroSection";
import { TaglineReveal } from "@/components/Landing/TaglineReveal";
import { HowItWorksSection } from "@/components/Landing/HowItWorksSection";
import { GameModesSection } from "@/components/Landing/GameModesSection";
import { DifficultyMatrixSection } from "@/components/Landing/DifficultyMatrixSection";
import { FAQSection } from "@/components/Landing/FAQSection";
import { CTABanner } from "@/components/Landing/CTABanner";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#070a12] text-slate-100 selection:bg-sky-500 selection:text-white">
      <Header />

      <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-8 sm:py-16 space-y-16 sm:space-y-24">
        <HeroSection />
        <TaglineReveal />
        <HowItWorksSection />
        <GameModesSection />
        <DifficultyMatrixSection />
        <FAQSection />
        <CTABanner />
      </main>

      <Footer />
    </div>
  );
}
