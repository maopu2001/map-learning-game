"use client";

import React from "react";
import { useGameStore } from "@/lib/store";
import { Badge } from "@/components/ui/badge";
import { Users, Maximize2, Compass, Layers } from "lucide-react";
import { MapsLinkButton } from "@/components/Mix/maps";
import { CountryData } from "@/data/world";
import { DistrictData } from "@/data/bangladesh";

interface TargetRevealCardProps {
  isBD?: boolean;
  targetCountry?: CountryData | null;
  targetDistrict?: DistrictData | null;
  scope?: "bangladesh" | "world";
}

export function TargetRevealCard(props: TargetRevealCardProps) {
  const storeTargetDistrict = useGameStore((s) => s.targetDistrict);
  const storeTargetCountry = useGameStore((s) => s.targetCountry);

  const isBD =
    props.isBD !== undefined ? props.isBD : props.scope === "bangladesh";

  const targetCountry =
    props.targetCountry !== undefined
      ? props.targetCountry
      : storeTargetCountry;
  const targetDistrict =
    props.targetDistrict !== undefined
      ? props.targetDistrict
      : storeTargetDistrict;

  const currentTarget = isBD ? targetDistrict : targetCountry;
  if (!currentTarget) return null;

  return (
    <div className="rounded-xl border border-border bg-card/60 p-3 space-y-2">
      <div className="flex items-center gap-2.5">
        {!isBD && targetCountry && (
          <span className="text-3xl shrink-0">{targetCountry.flagEmoji}</span>
        )}
        <div className="min-w-0 flex-1">
          <h4 className="text-base font-bold text-foreground flex items-center gap-1.5 flex-wrap">
            <span>{currentTarget.name}</span>
            <Badge
              variant="outline"
              className="text-2xs border-border font-mono py-0 px-1.5 h-4.5"
            >
              {isBD ? "District" : targetCountry?.id}
            </Badge>
            {!isBD && targetCountry?.isIsland && (
              <Badge
                variant="outline"
                className="text-2xs border-accent/30 text-accent font-sans py-0 px-1.5 h-4.5"
              >
                Island Nation
              </Badge>
            )}
            {isBD && targetDistrict?.isCoastal && (
              <Badge
                variant="outline"
                className="text-2xs border-primary/30 text-primary font-sans py-0 px-1.5 h-4.5"
              >
                Coastal
              </Badge>
            )}
          </h4>
          {!isBD &&
            targetCountry?.officialName &&
            targetCountry.officialName !== targetCountry.name && (
              <p className="text-2xs text-muted-foreground italic truncate">
                {targetCountry.officialName}
              </p>
            )}
          <p className="text-2xs text-muted-foreground">
            {isBD && targetDistrict
              ? `${targetDistrict.division} Division`
              : targetCountry
                ? `Capital: ${targetCountry.capital} • ${targetCountry.continent}${targetCountry.subregion ? ` • ${targetCountry.subregion}` : ""}`
                : ""}
          </p>
        </div>
      </div>

      {/* Demographic & Spatial Metrics Row */}
      <div className="grid grid-cols-2 gap-1.5 text-2xs">
        {!isBD && targetCountry ? (
          <>
            <div className="px-2 py-1 rounded-lg bg-muted/40 border border-border flex items-center justify-between">
              <span className="text-muted-foreground flex items-center gap-1">
                <Users className="size-3 text-accent" /> Population
              </span>
              <span className="font-mono font-semibold text-foreground">
                {targetCountry.population
                  ? targetCountry.population.toLocaleString()
                  : "N/A"}
              </span>
            </div>
            <div className="px-2 py-1 rounded-lg bg-muted/40 border border-border flex items-center justify-between">
              <span className="text-muted-foreground flex items-center gap-1">
                <Maximize2 className="size-3 text-primary" /> Area
              </span>
              <span className="font-mono font-semibold text-foreground">
                {targetCountry.area
                  ? `${targetCountry.area.toLocaleString()} km²`
                  : "N/A"}
              </span>
            </div>
            <div className="px-2 py-1 rounded-lg bg-muted/40 border border-border flex items-center justify-between col-span-2">
              <span className="text-muted-foreground flex items-center gap-1">
                <Compass className="size-3 text-accent" /> Coordinates
              </span>
              <div className="flex items-center gap-1.5">
                <span className="font-mono font-semibold text-foreground">
                  {Math.abs(targetCountry.coordinates[0]).toFixed(1)}°
                  {targetCountry.coordinates[0] >= 0 ? "N" : "S"},{" "}
                  {Math.abs(targetCountry.coordinates[1]).toFixed(1)}°
                  {targetCountry.coordinates[1] >= 0 ? "E" : "W"}
                </span>
                <MapsLinkButton name={targetCountry.name} />
              </div>
            </div>
          </>
        ) : isBD && targetDistrict ? (
          <>
            <div className="px-2 py-1 rounded-lg bg-muted/40 border border-border flex items-center justify-between col-span-2">
              <span className="text-muted-foreground flex items-center gap-1">
                <Compass className="size-3 text-accent" /> Coordinates
              </span>
              <div className="flex items-center gap-1.5">
                <span className="font-mono font-semibold text-foreground">
                  {targetDistrict.coordinates[0].toFixed(2)}°N,{" "}
                  {targetDistrict.coordinates[1].toFixed(2)}°E
                </span>
                <MapsLinkButton name={targetDistrict.name} isDistrict />
              </div>
            </div>
          </>
        ) : null}
      </div>

      <div className="p-3 rounded-lg bg-muted/40 border border-border text-xs text-foreground/90 leading-relaxed max-h-40 sm:max-h-44 overflow-y-auto overscroll-contain">
        <span className="font-semibold text-accent">Did you know? </span>
        {currentTarget.triviaFact}
      </div>
    </div>
  );
}
