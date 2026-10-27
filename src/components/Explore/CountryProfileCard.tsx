"use client";

import React, { useState } from "react";
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
import { MapsLinkButton } from "@/components/Mix/maps";

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
  const [lang, setLang] = useState<"en" | "bn">("en");

  if (!country) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 shadow-2xl flex flex-col items-center justify-center text-center space-y-3 min-h-[280px]">
        <div className="size-12 rounded-2xl bg-muted border border-border flex items-center justify-center text-muted-foreground">
          <Compass className="size-6 text-accent animate-pulse" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-bold text-foreground">
            No Country Selected
          </h3>
          <p className="text-xs text-muted-foreground max-w-xs">
            Click any highlighted country on the map or search above to view
            detailed tactical recon.
          </p>
        </div>
      </div>
    );
  }

  const effectiveBorders = getEffectiveBorders(country);

  return (
    <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-2xl space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-border">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{country.flagEmoji}</span>
          <div>
            <div className="flex items-baseline gap-2 flex-wrap">
              <h2 className="text-xl sm:text-2xl font-black text-foreground">
                {country.name}
              </h2>
              {country.nameBn && (
                <span className="text-base sm:text-lg font-bold text-muted-foreground">
                  ({country.nameBn})
                </span>
              )}
            </div>
            {country.officialName && country.officialName !== country.name && (
              <p className="text-2xs text-muted-foreground italic truncate max-w-[220px]">
                {country.officialName}
              </p>
            )}
            <p className="text-xs text-accent font-medium">
              {lang === "bn" && country.continentBn
                ? country.continentBn
                : country.continent}
              {country.subregion
                ? ` • ${
                    lang === "bn" && country.subregionBn
                      ? country.subregionBn
                      : country.subregion
                  }`
                : ""}
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <Badge
            variant="outline"
            className="border-accent/30 text-accent font-mono text-2xs"
          >
            {country.id}
          </Badge>
          {country.isIsland && (
            <Badge
              variant="outline"
              className="border-primary/30 text-primary font-sans text-2xs"
            >
              Island Nation
            </Badge>
          )}
        </div>
      </div>

      {/* Specs */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="p-3 rounded-xl bg-muted/40 border border-border space-y-1">
          <span className="text-muted-foreground text-xs flex items-center gap-1">
            <MapPin className="size-3 text-primary" /> Capital City
          </span>
          <span className="font-semibold text-foreground">
            {country.capital
              ? `${country.capital}${country.capitalBn ? ` (${country.capitalBn})` : ""}`
              : "N/A"}
          </span>
        </div>
        <div className="p-3 rounded-xl bg-muted/40 border border-border space-y-1">
          <span className="text-muted-foreground text-xs flex items-center gap-1">
            <Users className="size-3 text-accent" /> Population
          </span>
          <span className="font-semibold font-mono text-foreground">
            {country.population ? country.population.toLocaleString() : "N/A"}
          </span>
        </div>
        <div className="p-3 rounded-xl bg-muted/40 border border-border space-y-1">
          <span className="text-muted-foreground text-xs flex items-center gap-1">
            <Maximize2 className="size-3 text-accent" /> Surface Area
          </span>
          <span className="font-semibold font-mono text-foreground">
            {country.area ? `${country.area.toLocaleString()} km²` : "N/A"}
          </span>
        </div>
        <div className="p-3 rounded-xl bg-muted/40 border border-border space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-xs flex items-center gap-1">
              <Compass className="size-3 text-primary" /> Coordinates
            </span>
            <MapsLinkButton
              name={country.name}
              className="hover:bg-primary/15 hover:text-primary"
            />
          </div>
          <span className="font-semibold font-mono text-foreground block">
            {Math.abs(country.coordinates[0]).toFixed(1)}°
            {country.coordinates[0] >= 0 ? "N" : "S"},{" "}
            {Math.abs(country.coordinates[1]).toFixed(1)}°
            {country.coordinates[1] >= 0 ? "E" : "W"}
          </span>
        </div>
      </div>

      {/* Trivia */}
      <div className="p-3.5 rounded-xl bg-muted/40 border border-border space-y-1.5 text-xs leading-relaxed">
        <div className="flex items-center justify-between">
          <span className="text-accent font-semibold flex items-center gap-1.5">
            <CircleQuestionMark className="size-3.5" /> Did you know?
          </span>
          {country.triviaFactBn && (
            <div className="flex items-center bg-background p-0.5 rounded-md border border-border text-3xs font-medium">
              <button
                type="button"
                onClick={() => setLang("en")}
                className={`px-1.5 py-0.5 rounded-sm transition-all ${
                  lang === "en"
                    ? "bg-accent/20 text-accent font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLang("bn")}
                className={`px-1.5 py-0.5 rounded-sm transition-all ${
                  lang === "bn"
                    ? "bg-accent/20 text-accent font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                বাং
              </button>
            </div>
          )}
        </div>
        <p className="text-foreground/90">
          {lang === "bn" && country.triviaFactBn
            ? country.triviaFactBn
            : country.triviaFact}
        </p>
      </div>

      {/* Neighbors */}
      <div className="space-y-2">
        <h3 className="text-xs font-mono font-semibold text-muted-foreground uppercase tracking-wider">
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
                className="px-2.5 py-1.5 min-h-[36px] rounded-lg text-xs bg-accent/15 border border-accent/30 text-accent hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer"
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
