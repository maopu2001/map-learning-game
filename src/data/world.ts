import rawCountries from "../../public/data/world_countries.json";

export interface MaritimeNeighbor {
  id: string;
  name: string;
  distanceKm: number;
}

export interface RegionCenter {
  center: [number, number];
  zoom: number;
}

export interface CountryData {
  id: string; // ISO 3166-1 alpha-3 (e.g., "BOL")
  numericId: string; // "068"
  name: string; // "Bolivia"
  officialName: string;
  aliases: string[];
  capital: string;
  coordinates: [number, number]; // [lat, lng]
  borders: string[]; // ["ARG", "BRA", "CHL", "PRY", "PER"]
  continent: string;
  region: string;
  subregion: string;
  maritimeNeighbors?: string[];
  flagEmoji: string;
  triviaFact: string;
  area: number;
  population: number;
  isIsland: boolean;
}

const rawData = rawCountries as unknown as
  | {
      continentCenters?: Record<string, RegionCenter>;
      subregionCenters?: Record<string, RegionCenter>;
      countries?: CountryData[];
    }
  | CountryData[];

export const COUNTRIES: CountryData[] = Array.isArray(rawData)
  ? (rawData as CountryData[])
  : (rawData.countries || []);

export const CONTINENT_CENTERS: Record<string, RegionCenter> = Array.isArray(
  rawData,
)
  ? {}
  : rawData.continentCenters || {};

export const SUBREGION_CENTERS: Record<string, RegionCenter> = Array.isArray(
  rawData,
)
  ? {}
  : rawData.subregionCenters || {};

export const COUNTRIES_BY_ID = new Map<string, CountryData>();
export const COUNTRIES_BY_NUMERIC = new Map<string, CountryData>();
export const COUNTRIES_BY_NAME = new Map<string, CountryData>();

for (const c of COUNTRIES) {
  COUNTRIES_BY_ID.set(c.id, c);
  if (c.numericId) {
    COUNTRIES_BY_NUMERIC.set(c.numericId, c);
    COUNTRIES_BY_NUMERIC.set(String(parseInt(c.numericId, 10)), c);
  }
  COUNTRIES_BY_NAME.set(c.name.toLowerCase(), c);
}

// Microstates list for magnifying callout
export const MICROSTATES = new Set([
  "SMR",
  "VAT",
  "MCO",
  "LIE",
  "AND",
  "MLT",
  "LSO",
  "SWZ",
  "LUX",
  "SGP",
  "BHR",
  "BRN",
]);

// Helper to look up country by ISO3, name, or alias
export function findCountry(query: string): CountryData | undefined {
  if (!query) return undefined;
  const q = query.trim().toLowerCase();

  // Exact ISO
  const byId = COUNTRIES_BY_ID.get(query.toUpperCase());
  if (byId) return byId;

  // Exact Name
  const byName = COUNTRIES_BY_NAME.get(q);
  if (byName) return byName;

  // Partial or alias matching
  return COUNTRIES.find((c) => {
    if (c.name.toLowerCase() === q) return true;
    if (c.officialName.toLowerCase() === q) return true;
    return c.aliases.some((alias) => alias.toLowerCase() === q);
  });
}

export function haversineDistKm(
  coord1: [number, number],
  coord2: [number, number],
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((coord2[0] - coord1[0]) * Math.PI) / 180;
  const dLon = ((coord2[1] - coord1[1]) * Math.PI) / 180;
  const lat1 = (coord1[0] * Math.PI) / 180;
  const lat2 = (coord2[0] * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function getNearestCountries(
  country: CountryData,
  count = 3,
): CountryData[] {
  const result: CountryData[] = [];
  const seenIds = new Set<string>([country.id]);

  // 1. If country has maritimeNeighbors defined, prioritize them
  if (country.maritimeNeighbors && country.maritimeNeighbors.length > 0) {
    for (const id of country.maritimeNeighbors) {
      const neighbor = COUNTRIES_BY_ID.get(id);
      if (neighbor && !seenIds.has(neighbor.id)) {
        result.push(neighbor);
        seenIds.add(neighbor.id);
        if (result.length >= count) return result;
      }
    }
  }

  // 2. If we still need more countries to reach count, fill by geographic distance
  if (result.length < count) {
    const remaining = COUNTRIES.filter((c) => !seenIds.has(c.id))
      .map((c) => ({
        country: c,
        dist: haversineDistKm(country.coordinates, c.coordinates),
      }))
      .sort((a, b) => a.dist - b.dist)
      .slice(0, count - result.length)
      .map((item) => item.country);

    result.push(...remaining);
  }

  return result;
}

export function getEffectiveBorders(country: CountryData): string[] {
  if (country.borders && country.borders.length > 0) {
    return country.borders;
  }
  return getNearestCountries(country, 3).map((c) => c.id);
}
