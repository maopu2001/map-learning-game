"use client";

import React from "react";
import { DistrictData, DISTRICTS_BY_NAME } from "@/data/bangladesh";
import { Badge } from "@/components/ui/badge";
import { CircleQuestionMark, Compass, Layers } from "lucide-react";
import { MapsLinkButton } from "@/components/Mix/maps";

interface DistrictProfileCardProps {
  district: DistrictData;
  onSelectDistrict: (district: DistrictData) => void;
  onHoverDistrict: (district: DistrictData | null) => void;
}

export function DistrictProfileCard({
  district,
  onSelectDistrict,
  onHoverDistrict,
}: DistrictProfileCardProps) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-2xl space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-border">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-foreground">
            {district.name}
          </h2>
          <p className="text-xs text-bd-primary font-medium">
            {district.division} Division • Bangladesh
          </p>
        </div>
        <Badge
          variant="outline"
          className="border-bd-primary/30 text-bd-primary bg-bd-subtle font-mono text-2xs"
        >
          {district.isCoastal ? "Coastal District" : "Inland District"}
        </Badge>
      </div>

      {/* Spatial Specs */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="p-3 rounded-xl bg-muted/40 border border-border space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-xs flex items-center gap-1">
              <Compass className="size-3 text-accent" /> Coordinates
            </span>
            <MapsLinkButton name={district.name} isDistrict />
          </div>
          <span className="font-mono text-foreground font-semibold block">
            {district.coordinates[0].toFixed(2)}°N,{" "}
            {district.coordinates[1].toFixed(2)}°E
          </span>
        </div>
        <div className="p-3 rounded-xl bg-muted/40 border border-border space-y-1">
          <span className="text-muted-foreground text-xs flex items-center gap-1">
            <Layers className="size-3 text-bd-primary" /> Neighbors
          </span>
          <span className="font-mono text-foreground font-semibold">
            {district.borders.length} Adjacent Districts
          </span>
        </div>
      </div>

      {/* Trivia Fact */}
      <div className="p-3.5 rounded-xl bg-muted/40 border border-border space-y-1 text-xs leading-relaxed">
        <span className="text-accent font-semibold flex items-center gap-1.5">
          <CircleQuestionMark className="size-3.5" /> Did you know?
        </span>
        <p className="text-foreground/90">{district.triviaFact}</p>
      </div>

      {/* Bordering Districts Interactive List */}
      <div className="space-y-2">
        <h3 className="text-xs font-mono font-semibold text-muted-foreground uppercase tracking-wider">
          Bordering Districts (click to jump):
        </h3>
        <div className="flex flex-wrap gap-1.5">
          {district.borders.map((neighborName) => {
            const neighborData = DISTRICTS_BY_NAME.get(
              neighborName.toLowerCase(),
            );
            return (
              <button
                key={neighborName}
                onMouseEnter={() => {
                  if (neighborData) onHoverDistrict(neighborData);
                }}
                onMouseLeave={() => {
                  onHoverDistrict(null);
                }}
                onClick={() => {
                  if (neighborData) {
                    onSelectDistrict(neighborData);
                    onHoverDistrict(null);
                  }
                }}
                className="px-2.5 py-1.5 min-h-[36px] rounded-lg text-xs bg-accent/15 border border-accent/30 text-accent hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer"
              >
                {neighborName} ↗
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
