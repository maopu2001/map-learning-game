"use client";

import React, { useState, useEffect, useRef } from "react";

export function TaglineReveal() {
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
      className="py-16 sm:py-24 border-y border-border bg-card/40"
    >
      <div className="max-w-4xl mx-auto px-4 text-center space-y-4">
        <span className="text-xs font-mono uppercase tracking-widest text-accent font-semibold">
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
                  color: isRevealed ? "var(--foreground)" : "var(--muted-foreground)",
                  opacity: isRevealed ? 1 : 0.4,
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
