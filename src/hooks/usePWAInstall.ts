"use client";

import { useState, useEffect } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

let deferredPrompt: BeforeInstallPromptEvent | null = null;
let installedFlag = false;
const listeners = new Set<() => void>();

if (typeof window !== "undefined") {
  try {
    if (localStorage.getItem("shimana_app_installed") === "1") {
      installedFlag = true;
    }
  } catch {}

  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e as BeforeInstallPromptEvent;
    listeners.forEach((l) => l());
  });

  window.addEventListener("appinstalled", () => {
    deferredPrompt = null;
    installedFlag = true;
    try {
      localStorage.setItem("shimana_app_installed", "1");
    } catch {}
    listeners.forEach((l) => l());
  });
}

export function usePWAInstall() {
  const [mounted, setMounted] = useState(false);
  const [canPrompt, setCanPrompt] = useState(Boolean(deferredPrompt));
  const [isStandalone, setIsStandalone] = useState(false);
  const [isInstalled, setIsInstalled] = useState(installedFlag);

  useEffect(() => {
    setMounted(true);

    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.matchMedia("(display-mode: window-controls-overlay)").matches ||
      (navigator as unknown as { standalone?: boolean }).standalone === true;

    setIsStandalone(standalone);

    let hasStoredInstall = false;
    try {
      hasStoredInstall = localStorage.getItem("shimana_app_installed") === "1";
    } catch {}

    if (standalone || installedFlag || hasStoredInstall) {
      installedFlag = true;
      setIsInstalled(true);
    }

    // Check Chrome / Android getInstalledRelatedApps API if available
    if ("getInstalledRelatedApps" in navigator) {
      (
        navigator as unknown as {
          getInstalledRelatedApps: () => Promise<unknown[]>;
        }
      )
        .getInstalledRelatedApps()
        .then((apps) => {
          if (apps && apps.length > 0) {
            installedFlag = true;
            setIsInstalled(true);
            try {
              localStorage.setItem("shimana_app_installed", "1");
            } catch {}
          } else if (!standalone) {
            // On production HTTPS, empty array means app was uninstalled
            const isLocal =
              window.location.hostname === "localhost" ||
              window.location.hostname.startsWith("192.168.") ||
              window.location.hostname.startsWith("10.") ||
              window.location.hostname.startsWith("172.");

            if (!isLocal) {
              installedFlag = false;
              setIsInstalled(false);
              try {
                localStorage.removeItem("shimana_app_installed");
              } catch {}
            }
          }
          listeners.forEach((l) => l());
        })
        .catch(() => {});
    }

    const update = () => {
      setCanPrompt(Boolean(deferredPrompt));
      let stored = false;
      try {
        stored = localStorage.getItem("shimana_app_installed") === "1";
      } catch {}
      if (installedFlag || stored) {
        setIsInstalled(true);
      }
    };

    listeners.add(update);
    return () => {
      listeners.delete(update);
    };
  }, []);

  const triggerInstall = async (): Promise<boolean> => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === "accepted") {
        deferredPrompt = null;
        installedFlag = true;
        try {
          localStorage.setItem("shimana_app_installed", "1");
        } catch {}
        setCanPrompt(false);
        setIsInstalled(true);
      }
      return true;
    }
    return false;
  };

  return {
    mounted,
    canPrompt,
    isStandalone,
    isInstalled,
    triggerInstall,
  };
}
