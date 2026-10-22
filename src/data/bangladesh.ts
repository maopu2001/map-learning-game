import rawDistricts from "../../public/data/bangladesh-districts.json";

export interface DistrictData {
  id: string; // District name as ID (e.g., "Dhaka", "Chattogram")
  shapeId: string;
  name: string;
  division: string;
  coordinates: [number, number]; // [lat, lng]
  borders: string[]; // Neighbor district names
  triviaFact: string;
  flagEmoji: string;
  isCoastal: boolean;
  aliases?: string[];
}

export const BANGLADESH_DISTRICTS: DistrictData[] = rawDistricts as DistrictData[];

export const DISTRICTS_BY_NAME = new Map<string, DistrictData>();

for (const d of BANGLADESH_DISTRICTS) {
  DISTRICTS_BY_NAME.set(d.name.toLowerCase(), d);
  if (d.aliases) {
    for (const a of d.aliases) {
      DISTRICTS_BY_NAME.set(a.toLowerCase(), d);
    }
  }
}

export function findDistrict(query: string): DistrictData | undefined {
  if (!query) return undefined;
  const q = query.trim().toLowerCase();
  const exact = DISTRICTS_BY_NAME.get(q);
  if (exact) return exact;

  return BANGLADESH_DISTRICTS.find(
    (d) =>
      d.name.toLowerCase().includes(q) ||
      d.aliases?.some((a) => a.toLowerCase().includes(q)),
  );
}
