"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const PREFETCH_ROUTES = [
  "/world",
  "/bangladesh",
  "/explore/world",
  "/explore/bangladesh",
  "/offline",
];

export function ServiceWorkerRegister() {
  const router = useRouter();

  useEffect(() => {
    // 1. Prefetch all routes in Next.js client router
    if ("requestIdleCallback" in window) {
      window.requestIdleCallback(() => {
        PREFETCH_ROUTES.forEach((route) => router.prefetch(route));
      });
    } else {
      setTimeout(() => {
        PREFETCH_ROUTES.forEach((route) => router.prefetch(route));
      }, 500);
    }

    // 2. Register Service Worker to precache all chunks and assets
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      const register = () => {
        navigator.serviceWorker
          .register("/sw.js", { scope: "/" })
          .then((registration) => {
            setInterval(() => {
              registration.update();
            }, 60 * 60 * 1000);
          })
          .catch((err) => {
            console.warn("ServiceWorker registration error:", err);
          });
      };

      if (document.readyState === "complete") {
        register();
      } else {
        window.addEventListener("load", register);
        return () => window.removeEventListener("load", register);
      }
    }
  }, [router]);

  return null;
}
