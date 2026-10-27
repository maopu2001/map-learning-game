"use client";

import React, { useState, useRef, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Header } from "@/components/Header";
import { Map, Info, ArrowRight } from "lucide-react";
import {
  BANGLADESH_DISTRICTS,
  DISTRICTS_BY_NAME,
  DistrictData,
} from "@/data/bangladesh";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from "react-simple-maps";
import { TargetPulseMarker } from "@/components/Map/TargetPulseMarker";
import { MapZoomControls } from "@/components/Map/MapZoomControls";
import { ExploreHeader } from "@/components/Explore/ExploreHeader";
import { DivisionFilterBar } from "@/components/Explore/DivisionFilterBar";
import { DistrictSearch } from "@/components/Explore/DistrictSearch";
import { DistrictProfileCard } from "@/components/Explore/DistrictProfileCard";

const BD_GEO_URL = "/data/bangladesh-districts-topo.json";

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

  const [position, setPosition] = useState<{
    coordinates: [number, number];
    zoom: number;
  }>({
    coordinates: [
      initialDistrict.coordinates[1],
      initialDistrict.coordinates[0],
    ],
    zoom: selectParam ? 3.5 : 2.5,
  });

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<number | null>(null);
  const positionRef = useRef(position);
  positionRef.current = position;

  useEffect(() => {
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, []);

  const flyTo = (targetCoords: [number, number], targetZoom: number) => {
    if (animRef.current) cancelAnimationFrame(animRef.current);
    const startCoords = positionRef.current.coordinates;
    const startZoom = positionRef.current.zoom;
    const startTime = performance.now();
    const duration = 320;

    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      // Smooth ease-out cubic
      const ease = 1 - Math.pow(1 - progress, 3);

      const currentLng =
        startCoords[0] + (targetCoords[0] - startCoords[0]) * ease;
      const currentLat =
        startCoords[1] + (targetCoords[1] - startCoords[1]) * ease;
      const currentZoom = startZoom + (targetZoom - startZoom) * ease;

      setPosition({
        coordinates: [currentLng, currentLat],
        zoom: currentZoom,
      });

      if (progress < 1) {
        animRef.current = requestAnimationFrame(step);
      } else {
        animRef.current = null;
      }
    };

    animRef.current = requestAnimationFrame(step);
  };

  // Prevent browser viewport tab-zooming on trackpad pinch so the map zooms instead
  useEffect(() => {
    const el = mapContainerRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
    };

    const onGesture = (e: Event) => {
      e.preventDefault();
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("gesturestart", onGesture, { passive: false });
    el.addEventListener("gesturechange", onGesture, { passive: false });

    return () => {
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("gesturestart", onGesture);
      el.removeEventListener("gesturechange", onGesture);
    };
  }, []);

  const filterZoomEvent = (event: unknown) => {
    if (animRef.current) {
      cancelAnimationFrame(animRef.current);
      animRef.current = null;
    }
    const e = event as { type?: string; ctrlKey?: boolean; button?: number };
    if (!e || !e.type) return true;

    if (e.type === "wheel") {
      return true;
    }
    if (e.type === "mousedown") {
      return e.button === 0;
    }
    if (e.type.startsWith("touch")) {
      return true;
    }
    return true;
  };

  const handleZoomIn = () => {
    setPosition((pos) => ({ ...pos, zoom: Math.min(pos.zoom * 1.6, 50) }));
  };

  const handleZoomOut = () => {
    setPosition((pos) => ({ ...pos, zoom: Math.max(pos.zoom / 1.6, 0.8) }));
  };

  const handleResetZoom = () => {
    flyTo([90.3563, 23.685], 1);
  };

  const selectDistrict = (dist: DistrictData, shouldFly = true) => {
    setSelectedDistrict(dist);
    if (divisionFilter !== "All" && dist.division !== divisionFilter) {
      setDivisionFilter(dist.division);
    }
    if (shouldFly) {
      const targetZoom = Math.max(positionRef.current.zoom, 3.5);
      flyTo([dist.coordinates[1], dist.coordinates[0]], targetZoom);
    }

    // Synchronize ?select= query param in URL without full page reload
    if (typeof window !== "undefined") {
      try {
        const url = new URL(window.location.href);
        if (url.searchParams.get("select") !== dist.id) {
          url.searchParams.set("select", dist.id);
          window.history.replaceState(window.history.state, "", url.toString());
        }
      } catch {
        // Safe fallback in non-standard environments
      }
    }
  };

  // When ?select= changes (e.g. browser navigation or external link), sync selection & focus
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

  return (
    <div className="h-dvh max-h-dvh w-full overflow-hidden flex flex-col bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      <Header />

      <main className="flex-1 min-h-0 w-full max-w-7xl mx-auto p-2 sm:px-4 sm:py-3 flex flex-col gap-2 overflow-hidden">
        {/* Top Context Subheader (Desktop only to prevent vertical overflow) */}
        <div className="hidden lg:block shrink-0">
          <ExploreHeader
            title="Bangladesh Districts Explorer"
            badgeText="64 Districts • 8 Divisions"
            description="Browse districts, administrative divisions, and neighboring borders at your own pace."
            playHref="/bangladesh"
            playLabel="Play Bangladesh"
            switchHref="/explore/world"
            switchLabel="World Explorer"
            switchShortLabel="World"
            switchEmoji="🌍"
            accentColor="bd"
          />
        </div>

        {/* Mobile Tab Switcher */}
        <div className="lg:hidden flex items-center gap-1.5 p-1 rounded-2xl bg-card border border-border shrink-0 text-xs font-semibold">
          <button
            onClick={() => setMobileTab("map")}
            className={`flex-1 py-1.5 px-3 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
              mobileTab === "map"
                ? "bg-bd-primary text-bd-primary-foreground shadow-md"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Map className="size-3.5" />
            <span>Map</span>
          </button>
          <button
            onClick={() => setMobileTab("info")}
            className={`flex-1 py-1.5 px-3 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
              mobileTab === "info"
                ? "bg-accent text-accent-foreground shadow-md"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Info className="size-3.5" />
            <span className="truncate">
              {selectedDistrict ? selectedDistrict.name : "Info"}
            </span>
          </button>
        </div>

        {/* 2-Column Responsive Layout: Map + Profile Panel */}
        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-2 lg:gap-3 items-stretch overflow-hidden">
          {/* Left Column: Interactive Map Canvas (7 cols on lg, full on mobile when map tab) */}
          <div
            className={`lg:col-span-7 xl:col-span-8 flex flex-col gap-2 h-full min-h-0 overflow-hidden ${
              mobileTab === "map" ? "flex flex-1" : "hidden lg:flex"
            }`}
          >
            {/* Division Filters */}
            <div className="shrink-0">
              <DivisionFilterBar
                selectedDivision={divisionFilter}
                onSelectDivision={handleSelectDivision}
              />
            </div>

            {/* Mobile Search Input pinned directly above map in mobile view */}
            <div className="lg:hidden shrink-0 z-30">
              <DistrictSearch
                onSelectDistrict={selectDistrict}
                divisionFilter={divisionFilter}
              />
            </div>

            {/* Map Container */}
            <div
              ref={mapContainerRef}
              onMouseLeave={() => setHoveredDistrict(null)}
              className="relative w-full flex-1 min-h-0 rounded-2xl overflow-hidden border border-border bg-card shadow-xl flex flex-col items-center justify-center select-none"
            >
              <div className="absolute inset-0 bg-tactical-grid opacity-40 pointer-events-none" />

              {/* Floating Controls */}
              <MapZoomControls
                onZoomIn={handleZoomIn}
                onZoomOut={handleZoomOut}
                onResetZoom={handleResetZoom}
                resetTitle="Recenter Bangladesh"
              />

              {/* Top-Left Unified Callout (Selection + Hover in same overlay) */}
              <div className="hidden lg:block absolute top-3 left-3 sm:top-4 sm:left-4 z-10 pointer-events-none select-none">
                <div
                  className={`flex items-center gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full backdrop-blur-md text-xs transition-all duration-150 ${
                    isHovering
                      ? "bg-card/95 border border-bd-primary/50 text-foreground shadow-2xl ring-1 ring-bd-primary/25"
                      : "bg-card/90 border border-bd-primary/30 text-foreground shadow-lg"
                  }`}
                >
                  <span
                    className={`size-1.5 sm:size-2 rounded-full shrink-0 animate-pulse ${
                      isHovering ? "bg-accent" : "bg-bd-primary"
                    }`}
                  />
                  <span className="font-bold text-foreground text-2xs sm:text-xs">
                    {activeDistrict.name}
                    {activeDistrict.nameBn && (
                      <span className="ml-1 text-muted-foreground font-medium">
                        ({activeDistrict.nameBn})
                      </span>
                    )}
                  </span>
                  {isHovering && (isNeighbor || isHoverInDivision) && (
                    <span className="text-3xs font-mono uppercase px-1.5 py-0.5 rounded-md bg-bd-subtle text-bd-primary border border-bd-subtle-border">
                      {isNeighbor
                        ? "Neighbor"
                        : `${hoveredDistrict?.division}${hoveredDistrict?.divisionBn ? ` (${hoveredDistrict.divisionBn})` : ""} Div`}
                    </span>
                  )}
                </div>
              </div>

              {/* SVG Map Canvas */}
              <ComposableMap
                width={960}
                height={580}
                projection="geoMercator"
                projectionConfig={{
                  scale: 4320,
                  center: [90.3563, 23.685],
                }}
                className="w-full h-full cursor-grab active:cursor-grabbing outline-none touch-none"
                style={{
                  touchAction: "none",
                  shapeRendering: "geometricPrecision",
                }}
              >
                <ZoomableGroup
                  zoom={position.zoom}
                  center={position.coordinates}
                  filterZoomEvent={filterZoomEvent}
                  onMoveEnd={(pos) => {
                    if (animRef.current) {
                      cancelAnimationFrame(animRef.current);
                      animRef.current = null;
                    }
                    setPosition(pos);
                  }}
                  maxZoom={50}
                  minZoom={0.8}
                >
                  <Geographies geography={BD_GEO_URL}>
                    {({ geographies }) => {
                      const strokeWidth = 0.65;
                      const isDivisionActive = divisionFilter !== "All";

                      const selectedGeo = selectedDistrict
                        ? geographies.find(
                            (g) =>
                              g.properties?.shapeName === selectedDistrict.name,
                          )
                        : null;
                      const hoveredGeo = hoveredDistrict
                        ? geographies.find(
                            (g) =>
                              g.properties?.shapeName === hoveredDistrict.name,
                          )
                        : null;

                      // Neighbors of the selected district
                      const neighborGeos = geographies.filter((g) => {
                        const sName = (g.properties?.shapeName as string) || "";
                        return Boolean(
                          sName &&
                          sName !== selectedDistrict?.name &&
                          selectedDistrict?.borders.includes(sName),
                        );
                      });

                      // Districts matching active division filter (excluding selected and neighbors)
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
                            const d = DISTRICTS_BY_NAME.get(
                              sName.toLowerCase(),
                            );
                            return d?.division === divisionFilter;
                          })
                        : [];

                      const styledGeographies = geographies
                        .map((geo) => {
                          const districtName =
                            (geo.properties?.shapeName as string) || "";
                          if (!districtName) return null;
                          const district = DISTRICTS_BY_NAME.get(
                            districtName.toLowerCase(),
                          );
                          const isSelected =
                            selectedDistrict?.name === districtName;
                          const isNeighbor = Boolean(
                            selectedDistrict?.name &&
                            selectedDistrict.borders.includes(districtName),
                          );
                          const isInDivision =
                            isDivisionActive &&
                            district?.division === divisionFilter;

                          let priority = 0;
                          let fill = "var(--map-land)";
                          let stroke = "var(--map-land-border)";
                          let itemStrokeWidth = strokeWidth * 0.9;

                          if (isSelected) {
                            priority = 3;
                            fill = "var(--map-target)";
                            stroke = "var(--map-target-stroke)";
                            itemStrokeWidth = strokeWidth * 1.6;
                          } else if (isNeighbor) {
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
                            geo,
                            district,
                            priority,
                            fill,
                            stroke,
                            itemStrokeWidth,
                          };
                        })
                        .filter(
                          (item): item is NonNullable<typeof item> =>
                            item !== null,
                        )
                        .sort((a, b) => a.priority - b.priority);

                      return (
                        <>
                          {styledGeographies.map(
                            ({
                              geo,
                              district,
                              fill,
                              stroke,
                              itemStrokeWidth,
                            }) => (
                              <Geography
                                key={geo.rsmKey}
                                geography={geo}
                                onMouseEnter={() => {
                                  if (district) setHoveredDistrict(district);
                                }}
                                onMouseLeave={() => {
                                  setHoveredDistrict(null);
                                }}
                                onClick={() => {
                                  if (district) selectDistrict(district);
                                }}
                                style={{
                                  default: {
                                    fill,
                                    stroke,
                                    strokeWidth: itemStrokeWidth,
                                    strokeLinejoin: "round",
                                    strokeLinecap: "round",
                                    vectorEffect: "non-scaling-stroke",
                                    outline: "none",
                                    transition:
                                      "fill 200ms ease, stroke 200ms ease",
                                  },
                                  hover: {
                                    fill: "var(--map-land-hover)",
                                    stroke: "var(--map-inspect-stroke-bd)",
                                    strokeWidth: strokeWidth * 1.6,
                                    strokeLinejoin: "round",
                                    strokeLinecap: "round",
                                    vectorEffect: "non-scaling-stroke",
                                    outline: "none",
                                    cursor: "pointer",
                                  },
                                  pressed: {
                                    fill: "var(--map-land-hover)",
                                    outline: "none",
                                  },
                                }}
                              />
                            ),
                          )}

                          {/* Overlay 1: Division filter matches */}
                          {filterMatchGeos.map((geo) => (
                            <Geography
                              key={`overlay-explore-filter-${geo.rsmKey}`}
                              geography={geo}
                              style={{
                                default: {
                                  fill: "var(--map-filter-bd)",
                                  fillOpacity: 0.2,
                                  stroke: "var(--map-filter-stroke-bd)",
                                  strokeWidth: strokeWidth * 1.1,
                                  strokeLinejoin: "round",
                                  strokeLinecap: "round",
                                  vectorEffect: "non-scaling-stroke",
                                  pointerEvents: "none",
                                },
                                hover: {
                                  fill: "var(--map-filter-bd)",
                                  fillOpacity: 0.2,
                                  stroke: "var(--map-filter-stroke-bd)",
                                  strokeWidth: strokeWidth * 1.1,
                                  vectorEffect: "non-scaling-stroke",
                                  pointerEvents: "none",
                                },
                              }}
                            />
                          ))}

                          {/* Overlay 2: Neighboring districts */}
                          {neighborGeos.map((geo) => (
                            <Geography
                              key={`overlay-explore-neighbor-${geo.rsmKey}`}
                              geography={geo}
                              style={{
                                default: {
                                  fill: "var(--map-neighbor)",
                                  fillOpacity: 0.22,
                                  stroke: "var(--map-neighbor-stroke)",
                                  strokeWidth: strokeWidth * 1.35,
                                  strokeLinejoin: "round",
                                  strokeLinecap: "round",
                                  vectorEffect: "non-scaling-stroke",
                                  pointerEvents: "none",
                                },
                                hover: {
                                  fill: "var(--map-neighbor)",
                                  fillOpacity: 0.22,
                                  stroke: "var(--map-neighbor-stroke)",
                                  strokeWidth: strokeWidth * 1.35,
                                  vectorEffect: "non-scaling-stroke",
                                  pointerEvents: "none",
                                },
                              }}
                            />
                          ))}

                          {/* Overlay 3: Selected district */}
                          {selectedGeo && (
                            <Geography
                              key={`overlay-explore-sel-${selectedGeo.rsmKey}`}
                              geography={selectedGeo}
                              style={{
                                default: {
                                  fill: "var(--map-target)",
                                  fillOpacity: 0.24,
                                  stroke: "var(--map-target-stroke)",
                                  strokeWidth: strokeWidth * 1.6,
                                  strokeLinejoin: "round",
                                  strokeLinecap: "round",
                                  vectorEffect: "non-scaling-stroke",
                                  pointerEvents: "none",
                                },
                                hover: {
                                  fill: "var(--map-target)",
                                  fillOpacity: 0.24,
                                  stroke: "var(--map-target-stroke)",
                                  strokeWidth: strokeWidth * 1.6,
                                  vectorEffect: "non-scaling-stroke",
                                  pointerEvents: "none",
                                },
                              }}
                            />
                          )}

                          {/* Overlay 4: Hovered district */}
                          {hoveredGeo && hoveredGeo !== selectedGeo && (
                            <Geography
                              key={`overlay-explore-hover-${hoveredGeo.rsmKey}`}
                              geography={hoveredGeo}
                              style={{
                                default: {
                                  fill: "var(--map-inspect-fill-bd)",
                                  stroke: "var(--map-inspect-stroke-bd)",
                                  strokeWidth: strokeWidth * 1.6,
                                  strokeLinejoin: "round",
                                  strokeLinecap: "round",
                                  vectorEffect: "non-scaling-stroke",
                                  pointerEvents: "none",
                                },
                                hover: {
                                  fill: "var(--map-inspect-fill-bd)",
                                  stroke: "var(--map-inspect-stroke-bd)",
                                  strokeWidth: strokeWidth * 1.6,
                                  vectorEffect: "non-scaling-stroke",
                                  pointerEvents: "none",
                                },
                              }}
                            />
                          )}
                        </>
                      );
                    }}
                  </Geographies>

                  {/* Marker on selected district */}
                  {selectedDistrict && (
                    <TargetPulseMarker
                      coordinates={[
                        selectedDistrict.coordinates[1],
                        selectedDistrict.coordinates[0],
                      ]}
                      zoom={position.zoom}
                      fillColor="var(--map-target)"
                    />
                  )}

                  {/* Marker on hovered district */}
                  {hoveredDistrict &&
                    hoveredDistrict.name !== selectedDistrict.name && (
                      <TargetPulseMarker
                        coordinates={[
                          hoveredDistrict.coordinates[1],
                          hoveredDistrict.coordinates[0],
                        ]}
                        zoom={position.zoom}
                        fillColor="var(--map-neighbor-stroke)"
                      />
                    )}
                </ZoomableGroup>
              </ComposableMap>

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
            </div>

            {/* Mobile Selection Callout on Map view */}
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
          </div>

          {/* Right Column: Search Box & District Profile (5 cols on lg, full on mobile when info tab) */}
          <div
            className={`lg:col-span-5 xl:col-span-4 h-full min-h-0 flex flex-col gap-2 overflow-hidden ${
              mobileTab === "info" ? "flex flex-1" : "hidden lg:flex"
            }`}
          >
            {/* Pinned Search Box (never scrolls) */}
            <div className="shrink-0 z-30">
              <DistrictSearch
                onSelectDistrict={selectDistrict}
                divisionFilter={divisionFilter}
              />
            </div>

            {/* ONLY this container scrolls like in game mode */}
            <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain pr-1">
              <DistrictProfileCard
                district={selectedDistrict}
                onSelectDistrict={selectDistrict}
                onHoverDistrict={setHoveredDistrict}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function BangladeshExplorePage() {
  return (
    <Suspense>
      <BangladeshExploreContent />
    </Suspense>
  );
}
