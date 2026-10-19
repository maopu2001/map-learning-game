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
export type GameMode = "daily" | "streak" | "blitz";
export type GameDifficulty = "easy" | "normal" | "hard";

export const BD_DIST_MIN_KM = 45;
export const BD_DIST_MAX_KM = 240;
export const WORLD_DIST_MIN_KM = 800;
export const WORLD_DIST_MAX_KM = 4200;

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

export interface GameStats {
  played: number;
  won: number;
  streak: number;
  maxStreak: number;
  guessesDistribution: Record<number, number>; // 1-8
}

export interface GameState {
  scope: GameScope; // "world" or "bangladesh"
  mode: GameMode;
  difficulty: GameDifficulty;
  targetCountry: CountryData;
  targetDistrict: DistrictData;
  guesses: GuessResult[];
  unlockedHints: number; // 0, 1, 2, 3
  extraNeighborsRevealed: number; // For super-bordered nations
  gameStatus: "playing" | "won" | "lost";
  stats: GameStats;
  lastDailyDate: string;
  blitzTimeLeft: number;
  recentTargetIds: string[];

  // Actions
  setScope: (scope: GameScope) => void;
  initRouteScope: (scope: GameScope) => void;
  setMode: (mode: GameMode) => void;
  setDifficulty: (difficulty: GameDifficulty) => void;
  makeGuess: (item: CountryData | DistrictData) => void;
  unlockNextHint: () => void;
  revealExtraNeighbor: () => void;
  nextStreakRound: () => void;
  resetGame: () => void;
  forfeitAndSwitch: (target: {
    difficulty?: GameDifficulty;
    mode?: GameMode;
    reset?: boolean;
  }) => void;
  tickBlitzTimer: () => void;
}

const getTodayDateStr = () => new Date().toISOString().slice(0, 10);

const defaultTargetCountry = COUNTRIES[0] || {
  id: "BOL",
  numericId: "068",
  name: "Bolivia",
  officialName: "Plurinational State of Bolivia",
  aliases: ["Bolivia"],
  capital: "Sucre / La Paz",
  coordinates: [-17, -65],
  borders: ["ARG", "BRA", "CHL", "PRY", "PER"],
  region: "Americas",
  subregion: "South America",
  flagEmoji: "🇧🇴",
  triviaFact: "Has two capitals: Sucre and La Paz.",
  area: 1098581,
  population: 11673021,
  isIsland: false,
};

const defaultTargetDistrict = BANGLADESH_DISTRICTS[0] || {
  id: "Dhaka",
  shapeId: "0",
  name: "Dhaka",
  division: "Dhaka",
  coordinates: [23.8103, 90.4125],
  borders: ["Gazipur", "Narayanganj", "Manikganj"],
  triviaFact: "Capital city of Bangladesh.",
  flagEmoji: "🇧🇩",
  isCoastal: false,
};

let initialTargetCountry = defaultTargetCountry;
try {
  initialTargetCountry =
    getDailyCountry(COUNTRIES, getTodayDateStr()) || defaultTargetCountry;
} catch {
  initialTargetCountry = defaultTargetCountry;
}

let initialTargetDistrict = defaultTargetDistrict;
try {
  initialTargetDistrict =
    getDailyDistrict(BANGLADESH_DISTRICTS, getTodayDateStr()) ||
    defaultTargetDistrict;
} catch {
  initialTargetDistrict = defaultTargetDistrict;
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      scope: "bangladesh",
      mode: "daily",
      difficulty: "normal",
      targetCountry: initialTargetCountry,
      targetDistrict: initialTargetDistrict,
      guesses: [],
      unlockedHints: 0,
      extraNeighborsRevealed: 0,
      gameStatus: "playing",
      stats: {
        played: 0,
        won: 0,
        streak: 0,
        maxStreak: 0,
        guessesDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0 },
      },
      lastDailyDate: getTodayDateStr(),
      blitzTimeLeft: 90,
      recentTargetIds: [],

      initRouteScope: (scope: GameScope) => {
        const state = get();
        if (state.scope === scope) return;
        state.setScope(scope);
      },

      setScope: (scope: GameScope) => {
        const state = get();
        if (state.scope === scope) return;

        let nextTargetCountry = state.targetCountry;
        let nextTargetDistrict = state.targetDistrict;
        let nextRecent = state.recentTargetIds;

        if (scope === "bangladesh") {
          nextTargetDistrict =
            state.mode === "daily"
              ? getDailyDistrict(BANGLADESH_DISTRICTS, getTodayDateStr())
              : pickNextInDistanceRange(
                  state.targetDistrict,
                  BANGLADESH_DISTRICTS,
                  BD_DIST_MIN_KM,
                  BD_DIST_MAX_KM,
                  state.recentTargetIds,
                );
          nextRecent = [...state.recentTargetIds, nextTargetDistrict.id].slice(
            -15,
          );
        } else {
          const eligible = COUNTRIES.filter((c) => c.area > 5000);
          nextTargetCountry =
            state.mode === "daily"
              ? getDailyCountry(COUNTRIES, getTodayDateStr())
              : pickNextInDistanceRange(
                  state.targetCountry,
                  eligible,
                  WORLD_DIST_MIN_KM,
                  WORLD_DIST_MAX_KM,
                  state.recentTargetIds,
                );
          nextRecent = [...state.recentTargetIds, nextTargetCountry.id].slice(
            -15,
          );
        }

        set({
          scope,
          targetCountry: nextTargetCountry,
          targetDistrict: nextTargetDistrict,
          recentTargetIds: nextRecent,
          guesses: [],
          unlockedHints: 0,
          extraNeighborsRevealed: 0,
          gameStatus: "playing",
          blitzTimeLeft: 90,
        });
      },

      setDifficulty: (difficulty: GameDifficulty) => {
        const state = get();
        if (state.difficulty === difficulty) return;

        let nextTargetCountry = state.targetCountry;
        let nextTargetDistrict = state.targetDistrict;
        let nextRecent = state.recentTargetIds;

        if (state.scope === "bangladesh") {
          if (state.mode === "daily") {
            nextTargetDistrict = getDailyDistrict(
              BANGLADESH_DISTRICTS,
              getTodayDateStr(),
            );
          } else {
            nextTargetDistrict = pickNextInDistanceRange(
              state.targetDistrict,
              BANGLADESH_DISTRICTS,
              BD_DIST_MIN_KM,
              BD_DIST_MAX_KM,
              state.recentTargetIds,
            );
          }
          nextRecent = [...state.recentTargetIds, nextTargetDistrict.id].slice(
            -15,
          );
        } else {
          if (state.mode === "daily") {
            nextTargetCountry = getDailyCountry(COUNTRIES, getTodayDateStr());
          } else {
            const eligible = COUNTRIES.filter((c) => c.area > 5000);
            nextTargetCountry = pickNextInDistanceRange(
              state.targetCountry,
              eligible,
              WORLD_DIST_MIN_KM,
              WORLD_DIST_MAX_KM,
              state.recentTargetIds,
            );
          }
          nextRecent = [...state.recentTargetIds, nextTargetCountry.id].slice(
            -15,
          );
        }

        set({
          difficulty,
          targetCountry: nextTargetCountry,
          targetDistrict: nextTargetDistrict,
          recentTargetIds: nextRecent,
          guesses: [],
          unlockedHints: 0,
          extraNeighborsRevealed: 0,
          gameStatus: "playing",
          blitzTimeLeft: 90,
        });
      },

      setMode: (mode: GameMode) => {
        const state = get();
        if (state.mode === mode) return;

        let nextTargetCountry = state.targetCountry;
        let nextTargetDistrict = state.targetDistrict;
        let nextRecent = state.recentTargetIds;

        if (state.scope === "bangladesh") {
          if (mode === "daily") {
            nextTargetDistrict = getDailyDistrict(
              BANGLADESH_DISTRICTS,
              getTodayDateStr(),
            );
          } else {
            nextTargetDistrict = pickNextInDistanceRange(
              state.targetDistrict,
              BANGLADESH_DISTRICTS,
              BD_DIST_MIN_KM,
              BD_DIST_MAX_KM,
              state.recentTargetIds,
            );
          }
          nextRecent = [...state.recentTargetIds, nextTargetDistrict.id].slice(
            -15,
          );
        } else {
          if (mode === "daily") {
            nextTargetCountry = getDailyCountry(COUNTRIES, getTodayDateStr());
          } else {
            const eligible = COUNTRIES.filter((c) => c.area > 5000);
            nextTargetCountry = pickNextInDistanceRange(
              state.targetCountry,
              eligible,
              WORLD_DIST_MIN_KM,
              WORLD_DIST_MAX_KM,
              state.recentTargetIds,
            );
          }
          nextRecent = [...state.recentTargetIds, nextTargetCountry.id].slice(
            -15,
          );
        }

        set({
          mode,
          targetCountry: nextTargetCountry,
          targetDistrict: nextTargetDistrict,
          recentTargetIds: nextRecent,
          guesses: [],
          unlockedHints: 0,
          extraNeighborsRevealed: 0,
          gameStatus: "playing",
          blitzTimeLeft: 90,
        });
      },

      makeGuess: (item: CountryData | DistrictData) => {
        const state = get();
        if (state.gameStatus !== "playing") return;

        // Check duplicate
        if (state.guesses.some((g) => g.country.id === item.id)) return;

        const isDistrictMode = state.scope === "bangladesh";
        const currentTarget = isDistrictMode
          ? state.targetDistrict
          : state.targetCountry;

        const evaluated = evaluateGuess(item, currentTarget, isDistrictMode);
        const newGuesses = [...state.guesses, evaluated];
        const isWon = evaluated.isCorrect;
        const maxGuesses = getMaxGuesses(state.difficulty);
        const isLost = !isWon && newGuesses.length >= maxGuesses;
        const newStatus = isWon ? "won" : isLost ? "lost" : "playing";

        let updatedStats = { ...state.stats };
        if (newStatus !== "playing") {
          const played = state.stats.played + 1;
          const won = isWon ? state.stats.won + 1 : state.stats.won;
          const streak = isWon ? state.stats.streak + 1 : 0;
          const maxStreak = Math.max(state.stats.maxStreak, streak);
          const distribution = { ...state.stats.guessesDistribution };
          if (isWon && newGuesses.length <= maxGuesses) {
            distribution[newGuesses.length] =
              (distribution[newGuesses.length] || 0) + 1;
          }

          updatedStats = {
            played,
            won,
            streak,
            maxStreak,
            guessesDistribution: distribution,
          };
        }

        set({
          guesses: newGuesses,
          gameStatus: newStatus,
          stats: updatedStats,
        });
      },

      unlockNextHint: () => {
        set((state) => ({
          unlockedHints: Math.min(3, state.unlockedHints + 1),
        }));
      },

      revealExtraNeighbor: () => {
        set((state) => ({
          extraNeighborsRevealed: state.extraNeighborsRevealed + 1,
        }));
      },

      nextStreakRound: () => {
        const state = get();
        if (state.scope === "bangladesh") {
          const nextDistrict = pickNextInDistanceRange(
            state.targetDistrict,
            BANGLADESH_DISTRICTS,
            BD_DIST_MIN_KM,
            BD_DIST_MAX_KM,
            state.recentTargetIds,
          );
          set({
            targetDistrict: nextDistrict,
            recentTargetIds: [...state.recentTargetIds, nextDistrict.id].slice(
              -15,
            ),
            guesses: [],
            unlockedHints: 0,
            extraNeighborsRevealed: 0,
            gameStatus: "playing",
          });
        } else {
          const eligible = COUNTRIES.filter((c) => c.area > 5000);
          const nextCountry = pickNextInDistanceRange(
            state.targetCountry,
            eligible,
            WORLD_DIST_MIN_KM,
            WORLD_DIST_MAX_KM,
            state.recentTargetIds,
          );
          set({
            targetCountry: nextCountry,
            recentTargetIds: [...state.recentTargetIds, nextCountry.id].slice(
              -15,
            ),
            guesses: [],
            unlockedHints: 0,
            extraNeighborsRevealed: 0,
            gameStatus: "playing",
          });
        }
      },

      resetGame: () => {
        const state = get();
        if (state.scope === "bangladesh") {
          let nextTarget = state.targetDistrict;
          let nextRecent = state.recentTargetIds;
          if (state.mode === "daily") {
            nextTarget = getDailyDistrict(
              BANGLADESH_DISTRICTS,
              getTodayDateStr(),
            );
          } else {
            nextTarget = pickNextInDistanceRange(
              state.targetDistrict,
              BANGLADESH_DISTRICTS,
              BD_DIST_MIN_KM,
              BD_DIST_MAX_KM,
              state.recentTargetIds,
            );
            nextRecent = [...state.recentTargetIds, nextTarget.id].slice(-15);
          }
          set({
            targetDistrict: nextTarget,
            recentTargetIds: nextRecent,
            guesses: [],
            unlockedHints: 0,
            extraNeighborsRevealed: 0,
            gameStatus: "playing",
            blitzTimeLeft: 90,
          });
        } else {
          let nextTarget = state.targetCountry;
          let nextRecent = state.recentTargetIds;
          if (state.mode === "daily") {
            nextTarget = getDailyCountry(COUNTRIES, getTodayDateStr());
          } else {
            const eligible = COUNTRIES.filter((c) => c.area > 5000);
            nextTarget = pickNextInDistanceRange(
              state.targetCountry,
              eligible,
              WORLD_DIST_MIN_KM,
              WORLD_DIST_MAX_KM,
              state.recentTargetIds,
            );
            nextRecent = [...state.recentTargetIds, nextTarget.id].slice(-15);
          }
          set({
            targetCountry: nextTarget,
            recentTargetIds: nextRecent,
            guesses: [],
            unlockedHints: 0,
            extraNeighborsRevealed: 0,
            gameStatus: "playing",
            blitzTimeLeft: 90,
          });
        }
      },

      forfeitAndSwitch: (target: {
        difficulty?: GameDifficulty;
        mode?: GameMode;
        reset?: boolean;
      }) => {
        const state = get();
        let updatedStats = state.stats;
        if (state.guesses.length > 0 || (state.mode === "blitz" && state.blitzTimeLeft < 90)) {
          updatedStats = {
            ...state.stats,
            played: state.stats.played + 1,
            streak: 0,
          };
        }

        const nextDifficulty = target.difficulty ?? state.difficulty;
        const nextMode = target.mode ?? state.mode;

        let nextTargetCountry = state.targetCountry;
        let nextTargetDistrict = state.targetDistrict;
        let nextRecent = state.recentTargetIds;

        if (state.scope === "bangladesh") {
          if (nextMode === "daily") {
            nextTargetDistrict = getDailyDistrict(
              BANGLADESH_DISTRICTS,
              getTodayDateStr(),
            );
          } else {
            nextTargetDistrict = pickNextInDistanceRange(
              state.targetDistrict,
              BANGLADESH_DISTRICTS,
              BD_DIST_MIN_KM,
              BD_DIST_MAX_KM,
              state.recentTargetIds,
            );
          }
          nextRecent = [...state.recentTargetIds, nextTargetDistrict.id].slice(-15);
        } else {
          if (nextMode === "daily") {
            nextTargetCountry = getDailyCountry(COUNTRIES, getTodayDateStr());
          } else {
            const eligible = COUNTRIES.filter((c) => c.area > 5000);
            nextTargetCountry = pickNextInDistanceRange(
              state.targetCountry,
              eligible,
              WORLD_DIST_MIN_KM,
              WORLD_DIST_MAX_KM,
              state.recentTargetIds,
            );
          }
          nextRecent = [...state.recentTargetIds, nextTargetCountry.id].slice(-15);
        }

        set({
          difficulty: nextDifficulty,
          mode: nextMode,
          targetCountry: nextTargetCountry,
          targetDistrict: nextTargetDistrict,
          recentTargetIds: nextRecent,
          guesses: [],
          unlockedHints: 0,
          extraNeighborsRevealed: 0,
          gameStatus: "playing",
          blitzTimeLeft: 90,
          stats: updatedStats,
        });
      },

      tickBlitzTimer: () => {
        const state = get();
        if (state.mode !== "blitz" || state.gameStatus !== "playing") return;
        if (state.blitzTimeLeft <= 1) {
          set({
            blitzTimeLeft: 0,
            gameStatus: "lost",
            stats: {
              ...state.stats,
              played: state.stats.played + 1,
              streak: 0,
            },
          });
        } else {
          set({ blitzTimeLeft: state.blitzTimeLeft - 1 });
        }
      },
    }),
    {
      name: "borderline-game-storage",
      storage: createJSONStorage(() => localStorage),
      version: 3,
      migrate: (persistedState: unknown, version: number) => {
        const state = (persistedState || {}) as Record<string, unknown>;
        if (!version || version < 2) {
          return {
            ...state,
            scope: state.scope || "bangladesh",
            difficulty: state.difficulty || "normal",
            recentTargetIds: [],
          };
        }
        if (version < 3) {
          return {
            ...state,
            recentTargetIds: [],
          };
        }
        return state;
      },
      partialize: (state) => ({
        stats: state.stats,
        lastDailyDate: state.lastDailyDate,
        mode: state.mode,
        scope: state.scope,
        difficulty: state.difficulty,
        recentTargetIds: state.recentTargetIds,
      }),
    },
  ),
);
