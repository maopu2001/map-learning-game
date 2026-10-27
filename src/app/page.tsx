"use client";

import React, { useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { HeroSection } from "@/components/Landing/HeroSection";
import { TaglineReveal } from "@/components/Landing/TaglineReveal";
import { HowItWorksSection } from "@/components/Landing/HowItWorksSection";
import { GameModesSection } from "@/components/Landing/GameModesSection";
import { DifficultyMatrixSection } from "@/components/Landing/DifficultyMatrixSection";
import { FAQSection } from "@/components/Landing/FAQSection";

export default function HomePage() {
  useEffect(() => {
    const cleanSearch = () => {
      if (typeof window !== "undefined" && window.location.search) {
        window.history.replaceState(null, "", window.location.pathname);
      }
    };
    cleanSearch();
    window.addEventListener("popstate", cleanSearch);
    return () => window.removeEventListener("popstate", cleanSearch);
  }, []);
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      <Header />

      <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-8 sm:py-16 space-y-16 sm:space-y-24">
        <HeroSection />
        <TaglineReveal />
        <HowItWorksSection />
        <GameModesSection />
        <DifficultyMatrixSection />
        <FAQSection />
      </main>

      <Footer />
    </div>
  );
}
