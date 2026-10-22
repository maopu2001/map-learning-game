"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

export function FAQSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs = [
    {
      q: "How does Hard Mode work?",
      a: "Hard Mode gives you only 5 guesses instead of 6, and keeps map territories locked from inspection until guessed or revealed through hints. Every guess gives you precise distance and compass direction to the target.",
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
      q: "Is Shimana free to play?",
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
