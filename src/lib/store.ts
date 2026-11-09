import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { CountryData, COUNTRIES, haversineDistKm } from "@/data/world";
import { DistrictData, BANGLADESH_DISTRICTS } from "@/data/bangladesh";
import {
  GuessResult,
  evaluateGuess,
  getDailyCountry,
  getDailyDistrict,
} from "./engine";

export type GameScope = "world" | "bangladesh";
export type GameMode = "daily" | "detective" | "blitz";
export type GameDifficulty = "easy" | "normal" | "hard";

export const BD_DIST_MIN_KM = 120;
export const BD_DIST_MAX_KM = 350;
export const WORLD_DIST_MIN_KM = 1500;
export const WORLD_DIST_MAX_KM = 6000;

export function pickNextInDistanceRange<
  T extends { id: string; coordinates: [number, number] },
>(
  current: T,
  pool: T[],
  minKm: number,
  maxKm: number,
  recentIds: string[] = [],
): T {
  // 1. Candidate within distance band, not in recent history
  const inRange = pool.filter((item) => {
    if (item.id === current.id || recentIds.includes(item.id)) return false;
    const dist = haversineDistKm(current.coordinates, item.coordinates);
    return dist >= minKm && dist <= maxKm;
  });

  if (inRange.length > 0) {
    return inRange[Math.floor(Math.random() * inRange.length)];
  }

  // 2. Candidate not in recent history (broader fallback)
  const unvisited = pool.filter(
    (item) => item.id !== current.id && !recentIds.includes(item.id),
  );
  if (unvisited.length > 0) {
    return unvisited[Math.floor(Math.random() * unvisited.length)];
  }

  // 3. Fallback: any other item
  const others = pool.filter((item) => item.id !== current.id);
  return others[Math.floor(Math.random() * others.length)] || current;
}

export function getMaxGuesses(difficulty: GameDifficulty = "normal"): number {
  if (difficulty === "easy") return 8;
  if (difficulty === "hard") return 5;
  return 6;
}

export type GameStatus = "playing" | "won" | "lost";
export type { GuessResult };

export interface DailyRecord {
  date: string;
  gameStatus: GameStatus;
  guesses: GuessResult[];
  unlockedHints: number;
  extraNeighborsRevealed: number;
  difficulty?: GameDifficulty;
}

export interface GameState {
  scope: GameScope;
  mode: GameMode;
  difficulty: GameDifficulty;
  targetCountry: CountryData;
  targetDistrict: DistrictData;
  guesses: GuessResult[];
  unlockedHints: number;
  extraNeighborsRevealed: number;
  gameStatus: GameStatus;
  lastDailyDate: string;
  blitzTimeLeft: number;
  recentTargetIds: string[];
  dailyHistory: Partial<Record<GameScope, DailyRecord>>;
  isGameOverOpen: boolean;
  triviaLang: "en" | "bn";

  // Actions
  setTriviaLang: (lang: "en" | "bn") => void;
  toggleTriviaLang: () => void;
  setScope: (scope: GameScope) => void;
  initRouteScope: (scope: GameScope) => void;
  makeGuess: (item: CountryData | DistrictData) => void;
  unlockNextHint: () => void;
  revealExtraNeighbor: () => void;
  nextDetectiveRound: () => void;
  resetGame: () => void;
  forfeitAndSwitch: (target: {
    difficulty?: GameDifficulty;
    mode?: GameMode;
    reset?: boolean;
  }) => void;
  tickBlitzTimer: () => void;
  setGameOverOpen: (open: boolean) => void;
}

export const getTodayDateStr = () => new Date().toISOString().slice(0, 10);

const defaultTargetCountry = COUNTRIES[0];
const defaultTargetDistrict = BANGLADESH_DISTRICTS[0];

const getSafeDailyCountry = (today: string = getTodayDateStr()) => {
  try {
    return getDailyCountry(COUNTRIES, today) || defaultTargetCountry;
  } catch {
    return defaultTargetCountry;
  }
};

const getSafeDailyDistrict = (today: string = getTodayDateStr()) => {
  try {
    return getDailyDistrict(BANGLADESH_DISTRICTS, today) || defaultTargetDistrict;
  } catch {
    return defaultTargetDistrict;
  }
};

const FRESH_ROUND_STATE = {
  guesses: [],
  unlockedHints: 0,
  extraNeighborsRevealed: 0,
  gameStatus: "playing" as const,
  blitzTimeLeft: 90,
  isGameOverOpen: false,
};

function unpackDailyRecord(
  record: DailyRecord,
  fallbackDifficulty: GameDifficulty = "normal",
) {
  return {
    difficulty: record.difficulty ?? fallbackDifficulty,
    guesses: record.guesses,
    unlockedHints: record.unlockedHints,
    extraNeighborsRevealed: record.extraNeighborsRevealed,
    gameStatus: record.gameStatus,
    blitzTimeLeft: 90,
    isGameOverOpen: false,
  };
}

function updateDailyHistory(
  state: GameState,
  scope: GameScope,
  overrides?: Partial<DailyRecord>,
): Partial<Record<GameScope, DailyRecord>> {
  const today = getTodayDateStr();
  return {
    ...state.dailyHistory,
    [scope]: {
      date: today,
      gameStatus: overrides?.gameStatus ?? state.gameStatus,
      guesses: overrides?.guesses ?? state.guesses,
      unlockedHints: overrides?.unlockedHints ?? state.unlockedHints,
      extraNeighborsRevealed:
        overrides?.extraNeighborsRevealed ?? state.extraNeighborsRevealed,
      difficulty: overrides?.difficulty ?? state.difficulty,
    },
  };
}

export function pickScopeTarget(
  scope: GameScope,
  mode: GameMode,
  current: { country: CountryData; district: DistrictData; recentIds: string[] },
  today: string = getTodayDateStr(),
): {
  targetCountry: CountryData;
  targetDistrict: DistrictData;
  recentTargetIds: string[];
} {
  if (scope === "bangladesh") {
    const nextDistrict =
      mode === "daily"
        ? getSafeDailyDistrict(today)
        : pickNextInDistanceRange(
            current.district,
            BANGLADESH_DISTRICTS,
            BD_DIST_MIN_KM,
            BD_DIST_MAX_KM,
            current.recentIds,
          );
    return {
      targetCountry: current.country,
      targetDistrict: nextDistrict,
      recentTargetIds: [...current.recentIds, nextDistrict.id].slice(-15),
    };
  }

  const eligible = COUNTRIES.filter((c) => c.area > 5000);
  const nextCountry =
    mode === "daily"
      ? getSafeDailyCountry(today)
      : pickNextInDistanceRange(
          current.country,
          eligible,
          WORLD_DIST_MIN_KM,
          WORLD_DIST_MAX_KM,
          current.recentIds,
        );
  return {
    targetCountry: nextCountry,
    targetDistrict: current.district,
    recentTargetIds: [...current.recentIds, nextCountry.id].slice(-15),
  };
}

const pickTargetForState = (
  state: GameState,
  scope: GameScope,
  mode: GameMode,
  today = getTodayDateStr(),
) =>
  pickScopeTarget(
    scope,
    mode,
    {
      country: state.targetCountry,
      district: state.targetDistrict,
      recentIds: state.recentTargetIds,
    },
    today,
  );

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      scope: "bangladesh",
      mode: "daily",
      difficulty: "normal",
      targetCountry: getSafeDailyCountry(),
      targetDistrict: getSafeDailyDistrict(),
      guesses: [],
      unlockedHints: 0,
      extraNeighborsRevealed: 0,
      gameStatus: "playing",
      lastDailyDate: getTodayDateStr(),
      blitzTimeLeft: 90,
      recentTargetIds: [],
      dailyHistory: {},
      isGameOverOpen: false,
      triviaLang: "en",

      setTriviaLang: (lang: "en" | "bn") => set({ triviaLang: lang }),
      toggleTriviaLang: () =>
        set((state) => ({
          triviaLang: state.triviaLang === "en" ? "bn" : "en",
        })),

      setGameOverOpen: (open: boolean) => set({ isGameOverOpen: open }),

      initRouteScope: (scope: GameScope) => {
        const state = get();
        const today = getTodayDateStr();

        if (state.scope !== scope) {
          state.setScope(scope);
          return;
        }

        // Same scope, but if in daily mode, sync with today's record
        if (state.mode === "daily") {
          const record = state.dailyHistory?.[scope];
          if (record && record.date === today) {
            const updates: Partial<GameState> = {};
            if (record.difficulty && state.difficulty !== record.difficulty) {
              updates.difficulty = record.difficulty;
            }
            if (
              state.gameStatus !== record.gameStatus ||
              state.guesses.length !== record.guesses.length ||
              state.unlockedHints !== record.unlockedHints ||
              state.extraNeighborsRevealed !== record.extraNeighborsRevealed
            ) {
              updates.guesses = record.guesses;
              updates.gameStatus = record.gameStatus;
              updates.unlockedHints = record.unlockedHints;
              updates.extraNeighborsRevealed = record.extraNeighborsRevealed;
            }
            if (Object.keys(updates).length > 0) {
              set(updates);
            }
          } else if (
            (state.guesses.length > 0 && state.lastDailyDate !== today) ||
            state.gameStatus !== "playing"
          ) {
            // Day rolled over or stale state
            set({
              ...FRESH_ROUND_STATE,
              lastDailyDate: today,
              targetDistrict: getSafeDailyDistrict(today),
              targetCountry: getSafeDailyCountry(today),
            });
          }
        } else {
          // In non-daily modes, force non-daily target if it fell back to daily target on load
          const dailyTargetId =
            scope === "bangladesh"
              ? getSafeDailyDistrict(today).id
              : getSafeDailyCountry(today).id;
          const currentTargetId =
            scope === "bangladesh"
              ? state.targetDistrict.id
              : state.targetCountry.id;

          if (currentTargetId === dailyTargetId) {
            set(pickTargetForState(state, scope, state.mode, today));
          }
        }

        // Clean up any mismatched guesses from the other scope
        const currentGuesses = get().guesses;
        const hasMismatchedGuesses = currentGuesses.some((g) =>
          scope === "bangladesh"
            ? !("division" in g.country)
            : "division" in g.country,
        );
        if (hasMismatchedGuesses) {
          set(FRESH_ROUND_STATE);
        }
      },

      setScope: (scope: GameScope) => {
        const state = get();
        if (state.scope === scope) return;

        const today = getTodayDateStr();
        const next = pickTargetForState(state, scope, state.mode, today);

        // Check if daily record already exists for the target scope today
        if (state.mode === "daily") {
          const record = state.dailyHistory?.[scope];
          if (record && record.date === today) {
            set({
              ...next,
              scope,
              lastDailyDate: today,
              ...unpackDailyRecord(record, state.difficulty),
            });
            return;
          }
        }

        set({
          ...next,
          ...FRESH_ROUND_STATE,
          scope,
          lastDailyDate: today,
        });
      },

      makeGuess: (item: CountryData | DistrictData) => {
        const state = get();
        if (state.gameStatus !== "playing") return;

        const today = getTodayDateStr();

        // In daily mode, verify game isn't already finished today
        if (state.mode === "daily") {
          const record = state.dailyHistory?.[state.scope];
          if (
            record &&
            record.date === today &&
            record.gameStatus !== "playing"
          ) {
            return;
          }
        }

        // Check duplicate
        if (state.guesses.some((g) => g.country.id === item.id)) return;

        const isDistrictMode = "division" in item;
        const targetScope: GameScope = isDistrictMode ? "bangladesh" : "world";
        const currentTarget = isDistrictMode
          ? state.targetDistrict
          : state.targetCountry;

        const evaluated = evaluateGuess(item, currentTarget, isDistrictMode);
        const newGuesses = [...state.guesses, evaluated];
        const isWon = evaluated.isCorrect;
        const maxGuesses = getMaxGuesses(state.difficulty);
        const isLost = !isWon && newGuesses.length >= maxGuesses;
        const newStatus = isWon ? "won" : isLost ? "lost" : "playing";

        const nextDailyHistory =
          state.mode === "daily"
            ? updateDailyHistory(state, targetScope, {
                gameStatus: newStatus,
                guesses: newGuesses,
              })
            : state.dailyHistory;

        set({
          scope: targetScope,
          guesses: newGuesses,
          gameStatus: newStatus,
          dailyHistory: nextDailyHistory,
          isGameOverOpen: newStatus !== "playing",
        });
      },

      unlockNextHint: () => {
        const state = get();
        if (state.gameStatus !== "playing") return;
        const nextHints = Math.min(3, state.unlockedHints + 1);
        const nextDailyHistory =
          state.mode === "daily"
            ? updateDailyHistory(state, state.scope, {
                unlockedHints: nextHints,
              })
            : state.dailyHistory;

        set({
          unlockedHints: nextHints,
          dailyHistory: nextDailyHistory,
        });
      },

      revealExtraNeighbor: () => {
        const state = get();
        if (state.gameStatus !== "playing") return;
        const nextNeighbors = state.extraNeighborsRevealed + 1;
        const nextDailyHistory =
          state.mode === "daily"
            ? updateDailyHistory(state, state.scope, {
                extraNeighborsRevealed: nextNeighbors,
              })
            : state.dailyHistory;

        set({
          extraNeighborsRevealed: nextNeighbors,
          dailyHistory: nextDailyHistory,
        });
      },

      nextDetectiveRound: () => {
        const state = get();
        set({
          ...pickTargetForState(state, state.scope, "detective"),
          ...FRESH_ROUND_STATE,
        });
      },

      resetGame: () => {
        const state = get();
        if (state.mode === "daily") return;
        set({
          ...pickTargetForState(state, state.scope, state.mode),
          ...FRESH_ROUND_STATE,
        });
      },

      forfeitAndSwitch: (target: {
        difficulty?: GameDifficulty;
        mode?: GameMode;
        reset?: boolean;
      }) => {
        const state = get();
        const nextDifficulty = target.difficulty ?? state.difficulty;
        const nextMode = target.mode ?? state.mode;
        const today = getTodayDateStr();

        let nextDailyHistory = state.dailyHistory;

        // If currently in daily mode and mid-game, switching away or resetting forfeits as loss
        if (
          state.mode === "daily" &&
          state.gameStatus === "playing" &&
          (state.guesses.length > 0 || state.unlockedHints > 0)
        ) {
          nextDailyHistory = updateDailyHistory(state, state.scope, {
            gameStatus: "lost",
          });
        }

        // If staying in daily mode and reset is requested: blocked
        if (state.mode === "daily" && nextMode === "daily" && target.reset) {
          if (nextDailyHistory !== state.dailyHistory) {
            set({
              gameStatus: "lost",
              isGameOverOpen: true,
              dailyHistory: nextDailyHistory,
            });
          }
          return;
        }

        const next = pickTargetForState(state, state.scope, nextMode, today);

        // If next mode is daily, restore today's record if it exists
        if (nextMode === "daily") {
          const record = nextDailyHistory?.[state.scope];
          if (record && record.date === today) {
            set({
              ...next,
              mode: nextMode,
              dailyHistory: nextDailyHistory,
              ...unpackDailyRecord(record, nextDifficulty),
            });
            return;
          }
        }

        set({
          ...next,
          ...FRESH_ROUND_STATE,
          difficulty: nextDifficulty,
          mode: nextMode,
          dailyHistory: nextDailyHistory,
        });
      },

      tickBlitzTimer: () => {
        const state = get();
        if (state.mode !== "blitz" || state.gameStatus !== "playing") return;
        if (state.blitzTimeLeft <= 1) {
          set({
            blitzTimeLeft: 0,
            gameStatus: "lost",
            isGameOverOpen: true,
          });
        } else {
          set({ blitzTimeLeft: state.blitzTimeLeft - 1 });
        }
      },
    }),
    {
      name: "shimana-game-storage",
      storage: createJSONStorage(() =>
        typeof window !== "undefined"
          ? window.localStorage
          : {
              getItem: () => null,
              setItem: () => {},
              removeItem: () => {},
            },
      ),
      version: 7,
      migrate: (persistedState: unknown) => {
        const state = (persistedState || {}) as Record<string, unknown>;
        state.dailyHistory = state.dailyHistory || {};
        state.recentTargetIds = state.recentTargetIds || [];
        return state;
      },
      partialize: (state) => ({
        lastDailyDate: state.lastDailyDate,
        recentTargetIds: state.recentTargetIds,
        dailyHistory: state.dailyHistory,
        triviaLang: state.triviaLang,
      }),
    },
  ),
);
