"use client";

import React from "react";
import { Globe, Layers } from "lucide-react";
import { COUNTRIES, CountryData } from "@/data/world";

export const WORLD_CONTINENTS = [
  "All",
  "Africa",
  "Asia",
  "Europe",
  "North America",
  "South America",
  "Oceania",
  "Antarctica",
] as const;

export function getContinentForCountry(c: CountryData): string {
  return c.continent;
}

export interface ContinentFilterBarProps {
  selectedContinent: string;
  onSelectContinent: (continent: string) => void;
  selectedSubregion: string;
  onSelectSubregion: (subregion: string) => void;
}

export type RegionFilterBarProps = ContinentFilterBarProps;

export function ContinentFilterBar({
  selectedContinent,
  onSelectContinent,
  selectedSubregion,
  onSelectSubregion,
}: ContinentFilterBarProps) {
  const subregions = React.useMemo(() => {
    if (selectedContinent === "All") return [];
    const set = new Set<string>();
    for (const c of COUNTRIES) {
      if (getContinentForCountry(c) === selectedContinent && c.subregion) {
        set.add(c.subregion);
      }
    }
    return Array.from(set).sort();
  }, [selectedContinent]);

  return (
    <div className="flex flex-col gap-1.5 shrink-0">
      {/* Tier 1: Continents */}
      <div className="flex items-center gap-1.5 min-w-0">
        <span className="text-xs font-mono text-slate-400 font-medium shrink-0 flex items-center gap-1 mr-1 select-none">
          <Globe className="size-3 text-amber-400" /> Continent:
        </span>
        <div className="flex-1 min-w-0 flex items-center gap-1.5 overflow-x-auto pb-0.5 text-xs scrollbar-none">
          {WORLD_CONTINENTS.map((cont) => (
            <button
              key={cont}
              type="button"
              onClick={() => onSelectContinent(cont)}
              className={`px-3 py-1.5 min-h-[32px] rounded-lg shrink-0 text-xs font-medium border transition-colors cursor-pointer ${
                selectedContinent === cont
                  ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                  : "bg-black/40 text-slate-400 border-white/5 hover:text-white"
              }`}
            >
              {cont}
            </button>
          ))}
        </div>
      </div>

      {/* Tier 2: Subregions (Shown when a continent has more than 1 subregion) */}
      {selectedContinent !== "All" && subregions.length > 1 && (
        <div className="flex items-center gap-1.5 min-w-0 animate-in fade-in duration-200">
          <span className="text-xs font-mono text-slate-400 font-medium shrink-0 flex items-center gap-1 mr-1 select-none">
            <Layers className="size-3 text-sky-400" /> Subregion:
          </span>
          <div className="flex-1 min-w-0 flex items-center gap-1.5 overflow-x-auto pb-0.5 text-xs scrollbar-none">
            <button
              type="button"
              onClick={() => onSelectSubregion("All")}
              className={`px-2.5 py-1 min-h-[28px] rounded-lg shrink-0 text-2xs font-medium border transition-colors cursor-pointer ${
                selectedSubregion === "All"
                  ? "bg-sky-500/20 text-sky-300 border-sky-500/40"
                  : "bg-black/40 text-slate-400 border-white/5 hover:text-white"
              }`}
            >
              All {selectedContinent}
            </button>
            {subregions.map((sub) => (
              <button
                key={sub}
                type="button"
                onClick={() => onSelectSubregion(sub)}
                className={`px-2.5 py-1 min-h-[28px] rounded-lg shrink-0 text-2xs font-medium border transition-colors cursor-pointer ${
                  selectedSubregion === sub
                    ? "bg-sky-500/20 text-sky-300 border-sky-500/40"
                    : "bg-black/40 text-slate-400 border-white/5 hover:text-white"
                }`}
              >
                {sub}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export const RegionFilterBar = ContinentFilterBar;
