"use client";

import React, { useState, useRef, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
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
import { MapHoverPill } from "@/components/Explore/MapHoverPill";
import { DistrictSearch } from "@/components/Explore/DistrictSearch";
import { DistrictProfileCard } from "@/components/Explore/DistrictProfileCard";

const BD_GEO_URL = "/data/bangladesh-districts-geo.json";

const DEFAULT_DISTRICT =
  DISTRICTS_BY_NAME.get("dhaka") || BANGLADESH_DISTRICTS[0];

export default function BangladeshExplorePage() {
  const [selectedDistrict, setSelectedDistrict] =
    useState<DistrictData>(DEFAULT_DISTRICT);
  const [hoveredDistrict, setHoveredDistrict] = useState<DistrictData | null>(
    null,
  );
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(
    null,
  );
  const [divisionFilter, setDivisionFilter] = useState("All");
  const [mobileTab, setMobileTab] = useState<"map" | "info">("map");

  const [position, setPosition] = useState<{
    coordinates: [number, number];
    zoom: number;
  }>({
    coordinates: [
      DEFAULT_DISTRICT.coordinates[1],
      DEFAULT_DISTRICT.coordinates[0],
    ],
    zoom: 2.5,
  });

  const mapContainerRef = useRef<HTMLDivElement>(null);

  // Prevent browser viewport tab-zooming on trackpad pinch so the map zooms instead
  useEffect(() => {
    const el = mapContainerRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey) {
        e.preventDefault();
      }
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
    const e = event as { type?: string; ctrlKey?: boolean; button?: number };
    if (!e || !e.type) return true;

    if (e.type === "wheel") {
      return Boolean(e.ctrlKey);
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
    setPosition((pos) => ({ ...pos, zoom: Math.min(pos.zoom * 1.5, 8) }));
  };

  const handleZoomOut = () => {
    setPosition((pos) => ({ ...pos, zoom: Math.max(pos.zoom / 1.5, 0.8) }));
  };

  const handleResetZoom = () => {
    setPosition({ coordinates: [90.3563, 23.685], zoom: 1 });
  };

  const selectDistrict = (dist: DistrictData) => {
    setSelectedDistrict(dist);
    setPosition({
      coordinates: [dist.coordinates[1], dist.coordinates[0]],
      zoom: 3.5,
    });
  };

  return (
    <div className="h-dvh max-h-dvh w-full overflow-hidden flex flex-col bg-[#070a12] text-slate-100 selection:bg-emerald-500 selection:text-white lg:h-auto lg:max-h-none lg:min-h-screen lg:overflow-visible">
      <Header />

      <main className="flex-1 min-h-0 w-full max-w-7xl mx-auto p-2 sm:px-4 sm:py-4 flex flex-col gap-2 sm:space-y-4 overflow-hidden lg:overflow-visible">
        {/* Top Context Subheader (Desktop only to prevent mobile vertical overflow) */}
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
            accentColor="emerald"
          />
        </div>

        {/* Mobile Tab Switcher */}
        <div className="lg:hidden flex items-center gap-1.5 p-1 rounded-2xl bg-[#0c101c] border border-white/10 shrink-0 text-xs font-semibold">
          <button
            onClick={() => setMobileTab("map")}
            className={`flex-1 py-1.5 px-3 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
              mobileTab === "map"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-950/60"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Map className="size-3.5" />
            <span>Map</span>
          </button>
          <button
            onClick={() => setMobileTab("info")}
            className={`flex-1 py-1.5 px-3 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
              mobileTab === "info"
                ? "bg-sky-600 text-white shadow-md shadow-sky-950/60"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Info className="size-3.5" />
            <span className="truncate">
              {selectedDistrict ? selectedDistrict.name : "Info"}
            </span>
          </button>
        </div>

        {/* 2-Column Responsive Layout: Map + Profile Panel */}
        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-2 lg:gap-4 items-stretch lg:items-start overflow-hidden lg:overflow-visible">
          {/* Left Column: Interactive Map Canvas (7 cols on lg, full on mobile when map tab) */}
          <div
            className={`lg:col-span-7 flex flex-col gap-2 h-full min-h-0 ${
              mobileTab === "map" ? "flex flex-1" : "hidden lg:flex"
            }`}
          >
            {/* Division Filters */}
            <div className="shrink-0">
              <DivisionFilterBar
                selectedDivision={divisionFilter}
                onSelectDivision={setDivisionFilter}
              />
            </div>

            {/* Map Container */}
            <div
              ref={mapContainerRef}
              onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                setMousePos({
                  x: e.clientX - rect.left,
                  y: e.clientY - rect.top,
                });
              }}
              onMouseLeave={() => {
                setMousePos(null);
                setHoveredDistrict(null);
              }}
              className="relative w-full flex-1 min-h-0 lg:h-[calc(100vh-250px)] lg:min-h-[460px] rounded-2xl overflow-hidden border border-white/10 bg-[#090d16] shadow-2xl flex flex-col items-center justify-center select-none"
            >
              <div className="absolute inset-0 bg-tactical-grid opacity-40 pointer-events-none" />

              {/* Floating Controls */}
              <MapZoomControls
                onZoomIn={handleZoomIn}
                onZoomOut={handleZoomOut}
                onResetZoom={handleResetZoom}
                resetTitle="Recenter Bangladesh"
              />

              {/* Active Selection Callout */}
              <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-10 flex items-center gap-2 bg-[#0c101c]/90 border border-emerald-500/30 text-slate-200 text-xs px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full backdrop-blur-md pointer-events-none">
                <span className="size-1.5 sm:size-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                <span className="font-bold text-white text-2xs sm:text-xs">
                  {selectedDistrict.name}
                </span>
                <span className="text-emerald-400 text-2xs hidden sm:inline font-mono">
                  ({selectedDistrict.division} Div)
                </span>
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
                  onMoveEnd={(pos) => setPosition(pos)}
                  maxZoom={15}
                  minZoom={0.8}
                >
                  <Geographies geography={BD_GEO_URL}>
                    {({ geographies }) => {
                      const strokeWidth = 0.65;
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
                      const neighborGeos = selectedDistrict
                        ? geographies.filter((g) => {
                            const sName = g.properties?.shapeName as
                              | string
                              | undefined;
                            return Boolean(
                              sName && selectedDistrict.borders.includes(sName),
                            );
                          })
                        : [];

                      return (
                        <>
                          {geographies.map((geo) => {
                            const districtName =
                              (geo.properties?.shapeName as string) || "";
                            if (!districtName) return null;
                            const district = DISTRICTS_BY_NAME.get(
                              districtName.toLowerCase(),
                            );
                            const isSelected =
                              selectedDistrict?.name === districtName;
                            const isNeighbor = Boolean(
                              selectedDistrict?.borders.includes(districtName),
                            );
                            const matchesDivision =
                              divisionFilter === "All" ||
                              district?.division === divisionFilter;

                            let fill = "#131b2e";
                            let stroke = "#24324a";

                            if (isSelected) {
                              fill = "#1a253a";
                              stroke = "#10b981";
                            } else if (isNeighbor) {
                              fill = "#0369a1";
                              stroke = "#38bdf8";
                            } else if (!matchesDivision) {
                              fill = "#080c14";
                              stroke = "#141c2c";
                            }

                            return (
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
                                    strokeWidth,
                                    strokeLinejoin: "round",
                                    strokeLinecap: "round",
                                    vectorEffect: "non-scaling-stroke",
                                    outline: "none",
                                    transition:
                                      "fill 200ms ease, stroke 200ms ease",
                                  },
                                  hover: {
                                    fill: "#1e2c45",
                                    stroke: isSelected
                                      ? "#34d399"
                                      : isNeighbor
                                        ? "#38bdf8"
                                        : "#94a3b8",
                                    strokeWidth,
                                    strokeLinejoin: "round",
                                    strokeLinecap: "round",
                                    vectorEffect: "non-scaling-stroke",
                                    outline: "none",
                                    cursor: "pointer",
                                  },
                                  pressed: {
                                    fill: "#0f172a",
                                    outline: "none",
                                  },
                                }}
                              />
                            );
                          })}

                          {/* Overlay 1: Neighbor districts */}
                          {neighborGeos.map((geo) => (
                            <Geography
                              key={`overlay-explore-nb-${geo.rsmKey}`}
                              geography={geo}
                              style={{
                                default: {
                                  fill: "rgba(3, 105, 161, 0.22)",
                                  stroke: "#38bdf8",
                                  strokeWidth,
                                  strokeLinejoin: "round",
                                  strokeLinecap: "round",
                                  vectorEffect: "non-scaling-stroke",
                                  pointerEvents: "none",
                                },
                                hover: {
                                  fill: "rgba(3, 105, 161, 0.22)",
                                  stroke: "#38bdf8",
                                  strokeWidth,
                                  vectorEffect: "non-scaling-stroke",
                                  pointerEvents: "none",
                                },
                              }}
                            />
                          ))}

                          {/* Overlay 2: Selected district */}
                          {selectedGeo && (
                            <Geography
                              key={`overlay-explore-sel-${selectedGeo.rsmKey}`}
                              geography={selectedGeo}
                              style={{
                                default: {
                                  fill: "rgba(16, 185, 129, 0.16)",
                                  stroke: "#10b981",
                                  strokeWidth,
                                  strokeLinejoin: "round",
                                  strokeLinecap: "round",
                                  vectorEffect: "non-scaling-stroke",
                                  pointerEvents: "none",
                                },
                                hover: {
                                  fill: "rgba(16, 185, 129, 0.16)",
                                  stroke: "#10b981",
                                  strokeWidth,
                                  vectorEffect: "non-scaling-stroke",
                                  pointerEvents: "none",
                                },
                              }}
                            />
                          )}

                          {/* Overlay 3: Hovered district */}
                          {hoveredGeo && hoveredGeo !== selectedGeo && (
                            <Geography
                              key={`overlay-explore-hover-${hoveredGeo.rsmKey}`}
                              geography={hoveredGeo}
                              style={{
                                default: {
                                  fill: "rgba(56, 189, 248, 0.38)",
                                  stroke: "#60a5fa",
                                  strokeWidth: 1.5,
                                  strokeLinejoin: "round",
                                  strokeLinecap: "round",
                                  vectorEffect: "non-scaling-stroke",
                                  pointerEvents: "none",
                                },
                                hover: {
                                  fill: "rgba(56, 189, 248, 0.38)",
                                  stroke: "#60a5fa",
                                  strokeWidth: 1.5,
                                  strokeLinejoin: "round",
                                  strokeLinecap: "round",
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
                      fillColor="#10b981"
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
                        fillColor="#38bdf8"
                      />
                    )}
                </ZoomableGroup>
              </ComposableMap>

              {/* Legend (Desktop) */}
              <div className="hidden sm:flex absolute bottom-3 left-3 z-10 flex-wrap items-center gap-2 sm:gap-3 bg-[#0c101c]/90 px-3 py-1.5 rounded-xl border border-white/10 text-xs text-slate-300 backdrop-blur-md">
                <div className="flex items-center gap-1.5">
                  <span className="size-2.5 rounded-full bg-amber-400 ring-2 ring-amber-400/20" />
                  <span>Selected</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="size-2.5 rounded-full bg-sky-500 ring-2 ring-sky-500/20" />
                  <span>Neighboring Districts</span>
                </div>
              </div>

              {/* Hover Pill */}
              {hoveredDistrict && (
                <MapHoverPill
                  mousePos={mousePos}
                  title={hoveredDistrict.name}
                  subtitle={`${hoveredDistrict.division} Division`}
                />
              )}
            </div>

            {/* Mobile Selection Callout on Map view */}
            <div className="lg:hidden shrink-0 p-2.5 rounded-2xl bg-[#0c101c] border border-white/10 flex items-center justify-between text-xs shadow-xl">
              <div className="flex items-center gap-2 min-w-0">
                <span className="size-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                <div className="truncate">
                  <div className="font-bold text-white text-xs truncate">
                    {selectedDistrict.name}
                  </div>
                  <span className="text-2xs text-slate-400 font-mono">
                    {selectedDistrict.division} Division •{" "}
                    {selectedDistrict.borders.length} neighbors
                  </span>
                </div>
              </div>
              <button
                onClick={() => setMobileTab("info")}
                className="px-2.5 py-1.5 rounded-xl bg-sky-600/30 hover:bg-sky-600/50 border border-sky-500/40 text-xs font-semibold text-sky-300 flex items-center gap-1 cursor-pointer shrink-0 ml-2 transition-colors"
              >
                <span>Details</span>
                <ArrowRight className="size-3" />
              </button>
            </div>
          </div>

          {/* Right Column: Search Box & District Profile (5 cols on lg, full on mobile when info tab) */}
          <div
            className={`lg:col-span-5 space-y-3 h-full min-h-0 ${
              mobileTab === "info"
                ? "flex flex-col flex-1 overflow-y-auto overscroll-contain pb-3"
                : "hidden lg:block"
            }`}
          >
            <div className="shrink-0 z-30">
              <DistrictSearch
                onSelectDistrict={selectDistrict}
                divisionFilter={divisionFilter}
              />
            </div>
            <DistrictProfileCard
              district={selectedDistrict}
              onSelectDistrict={selectDistrict}
              onHoverDistrict={setHoveredDistrict}
            />
          </div>
        </div>
      </main>

      <div className="hidden lg:block shrink-0">
        <Footer />
      </div>
    </div>
  );
}
