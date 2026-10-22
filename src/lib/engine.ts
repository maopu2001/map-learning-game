import distance from "@turf/distance";
import bearing from "@turf/bearing";
import { point } from "@turf/helpers";
import { CountryData } from "@/data/world";
import { DistrictData } from "@/data/bangladesh";

export type Direction = "N" | "NE" | "E" | "SE" | "S" | "SW" | "W" | "NW";

export interface GuessResult {
  country: CountryData | DistrictData;
  distanceKm: number;
  bearing: number;
  direction: Direction;
  directionEmoji: string;
  isCorrect: boolean;
  proximityScore: number; // 0 to 100%
}

// Convert degrees to 8-point compass bearing
export function bearingToDirection(deg: number): {
  dir: Direction;
  emoji: string;
} {
  // normalize between 0 and 360
  const normalized = (deg + 360) % 360;
  if (normalized >= 337.5 || normalized < 22.5)
    return { dir: "N", emoji: "⬆️" };
  if (normalized >= 22.5 && normalized < 67.5)
    return { dir: "NE", emoji: "↗️" };
  if (normalized >= 67.5 && normalized < 112.5)
    return { dir: "E", emoji: "➡️" };
  if (normalized >= 112.5 && normalized < 157.5)
    return { dir: "SE", emoji: "↘️" };
  if (normalized >= 157.5 && normalized < 202.5)
    return { dir: "S", emoji: "⬇️" };
  if (normalized >= 202.5 && normalized < 247.5)
    return { dir: "SW", emoji: "↙️" };
  if (normalized >= 247.5 && normalized < 292.5)
    return { dir: "W", emoji: "⬅️" };
  return { dir: "NW", emoji: "↖️" };
}

// Earth maximum antipodal distance ~ 20015 km
const MAX_EARTH_DIST = 20000;
// Bangladesh diagonal ~ 750 km
const MAX_BD_DIST = 750;

export function evaluateGuess(
  guess: CountryData | DistrictData,
  target: CountryData | DistrictData,
  isDistrictMode = false,
): GuessResult {
  const isCorrect = guess.id === target.id;
  if (isCorrect) {
    return {
      country: guess,
      distanceKm: 0,
      bearing: 0,
      direction: "N",
      directionEmoji: "🎯",
      isCorrect: true,
      proximityScore: 100,
    };
  }

  // Turf uses [lng, lat]
  const p1 = point([guess.coordinates[1], guess.coordinates[0]]);
  const p2 = point([target.coordinates[1], target.coordinates[0]]);

  const dist = Math.round(distance(p1, p2, { units: "kilometers" }));
  const b = bearing(p1, p2);
  const { dir, emoji } = bearingToDirection(b);

  const maxDist = isDistrictMode ? MAX_BD_DIST : MAX_EARTH_DIST;
  const proximityScore = Math.max(0, Math.round((1 - dist / maxDist) * 100));

  return {
    country: guess,
    distanceKm: dist,
    bearing: Math.round(b),
    direction: dir,
    directionEmoji: emoji,
    isCorrect: false,
    proximityScore,
  };
}

// Mask capital or name: reveals first char and spaces, masks remainder
export function maskCapital(capital: string, revealTier: number): string {
  if (!capital || capital.includes("No official")) return capital;

  if (revealTier >= 2) return capital;

  const words = capital.split(" ");
  return words
    .map((word) => {
      if (word.length <= 2) return word;
      return word
        .split("")
        .map((ch, idx) => {
          if (idx === 0) return ch;
          if (ch === "-" || ch === "/" || ch === "'" || ch === ".") return ch;
          return "_";
        })
        .join(" ");
    })
    .join("   ");
}

// Seeded pseudo-random number generator for daily puzzle
export function getDailyCountry(
  countries: CountryData[],
  dateStr: string,
): CountryData {
  if (!countries || countries.length === 0) {
    throw new Error("No countries provided to getDailyCountry");
  }
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = (hash << 5) - hash + dateStr.charCodeAt(i);
    hash |= 0;
  }
  const eligible = countries.filter(
    (c) => c.area > 10000 || c.borders.length > 0,
  );
  const pool = eligible.length > 0 ? eligible : countries;
  const index = Math.abs(hash) % pool.length;
  return pool[index];
}

export function getDailyDistrict(
  districts: DistrictData[],
  dateStr: string,
): DistrictData {
  if (!districts || districts.length === 0) {
    throw new Error("No districts provided to getDailyDistrict");
  }
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = (hash << 5) - hash + dateStr.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % districts.length;
  return districts[index];
}

// Generate Wordle-like share text
export function generateShareText(
  dayIndex: number | string,
  guesses: GuessResult[],
  won: boolean,
  modeName = "Borderline",
  maxGuesses = 6,
): string {
  const countStr = won ? `${guesses.length}/${maxGuesses}` : `X/${maxGuesses}`;
  const header = `${modeName} #${dayIndex} 🌍 ${countStr}\n`;

  const rows = guesses.map((g) => {
    if (g.isCorrect) return "🟩 0 km 🎯";
    const squares =
      g.distanceKm < 200 ? "🟨" : g.distanceKm < 600 ? "🟧" : "⬛";
    return `${squares} ${g.distanceKm.toLocaleString()} km ${g.directionEmoji}`;
  });

  const footer = `\nPlay at borderline.game`;
  return `${header}${rows.join("\n")}${footer}`;
}
