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

export function isTargetHiddenOnMap(
  mode: GameMode,
  gameStatus: GameStatus,
): boolean {
  return mode === "detective" && gameStatus === "playing";
}

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
  scope: GameScope; // "world" or "bangladesh"
  mode: GameMode;
  difficulty: GameDifficulty;
  targetCountry: CountryData;
  targetDistrict: DistrictData;
  guesses: GuessResult[];
  unlockedHints: number; // 0, 1, 2, 3
  extraNeighborsRevealed: number; // For super-bordered nations
  gameStatus: GameStatus;
  lastDailyDate: string;
  blitzTimeLeft: number;
  recentTargetIds: string[];
  dailyHistory: Partial<Record<GameScope, DailyRecord>>;
  isGameOverOpen: boolean;

  // Actions
  setScope: (scope: GameScope) => void;
  initRouteScope: (scope: GameScope) => void;
  setMode: (mode: GameMode) => void;
  setDifficulty: (difficulty: GameDifficulty) => void;
  makeGuess: (item: CountryData | DistrictData) => void;
  unlockNextHint: () => void;
  revealExtraNeighbor: () => void;
  nextDetectiveRound: () => void;
  nextStreakRound: () => void;
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
      lastDailyDate: getTodayDateStr(),
      blitzTimeLeft: 90,
      recentTargetIds: [],
      dailyHistory: {},
      isGameOverOpen: false,

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
          } else if (state.guesses.length > 0 && state.lastDailyDate !== today) {
            // Day rolled over
            set({
              lastDailyDate: today,
              targetDistrict: getDailyDistrict(BANGLADESH_DISTRICTS, today),
              targetCountry: getDailyCountry(COUNTRIES, today),
              guesses: [],
              unlockedHints: 0,
              extraNeighborsRevealed: 0,
              gameStatus: "playing",
            });
          }
        }
      },

      setScope: (scope: GameScope) => {
        const state = get();
        if (state.scope === scope) return;

        const today = getTodayDateStr();
        let nextTargetCountry = state.targetCountry;
        let nextTargetDistrict = state.targetDistrict;
        let nextRecent = state.recentTargetIds;

        if (scope === "bangladesh") {
          nextTargetDistrict =
            state.mode === "daily"
              ? getDailyDistrict(BANGLADESH_DISTRICTS, today)
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
              ? getDailyCountry(COUNTRIES, today)
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

        // Check if daily record already exists for the target scope today
        if (state.mode === "daily") {
          const record = state.dailyHistory?.[scope];
          if (record && record.date === today) {
            set({
              scope,
              difficulty: record.difficulty ?? state.difficulty,
              targetCountry: nextTargetCountry,
              targetDistrict: nextTargetDistrict,
              recentTargetIds: nextRecent,
              guesses: record.guesses,
              unlockedHints: record.unlockedHints,
              extraNeighborsRevealed: record.extraNeighborsRevealed,
              gameStatus: record.gameStatus,
              blitzTimeLeft: 90,
              lastDailyDate: today,
            });
            return;
          }
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
          lastDailyDate: today,
        });
      },

      setDifficulty: (difficulty: GameDifficulty) => {
        const state = get();
        if (state.difficulty === difficulty) return;

        // In daily mode, difficulty does not reset target or guesses
        if (state.mode === "daily") {
          const today = getTodayDateStr();
          const currentRecord = state.dailyHistory?.[state.scope];
          if (
            currentRecord &&
            currentRecord.date === today &&
            currentRecord.gameStatus !== "playing"
          ) {
            return;
          }
          let nextDailyHistory = state.dailyHistory;
          if (currentRecord && currentRecord.date === today) {
            nextDailyHistory = {
              ...state.dailyHistory,
              [state.scope]: {
                ...currentRecord,
                difficulty,
              },
            };
          }
          set({ difficulty, dailyHistory: nextDailyHistory });
          return;
        }

        let nextTargetCountry = state.targetCountry;
        let nextTargetDistrict = state.targetDistrict;
        let nextRecent = state.recentTargetIds;

        if (state.scope === "bangladesh") {
          nextTargetDistrict = pickNextInDistanceRange(
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
          nextTargetCountry = pickNextInDistanceRange(
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

        const today = getTodayDateStr();
        let nextTargetCountry = state.targetCountry;
        let nextTargetDistrict = state.targetDistrict;
        let nextRecent = state.recentTargetIds;

        if (state.scope === "bangladesh") {
          if (mode === "daily") {
            nextTargetDistrict = getDailyDistrict(
              BANGLADESH_DISTRICTS,
              today,
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
            nextTargetCountry = getDailyCountry(COUNTRIES, today);
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

        // If switching into daily mode, check if today's record exists
        if (mode === "daily") {
          const record = state.dailyHistory?.[state.scope];
          if (record && record.date === today) {
            set({
              mode,
              difficulty: record.difficulty ?? state.difficulty,
              targetCountry: nextTargetCountry,
              targetDistrict: nextTargetDistrict,
              recentTargetIds: nextRecent,
              guesses: record.guesses,
              unlockedHints: record.unlockedHints,
              extraNeighborsRevealed: record.extraNeighborsRevealed,
              gameStatus: record.gameStatus,
              blitzTimeLeft: 90,
              lastDailyDate: today,
            });
            return;
          }
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

        const today = getTodayDateStr();

        // In daily mode, verify game isn't already finished today
        if (state.mode === "daily") {
          const record = state.dailyHistory?.[state.scope];
          if (record && record.date === today && record.gameStatus !== "playing") {
            return;
          }
        }

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

        let nextDailyHistory = state.dailyHistory;
        if (state.mode === "daily") {
          nextDailyHistory = {
            ...state.dailyHistory,
            [state.scope]: {
              date: today,
              gameStatus: newStatus,
              guesses: newGuesses,
              unlockedHints: state.unlockedHints,
              extraNeighborsRevealed: state.extraNeighborsRevealed,
              difficulty: state.difficulty,
            },
          };
        }

        set({
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
        let nextDailyHistory = state.dailyHistory;
        if (state.mode === "daily") {
          const today = getTodayDateStr();
          nextDailyHistory = {
            ...state.dailyHistory,
            [state.scope]: {
              date: today,
              gameStatus: state.gameStatus,
              guesses: state.guesses,
              unlockedHints: nextHints,
              extraNeighborsRevealed: state.extraNeighborsRevealed,
              difficulty: state.difficulty,
            },
          };
        }
        set({
          unlockedHints: nextHints,
          dailyHistory: nextDailyHistory,
        });
      },

      revealExtraNeighbor: () => {
        const state = get();
        if (state.gameStatus !== "playing") return;
        const nextNeighbors = state.extraNeighborsRevealed + 1;
        let nextDailyHistory = state.dailyHistory;
        if (state.mode === "daily") {
          const today = getTodayDateStr();
          nextDailyHistory = {
            ...state.dailyHistory,
            [state.scope]: {
              date: today,
              gameStatus: state.gameStatus,
              guesses: state.guesses,
              unlockedHints: state.unlockedHints,
              extraNeighborsRevealed: nextNeighbors,
              difficulty: state.difficulty,
            },
          };
        }
        set({
          extraNeighborsRevealed: nextNeighbors,
          dailyHistory: nextDailyHistory,
        });
      },

      nextDetectiveRound: () => {
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
            isGameOverOpen: false,
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
            isGameOverOpen: false,
          });
        }
      },

      nextStreakRound: () => {
        get().nextDetectiveRound();
      },

      resetGame: () => {
        const state = get();
        // Daily puzzle can ONLY be played once per day. Resetting is blocked.
        if (state.mode === "daily") {
          return;
        }

        if (state.scope === "bangladesh") {
          const nextTarget = pickNextInDistanceRange(
            state.targetDistrict,
            BANGLADESH_DISTRICTS,
            BD_DIST_MIN_KM,
            BD_DIST_MAX_KM,
            state.recentTargetIds,
          );
          const nextRecent = [...state.recentTargetIds, nextTarget.id].slice(-15);
          set({
            targetDistrict: nextTarget,
            recentTargetIds: nextRecent,
            guesses: [],
            unlockedHints: 0,
            extraNeighborsRevealed: 0,
            gameStatus: "playing",
            blitzTimeLeft: 90,
            isGameOverOpen: false,
          });
        } else {
          const eligible = COUNTRIES.filter((c) => c.area > 5000);
          const nextTarget = pickNextInDistanceRange(
            state.targetCountry,
            eligible,
            WORLD_DIST_MIN_KM,
            WORLD_DIST_MAX_KM,
            state.recentTargetIds,
          );
          const nextRecent = [...state.recentTargetIds, nextTarget.id].slice(-15);
          set({
            targetCountry: nextTarget,
            recentTargetIds: nextRecent,
            guesses: [],
            unlockedHints: 0,
            extraNeighborsRevealed: 0,
            gameStatus: "playing",
            blitzTimeLeft: 90,
            isGameOverOpen: false,
          });
        }
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
          nextDailyHistory = {
            ...state.dailyHistory,
            [state.scope]: {
              date: today,
              gameStatus: "lost",
              guesses: state.guesses,
              unlockedHints: state.unlockedHints,
              extraNeighborsRevealed: state.extraNeighborsRevealed,
              difficulty: state.difficulty,
            },
          };
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

        let nextTargetCountry = state.targetCountry;
        let nextTargetDistrict = state.targetDistrict;
        let nextRecent = state.recentTargetIds;

        if (state.scope === "bangladesh") {
          if (nextMode === "daily") {
            nextTargetDistrict = getDailyDistrict(
              BANGLADESH_DISTRICTS,
              today,
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
            nextTargetCountry = getDailyCountry(COUNTRIES, today);
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

        // If next mode is daily, restore today's record if it exists
        if (nextMode === "daily") {
          const record = nextDailyHistory?.[state.scope];
          if (record && record.date === today) {
            set({
              difficulty: record.difficulty ?? nextDifficulty,
              mode: nextMode,
              targetCountry: nextTargetCountry,
              targetDistrict: nextTargetDistrict,
              recentTargetIds: nextRecent,
              guesses: record.guesses,
              unlockedHints: record.unlockedHints,
              extraNeighborsRevealed: record.extraNeighborsRevealed,
              gameStatus: record.gameStatus,
              blitzTimeLeft: 90,
              dailyHistory: nextDailyHistory,
              isGameOverOpen: false,
            });
            return;
          }
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
          dailyHistory: nextDailyHistory,
          isGameOverOpen: false,
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
      name: "borderline-game-storage",
      storage: createJSONStorage(() =>
        typeof window !== "undefined"
          ? window.localStorage
          : {
              getItem: () => null,
              setItem: () => {},
              removeItem: () => {},
            },
      ),
      version: 6,
      migrate: (persistedState: unknown, version: number) => {
        const state = (persistedState || {}) as Record<string, unknown>;
        if (!version || version < 2) {
          state.scope = state.scope || "bangladesh";
          state.difficulty = state.difficulty || "normal";
          state.recentTargetIds = [];
        }
        if (version < 3) {
          state.recentTargetIds = [];
        }
        if (version < 4 || state.mode === "streak") {
          state.mode = "detective";
        }
        if (version < 5) {
          delete state.stats;
        }
        if (version < 6) {
          state.dailyHistory = state.dailyHistory || {};
        }
        return state;
      },
      partialize: (state) => ({
        lastDailyDate: state.lastDailyDate,
        mode: state.mode,
        scope: state.scope,
        difficulty: state.difficulty,
        recentTargetIds: state.recentTargetIds,
        dailyHistory: state.dailyHistory,
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        const today = getTodayDateStr();
        if (state.mode === "daily") {
          const record = state.dailyHistory?.[state.scope];
          if (record && record.date === today) {
            useGameStore.setState({
              difficulty: record.difficulty ?? state.difficulty,
              guesses: record.guesses,
              gameStatus: record.gameStatus,
              unlockedHints: record.unlockedHints,
              extraNeighborsRevealed: record.extraNeighborsRevealed,
              targetDistrict: getDailyDistrict(BANGLADESH_DISTRICTS, today),
              targetCountry: getDailyCountry(COUNTRIES, today),
            });
          } else {
            useGameStore.setState({
              guesses: [],
              gameStatus: "playing",
              unlockedHints: 0,
              extraNeighborsRevealed: 0,
              targetDistrict: getDailyDistrict(BANGLADESH_DISTRICTS, today),
              targetCountry: getDailyCountry(COUNTRIES, today),
            });
          }
        }
      },
    },
  ),
);
