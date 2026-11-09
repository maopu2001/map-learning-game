"use client";

import React, { useState, useRef, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowRight } from "lucide-react";
import {
  COUNTRIES,
  CountryData,
  COUNTRIES_BY_NAME,
  getEffectiveBorders,
  CONTINENT_CENTERS,
  SUBREGION_CENTERS,
} from "@/data/world";
import {
  WorldMapBase,
  CountryFeatureStyle,
} from "@/components/Map/WorldMapBase";
import { MapHoverPill } from "@/components/Explore/MapHoverPill";
import { CountrySearch } from "@/components/Explore/CountrySearch";
import { CountryProfileCard } from "@/components/Explore/CountryProfileCard";
import {
  ContinentFilterBar,
  getContinentForCountry,
} from "@/components/Explore/RegionFilterBar";
import { ExploreShell } from "@/components/Explore/ExploreShell";
import { ExploreOverlays } from "@/components/Explore/ExploreOverlays";
import { useMapCamera } from "@/hooks/useMapCamera";
import { updateSelectUrl } from "@/hooks/useGameUrlSync";

const DEFAULT_WORLD_COUNTRY =
  COUNTRIES_BY_NAME.get("bangladesh") ||
  COUNTRIES.find((c) => c.id === "BGD") ||
  COUNTRIES[0];

function WorldExploreContent() {
  const searchParams = useSearchParams();
  const selectParam = searchParams.get("select");
  const initialCountry = React.useMemo(() => {
    if (selectParam) {
      const match =
        COUNTRIES.find(
          (c) =>
            c.id.toLowerCase() === selectParam.toLowerCase() ||
            c.name.toLowerCase() === selectParam.toLowerCase() ||
            (c.nameBn && c.nameBn.toLowerCase() === selectParam.toLowerCase()),
        ) ||
        COUNTRIES_BY_NAME.get(selectParam.toLowerCase());
      if (match) return match;
    }
    return DEFAULT_WORLD_COUNTRY;
  }, [selectParam]);

  const [selectedCountry, setSelectedCountry] = useState<CountryData | null>(
    initialCountry,
  );
  const [hoveredCountry, setHoveredCountry] = useState<CountryData | null>(
    null,
  );
  const [continentFilter, setContinentFilter] = useState("All");
  const [subregionFilter, setSubregionFilter] = useState("All");
  const [mobileTab, setMobileTab] = useState<"map" | "info">("map");

  const effectiveBorders = React.useMemo(
    () => (selectedCountry ? getEffectiveBorders(selectedCountry) : []),
    [selectedCountry],
  );

  const initialZoom = React.useMemo(() => {
    if (!selectParam || !initialCountry) return 2.5;
    return initialCountry.area < 10000
      ? 5
      : initialCountry.area < 100000
        ? 4
        : 2.5;
  }, [selectParam, initialCountry]);

  const camera = useMapCamera({
    initialCoordinates: initialCountry
      ? [initialCountry.coordinates[1], initialCountry.coordinates[0]]
      : [0, 20],
    initialZoom,
    resetCoordinates: [0, 20],
    resetZoom: 1,
    maxZoom: 60,
    minZoom: 0.8,
  });
  const { positionRef, flyTo } = camera;

  const selectCountry = (c: CountryData, shouldFly = true) => {
    setSelectedCountry(c);
    const cont = getContinentForCountry(c);
    if (continentFilter !== "All" && cont !== continentFilter) {
      setContinentFilter(cont);
      setSubregionFilter("All");
    } else if (
      subregionFilter !== "All" &&
      c.subregion &&
      c.subregion !== subregionFilter
    ) {
      setSubregionFilter(c.subregion);
    }
    if (shouldFly) {
      const minZoom = c.area < 10000 ? 5 : c.area < 100000 ? 4 : 2.5;
      const targetZoom = Math.max(positionRef.current.zoom, minZoom);
      flyTo([c.coordinates[1], c.coordinates[0]], targetZoom);
    }

    updateSelectUrl(c.id);
  };

  const prevSelectRef = useRef<string | null>(null);

  useEffect(() => {
    if (selectParam && selectParam !== prevSelectRef.current) {
      prevSelectRef.current = selectParam;
      const target =
        COUNTRIES.find(
          (c) =>
            c.id.toLowerCase() === selectParam.toLowerCase() ||
            c.name.toLowerCase() === selectParam.toLowerCase() ||
            (c.nameBn && c.nameBn.toLowerCase() === selectParam.toLowerCase()),
        ) ||
        COUNTRIES_BY_NAME.get(selectParam.toLowerCase());
      if (target) {
        selectCountry(target, true);
      }
    }
  }, [selectParam]);

  const getDynamicCenterAndZoom = (
    countries: CountryData[],
  ): { center: [number, number]; zoom: number } => {
    if (countries.length === 0) return { center: [0, 20], zoom: 1 };
    const lats = countries.map((c) => c.coordinates[0]);
    const lngs = countries.map((c) => c.coordinates[1]);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    const center: [number, number] = [
      (minLng + maxLng) / 2,
      (minLat + maxLat) / 2,
    ];
    const dLng = Math.max(1, maxLng - minLng);
    const dLat = Math.max(1, maxLat - minLat);
    const zoom = Math.max(
      1.4,
      Math.min(5.5, Math.min(360 / dLng, 180 / dLat) * 0.75),
    );
    return { center, zoom: Math.round(zoom * 10) / 10 };
  };

  const handleSelectContinent = (cont: string) => {
    setContinentFilter(cont);
    setSubregionFilter("All");
    setSelectedCountry(null);
    if (cont === "All") {
      flyTo([0, 20], 1);
    } else {
      const target =
        CONTINENT_CENTERS[cont] ||
        getDynamicCenterAndZoom(
          COUNTRIES.filter((c) => getContinentForCountry(c) === cont),
        );
      if (target) {
        flyTo(target.center, target.zoom);
      }
    }
  };

  const handleSelectSubregion = (sub: string) => {
    setSubregionFilter(sub);
    setSelectedCountry(null);
    if (sub === "All") {
      if (continentFilter !== "All") {
        const target =
          CONTINENT_CENTERS[continentFilter] ||
          getDynamicCenterAndZoom(
            COUNTRIES.filter(
              (c) => getContinentForCountry(c) === continentFilter,
            ),
          );
        if (target) {
          flyTo(target.center, target.zoom);
        } else {
          flyTo([0, 20], 1);
        }
      } else {
        flyTo([0, 20], 1);
      }
    } else {
      const target =
        SUBREGION_CENTERS[sub] ||
        getDynamicCenterAndZoom(COUNTRIES.filter((c) => c.subregion === sub));
      if (target) {
        flyTo(target.center, target.zoom);
      }
    }
  };

  const isFilterActive = continentFilter !== "All" || subregionFilter !== "All";

  const matchesFilter = (c: CountryData | null | undefined) => {
    if (!c) return false;
    if (
      continentFilter !== "All" &&
      getContinentForCountry(c) !== continentFilter
    ) {
      return false;
    }
    if (subregionFilter !== "All" && c.subregion !== subregionFilter) {
      return false;
    }
    return true;
  };

  const activeCountry = hoveredCountry || selectedCountry;
  const isHovering = Boolean(
    hoveredCountry && hoveredCountry.id !== selectedCountry?.id,
  );
  const isNeighbor = Boolean(
    hoveredCountry && effectiveBorders.includes(hoveredCountry.id),
  );
  const isHoverInFilterZone = Boolean(
    hoveredCountry &&
    isFilterActive &&
    matchesFilter(hoveredCountry) &&
    hoveredCountry.id !== selectedCountry?.id,
  );

  const strokeWidth = 0.55;

  const getCountryStyle = React.useCallback(
    (country: CountryData | undefined): CountryFeatureStyle => {
      const isSelected = Boolean(
        selectedCountry?.id && country?.id && selectedCountry.id === country.id,
      );
      const isNeighborCountry = Boolean(
        selectedCountry?.id &&
          country?.id &&
          effectiveBorders.includes(country.id),
      );
      const isFilterMatch = isFilterActive && matchesFilter(country);

      let priority = 0;
      let fill = "var(--map-land)";
      let stroke = "var(--map-land-border)";
      let itemStrokeWidth = strokeWidth * 1.1;

      if (isSelected) {
        priority = 3;
        fill = "var(--map-target)";
        stroke = "var(--map-target-stroke)";
        itemStrokeWidth = strokeWidth * 1.6;
      } else if (isNeighborCountry) {
        priority = 2;
        fill = "var(--map-neighbor)";
        stroke = "var(--map-neighbor-stroke)";
        itemStrokeWidth = strokeWidth * 1.35;
      } else if (isFilterActive && isFilterMatch) {
        priority = 1;
        fill = "var(--map-filter)";
        stroke = "var(--map-filter-stroke)";
        itemStrokeWidth = strokeWidth * 1.1;
      } else if (isFilterActive && !isFilterMatch) {
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
        hoverStroke: "var(--map-inspect-stroke)",
        priority,
      };
    },
    [selectedCountry, effectiveBorders, isFilterActive, continentFilter, subregionFilter],
  );

  return (
    <ExploreShell
      selectedTitle={selectedCountry ? selectedCountry.name : "Info"}
      mobileTab={mobileTab}
      onMobileTabChange={setMobileTab}
      filterBar={
        <ContinentFilterBar
          selectedContinent={continentFilter}
          onSelectContinent={handleSelectContinent}
          selectedSubregion={subregionFilter}
          onSelectSubregion={handleSelectSubregion}
        />
      }
      mobileSearch={
        <CountrySearch
          onSelectCountry={selectCountry}
          continentFilter={continentFilter}
          subregionFilter={subregionFilter}
        />
      }
      mapCanvas={
        <WorldMapBase
          camera={camera}
          className="relative w-full flex-1 min-h-0 rounded-2xl overflow-hidden border border-border bg-card/60 shadow-xl flex flex-col items-center justify-center select-none"
          getCountryStyle={getCountryStyle}
          onCountryHover={setHoveredCountry}
          onCountryClick={selectCountry}
          onMouseLeave={() => setHoveredCountry(null)}
          zoomTargetCenter={
            selectedCountry?.coordinates
              ? [
                  selectedCountry.coordinates[1],
                  selectedCountry.coordinates[0],
                ]
              : null
          }
          resetTitle="Recenter World Map"
          renderSvgLayers={({ geographies, resolveCountry, zoom }) => {
            const selectedGeo = selectedCountry
              ? geographies.find(
                  (g) => resolveCountry(g)?.id === selectedCountry.id,
                )
              : null;
            const hoveredGeo = hoveredCountry
              ? geographies.find(
                  (g) => resolveCountry(g)?.id === hoveredCountry.id,
                )
              : null;

            const neighborGeos = geographies.filter((g) => {
              const c = resolveCountry(g);
              return Boolean(
                c?.id &&
                c.id !== selectedCountry?.id &&
                effectiveBorders.includes(c.id),
              );
            });

            const filterMatchGeos = isFilterActive
              ? geographies.filter((g) => {
                  const c = resolveCountry(g);
                  if (
                    !c ||
                    c.id === selectedCountry?.id ||
                    effectiveBorders.includes(c.id)
                  )
                    return false;
                  return matchesFilter(c);
                })
              : [];

            return (
              <ExploreOverlays
                filterMatchGeos={filterMatchGeos}
                neighborGeos={neighborGeos}
                selectedGeo={selectedGeo}
                hoveredGeo={hoveredGeo}
                selectedCoordinates={
                  selectedCountry?.coordinates
                    ? [
                        selectedCountry.coordinates[1],
                        selectedCountry.coordinates[0],
                      ]
                    : null
                }
                hoveredCoordinates={
                  hoveredCountry && hoveredCountry.id !== selectedCountry?.id
                    ? [
                        hoveredCountry.coordinates[1],
                        hoveredCountry.coordinates[0],
                      ]
                    : null
                }
                zoom={zoom}
                strokeWidth={strokeWidth}
                filterFill="var(--map-filter)"
                filterStroke="var(--map-filter-stroke)"
                inspectFill="var(--map-inspect-fill)"
                inspectStroke="var(--map-inspect-stroke)"
              />
            );
          }}
        >
          {/* Top-Left Unified Callout */}
          <div className="hidden lg:block absolute top-3 left-3 sm:top-4 sm:left-4 z-10 pointer-events-none select-none">
            {activeCountry ? (
              <MapHoverPill
                leading={
                  <span className="text-sm sm:text-base leading-none">
                    {activeCountry.flagEmoji}
                  </span>
                }
                title={
                  activeCountry.nameBn
                    ? `${activeCountry.name} (${activeCountry.nameBn})`
                    : activeCountry.name
                }
                subtitle={
                  activeCountry.capital
                    ? `${activeCountry.capital}${activeCountry.capitalBn ? ` (${activeCountry.capitalBn})` : ""}`
                    : `${activeCountry.continent}${activeCountry.continentBn ? ` (${activeCountry.continentBn})` : ""}`
                }
                isHovering={isHovering}
                isNeighbor={Boolean(isHovering && isNeighbor)}
                badgeLabel={
                  isHovering && (isNeighbor || isHoverInFilterZone)
                    ? isNeighbor
                      ? "Neighbor"
                      : subregionFilter !== "All"
                        ? `${hoveredCountry?.subregion}${hoveredCountry?.subregionBn ? ` (${hoveredCountry.subregionBn})` : ""}`
                        : hoveredCountry
                          ? `${getContinentForCountry(hoveredCountry)}${hoveredCountry.continentBn ? ` (${hoveredCountry.continentBn})` : ""}`
                          : undefined
                    : undefined
                }
              />
            ) : isFilterActive ? (
              <MapHoverPill
                title={
                  subregionFilter !== "All"
                    ? subregionFilter
                    : continentFilter
                }
                badgeLabel="Zone Highlighted"
              />
            ) : null}
          </div>

          {/* Legend (Desktop) */}
          <div className="hidden sm:flex absolute bottom-3 left-3 z-10 flex-wrap items-center gap-2 sm:gap-3 bg-card/90 px-3 py-1.5 rounded-xl border border-border text-xs text-muted-foreground backdrop-blur-md">
            <div className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-full bg-[var(--map-target)] border border-[var(--map-target-stroke)]" />
              <span>Selected</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-full bg-[var(--map-neighbor)] border border-[var(--map-neighbor-stroke)]" />
              <span>Neighboring Nations</span>
            </div>
            {isFilterActive && (
              <div className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-full bg-[var(--map-filter)] border border-[var(--map-filter-stroke)]" />
                <span>Filter Match</span>
              </div>
            )}
          </div>
        </WorldMapBase>
      }
      mobileCallout={
        selectedCountry && (
          <div className="lg:hidden shrink-0 p-2.5 rounded-2xl bg-card border border-border flex items-center justify-between text-xs shadow-xl">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-base shrink-0">
                {selectedCountry.flagEmoji}
              </span>
              <div className="truncate">
                <div className="font-bold text-foreground text-xs truncate">
                  {selectedCountry.name}
                  {selectedCountry.nameBn && (
                    <span className="ml-1 text-muted-foreground font-medium">
                      ({selectedCountry.nameBn})
                    </span>
                  )}
                </div>
                <span className="text-2xs text-muted-foreground font-mono">
                  {selectedCountry.capital
                    ? `Capital: ${selectedCountry.capital}${selectedCountry.capitalBn ? ` (${selectedCountry.capitalBn})` : ""} • `
                    : ""}
                  {selectedCountry.continent}
                  {selectedCountry.continentBn
                    ? ` (${selectedCountry.continentBn})`
                    : ""}
                  {selectedCountry.subregion
                    ? ` • ${selectedCountry.subregion}${selectedCountry.subregionBn ? ` (${selectedCountry.subregionBn})` : ""}`
                    : ""}
                </span>
              </div>
            </div>
            <button
              onClick={() => setMobileTab("info")}
              className="px-2.5 py-1.5 rounded-xl bg-accent/15 hover:bg-accent/25 border border-accent/30 text-xs font-semibold text-accent flex items-center gap-1 cursor-pointer shrink-0 ml-2 transition-colors"
            >
              <span>Details</span>
              <ArrowRight className="size-3" />
            </button>
          </div>
        )
      }
      desktopSearch={
        <CountrySearch
          onSelectCountry={selectCountry}
          continentFilter={continentFilter}
          subregionFilter={subregionFilter}
        />
      }
      profileCard={
        <CountryProfileCard
          country={selectedCountry}
          onSelectCountry={selectCountry}
          onHoverCountry={setHoveredCountry}
        />
      }
    />
  );
}

export default function WorldExplorePage() {
  return (
    <Suspense>
      <WorldExploreContent />
    </Suspense>
  );
}
