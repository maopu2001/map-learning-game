"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import {
  COUNTRIES,
  COUNTRIES_BY_ID,
  COUNTRIES_BY_NUMERIC,
  CountryData,
  getEffectiveBorders,
} from "@/data/world";
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
  MapPin,
  Users,
  Maximize2,
  Compass,
  Sparkles,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  ArrowRight,
  CornerDownLeft,
  Play,
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

const WORLD_GEO_URL = "/data/world-countries-geo-50m.json";

const DEFAULT_COUNTRY =
  COUNTRIES_BY_ID.get("BGD") || COUNTRIES[0];

export default function WorldExplorePage() {
  const [selectedCountry, setSelectedCountry] =
    useState<CountryData>(DEFAULT_COUNTRY);
  const [hoveredCountry, setHoveredCountry] = useState<CountryData | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [position, setPosition] = useState<{
    coordinates: [number, number];
    zoom: number;
  }>({
    coordinates: [DEFAULT_COUNTRY.coordinates[1], DEFAULT_COUNTRY.coordinates[0]],
    zoom: 2.2,
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
    setPosition({ coordinates: [0, 20], zoom: 1 });
  };

  const selectCountry = (c: CountryData) => {
    setSelectedCountry(c);
    setSearchQuery("");
    setSearchOpen(false);
    setPosition({
      coordinates: [c.coordinates[1], c.coordinates[0]],
      zoom: c.area < 100000 ? 4 : 2.5,
    });
  };

  const submitQuery = (rawQuery: string) => {
    const q = rawQuery.trim().toLowerCase();
    if (!q) return;

    const exact = COUNTRIES.find((c) => c.name.toLowerCase() === q);
    const first =
      exact ||
      COUNTRIES.find(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.id.toLowerCase() === q ||
          c.capital.toLowerCase().includes(q) ||
          c.region.toLowerCase().includes(q) ||
          (c.subregion && c.subregion.toLowerCase().includes(q)) ||
          (c.officialName && c.officialName.toLowerCase().includes(q)) ||
          c.aliases.some((a) => a.toLowerCase().includes(q)),
      );
    if (first) {
      selectCountry(first);
    }
  };

  const filteredCountries = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return COUNTRIES;
    return COUNTRIES.filter((c) => {
      return (
        c.name.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q) ||
        c.capital.toLowerCase().includes(q) ||
        c.region.toLowerCase().includes(q) ||
        (c.subregion && c.subregion.toLowerCase().includes(q)) ||
        (c.officialName && c.officialName.toLowerCase().includes(q)) ||
        c.aliases.some((a) => a.toLowerCase().includes(q))
      );
    });
  }, [searchQuery]);

  return (
    <div className="flex flex-col min-h-screen bg-[#070a12] text-slate-100 selection:bg-sky-500 selection:text-white">
      <Header />

      <main className="flex-1 w-full max-w-7xl mx-auto px-2 sm:px-4 py-3 sm:py-4 space-y-4">
        {/* Top Context Subheader */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl border border-white/10 bg-[#0c101c] shadow-lg">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
                <BookOpen className="size-4" />
              </span>
              <h1 className="text-lg sm:text-xl font-bold text-white tracking-wide">
                World Countries Explorer
              </h1>
              <Badge
                variant="outline"
                className="text-2xs border-sky-500/30 text-sky-300 bg-sky-500/10 font-mono"
              >
                195 Countries
              </Badge>
            </div>
            <p className="text-xs text-slate-400">
              Browse world nations, capitals, populations, and neighboring borders at your own pace.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/world"
              className="px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 bg-sky-600 hover:bg-sky-500 text-white shadow-md shadow-sky-950/60 transition-colors"
            >
              <Play className="size-3.5 fill-white" />
              <span>Play World</span>
            </Link>
            <Link
              href="/explore/bangladesh"
              className="px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
            >
              <span>🇧🇩</span>
              <span className="hidden sm:inline">Bangladesh Explorer</span>
              <span className="sm:hidden">BD</span>
            </Link>
          </div>
        </div>

        {/* 2-Column Responsive Layout: Map + Profile Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          {/* Left Column: Interactive Map Canvas (7 cols on lg, full on mobile) */}
          <div className="lg:col-span-7 flex flex-col gap-3">
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
                setHoveredCountry(null);
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
                  title="Recenter World Map"
                  aria-label="Recenter World Map"
                  className="size-8 rounded-lg hover:bg-white/10 text-slate-300 cursor-pointer"
                >
                  <RotateCcw className="size-4" />
                </Button>
              </div>

              {/* Active Selection Callout */}
              <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-10 flex items-center gap-2 bg-[#0c101c]/90 border border-amber-500/30 text-slate-200 text-xs px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full backdrop-blur-md pointer-events-none">
                <span className="size-1.5 sm:size-2 rounded-full bg-amber-400 animate-pulse shrink-0" />
                <span className="text-sm sm:text-base">
                  {selectedCountry.flagEmoji}
                </span>
                <span className="font-bold text-white text-2xs sm:text-xs">
                  {selectedCountry.name}
                </span>
                <span className="text-amber-400/80 text-2xs hidden sm:inline font-mono">
                  ({selectedCountry.id})
                </span>
              </div>

              {/* SVG Map Canvas */}
              <ComposableMap
                width={960}
                height={580}
                projection="geoMercator"
                projectionConfig={{ scale: 155 }}
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
                  minZoom={1}
                >
                  <Geographies geography={WORLD_GEO_URL}>
                    {({ geographies }) => {
                      const strokeWidth = Math.max(
                        0.3,
                        Math.min(0.85, 0.55 / Math.sqrt(position.zoom)),
                      );
                      const effectiveBorders = selectedCountry
                        ? getEffectiveBorders(selectedCountry)
                        : [];
                      const selectedGeo = selectedCountry
                        ? geographies.find((g) => {
                            const gid = String(g.id);
                            const c =
                              COUNTRIES_BY_NUMERIC.get(gid) ||
                              COUNTRIES_BY_NUMERIC.get(
                                String(parseInt(gid, 10)),
                              );
                            return c?.id === selectedCountry.id;
                          })
                        : null;
                      const hoveredGeo = hoveredCountry
                        ? geographies.find((g) => {
                            const gid = String(g.id);
                            const c =
                              COUNTRIES_BY_NUMERIC.get(gid) ||
                              COUNTRIES_BY_NUMERIC.get(
                                String(parseInt(gid, 10)),
                              );
                            return c?.id === hoveredCountry.id;
                          })
                        : null;
                      const neighborGeos = selectedCountry
                        ? geographies.filter((g) => {
                            const gid = String(g.id);
                            const c =
                              COUNTRIES_BY_NUMERIC.get(gid) ||
                              COUNTRIES_BY_NUMERIC.get(
                                String(parseInt(gid, 10)),
                              );
                            return Boolean(
                              c?.id && effectiveBorders.includes(c.id),
                            );
                          })
                        : [];

                      return (
                        <>
                          {geographies.map((geo) => {
                            const geoId = String(geo.id);
                            const country =
                              COUNTRIES_BY_NUMERIC.get(geoId) ||
                              COUNTRIES_BY_NUMERIC.get(
                                String(parseInt(geoId, 10)),
                              );
                            const isSelected =
                              selectedCountry?.id === country?.id;
                            const isNeighbor = Boolean(
                              country?.id &&
                                effectiveBorders.includes(country.id),
                            );

                            let fill = "#131b2e";
                            let stroke = "#24324a";

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
                                  if (country) setHoveredCountry(country);
                                }}
                                onMouseLeave={() => {
                                  setHoveredCountry(null);
                                }}
                                onClick={() => {
                                  if (country) selectCountry(country);
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

                          {/* Overlay 1: Neighbor countries */}
                          {neighborGeos.map((geo) => (
                            <Geography
                              key={`overlay-world-nb-${geo.rsmKey}`}
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

                          {/* Overlay 2: Selected country */}
                          {selectedGeo && (
                            <Geography
                              key={`overlay-world-sel-${selectedGeo.rsmKey}`}
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

                          {/* Overlay 3: Hovered country */}
                          {hoveredGeo && hoveredGeo !== selectedGeo && (
                            <Geography
                              key={`overlay-world-hover-${hoveredGeo.rsmKey}`}
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

                  {/* Marker on selected country */}
                  {selectedCountry && (
                    <TargetPulseMarker
                      coordinates={[
                        selectedCountry.coordinates[1],
                        selectedCountry.coordinates[0],
                      ]}
                      zoom={position.zoom}
                      fillColor="#f59e0b"
                    />
                  )}

                  {/* Marker on hovered country */}
                  {hoveredCountry && hoveredCountry.id !== selectedCountry?.id && (
                    <TargetPulseMarker
                      coordinates={[
                        hoveredCountry.coordinates[1],
                        hoveredCountry.coordinates[0],
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
                  <span>Neighboring Nations</span>
                </div>
              </div>

              {/* Hover Pill */}
              {hoveredCountry && (
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
                    <span className="text-base leading-none">
                      {hoveredCountry.flagEmoji}
                    </span>
                    <span className="font-bold text-white">
                      {hoveredCountry.name}
                    </span>
                    <span className="text-slate-400 text-2xs border-l border-white/10 pl-2">
                      {hoveredCountry.capital || hoveredCountry.region}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Search Box & Country Profile (5 cols) */}
          <div className="lg:col-span-5 space-y-3">
            {/* Command Search Box (Matches by ISO, alias, name, capital, region, subregion) */}
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
                    placeholder="Search by name, capital, ISO code, or alias..."
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
                      {filteredCountries.slice(0, 8).map((c) => (
                        <CommandItem
                          key={c.id}
                          value={`${c.name} ${c.id} ${c.capital} ${c.region} ${c.subregion || ""} ${c.aliases.join(" ")}`}
                          onSelect={() => selectCountry(c)}
                          className="flex items-center justify-between px-3 py-2.5 sm:py-2 min-h-[42px] rounded-lg text-slate-200 hover:bg-white/5 hover:text-white cursor-pointer transition-colors"
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="text-lg">{c.flagEmoji}</span>
                            <div className="flex flex-col">
                              <div className="flex items-center gap-1.5">
                                <span className="font-semibold text-xs sm:text-sm text-white">
                                  {c.name}
                                </span>
                                <span className="text-xs text-slate-400 font-mono">
                                  ({c.id})
                                </span>
                              </div>
                              <span className="text-2xs text-slate-400 font-mono">
                                {c.capital} • {c.subregion || c.region}
                              </span>
                            </div>
                          </div>
                          <ArrowRight className="size-3.5 text-slate-500 opacity-60" />
                        </CommandItem>
                      ))}
                      {filteredCountries.length === 0 && (
                        <CommandEmpty className="py-6 text-center text-xs text-slate-400 flex items-center justify-center gap-2 font-mono">
                          <Globe className="size-4 text-slate-500" />
                          <span>No countries found</span>
                        </CommandEmpty>
                      )}
                    </CommandList>
                  </div>
                )}
              </Command>
            </div>

            {/* Country Profile Card */}
            <div className="rounded-2xl border border-white/10 bg-[#0c101c] p-4 sm:p-5 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{selectedCountry.flagEmoji}</span>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-white">
                      {selectedCountry.name}
                    </h2>
                    {selectedCountry.officialName &&
                      selectedCountry.officialName !== selectedCountry.name && (
                        <p className="text-2xs text-slate-400 italic truncate max-w-[220px]">
                          {selectedCountry.officialName}
                        </p>
                      )}
                    <p className="text-xs text-sky-400 font-medium">
                      {selectedCountry.region} • {selectedCountry.subregion}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Badge
                    variant="outline"
                    className="border-sky-500/30 text-sky-300 font-mono text-2xs"
                  >
                    {selectedCountry.id}
                  </Badge>
                  {selectedCountry.isIsland && (
                    <Badge
                      variant="outline"
                      className="border-sky-500/30 text-sky-400 font-sans text-2xs"
                    >
                      Island Nation
                    </Badge>
                  )}
                </div>
              </div>

              {/* Specs */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
                  <span className="text-slate-400 text-xs flex items-center gap-1">
                    <MapPin className="size-3 text-emerald-400" /> Capital City
                  </span>
                  <span className="font-semibold text-white">
                    {selectedCountry.capital || "N/A"}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
                  <span className="text-slate-400 text-xs flex items-center gap-1">
                    <Users className="size-3 text-sky-400" /> Population
                  </span>
                  <span className="font-semibold font-mono text-white">
                    {selectedCountry.population
                      ? selectedCountry.population.toLocaleString()
                      : "N/A"}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
                  <span className="text-slate-400 text-xs flex items-center gap-1">
                    <Maximize2 className="size-3 text-amber-400" /> Surface Area
                  </span>
                  <span className="font-semibold font-mono text-white">
                    {selectedCountry.area
                      ? `${selectedCountry.area.toLocaleString()} km²`
                      : "N/A"}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
                  <span className="text-slate-400 text-xs flex items-center gap-1">
                    <Compass className="size-3 text-purple-400" /> Coordinates
                  </span>
                  <span className="font-semibold font-mono text-white">
                    {Math.abs(selectedCountry.coordinates[0]).toFixed(1)}°
                    {selectedCountry.coordinates[0] >= 0 ? "N" : "S"},{" "}
                    {Math.abs(selectedCountry.coordinates[1]).toFixed(1)}°
                    {selectedCountry.coordinates[1] >= 0 ? "E" : "W"}
                  </span>
                </div>
              </div>

              {/* Trivia */}
              <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 space-y-1 text-xs leading-relaxed">
                <span className="text-amber-400 font-semibold flex items-center gap-1.5">
                  <Sparkles className="size-3.5" /> Did you know?
                </span>
                <p className="text-slate-300">{selectedCountry.triviaFact}</p>
              </div>

              {/* Neighbors */}
              <div className="space-y-2">
                <h3 className="text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider">
                  {selectedCountry.borders.length === 0
                    ? "Nearby Maritime Neighbors:"
                    : `Bordering Countries (${selectedCountry.borders.length}):`}
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {getEffectiveBorders(selectedCountry).map((iso) => {
                    const neighbor = COUNTRIES_BY_ID.get(iso);
                    return (
                      <button
                        key={iso}
                        onMouseEnter={() => {
                          if (neighbor) setHoveredCountry(neighbor);
                        }}
                        onMouseLeave={() => {
                          setHoveredCountry(null);
                        }}
                        onClick={() => {
                          if (neighbor) {
                            selectCountry(neighbor);
                            setHoveredCountry(null);
                          }
                        }}
                        className="px-2.5 py-1.5 min-h-[36px] rounded-lg text-xs bg-sky-950/40 border border-sky-500/30 text-sky-300 hover:bg-sky-500 hover:text-white transition-colors cursor-pointer"
                      >
                        {neighbor ? `${neighbor.flagEmoji} ${neighbor.name}` : iso}{" "}
                        ↗
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
        <p>Borderline • World Countries Explorer</p>
      </footer>
    </div>
  );
}
