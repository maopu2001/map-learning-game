"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Download } from "lucide-react";
import { usePWAInstall } from "@/hooks/usePWAInstall";

interface InstallAppButtonProps {
  variant?: "desktop" | "mobile" | "drawer";
  className?: string;
}

export function InstallAppButton({
  variant = "desktop",
  className = "",
}: InstallAppButtonProps) {
  const pathname = usePathname();
  const {
    mounted,
    canPrompt,
    isStandalone,
    isInstalled,
    triggerInstall,
  } = usePWAInstall();

  const isGameMode = pathname === "/bangladesh" || pathname === "/world";

  // Hide in game modes, inside standalone app, or when app is already installed
  if (!mounted || isStandalone || isGameMode || isInstalled || !canPrompt) {
    return null;
  }

  const title = "Install App";

  if (variant === "desktop") {
    return (
      <button
        onClick={triggerInstall}
        title={title}
        aria-label={title}
        className={`h-7 px-2 rounded-lg border border-border bg-card/60 text-2xs font-medium text-foreground hover:bg-muted cursor-pointer transition-colors flex items-center gap-1 shadow-xs ${className}`}
      >
        <Download className="size-3 text-primary" />
        <span>Install</span>
      </button>
    );
  }

  if (variant === "mobile") {
    return (
      <button
        onClick={triggerInstall}
        title={title}
        aria-label={title}
        className={`size-8 rounded-lg border border-border bg-card/60 text-primary flex items-center justify-center hover:bg-muted transition-colors cursor-pointer ${className}`}
      >
        <Download className="size-3.5" />
      </button>
    );
  }

  return (
    <button
      onClick={triggerInstall}
      className={`w-full py-2 px-3 rounded-xl bg-muted/50 border border-border text-foreground hover:bg-muted flex items-center justify-center gap-2 text-xs font-medium cursor-pointer ${className}`}
    >
      <Download className="size-3.5 text-primary" />
      <span>Install App</span>
    </button>
  );
}
