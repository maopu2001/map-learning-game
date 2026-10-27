"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

interface FAQItem {
  q: string;
  a: string;
}

const faqs: FAQItem[] = [
  {
    q: "How often do the Daily Puzzles reset?",
    a: "Every night at midnight local time! Both Bangladesh and World daily puzzles feature the exact same mystery location for all players worldwide each day.",
  },
  {
    q: "How does distance and direction work?",
    a: "We compute the great-circle (Haversine) distance from your guessed location's geographic center to the mystery target. The compass direction points along the initial bearing from your guess to the target.",
  },
  {
    q: "What is Detective Mode?",
    a: "In Detective Mode, the target location's perimeter is completely invisible until you find it or run out of guesses. You receive an intel dossier with geography facts and redacted clues that unlock as you progress.",
  },
  {
    q: "Can I use Shimana for BCS or university admission prep?",
    a: "Yes! Bangladesh district boundaries, administrative divisions, coordinates, and bordering neighbors match the official survey data, making it an ideal interactive visual study tool for competitive exams.",
  },
  {
    q: "Is there any install required?",
    a: "No installation required! Shimana runs entirely in modern mobile and desktop browsers with offline caching capabilities.",
  },
];

export function FAQSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <section className="space-y-4 max-w-4xl mx-auto">
      <div className="text-center space-y-1">
        <span className="text-xs font-mono uppercase tracking-widest text-accent font-semibold">
          Got Questions?
        </span>
        <h2 className="text-2xl sm:text-3xl font-black text-foreground">
          Frequently Asked Questions
        </h2>
      </div>

      <div className="space-y-2 pt-2">
        {faqs.map((faq, idx) => {
          const isOpen = openIdx === idx;
          return (
            <div
              key={idx}
              className="rounded-xl border border-border bg-card overflow-hidden transition-all duration-200"
            >
              <button
                onClick={() => setOpenIdx(isOpen ? null : idx)}
                className="w-full p-4 text-left flex items-center justify-between text-xs sm:text-sm font-semibold text-foreground hover:text-primary transition-colors cursor-pointer"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`size-4 text-muted-foreground shrink-0 transition-transform duration-200 ${
                    isOpen ? "rotate-180 text-primary" : ""
                  }`}
                />
              </button>
              {isOpen && (
                <div className="px-4 pb-4 text-xs text-muted-foreground leading-relaxed border-t border-border pt-3">
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
