import rawDistricts from "../../public/data/bangladesh-districts.json";

export interface DistrictData {
  id: string; // District name as ID (e.g., "Dhaka", "Chittagong")
  shapeId: string;
  name: string;
  division: string;
  coordinates: [number, number]; // [lat, lng]
  borders: string[]; // Neighbor district names
  triviaFact: string;
  flagEmoji: string;
  isCoastal: boolean;
}

export const BANGLADESH_DISTRICTS: DistrictData[] = rawDistricts as DistrictData[];

export const DISTRICTS_BY_NAME = new Map<string, DistrictData>();

for (const d of BANGLADESH_DISTRICTS) {
  DISTRICTS_BY_NAME.set(d.name.toLowerCase(), d);
}

export function findDistrict(query: string): DistrictData | undefined {
  if (!query) return undefined;
  const q = query.trim().toLowerCase();
  const exact = DISTRICTS_BY_NAME.get(q);
  if (exact) return exact;

  return BANGLADESH_DISTRICTS.find((d) => d.name.toLowerCase().includes(q));
}
