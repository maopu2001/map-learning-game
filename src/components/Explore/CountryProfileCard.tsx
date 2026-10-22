"use client";

import React from "react";
import {
  CountryData,
  COUNTRIES_BY_ID,
  getEffectiveBorders,
} from "@/data/world";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Users,
  Maximize2,
  Compass,
  CircleQuestionMark,
} from "lucide-react";

interface CountryProfileCardProps {
  country: CountryData | null;
  onSelectCountry: (country: CountryData) => void;
  onHoverCountry: (country: CountryData | null) => void;
}

export function CountryProfileCard({
  country,
  onSelectCountry,
  onHoverCountry,
}: CountryProfileCardProps) {
  if (!country) {
    return (
      <div className="rounded-2xl border border-white/10 bg-[#0c101c] p-6 shadow-2xl flex flex-col items-center justify-center text-center space-y-3 min-h-[280px]">
        <div className="size-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400">
          <Compass className="size-6 text-amber-400 animate-pulse" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-bold text-white">
            No Country Selected
          </h3>
          <p className="text-xs text-slate-400 max-w-xs">
            Click any highlighted country on the map or search above to view
            detailed tactical recon.
          </p>
        </div>
      </div>
    );
  }

  const effectiveBorders = getEffectiveBorders(country);

  return (
    <div className="rounded-2xl border border-white/10 bg-[#0c101c] p-4 sm:p-5 shadow-2xl space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-white/5">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{country.flagEmoji}</span>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              {country.name}
            </h2>
            {country.officialName && country.officialName !== country.name && (
              <p className="text-2xs text-slate-400 italic truncate max-w-[220px]">
                {country.officialName}
              </p>
            )}
            <p className="text-xs text-sky-400 font-medium">
              {country.continent}
              {country.subregion ? ` • ${country.subregion}` : ""}
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <Badge
            variant="outline"
            className="border-sky-500/30 text-sky-300 font-mono text-2xs"
          >
            {country.id}
          </Badge>
          {country.isIsland && (
            <Badge
              variant="outline"
              className="border-sky-500/30 text-sky-400 font-sans text-2xs"
            >
              Island Nation
            </Badge>
          )}
        </div>
      </div>

      {/* Specs */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
          <span className="text-slate-400 text-xs flex items-center gap-1">
            <MapPin className="size-3 text-emerald-400" /> Capital City
          </span>
          <span className="font-semibold text-white">
            {country.capital || "N/A"}
          </span>
        </div>
        <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
          <span className="text-slate-400 text-xs flex items-center gap-1">
            <Users className="size-3 text-sky-400" /> Population
          </span>
          <span className="font-semibold font-mono text-white">
            {country.population ? country.population.toLocaleString() : "N/A"}
          </span>
        </div>
        <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
          <span className="text-slate-400 text-xs flex items-center gap-1">
            <Maximize2 className="size-3 text-amber-400" /> Surface Area
          </span>
          <span className="font-semibold font-mono text-white">
            {country.area ? `${country.area.toLocaleString()} km²` : "N/A"}
          </span>
        </div>
        <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
          <span className="text-slate-400 text-xs flex items-center gap-1">
            <Compass className="size-3 text-purple-400" /> Coordinates
          </span>
          <span className="font-semibold font-mono text-white">
            {Math.abs(country.coordinates[0]).toFixed(1)}°
            {country.coordinates[0] >= 0 ? "N" : "S"},{" "}
            {Math.abs(country.coordinates[1]).toFixed(1)}°
            {country.coordinates[1] >= 0 ? "E" : "W"}
          </span>
        </div>
      </div>

      {/* Trivia */}
      <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 space-y-1 text-xs leading-relaxed">
        <span className="text-amber-400 font-semibold flex items-center gap-1.5">
          <CircleQuestionMark className="size-3.5" /> Did you know?
        </span>
        <p className="text-slate-300">{country.triviaFact}</p>
      </div>

      {/* Neighbors */}
      <div className="space-y-2">
        <h3 className="text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider">
          {country.borders.length === 0
            ? "Nearby Maritime Neighbors:"
            : `Bordering Countries (${country.borders.length}):`}
        </h3>
        <div className="flex flex-wrap gap-1.5">
          {effectiveBorders.map((iso) => {
            const neighbor = COUNTRIES_BY_ID.get(iso);
            return (
              <button
                key={iso}
                onMouseEnter={() => {
                  if (neighbor) onHoverCountry(neighbor);
                }}
                onMouseLeave={() => {
                  onHoverCountry(null);
                }}
                onClick={() => {
                  if (neighbor) {
                    onSelectCountry(neighbor);
                    onHoverCountry(null);
                  }
                }}
                className="px-2.5 py-1.5 min-h-[36px] rounded-lg text-xs bg-sky-950/40 border border-sky-500/30 text-sky-300 hover:bg-sky-500 hover:text-white transition-colors cursor-pointer"
              >
                {neighbor ? `${neighbor.flagEmoji} ${neighbor.name}` : iso} ↗
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
