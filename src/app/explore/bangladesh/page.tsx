"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
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
import {
  BookOpen,
  Globe,
  Compass,
  Sparkles,
  Layers,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  ArrowRight,
  CornerDownLeft,
  Play,
  Globe2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandItem,
} from "@/components/ui/command";

const BD_GEO_URL = "/data/bangladesh-districts-geo.json";

const BD_DIVISIONS = [
  "All",
  "Dhaka",
  "Chattogram",
  "Rajshahi",
  "Khulna",
  "Barishal",
  "Sylhet",
  "Rangpur",
  "Mymensingh",
];

const DEFAULT_DISTRICT =
  DISTRICTS_BY_NAME.get("dhaka") || BANGLADESH_DISTRICTS[0];

export default function BangladeshExplorePage() {
  const [selectedDistrict, setSelectedDistrict] =
    useState<DistrictData>(DEFAULT_DISTRICT);
  const [hoveredDistrict, setHoveredDistrict] = useState<DistrictData | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [divisionFilter, setDivisionFilter] = useState("All");

  const [position, setPosition] = useState<{
    coordinates: [number, number];
    zoom: number;
  }>({
    coordinates: [DEFAULT_DISTRICT.coordinates[1], DEFAULT_DISTRICT.coordinates[0]],
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
    setSearchQuery("");
    setSearchOpen(false);
    setPosition({
      coordinates: [dist.coordinates[1], dist.coordinates[0]],
      zoom: 3.5,
    });
  };

  const submitQuery = (rawQuery: string) => {
    const q = rawQuery.trim().toLowerCase();
    if (!q) return;

    const exact = BANGLADESH_DISTRICTS.find((d) => d.name.toLowerCase() === q);
    const first =
      exact ||
      BANGLADESH_DISTRICTS.find((d) => d.name.toLowerCase().includes(q));
    if (first) {
      selectDistrict(first);
    }
  };

  const filteredDistricts = useMemo(() => {
    return BANGLADESH_DISTRICTS.filter((d) => {
      const matchesSearch = d.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesDivision =
        divisionFilter === "All" || d.division === divisionFilter;
      return matchesSearch && matchesDivision;
    });
  }, [searchQuery, divisionFilter]);

  return (
    <div className="flex flex-col min-h-screen bg-[#070a12] text-slate-100 selection:bg-emerald-500 selection:text-white">
      <Header />

      <main className="flex-1 w-full max-w-7xl mx-auto px-2 sm:px-4 py-3 sm:py-4 space-y-4">
        {/* Top Context Subheader */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl border border-white/10 bg-[#0c101c] shadow-lg">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <BookOpen className="size-4" />
              </span>
              <h1 className="text-lg sm:text-xl font-bold text-white tracking-wide">
                Bangladesh District Explorer
              </h1>
              <Badge
                variant="outline"
                className="text-2xs border-emerald-500/30 text-emerald-300 bg-emerald-500/10 font-mono"
              >
                64 Districts
              </Badge>
            </div>
            <p className="text-xs text-slate-400">
              Browse districts, study bordering neighbors, and inspect regional facts at your own pace.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/bangladesh"
              className="px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-950/60 transition-colors"
            >
              <Play className="size-3.5 fill-white" />
              <span>Play Bangladesh</span>
            </Link>
            <Link
              href="/explore/world"
              className="px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
            >
              <Globe2 className="size-3.5 text-sky-400" />
              <span className="hidden sm:inline">World Explorer</span>
              <span className="sm:hidden">World</span>
            </Link>
          </div>
        </div>

        {/* 2-Column Responsive Layout: Map + Profile Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          {/* Left Column: Interactive Map Canvas (7 cols on lg, full on mobile) */}
          <div className="lg:col-span-7 flex flex-col gap-3">
            {/* Division Filters */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs scrollbar-none">
              <span className="text-xs font-mono text-slate-400 font-medium shrink-0 flex items-center gap-1 mr-1">
                <Layers className="size-3 text-emerald-400" /> Division:
              </span>
              {BD_DIVISIONS.map((div) => (
                <button
                  key={div}
                  onClick={() => setDivisionFilter(div)}
                  className={`px-3 py-1.5 min-h-[32px] rounded-lg shrink-0 text-xs font-medium border transition-colors cursor-pointer ${
                    divisionFilter === div
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                      : "bg-black/40 text-slate-400 border-white/5 hover:text-white"
                  }`}
                >
                  {div}
                </button>
              ))}
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
              className="relative w-full h-[50vh] sm:h-[520px] lg:h-[calc(100vh-210px)] min-h-[360px] rounded-2xl overflow-hidden border border-white/10 bg-[#090d16] shadow-2xl flex flex-col items-center justify-center select-none"
            >
              <div className="absolute inset-0 bg-tactical-grid opacity-40 pointer-events-none" />

              {/* Floating Controls */}
              <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 flex flex-col gap-1.5 bg-[#0c101c]/90 p-1.5 rounded-xl border border-white/10 backdrop-blur-md shadow-lg">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleZoomIn}
                  title="Zoom In"
                  aria-label="Zoom In"
                  className="size-8 rounded-lg hover:bg-white/10 text-slate-300 cursor-pointer"
                >
                  <ZoomIn className="size-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleZoomOut}
                  title="Zoom Out"
                  aria-label="Zoom Out"
                  className="size-8 rounded-lg hover:bg-white/10 text-slate-300 cursor-pointer"
                >
                  <ZoomOut className="size-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleResetZoom}
                  title="Recenter Map"
                  aria-label="Recenter Map"
                  className="size-8 rounded-lg hover:bg-white/10 text-slate-300 cursor-pointer"
                >
                  <RotateCcw className="size-4" />
                </Button>
              </div>

              {/* Active Selection Callout */}
              <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-10 flex items-center gap-2 bg-[#0c101c]/90 border border-amber-500/30 text-slate-200 text-xs px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full backdrop-blur-md pointer-events-none">
                <span className="size-1.5 sm:size-2 rounded-full bg-amber-400 animate-pulse shrink-0" />
                <span className="font-bold text-white text-2xs sm:text-xs">
                  {selectedDistrict.name}
                </span>
                <span className="text-amber-400/80 text-2xs hidden sm:inline font-mono">
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
                  maxZoom={8}
                  minZoom={0.8}
                >
                  <Geographies geography={BD_GEO_URL}>
                    {({ geographies }) => {
                      const strokeWidth = Math.max(
                        0.35,
                        Math.min(0.85, 0.65 / Math.sqrt(position.zoom)),
                      );
                      const selectedGeo = selectedDistrict
                        ? geographies.find(
                            (g) =>
                              (g.properties?.shapeName as string | undefined)?.toLowerCase() ===
                              selectedDistrict.name.toLowerCase(),
                          )
                        : null;
                      const hoveredGeo = hoveredDistrict
                        ? geographies.find(
                            (g) =>
                              (g.properties?.shapeName as string | undefined)?.toLowerCase() ===
                              hoveredDistrict.name.toLowerCase(),
                          )
                        : null;
                      const neighborGeos = selectedDistrict
                        ? geographies.filter((g) => {
                            const sName = (g.properties?.shapeName as string | undefined)?.toLowerCase();
                            return (
                              Boolean(sName) &&
                              selectedDistrict.borders.some(
                                (b) => b.toLowerCase() === sName,
                              )
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
                              selectedDistrict.name.toLowerCase() ===
                              districtName.toLowerCase();
                            const isNeighbor = selectedDistrict.borders.some(
                              (b) =>
                                b.toLowerCase() === districtName.toLowerCase(),
                            );
                            const isInFilteredDivision =
                              divisionFilter === "All" ||
                              district?.division === divisionFilter;

                            let fill = isInFilteredDivision
                              ? "#131b2e"
                              : "#0d1320";
                            let stroke = isInFilteredDivision
                              ? "#24324a"
                              : "#1c2638";

                            if (isSelected) {
                              fill = "#1a253a";
                              stroke = "#f59e0b";
                            } else if (isNeighbor) {
                              fill = "#0369a1";
                              stroke = "#38bdf8";
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
                                    transition: "fill 200ms ease, stroke 200ms ease",
                                  },
                                  hover: {
                                    fill: "#1e2c45",
                                    stroke: isSelected
                                      ? "#fbbf24"
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
                              key={`overlay-bd-nb-${geo.rsmKey}`}
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
                              key={`overlay-bd-sel-${selectedGeo.rsmKey}`}
                              geography={selectedGeo}
                              style={{
                                default: {
                                  fill: "rgba(245, 158, 11, 0.16)",
                                  stroke: "#f59e0b",
                                  strokeWidth,
                                  strokeLinejoin: "round",
                                  strokeLinecap: "round",
                                  vectorEffect: "non-scaling-stroke",
                                  pointerEvents: "none",
                                },
                                hover: {
                                  fill: "rgba(245, 158, 11, 0.16)",
                                  stroke: "#f59e0b",
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
                              key={`overlay-bd-hover-${hoveredGeo.rsmKey}`}
                              geography={hoveredGeo}
                              style={{
                                default: {
                                  fill: "rgba(56, 189, 248, 0.38)",
                                  stroke: "#60a5fa",
                                  strokeWidth: Math.max(1.6, strokeWidth * 2.2),
                                  strokeLinejoin: "round",
                                  strokeLinecap: "round",
                                  vectorEffect: "non-scaling-stroke",
                                  pointerEvents: "none",
                                },
                                hover: {
                                  fill: "rgba(56, 189, 248, 0.38)",
                                  stroke: "#60a5fa",
                                  strokeWidth: Math.max(1.6, strokeWidth * 2.2),
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
                      fillColor="#f59e0b"
                    />
                  )}

                  {/* Marker on hovered district */}
                  {hoveredDistrict && hoveredDistrict.name !== selectedDistrict.name && (
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
                <div
                  className="pointer-events-none absolute z-30 transition-all duration-75 ease-out select-none"
                  style={
                    mousePos
                      ? {
                          left: mousePos.x,
                          top: mousePos.y < 50 ? mousePos.y + 18 : mousePos.y - 12,
                          transform:
                            mousePos.y < 50
                              ? "translate(-50%, 0)"
                              : "translate(-50%, -100%)",
                        }
                      : {
                          left: "50%",
                          top: 16,
                          transform: "translateX(-50%)",
                        }
                  }
                >
                  <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0c101c]/95 border border-sky-400/40 shadow-2xl shadow-black/90 backdrop-blur-md text-xs whitespace-nowrap ring-1 ring-sky-500/20">
                    <span className="font-bold text-white">
                      {hoveredDistrict.name}
                    </span>
                    <span className="text-slate-400 text-2xs border-l border-white/10 pl-2">
                      {hoveredDistrict.division} Division
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Search Box & District Profile (5 cols) */}
          <div className="lg:col-span-5 space-y-3">
            {/* Command Search Box (Strictly by District Name) */}
            <div className="relative w-full z-20">
              <Command
                className="rounded-2xl border border-white/10 bg-[#0c101c] shadow-2xl backdrop-blur-xl overflow-visible"
                shouldFilter={false}
              >
                <div className="relative">
                  <CommandInput
                    value={searchQuery}
                    onValueChange={(val) => {
                      setSearchQuery(val);
                      if (!searchOpen && val.length > 0) setSearchOpen(true);
                    }}
                    onFocus={() => setSearchOpen(true)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && searchQuery.trim().length > 0) {
                        e.preventDefault();
                        submitQuery(searchQuery);
                      }
                    }}
                    placeholder="Type district name (Dhaka, Sylhet)..."
                    className="text-base sm:text-sm font-medium"
                  />
                  {searchQuery.length > 0 && (
                    <button
                      type="button"
                      onClick={() => submitQuery(searchQuery)}
                      className="absolute right-2.5 top-2 flex items-center gap-1 text-xs font-mono text-slate-200 bg-sky-600/30 hover:bg-sky-600/50 border border-sky-500/40 px-2.5 py-1 rounded-lg cursor-pointer transition-colors"
                    >
                      <span>Go</span>
                      <CornerDownLeft className="size-3 text-sky-400" />
                    </button>
                  )}
                </div>

                {searchOpen && searchQuery.trim().length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 z-50">
                    <CommandList className="max-h-56 sm:max-h-64 rounded-xl border border-white/10 bg-[#0c101c]/98 backdrop-blur-2xl shadow-2xl p-1.5 overflow-y-auto">
                      {filteredDistricts.slice(0, 8).map((d) => (
                        <CommandItem
                          key={d.id}
                          value={d.name}
                          onSelect={() => selectDistrict(d)}
                          className="flex items-center justify-between px-3 py-2.5 sm:py-2 min-h-[42px] rounded-lg text-slate-200 hover:bg-white/5 hover:text-white cursor-pointer transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-xs sm:text-sm text-white">
                              {d.name}
                            </span>
                            <span className="text-xs text-slate-400 font-mono">
                              ({d.division} Div)
                            </span>
                          </div>
                          <ArrowRight className="size-3.5 text-slate-500 opacity-60" />
                        </CommandItem>
                      ))}
                      {filteredDistricts.length === 0 && (
                        <CommandEmpty className="py-6 text-center text-xs text-slate-400 flex items-center justify-center gap-2 font-mono">
                          <Globe className="size-4 text-slate-500" />
                          <span>No districts found</span>
                        </CommandEmpty>
                      )}
                    </CommandList>
                  </div>
                )}
              </Command>
            </div>

            {/* District Profile Card */}
            <div className="rounded-2xl border border-white/10 bg-[#0c101c] p-4 sm:p-5 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/5">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-white">
                    {selectedDistrict.name}
                  </h2>
                  <p className="text-xs text-emerald-400 font-medium">
                    {selectedDistrict.division} Division • Bangladesh
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className="border-emerald-500/30 text-emerald-300 font-mono text-2xs"
                >
                  {selectedDistrict.isCoastal
                    ? "Coastal District"
                    : "Inland District"}
                </Badge>
              </div>

              {/* Spatial Specs */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
                  <span className="text-slate-400 text-xs flex items-center gap-1">
                    <Compass className="size-3 text-sky-400" /> Coordinates
                  </span>
                  <span className="font-mono text-white font-semibold">
                    {selectedDistrict.coordinates[0].toFixed(2)}°N,{" "}
                    {selectedDistrict.coordinates[1].toFixed(2)}°E
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
                  <span className="text-slate-400 text-xs flex items-center gap-1">
                    <Layers className="size-3 text-emerald-400" /> Neighbors
                  </span>
                  <span className="font-mono text-white font-semibold">
                    {selectedDistrict.borders.length} Adjacent Districts
                  </span>
                </div>
              </div>

              {/* Trivia Fact */}
              <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 space-y-1 text-xs leading-relaxed">
                <span className="text-amber-400 font-semibold flex items-center gap-1.5">
                  <Sparkles className="size-3.5" /> Did you know?
                </span>
                <p className="text-slate-300">{selectedDistrict.triviaFact}</p>
              </div>

              {/* Bordering Districts Interactive List */}
              <div className="space-y-2">
                <h3 className="text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider">
                  Bordering Districts (click to jump):
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {selectedDistrict.borders.map((neighborName) => {
                    const neighborData = DISTRICTS_BY_NAME.get(
                      neighborName.toLowerCase(),
                    );
                    return (
                      <button
                        key={neighborName}
                        onMouseEnter={() => {
                          if (neighborData) setHoveredDistrict(neighborData);
                        }}
                        onMouseLeave={() => {
                          setHoveredDistrict(null);
                        }}
                        onClick={() => {
                          if (neighborData) {
                            selectDistrict(neighborData);
                            setHoveredDistrict(null);
                          }
                        }}
                        className="px-2.5 py-1.5 min-h-[36px] rounded-lg text-xs bg-sky-950/40 border border-sky-500/30 text-sky-300 hover:bg-sky-500 hover:text-white transition-colors cursor-pointer"
                      >
                        {neighborName} ↗
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-6 text-center text-xs text-slate-500 mt-12 bg-[#070a12]">
        <p>Borderline • Bangladesh 64 Districts Explorer</p>
      </footer>
    </div>
  );
}
