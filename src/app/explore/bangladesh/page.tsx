"use client";

import React, { useState, useRef, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowRight } from "lucide-react";
import {
  BANGLADESH_DISTRICTS,
  DISTRICTS_BY_NAME,
  DistrictData,
} from "@/data/bangladesh";
import {
  BangladeshMapBase,
  DistrictFeatureStyle,
} from "@/components/Map/BangladeshMapBase";
import { MapHoverPill } from "@/components/Explore/MapHoverPill";
import { DivisionFilterBar } from "@/components/Explore/DivisionFilterBar";
import { DistrictSearch } from "@/components/Explore/DistrictSearch";
import { DistrictProfileCard } from "@/components/Explore/DistrictProfileCard";
import { ExploreShell } from "@/components/Explore/ExploreShell";
import { ExploreOverlays } from "@/components/Explore/ExploreOverlays";
import { useMapCamera } from "@/hooks/useMapCamera";
import { updateSelectUrl } from "@/hooks/useGameUrlSync";

const DEFAULT_DISTRICT =
  DISTRICTS_BY_NAME.get("dhaka") || BANGLADESH_DISTRICTS[0];

function BangladeshExploreContent() {
  const searchParams = useSearchParams();
  const selectParam = searchParams.get("select");
  const initialDistrict = React.useMemo(() => {
    if (selectParam) {
      const match =
        DISTRICTS_BY_NAME.get(selectParam.toLowerCase()) ||
        BANGLADESH_DISTRICTS.find(
          (d) =>
            d.id.toLowerCase() === selectParam.toLowerCase() ||
            d.name.toLowerCase() === selectParam.toLowerCase(),
        );
      if (match) return match;
    }
    return DEFAULT_DISTRICT;
  }, [selectParam]);

  const [selectedDistrict, setSelectedDistrict] =
    useState<DistrictData>(initialDistrict);
  const [hoveredDistrict, setHoveredDistrict] = useState<DistrictData | null>(
    null,
  );
  const [divisionFilter, setDivisionFilter] = useState("All");
  const isDivisionActive = divisionFilter !== "All";
  const [mobileTab, setMobileTab] = useState<"map" | "info">("map");

  const camera = useMapCamera({
    initialCoordinates: [
      initialDistrict.coordinates[1],
      initialDistrict.coordinates[0],
    ],
    initialZoom: selectParam ? 3.5 : 2.5,
    resetCoordinates: [90.3563, 23.685],
    resetZoom: 1,
    maxZoom: 50,
    minZoom: 0.8,
  });
  const { positionRef, flyTo } = camera;

  const selectDistrict = (dist: DistrictData, shouldFly = true) => {
    setSelectedDistrict(dist);
    if (divisionFilter !== "All" && dist.division !== divisionFilter) {
      setDivisionFilter(dist.division);
    }
    if (shouldFly) {
      const targetZoom = Math.max(positionRef.current.zoom, 3.5);
      flyTo([dist.coordinates[1], dist.coordinates[0]], targetZoom);
    }

    updateSelectUrl(dist.id);
  };

  const prevSelectRef = useRef<string | null>(null);

  useEffect(() => {
    if (selectParam && selectParam !== prevSelectRef.current) {
      prevSelectRef.current = selectParam;
      const target =
        DISTRICTS_BY_NAME.get(selectParam.toLowerCase()) ||
        BANGLADESH_DISTRICTS.find(
          (d) =>
            d.id.toLowerCase() === selectParam.toLowerCase() ||
            d.name.toLowerCase() === selectParam.toLowerCase(),
        );
      if (target) {
        selectDistrict(target, true);
      }
    }
  }, [selectParam]);

  const handleSelectDivision = (division: string) => {
    setDivisionFilter(division);
    if (division === "All") {
      flyTo([90.3563, 23.685], 1);
    } else {
      const divisionDistrict = DISTRICTS_BY_NAME.get(division.toLowerCase());
      if (divisionDistrict) {
        setSelectedDistrict(divisionDistrict);
        flyTo(
          [divisionDistrict.coordinates[1], divisionDistrict.coordinates[0]],
          2.6,
        );
      }
    }
  };

  const activeDistrict = hoveredDistrict || selectedDistrict;
  const isHovering = Boolean(
    hoveredDistrict && hoveredDistrict.name !== selectedDistrict.name,
  );
  const isNeighbor = Boolean(
    hoveredDistrict && selectedDistrict.borders.includes(hoveredDistrict.name),
  );
  const isHoverInDivision = Boolean(
    hoveredDistrict &&
    divisionFilter !== "All" &&
    hoveredDistrict.division === divisionFilter &&
    hoveredDistrict.name !== selectedDistrict.name,
  );

  const strokeWidth = 0.65;

  const getDistrictStyle = React.useCallback(
    (district: DistrictData | undefined): DistrictFeatureStyle => {
      const districtName = district?.name;
      const isSelected = selectedDistrict?.name === districtName;
      const isNeighborDistrict = Boolean(
        selectedDistrict?.name &&
          districtName &&
          selectedDistrict.borders.includes(districtName),
      );
      const isInDivision =
        isDivisionActive && district?.division === divisionFilter;

      let priority = 0;
      let fill = "var(--map-land)";
      let stroke = "var(--map-land-border)";
      let itemStrokeWidth = strokeWidth * 1.1;

      if (isSelected) {
        priority = 3;
        fill = "var(--map-target)";
        stroke = "var(--map-target-stroke)";
        itemStrokeWidth = strokeWidth * 1.6;
      } else if (isNeighborDistrict) {
        priority = 2;
        fill = "var(--map-neighbor)";
        stroke = "var(--map-neighbor-stroke)";
        itemStrokeWidth = strokeWidth * 1.35;
      } else if (isDivisionActive && isInDivision) {
        priority = 1;
        fill = "var(--map-filter-bd)";
        stroke = "var(--map-filter-stroke-bd)";
        itemStrokeWidth = strokeWidth * 1.1;
      } else if (isDivisionActive && !isInDivision) {
        priority = -1;
        fill = "var(--map-sea)";
        stroke = "var(--border)";
        itemStrokeWidth = strokeWidth * 0.8;
      }

      return {
        fill,
        stroke,
        strokeWidth: itemStrokeWidth,
        hoverFill: "var(--map-land-hover)",
        hoverStroke: "var(--map-inspect-stroke-bd)",
        priority,
      };
    },
    [selectedDistrict, divisionFilter, isDivisionActive],
  );

  return (
    <ExploreShell
      selectedTitle={selectedDistrict ? selectedDistrict.name : "Info"}
      mobileTabMapClass="bg-bd-primary text-bd-primary-foreground shadow-md"
      mobileTabInfoClass="bg-accent text-accent-foreground shadow-md"
      mobileTab={mobileTab}
      onMobileTabChange={setMobileTab}
      filterBar={
        <DivisionFilterBar
          selectedDivision={divisionFilter}
          onSelectDivision={handleSelectDivision}
        />
      }
      mobileSearch={
        <DistrictSearch
          onSelectDistrict={selectDistrict}
          divisionFilter={divisionFilter}
        />
      }
      mapCanvas={
        <BangladeshMapBase
          camera={camera}
          className="relative w-full flex-1 min-h-0 rounded-2xl overflow-hidden border border-border bg-card/60 shadow-xl flex flex-col items-center justify-center select-none"
          getDistrictStyle={getDistrictStyle}
          onDistrictHover={setHoveredDistrict}
          onDistrictClick={selectDistrict}
          onMouseLeave={() => setHoveredDistrict(null)}
          zoomTargetCenter={
            selectedDistrict?.coordinates
              ? [
                  selectedDistrict.coordinates[1],
                  selectedDistrict.coordinates[0],
                ]
              : null
          }
          resetTitle="Recenter Bangladesh"
          renderSvgLayers={({ geographies, resolveDistrict, zoom }) => {
            const selectedGeo = selectedDistrict
              ? geographies.find(
                  (g) =>
                    resolveDistrict(g)?.name === selectedDistrict.name,
                )
              : null;
            const hoveredGeo = hoveredDistrict
              ? geographies.find(
                  (g) =>
                    resolveDistrict(g)?.name === hoveredDistrict.name,
                )
              : null;

            const neighborGeos = geographies.filter((g) => {
              const sName = (g.properties?.shapeName as string) || "";
              return Boolean(
                sName &&
                sName !== selectedDistrict?.name &&
                selectedDistrict?.borders.includes(sName),
              );
            });

            const filterMatchGeos = isDivisionActive
              ? geographies.filter((g) => {
                  const sName =
                    (g.properties?.shapeName as string) || "";
                  if (
                    !sName ||
                    sName === selectedDistrict?.name ||
                    selectedDistrict?.borders.includes(sName)
                  ) {
                    return false;
                  }
                  const d = resolveDistrict(g);
                  return d?.division === divisionFilter;
                })
              : [];

            return (
              <ExploreOverlays
                filterMatchGeos={filterMatchGeos}
                neighborGeos={neighborGeos}
                selectedGeo={selectedGeo}
                hoveredGeo={hoveredGeo}
                selectedCoordinates={
                  selectedDistrict?.coordinates
                    ? [
                        selectedDistrict.coordinates[1],
                        selectedDistrict.coordinates[0],
                      ]
                    : null
                }
                hoveredCoordinates={
                  hoveredDistrict &&
                  hoveredDistrict.name !== selectedDistrict.name
                    ? [
                        hoveredDistrict.coordinates[1],
                        hoveredDistrict.coordinates[0],
                      ]
                    : null
                }
                zoom={zoom}
                strokeWidth={strokeWidth}
                filterFill="var(--map-filter-bd)"
                filterStroke="var(--map-filter-stroke-bd)"
                inspectFill="var(--map-inspect-fill-bd)"
                inspectStroke="var(--map-inspect-stroke-bd)"
              />
            );
          }}
        >
          {/* Top-Left Unified Callout */}
          <div className="hidden lg:block absolute top-3 left-3 sm:top-4 sm:left-4 z-10 pointer-events-none select-none">
            <MapHoverPill
              title={
                activeDistrict.nameBn
                  ? `${activeDistrict.name} (${activeDistrict.nameBn})`
                  : activeDistrict.name
              }
              isHovering={isHovering}
              isNeighbor={Boolean(isHovering && isNeighbor)}
              badgeLabel={
                isHovering && (isNeighbor || isHoverInDivision)
                  ? isNeighbor
                    ? "Neighbor"
                    : `${hoveredDistrict?.division}${hoveredDistrict?.divisionBn ? ` (${hoveredDistrict.divisionBn})` : ""} Div`
                  : undefined
              }
            />
          </div>

          {/* Legend (Desktop) */}
          <div className="hidden sm:flex absolute bottom-3 left-3 z-10 flex-wrap items-center gap-2 sm:gap-3 bg-card/90 px-3 py-1.5 rounded-xl border border-border text-xs text-muted-foreground backdrop-blur-md">
            <div className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-full bg-[var(--map-target)] border border-[var(--map-target-stroke)]" />
              <span>Selected</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-full bg-[var(--map-neighbor)] border border-[var(--map-neighbor-stroke)]" />
              <span>Neighboring Districts</span>
            </div>
            {isDivisionActive && (
              <div className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-full bg-[var(--map-filter-bd)] border border-[var(--map-filter-stroke-bd)]" />
                <span>Division Match</span>
              </div>
            )}
          </div>
        </BangladeshMapBase>
      }
      mobileCallout={
        <div className="lg:hidden shrink-0 p-2.5 rounded-2xl bg-card border border-border flex items-center justify-between text-xs shadow-xl">
          <div className="flex items-center gap-2 min-w-0">
            <span className="size-2 rounded-full bg-[var(--map-target)] animate-pulse shrink-0" />
            <div className="truncate">
              <div className="font-bold text-foreground text-xs truncate">
                {selectedDistrict.name}
                {selectedDistrict.nameBn && (
                  <span className="ml-1 text-muted-foreground font-medium">
                    ({selectedDistrict.nameBn})
                  </span>
                )}
              </div>
              <span className="text-2xs text-muted-foreground font-mono">
                {selectedDistrict.division}
                {selectedDistrict.divisionBn
                  ? ` (${selectedDistrict.divisionBn})`
                  : ""}{" "}
                Division • {selectedDistrict.borders.length} neighbors
              </span>
            </div>
          </div>
          <button
            onClick={() => setMobileTab("info")}
            className="px-2.5 py-1.5 rounded-xl bg-bd-subtle hover:bg-bd-subtle/80 border border-bd-subtle-border text-xs font-semibold text-bd-primary flex items-center gap-1 cursor-pointer shrink-0 ml-2 transition-colors"
          >
            <span>Details</span>
            <ArrowRight className="size-3" />
          </button>
        </div>
      }
      desktopSearch={
        <DistrictSearch
          onSelectDistrict={selectDistrict}
          divisionFilter={divisionFilter}
        />
      }
      profileCard={
        <DistrictProfileCard
          district={selectedDistrict}
          onSelectDistrict={selectDistrict}
          onHoverDistrict={setHoveredDistrict}
        />
      }
    />
  );
}

export default function BangladeshExplorePage() {
  return (
    <Suspense>
      <BangladeshExploreContent />
    </Suspense>
  );
}
