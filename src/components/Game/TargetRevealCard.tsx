"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Users, Maximize2, Compass, Layers } from "lucide-react";
import { CountryData } from "@/data/world";
import { DistrictData } from "@/data/bangladesh";

interface TargetRevealCardProps {
  isBD: boolean;
  targetCountry: CountryData | null;
  targetDistrict: DistrictData | null;
}

export function TargetRevealCard({
  isBD,
  targetCountry,
  targetDistrict,
}: TargetRevealCardProps) {
  const currentTarget = isBD ? targetDistrict : targetCountry;
  if (!currentTarget) return null;

  return (
    <div className="rounded-xl border border-white/10 bg-black/40 p-4 space-y-3">
      <div className="flex items-center gap-3">
        {!isBD && targetCountry && (
          <span className="text-4xl">{targetCountry.flagEmoji}</span>
        )}
        <div className="min-w-0 flex-1">
          <h4 className="text-lg font-bold text-white flex items-center gap-2 flex-wrap">
            <span>{currentTarget.name}</span>
            <Badge
              variant="outline"
              className="text-xs border-white/10 font-mono"
            >
              {isBD ? "District" : targetCountry?.id}
            </Badge>
            {!isBD && targetCountry?.isIsland && (
              <Badge
                variant="outline"
                className="text-2xs border-sky-500/30 text-sky-400 font-sans"
              >
                Island Nation
              </Badge>
            )}
            {isBD && targetDistrict?.isCoastal && (
              <Badge
                variant="outline"
                className="text-2xs border-emerald-500/30 text-emerald-400 font-sans"
              >
                Coastal
              </Badge>
            )}
          </h4>
          {!isBD &&
            targetCountry?.officialName &&
            targetCountry.officialName !== targetCountry.name && (
              <p className="text-2xs text-slate-400 italic truncate">
                {targetCountry.officialName}
              </p>
            )}
          <p className="text-xs text-slate-300">
            {isBD && targetDistrict
              ? `${targetDistrict.division} Division`
              : targetCountry
                ? `Capital: ${targetCountry.capital} • ${targetCountry.subregion || targetCountry.region}`
                : ""}
          </p>
        </div>
      </div>

      {/* Demographic & Spatial Metrics Row */}
      <div className="grid grid-cols-2 gap-2 text-2xs">
        {!isBD && targetCountry ? (
          <>
            <div className="px-2.5 py-1.5 rounded-lg bg-[#070a12] border border-white/5 flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-1">
                <Users className="size-3 text-sky-400" /> Population
              </span>
              <span className="font-mono font-semibold text-slate-200">
                {targetCountry.population
                  ? targetCountry.population.toLocaleString()
                  : "N/A"}
              </span>
            </div>
            <div className="px-2.5 py-1.5 rounded-lg bg-[#070a12] border border-white/5 flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-1">
                <Maximize2 className="size-3 text-emerald-400" /> Area
              </span>
              <span className="font-mono font-semibold text-slate-200">
                {targetCountry.area
                  ? `${targetCountry.area.toLocaleString()} km²`
                  : "N/A"}
              </span>
            </div>
            <div className="px-2.5 py-1.5 rounded-lg bg-[#070a12] border border-white/5 flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-1">
                <Compass className="size-3 text-purple-400" /> Coordinates
              </span>
              <span className="font-mono font-semibold text-slate-200">
                {Math.abs(targetCountry.coordinates[0]).toFixed(1)}°
                {targetCountry.coordinates[0] >= 0 ? "N" : "S"},{" "}
                {Math.abs(targetCountry.coordinates[1]).toFixed(1)}°
                {targetCountry.coordinates[1] >= 0 ? "E" : "W"}
              </span>
            </div>
            <div className="px-2.5 py-1.5 rounded-lg bg-[#070a12] border border-white/5 flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-1">
                <Layers className="size-3 text-amber-400" />{" "}
                {targetCountry.borders.length > 0 ? "Borders" : "Neighbors"}
              </span>
              <span className="font-mono font-semibold text-slate-200">
                {targetCountry.borders.length > 0
                  ? `${targetCountry.borders.length} Land borders`
                  : `${targetCountry.maritimeNeighbors?.length || 0} Nearby`}
              </span>
            </div>
          </>
        ) : isBD && targetDistrict ? (
          <>
            <div className="px-2.5 py-1.5 rounded-lg bg-[#070a12] border border-white/5 flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-1">
                <Compass className="size-3 text-sky-400" /> Coordinates
              </span>
              <span className="font-mono font-semibold text-slate-200">
                {targetDistrict.coordinates[0].toFixed(2)}°N,{" "}
                {targetDistrict.coordinates[1].toFixed(2)}°E
              </span>
            </div>
            <div className="px-2.5 py-1.5 rounded-lg bg-[#070a12] border border-white/5 flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-1">
                <Layers className="size-3 text-emerald-400" /> Borders
              </span>
              <span className="font-mono font-semibold text-slate-200">
                {targetDistrict.borders.length} Neighbors
              </span>
            </div>
          </>
        ) : null}
      </div>

      <div className="p-3 rounded-lg bg-[#070a12] border border-white/5 text-xs text-slate-300 leading-relaxed">
        <span className="font-semibold text-amber-400">Did you know? </span>
        {currentTarget.triviaFact}
      </div>
    </div>
  );
}
