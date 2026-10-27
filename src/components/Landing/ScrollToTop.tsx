"use client";

import { ChevronUp } from "lucide-react";

export function ScrollToTop() {
  return (
    <button
      onClick={() =>
        window.scrollTo({
          top: 0,
          behavior: "smooth",
        })
      }
      aria-label="Back to top"
      className="sticky right-5 bottom-5 z-50 flex size-8 items-center justify-center rounded-full bg-accent/50 p-1 text-primary transition-colors duration-200 hover:bg-muted hover:text-accent/80 ml-auto mb-5"
    >
      <ChevronUp className="shrink-0" />
    </button>
  );
}
