"use client";

import React, { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        className={`size-7 rounded-lg border border-border bg-card/50 ${
          className || ""
        }`}
      />
    );
  }

  const currentTheme = resolvedTheme || theme;
  const isDark = currentTheme === "dark";

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      aria-label="Toggle theme"
      className={`size-7 rounded-lg border border-border bg-card/60 text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer transition-colors ${
        className || ""
      }`}
    >
      {isDark ? (
        <Sun className="size-3.5 text-accent" />
      ) : (
        <Moon className="size-3.5 text-primary" />
      )}
    </Button>
  );
}
