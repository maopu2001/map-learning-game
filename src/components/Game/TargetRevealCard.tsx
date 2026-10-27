"use client";

import React from "react";
import Link from "next/link";
import { useGameStore } from "@/lib/store";
import { Badge } from "@/components/ui/badge";
import { Users, Maximize2, Compass, CircleQuestionMark, ExternalLink } from "lucide-react";
import { getDistrictMapsUrl, getCountryMapsUrl } from "@/components/Mix/maps";
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
  const triviaLang = useGameStore((s) => s.triviaLang);
  const setTriviaLang = useGameStore((s) => s.setTriviaLang);
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

  const exploreUrl = isBD && targetDistrict
    ? `/explore/bangladesh?select=${encodeURIComponent(targetDistrict.id)}`
    : targetCountry
      ? `/explore/world?select=${encodeURIComponent(targetCountry.id)}`
      : "#";

  const mapsUrl = isBD && targetDistrict
    ? getDistrictMapsUrl(targetDistrict.name)
    : targetCountry
      ? getCountryMapsUrl(targetCountry.name)
      : "#";

  return (
    <div className="rounded-xl border border-border bg-card/60 p-3 space-y-2">
      <div className="flex items-center gap-2.5">
        {!isBD && targetCountry && (
          <span className="text-3xl shrink-0">{targetCountry.flagEmoji}</span>
        )}
        <div className="min-w-0 flex-1">
          <h4 className="text-base font-bold text-foreground flex items-center gap-1.5 flex-wrap">
            <span>{currentTarget.name}</span>
            {currentTarget.nameBn && (
              <span className="text-sm font-semibold text-muted-foreground">
                ({currentTarget.nameBn})
              </span>
            )}
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
          <div className="text-2xs text-muted-foreground">
            {isBD && targetDistrict ? (
              `${targetDistrict.division} ${targetDistrict.divisionBn ? `(${targetDistrict.divisionBn})` : ""} Division`
            ) : targetCountry ? (
              <div className="flex flex-col">
                <span>
                  Capital: {targetCountry.capital}
                  {targetCountry.capitalBn
                    ? ` (${targetCountry.capitalBn})`
                    : ""}
                </span>
                <span>
                  {targetCountry.continent} (
                  {targetCountry.continentBn
                    ? `${targetCountry.continentBn}`
                    : ""}
                  )
                  {targetCountry.subregion &&
                    ` • ${targetCountry.subregion} (${
                      targetCountry.subregionBn
                        ? `${targetCountry.subregionBn}`
                        : ""
                    })`}
                </span>
              </div>
            ) : (
              ""
            )}
          </div>
        </div>
      </div>

      {/* Demographic & Spatial Metrics Row */}
      <div className="grid grid-cols-2 gap-1.5 text-2xs">
        {!isBD && targetCountry ? (
          <>
            <div className="h-8 px-2 py-1 rounded-lg bg-muted/40 border border-border flex items-center justify-between">
              <span className="text-muted-foreground flex items-center gap-1">
                <Users className="size-3 text-accent" /> Population
              </span>
              <span className="font-mono font-semibold text-foreground">
                {targetCountry.population
                  ? targetCountry.population.toLocaleString()
                  : "N/A"}
              </span>
            </div>
            <div className="h-8 px-2 py-1 rounded-lg bg-muted/40 border border-border flex items-center justify-between">
              <span className="text-muted-foreground flex items-center gap-1">
                <Maximize2 className="size-3 text-primary" /> Area
              </span>
              <span className="font-mono font-semibold text-foreground">
                {targetCountry.area
                  ? `${targetCountry.area.toLocaleString()} km²`
                  : "N/A"}
              </span>
            </div>
          </>
        ) : null}

        {/* 2 Action Buttons Side-by-Side (replacing Coordinates) */}
        <div className="grid grid-cols-2 gap-1.5 col-span-2 pt-0.5">
          <Link
            href={exploreUrl}
            className="h-8 px-2.5 rounded-lg border border-border bg-muted/40 hover:bg-muted text-foreground text-2xs font-semibold flex items-center justify-start gap-1.5 transition-all active:scale-[0.98] cursor-pointer shadow-xs"
          >
            <Compass className="size-3.5 text-accent shrink-0" />
            <span className="truncate">Open in Explorer</span>
          </Link>
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="h-8 px-2.5 rounded-lg border border-border bg-muted/40 hover:bg-muted text-foreground text-2xs font-semibold flex items-center justify-start gap-1.5 transition-all active:scale-[0.98] cursor-pointer shadow-xs"
          >
            <ExternalLink className="size-3.5 text-primary shrink-0" />
            <span className="truncate">Open in Maps</span>
          </a>
        </div>
      </div>

      {/* Trivia Fact Row */}
      <div className="p-3 rounded-lg bg-muted/40 border border-border text-xs text-foreground/90 leading-relaxed relative space-y-1.5">
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-1 font-semibold text-accent">
            <CircleQuestionMark className="size-4" />
            Did you know?
          </div>
          {currentTarget.triviaFactBn && (
            <div className="flex items-center bg-background/80 p-0.5 rounded-md border border-border text-3xs font-medium -mt-2 -mr-2">
              <button
                type="button"
                onClick={() => setTriviaLang("en")}
                className={`px-1.5 py-0.5 rounded-sm transition-all ${
                  triviaLang === "en"
                    ? "bg-accent/20 text-accent font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setTriviaLang("bn")}
                className={`px-1.5 py-0.5 rounded-sm transition-all ${
                  triviaLang === "bn"
                    ? "bg-accent/20 text-accent font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                বাং
              </button>
            </div>
          )}
        </div>
        <div className="overflow-y-auto overscroll-contain max-h-38 sm:max-h-42 mask-[linear-gradient(to_bottom,transparent,black_10pt,black_calc(100%-10pt),transparent)] pt-1 pb-1">
          {triviaLang === "bn" && currentTarget.triviaFactBn
            ? currentTarget.triviaFactBn
            : currentTarget.triviaFact}
        </div>
      </div>
    </div>
  );
}
