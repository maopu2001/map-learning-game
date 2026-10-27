"use client";

import { useEffect, useCallback, useRef } from "react";
import {
  GameDifficulty,
  GameMode,
  GameScope,
  useGameStore,
  getTodayDateStr,
} from "@/lib/store";

export const VALID_MODES: readonly GameMode[] = [
  "daily",
  "detective",
  "blitz",
] as const;

export const VALID_DIFFICULTIES: readonly GameDifficulty[] = [
  "easy",
  "normal",
  "hard",
] as const;

export function isValidMode(val: unknown): val is GameMode {
  return (
    typeof val === "string" &&
    (VALID_MODES as readonly string[]).includes(val)
  );
}

export function isValidDifficulty(val: unknown): val is GameDifficulty {
  return (
    typeof val === "string" &&
    (VALID_DIFFICULTIES as readonly string[]).includes(val)
  );
}

export function resolveGameParams(scope?: GameScope): {
  mode: GameMode;
  difficulty: GameDifficulty;
  needsUrlUpdate: boolean;
} {
  const params =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search)
      : new URLSearchParams();

  const urlMode = params.get("mode");
  const urlDifficulty = params.get("difficulty");
  const hasNoQuery = !params.has("mode") && !params.has("difficulty");

  // Mode: If no query in URL, always open daily mode.
  // Otherwise: Valid URL > Default ("daily")
  let resolvedMode: GameMode;
  if (hasNoQuery || !isValidMode(urlMode)) {
    resolvedMode = "daily";
  } else {
    resolvedMode = urlMode;
  }

  // Difficulty: Valid URL > Today's Daily Record (if daily mode) > Default ("normal")
  let resolvedDifficulty: GameDifficulty;
  if (isValidDifficulty(urlDifficulty)) {
    resolvedDifficulty = urlDifficulty;
  } else {
    const state = typeof window !== "undefined" ? useGameStore.getState() : null;
    const today = getTodayDateStr();
    const targetScope = scope || state?.scope;
    const dailyRec = targetScope ? state?.dailyHistory?.[targetScope] : null;

    if (
      resolvedMode === "daily" &&
      dailyRec?.date === today &&
      isValidDifficulty(dailyRec.difficulty)
    ) {
      resolvedDifficulty = dailyRec.difficulty;
    } else {
      resolvedDifficulty = "normal";
    }
  }

  const needsUrlUpdate =
    urlMode !== resolvedMode || urlDifficulty !== resolvedDifficulty;

  return {
    mode: resolvedMode,
    difficulty: resolvedDifficulty,
    needsUrlUpdate,
  };
}

export function updateGameUrl(
  mode: GameMode,
  difficulty: GameDifficulty,
  replace = true
) {
  if (typeof window === "undefined") return;
  const pathname = window.location.pathname;
  // Strictly enforce queries only on /bangladesh and /world
  if (pathname !== "/bangladesh" && pathname !== "/world") {
    return;
  }

  try {
    const url = new URL(window.location.href);
    const prevMode = url.searchParams.get("mode");
    const prevDiff = url.searchParams.get("difficulty");

    if (prevMode === mode && prevDiff === difficulty) return;

    url.searchParams.set("mode", mode);
    url.searchParams.set("difficulty", difficulty);

    const target = `${url.pathname}?${url.searchParams.toString()}${url.hash}`;
    if (replace) {
      window.history.replaceState(window.history.state, "", target);
    } else {
      window.history.pushState(window.history.state, "", target);
    }
  } catch {
    // Ignore URL update errors in non-browser envs
  }
}

/**
 * Hook to synchronize URL query params (?mode=...&difficulty=...) with localStorage/store.
 * Follows priority: Valid URL > LocalStorage > Default.
 * Ensures URL query is normalized ("made properly") ONLY on /bangladesh and /world.
 * In daily mode when today's daily puzzle is completed, automatically opens GameOverModal.
 */
export function useGameUrlSync(scope: GameScope) {
  const isInitialMount = useRef(true);

  const syncWithUrl = useCallback(
    (_isInitial = false) => {
      if (typeof window === "undefined") return;
      const pathname = window.location.pathname;
      if (pathname !== "/bangladesh" && pathname !== "/world") return;

      const { mode, difficulty, needsUrlUpdate } = resolveGameParams(scope);
      const state = useGameStore.getState();

      // Ensure scope and daily records are initialized
      state.initRouteScope(scope);

      // Apply resolved mode/difficulty if different from store state
      if (state.mode !== mode || state.difficulty !== difficulty) {
        state.forfeitAndSwitch({
          mode,
          difficulty,
          reset: false,
        });
      }

      // If in daily mode and daily is already done, always show gameover modal
      const today = getTodayDateStr();
      const dailyRecord = useGameStore.getState().dailyHistory?.[scope];
      const isDailyDone =
        dailyRecord?.date === today && dailyRecord?.gameStatus !== "playing";

      if (mode === "daily" && isDailyDone) {
        useGameStore.setState({ isGameOverOpen: true });
      }

      const currentState = useGameStore.getState();
      const finalMode = currentState.mode;
      const finalDiff = currentState.difficulty;

      // Normalize URL query if missing or invalid
      if (needsUrlUpdate || finalMode !== mode || finalDiff !== difficulty) {
        updateGameUrl(finalMode, finalDiff, true);
      }
    },
    [scope]
  );

  useEffect(() => {
    // 1. Initial resolution on mount
    if (isInitialMount.current) {
      isInitialMount.current = false;
      syncWithUrl(true);
    }

    // 2. Listen for browser back / forward navigation
    const handlePopState = () => {
      if (typeof window === "undefined") return;
      const pathname = window.location.pathname;
      if (pathname !== "/bangladesh" && pathname !== "/world") return;
      syncWithUrl(false);
    };
    window.addEventListener("popstate", handlePopState);

    // 3. Keep URL query synced when store changes mode or difficulty
    const unsubscribe = useGameStore.subscribe((state, prev) => {
      if (typeof window === "undefined") return;
      const pathname = window.location.pathname;
      if (pathname !== "/bangladesh" && pathname !== "/world") return;

      if (state.mode !== prev.mode || state.difficulty !== prev.difficulty) {
        updateGameUrl(state.mode, state.difficulty, true);
      }
    });

    return () => {
      window.removeEventListener("popstate", handlePopState);
      unsubscribe();
    };
  }, [syncWithUrl]);
}
