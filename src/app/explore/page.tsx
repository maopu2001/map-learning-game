"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { Header } from "@/components/Header";
import {
  BANGLADESH_DISTRICTS,
  DISTRICTS_BY_NAME,
  DistrictData,
} from "@/data/bangladesh";
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
  Globe2,
  MapPin,
  Users,
  Maximize2,
  Compass,
  Sparkles,
  Layers,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Map,
  ArrowRight,
  CornerDownLeft,
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
const WORLD_GEO_URL = "/data/world-countries-geo-50m.json";

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

const DEFAULT_BD_DISTRICT =
  DISTRICTS_BY_NAME.get("dhaka") || BANGLADESH_DISTRICTS[0];
const DEFAULT_WORLD_COUNTRY =
  COUNTRIES_BY_ID.get("BGD") || COUNTRIES[0];

export default function ExplorePage() {
  const [realm, setRealm] = useState<"bangladesh" | "world">("bangladesh");
  const [selectedBD, setSelectedBD] = useState<DistrictData>(DEFAULT_BD_DISTRICT);
  const [selectedWorld, setSelectedWorld] =
    useState<CountryData>(DEFAULT_WORLD_COUNTRY);
  const [hoveredBD, setHoveredBD] = useState<DistrictData | null>(null);
  const [hoveredWorld, setHoveredWorld] = useState<CountryData | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [divisionFilter, setDivisionFilter] = useState("All");
  const [mobileTab, setMobileTab] = useState<"map" | "dossier">("map");

  const [position, setPosition] = useState<{
    coordinates: [number, number];
    zoom: number;
  }>({
    coordinates: [90.3563, 23.685],
    zoom: 1,
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

  // Filter zoom events: disable scroll-to-zoom; enable touchpad pinch & mobile touch pinch
  const filterZoomEvent = (event: unknown) => {
    const e = event as { type?: string; ctrlKey?: boolean; button?: number };
    if (!e || !e.type) return true;

    // Mouse wheel or 2-finger scroll
    if (e.type === "wheel") {
      return Boolean(e.ctrlKey);
    }

    // Drag / panning
    if (e.type === "mousedown") {
      return e.button === 0;
    }

    // Touch events on mobile / tablet (1-finger pan, 2-finger pinch)
    if (e.type.startsWith("touch")) {
      return true;
    }

    return true;
  };

  // Switch realm centers
  const handleRealmChange = (newRealm: "bangladesh" | "world") => {
    setRealm(newRealm);
    setSearchQuery("");
    setSearchOpen(false);
    setHoveredBD(null);
    setHoveredWorld(null);
    setMousePos(null);
    if (newRealm === "bangladesh") {
      setSelectedBD(DEFAULT_BD_DISTRICT);
      setPosition({ coordinates: [90.3563, 23.685], zoom: 1 });
    } else {
      setSelectedWorld(DEFAULT_WORLD_COUNTRY);
      setPosition({ coordinates: [DEFAULT_WORLD_COUNTRY.coordinates[1], DEFAULT_WORLD_COUNTRY.coordinates[0]], zoom: 2 });
    }
  };

  const handleZoomIn = () => {
    setPosition((pos) => ({ ...pos, zoom: Math.min(pos.zoom * 1.5, 8) }));
  };

  const handleZoomOut = () => {
    setPosition((pos) => ({ ...pos, zoom: Math.max(pos.zoom / 1.5, 0.8) }));
  };

  const handleResetZoom = () => {
    if (realm === "bangladesh") {
      setPosition({ coordinates: [90.3563, 23.685], zoom: 1 });
    } else {
      setPosition({ coordinates: [0, 20], zoom: 1 });
    }
  };

  // Inspect district
  const selectDistrict = (dist: DistrictData) => {
    setSelectedBD(dist);
    setSearchQuery("");
    setSearchOpen(false);
    setPosition({
      coordinates: [dist.coordinates[1], dist.coordinates[0]],
      zoom: 3.5,
    });
  };

  // Inspect country
  const selectCountry = (c: CountryData) => {
    setSelectedWorld(c);
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

    if (realm === "bangladesh") {
      const exact = BANGLADESH_DISTRICTS.find((d) => d.name.toLowerCase() === q);
      const first =
        exact ||
        BANGLADESH_DISTRICTS.find((d) => d.name.toLowerCase().includes(q));
      if (first) {
        selectDistrict(first);
        setMobileTab("map");
      }
    } else {
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
        setMobileTab("map");
      }
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
    <div className="flex flex-col min-h-screen bg-[#070a12] text-slate-100 selection:bg-purple-500 selection:text-white">
      <Header />

      <main className="flex-1 w-full px-2 sm:px-3 py-2 sm:py-2.5 space-y-2.5">
        {/* Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-3 sm:p-3.5 rounded-xl border border-white/10 bg-[#0c101c] shadow-lg">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <BookOpen className="size-4" />
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-wide">
                Map Explorer
              </h2>
            </div>
            <p className="text-xs text-slate-400">
              Explore at your own pace. Click any district or country to view its borders, facts, and figures.
            </p>
          </div>

          {/* Realm Switcher */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleRealmChange("bangladesh")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 border transition-all ${
                realm === "bangladesh"
                  ? "bg-emerald-600 border-emerald-500 text-white shadow-lg shadow-emerald-950/50"
                  : "bg-black/40 border-white/5 text-slate-400 hover:text-white"
              }`}
            >
              <span>🇧🇩</span> Bangladesh (64)
            </button>
            <button
              onClick={() => handleRealmChange("world")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 border transition-all ${
                realm === "world"
                  ? "bg-sky-600 border-sky-500 text-white shadow-lg shadow-sky-950/50"
                  : "bg-black/40 border-white/5 text-slate-400 hover:text-white"
              }`}
            >
              <Globe2 className="size-3.5 text-sky-400" /> World (195)
            </button>
          </div>
        </div>

        {/* Mobile Tab Toggle Bar */}
        <div className="lg:hidden flex items-center gap-1.5 p-1 rounded-2xl bg-black/40 border border-white/10 text-xs font-semibold">
          <button
            onClick={() => setMobileTab("map")}
            className={`flex-1 py-2 px-3 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
              mobileTab === "map"
                ? realm === "bangladesh"
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-950/60"
                  : "bg-sky-600 text-white shadow-md shadow-sky-950/60"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Map className="size-3.5" />
            <span>Map View</span>
          </button>
          <button
            onClick={() => setMobileTab("dossier")}
            className={`flex-1 py-2 px-3 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
              mobileTab === "dossier"
                ? "bg-purple-600 text-white shadow-md shadow-purple-950/60"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <BookOpen className="size-3.5" />
            <span className="truncate">
              {realm === "bangladesh" ? selectedBD?.name : selectedWorld?.name} Details
            </span>
          </button>
        </div>

        {/* Search Input always pinned above on mobile for immediate access */}
        <div className="lg:hidden w-full relative z-20">
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
                placeholder={
                  realm === "bangladesh"
                    ? "Type district name (Dhaka, Sylhet)..."
                    : "Type country name (Japan, France)..."
                }
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
                  {realm === "bangladesh" ? (
                    <>
                      {filteredDistricts.slice(0, 8).map((d) => (
                        <CommandItem
                          key={d.id}
                          value={d.name}
                          onSelect={() => {
                            selectDistrict(d);
                            setMobileTab("map");
                          }}
                          className="flex items-center justify-between px-3 py-2.5 sm:py-2 min-h-[42px] rounded-lg text-slate-200 hover:bg-white/5 hover:text-white cursor-pointer transition-colors"
                        >
                          <div className="flex items-center gap-2.5">
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
                    </>
                  ) : (
                    <>
                      {filteredCountries.slice(0, 8).map((c) => (
                            <CommandItem
                              key={c.id}
                              value={`${c.name} ${c.id} ${c.capital} ${c.region} ${c.subregion || ""} ${c.aliases.join(" ")}`}
                              onSelect={() => {
                                selectCountry(c);
                                setMobileTab("map");
                              }}
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
                    </>
                  )}
                </CommandList>
              </div>
            )}
          </Command>
        </div>

        {/* 2-Column Command Desk: Map (7) + Dossier (5) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 items-start">
          {/* Map Column (7 cols) */}
          <div
            className={`lg:col-span-7 flex flex-col gap-3 ${
              mobileTab === "map" ? "block" : "hidden lg:flex"
            }`}
          >
            {/* Division Filters (Bangladesh) */}
            {realm === "bangladesh" && (
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                <span className="text-xs font-mono text-slate-400 font-medium shrink-0 flex items-center gap-1 mr-1">
                  <Layers className="size-3 text-emerald-400" /> Division:
                </span>
                {BD_DIVISIONS.map((div) => (
                  <button
                    key={div}
                    onClick={() => setDivisionFilter(div)}
                    className={`px-2.5 py-1 rounded-lg shrink-0 text-xs font-medium border transition-colors ${
                      divisionFilter === div
                        ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                        : "bg-black/40 text-slate-400 border-white/5 hover:text-white"
                    }`}
                  >
                    {div}
                  </button>
                ))}
              </div>
            )}

            {/* Map Box */}
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
                setHoveredBD(null);
                setHoveredWorld(null);
              }}
              className="relative w-full h-[55vh] sm:h-136 lg:h-[calc(100vh-140px)] min-h-[360px] sm:min-h-120 rounded-2xl overflow-hidden border border-white/10 bg-[#090d16] shadow-2xl flex flex-col items-center justify-center select-none"
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
                  className="size-8 rounded-lg hover:bg-white/10 text-slate-300"
                >
                  <ZoomIn className="size-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleZoomOut}
                  title="Zoom Out"
                  aria-label="Zoom Out"
                  className="size-8 rounded-lg hover:bg-white/10 text-slate-300"
                >
                  <ZoomOut className="size-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleResetZoom}
                  title="Recenter"
                  aria-label="Recenter"
                  className="size-8 rounded-lg hover:bg-white/10 text-slate-300"
                >
                  <RotateCcw className="size-4" />
                </Button>
              </div>

              {/* Active Selection Callout */}
              <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-10 flex items-center gap-2 bg-[#0c101c]/90 border border-amber-500/30 text-slate-200 text-xs px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full backdrop-blur-md">
                <span className="size-1.5 sm:size-2 rounded-full bg-amber-400 animate-pulse shrink-0" />
                {realm === "world" && selectedWorld?.flagEmoji && (
                  <span className="text-sm sm:text-base">
                    {selectedWorld.flagEmoji}
                  </span>
                )}
                <span className="font-bold text-white text-2xs sm:text-xs">
                  {realm === "bangladesh"
                    ? selectedBD?.name
                    : selectedWorld?.name}
                </span>
                <span className="text-amber-400/80 text-2xs hidden sm:inline font-mono">
                  (Selected)
                </span>
              </div>

              {/* Render Map Canvas */}
              {realm === "bangladesh" ? (
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
                        const selectedGeo = selectedBD
                          ? geographies.find(
                              (g) =>
                                (g.properties?.shapeName as string | undefined)?.toLowerCase() ===
                                selectedBD.name.toLowerCase(),
                            )
                          : null;
                        const hoveredGeo = hoveredBD
                          ? geographies.find(
                              (g) =>
                                (g.properties?.shapeName as string | undefined)?.toLowerCase() ===
                                hoveredBD.name.toLowerCase(),
                            )
                          : null;
                        const neighborGeos = selectedBD
                          ? geographies.filter((g) => {
                              const sName = (g.properties?.shapeName as string | undefined)?.toLowerCase();
                              return (
                                Boolean(sName) &&
                                selectedBD.borders.some(
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
                                selectedBD?.name.toLowerCase() ===
                                districtName.toLowerCase();
                              const isNeighbor = selectedBD?.borders.some(
                                (b) =>
                                  b.toLowerCase() ===
                                  districtName.toLowerCase(),
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
                                    if (district) setHoveredBD(district);
                                  }}
                                  onMouseLeave={() => {
                                    setHoveredBD(null);
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

                            {/* OVERLAY 1: Neighbor districts - complete perimeter, opacity-controlled fill */}
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

                            {/* OVERLAY 2: Selected Target - complete perimeter on top, opacity-controlled fill */}
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

                            {/* OVERLAY 3: Hovered district overlay - complete perimeter on top */}
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
                    {selectedBD && (
                      <TargetPulseMarker
                        coordinates={[
                          selectedBD.coordinates[1],
                          selectedBD.coordinates[0],
                        ]}
                        zoom={position.zoom}
                        fillColor="#f59e0b"
                      />
                    )}

                    {/* Marker on hovered district */}
                    {hoveredBD && hoveredBD.name !== selectedBD?.name && (
                      <TargetPulseMarker
                        coordinates={[
                          hoveredBD.coordinates[1],
                          hoveredBD.coordinates[0],
                        ]}
                        zoom={position.zoom}
                        fillColor="#38bdf8"
                      />
                    )}
                  </ZoomableGroup>
                </ComposableMap>
              ) : (
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
                        const effectiveBorders = selectedWorld
                          ? getEffectiveBorders(selectedWorld)
                          : [];
                        const selectedGeo = selectedWorld
                          ? geographies.find((g) => {
                              const gid = String(g.id);
                              const c =
                                COUNTRIES_BY_NUMERIC.get(gid) ||
                                COUNTRIES_BY_NUMERIC.get(
                                  String(parseInt(gid, 10)),
                                );
                              return c?.id === selectedWorld.id;
                            })
                          : null;
                        const hoveredGeo = hoveredWorld
                          ? geographies.find((g) => {
                              const gid = String(g.id);
                              const c =
                                COUNTRIES_BY_NUMERIC.get(gid) ||
                                COUNTRIES_BY_NUMERIC.get(
                                  String(parseInt(gid, 10)),
                                );
                              return c?.id === hoveredWorld.id;
                            })
                          : null;
                        const neighborGeos = selectedWorld
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
                                selectedWorld?.id === country?.id;
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
                                    if (country) setHoveredWorld(country);
                                  }}
                                  onMouseLeave={() => {
                                    setHoveredWorld(null);
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

                            {/* OVERLAY 1: Neighbor countries - complete perimeter, opacity-controlled fill */}
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

                            {/* OVERLAY 2: Selected Target - complete perimeter on top, opacity-controlled fill */}
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

                            {/* OVERLAY 3: Hovered country overlay - complete perimeter on top */}
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

                    {selectedWorld && (
                      <TargetPulseMarker
                        coordinates={[
                          selectedWorld.coordinates[1],
                          selectedWorld.coordinates[0],
                        ]}
                        zoom={position.zoom}
                        fillColor="#f59e0b"
                      />
                    )}

                    {hoveredWorld && hoveredWorld.id !== selectedWorld?.id && (
                      <TargetPulseMarker
                        coordinates={[
                          hoveredWorld.coordinates[1],
                          hoveredWorld.coordinates[0],
                        ]}
                        zoom={position.zoom}
                        fillColor="#38bdf8"
                      />
                    )}
                  </ZoomableGroup>
                </ComposableMap>
              )}

              {/* Mobile Bottom Inspection Sheet */}
              <div className="lg:hidden absolute bottom-2 left-2 right-2 z-20 flex items-center justify-between p-3 rounded-2xl border border-white/10 bg-[#0c101c]/95 backdrop-blur-xl shadow-2xl">
                <div className="flex items-center gap-2.5 overflow-hidden mr-2">
                  {realm === "world" && selectedWorld?.flagEmoji && (
                    <span className="text-2xl shrink-0">
                      {selectedWorld.flagEmoji}
                    </span>
                  )}
                  <div className="truncate">
                    <h4 className="font-bold text-white text-xs sm:text-sm truncate">
                      {realm === "bangladesh"
                        ? selectedBD?.name
                        : selectedWorld?.name}
                    </h4>
                    <p className="text-2xs text-slate-400 truncate">
                      {realm === "bangladesh"
                        ? `${selectedBD?.division} Division • ${selectedBD?.borders.length} Borders`
                        : `${selectedWorld?.capital} • ${selectedWorld?.region}`}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setMobileTab("dossier")}
                  className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center gap-1 shadow-md shadow-purple-950/50 cursor-pointer shrink-0"
                >
                  <span>Details</span>
                  <ArrowRight className="size-3" />
                </button>
              </div>

              {/* Legend (desktop) */}
              <div className="hidden lg:flex absolute bottom-2 left-3 right-3 sm:left-4 sm:right-auto z-10 flex-wrap items-center gap-2 sm:gap-3 bg-[#0c101c]/90 px-3 py-1.5 rounded-xl border border-white/10 text-xs text-slate-300 backdrop-blur-md">
                <div className="flex items-center gap-1.5">
                  <span className="size-2.5 rounded-full bg-amber-400 ring-2 ring-amber-400/20" />
                  <span>Selected</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="size-2.5 rounded-full bg-sky-500 ring-2 ring-sky-500/20" />
                  <span>Neighbor</span>
                </div>
              </div>

              {/* Elevated Floating Reconnaissance Pill */}
              {(hoveredBD || hoveredWorld) && (
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
                    {realm === "world" && hoveredWorld?.flagEmoji && (
                      <span className="text-base leading-none">
                        {hoveredWorld.flagEmoji}
                      </span>
                    )}
                    <span className="font-bold text-white">
                      {realm === "bangladesh"
                        ? hoveredBD?.name
                        : hoveredWorld?.name}
                    </span>
                    <span className="text-slate-400 text-2xs border-l border-white/10 pl-2">
                      {realm === "bangladesh"
                        ? `${hoveredBD?.division} Division`
                        : hoveredWorld?.capital
                        ? hoveredWorld.capital
                        : hoveredWorld?.region}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Dossier & Quick Search Column (5 cols) */}
          <div
            className={`lg:col-span-5 space-y-3 lg:h-[calc(100vh-140px)] lg:overflow-y-auto pr-0 lg:pr-1 ${
              mobileTab === "dossier" ? "block" : "hidden lg:block"
            }`}
          >
            {/* Mobile Back-to-Map button */}
            <button
              onClick={() => setMobileTab("map")}
              className="lg:hidden w-full py-2.5 px-3 rounded-xl bg-white/5 border border-white/10 text-sky-400 hover:text-white flex items-center justify-center gap-2 text-xs font-semibold"
            >
              <Map className="size-3.5" />
              <span>Back to Map View</span>
            </button>
            {/* Search Input on Desktop (matches game mode Command component) */}
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
                    placeholder={
                      realm === "bangladesh"
                        ? "Type district name (Dhaka, Sylhet)..."
                        : "Type country name (Japan, France)..."
                    }
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
                      {realm === "bangladesh" ? (
                        <>
                          {filteredDistricts.slice(0, 8).map((d) => (
                            <CommandItem
                              key={d.id}
                              value={d.name}
                              onSelect={() => selectDistrict(d)}
                              className="flex items-center justify-between px-3 py-2.5 sm:py-2 min-h-[42px] rounded-lg text-slate-200 hover:bg-white/5 hover:text-white cursor-pointer transition-colors"
                            >
                              <div className="flex items-center gap-2.5">
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
                        </>
                      ) : (
                        <>
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
                        </>
                      )}
                    </CommandList>
                  </div>
                )}
              </Command>
            </div>

            {/* Dossier Card */}
            {realm === "bangladesh" && selectedBD ? (
              <div className="rounded-2xl border border-white/10 bg-[#0c101c] p-5 shadow-2xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/5">
                  <div className="flex items-center gap-3">
                    <div>
                      <h3 className="text-xl font-black text-white">
                        {selectedBD.name}
                      </h3>
                      <p className="text-xs text-emerald-400 font-medium">
                        {selectedBD.division} Division • Bangladesh
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className="border-emerald-500/30 text-emerald-300 font-mono text-2xs"
                  >
                    {selectedBD.isCoastal
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
                      {selectedBD.coordinates[0].toFixed(2)}°N,{" "}
                      {selectedBD.coordinates[1].toFixed(2)}°E
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
                    <span className="text-slate-400 text-xs flex items-center gap-1">
                      <Layers className="size-3 text-emerald-400" /> Neighboring
                      Districts
                    </span>
                    <span className="font-mono text-white font-semibold">
                      {selectedBD.borders.length} Neighbors
                    </span>
                  </div>
                </div>

                {/* Trivia Fact */}
                <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 space-y-1 text-xs leading-relaxed">
                  <span className="text-amber-400 font-semibold flex items-center gap-1.5">
                    <Sparkles className="size-3.5" /> Did you know?
                  </span>
                  <p className="text-slate-300">{selectedBD.triviaFact}</p>
                </div>

                {/* Bordering Neighbors Interactive List */}
                <div className="space-y-2">
                  <h4 className="text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider">
                    Bordering Districts (click to jump):
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedBD.borders.map((neighborName) => {
                      const neighborData = DISTRICTS_BY_NAME.get(
                        neighborName.toLowerCase(),
                      );
                      return (
                        <button
                          key={neighborName}
                          onMouseEnter={() => {
                            if (neighborData) setHoveredBD(neighborData);
                          }}
                          onMouseLeave={() => {
                            setHoveredBD(null);
                          }}
                          onClick={() => {
                            if (neighborData) {
                              selectDistrict(neighborData);
                              setHoveredBD(null);
                              setMobileTab("map");
                            }
                          }}
                          className="px-2.5 py-1.5 rounded-lg text-xs bg-sky-950/40 border border-sky-500/30 text-sky-300 hover:bg-sky-500 hover:text-white transition-colors cursor-pointer"
                        >
                          {neighborName} ↗
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : selectedWorld ? (
              <div className="rounded-2xl border border-white/10 bg-[#0c101c] p-5 shadow-2xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/5">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{selectedWorld.flagEmoji}</span>
                    <div>
                      <h3 className="text-xl font-black text-white">
                        {selectedWorld.name}
                      </h3>
                      {selectedWorld.officialName &&
                        selectedWorld.officialName !== selectedWorld.name && (
                          <p className="text-2xs text-slate-400 italic truncate max-w-[220px]">
                            {selectedWorld.officialName}
                          </p>
                        )}
                      <p className="text-xs text-sky-400 font-medium">
                        {selectedWorld.region} • {selectedWorld.subregion}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge
                      variant="outline"
                      className="border-sky-500/30 text-sky-300 font-mono text-2xs"
                    >
                      {selectedWorld.id}
                    </Badge>
                    {selectedWorld.isIsland && (
                      <Badge
                        variant="outline"
                        className="border-sky-500/30 text-sky-400 font-sans text-2xs"
                      >
                        Island State
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Specs */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
                    <span className="text-slate-400 text-xs flex items-center gap-1">
                      <MapPin className="size-3 text-emerald-400" /> Capital
                      City
                    </span>
                    <span className="font-semibold text-white">
                      {selectedWorld.capital}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
                    <span className="text-slate-400 text-xs flex items-center gap-1">
                      <Users className="size-3 text-sky-400" /> Population
                    </span>
                    <span className="font-semibold font-mono text-white">
                      {selectedWorld.population ? selectedWorld.population.toLocaleString() : "N/A"}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
                    <span className="text-slate-400 text-xs flex items-center gap-1">
                      <Maximize2 className="size-3 text-amber-400" /> Surface Area
                    </span>
                    <span className="font-semibold font-mono text-white">
                      {selectedWorld.area ? `${selectedWorld.area.toLocaleString()} km²` : "N/A"}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
                    <span className="text-slate-400 text-xs flex items-center gap-1">
                      <Compass className="size-3 text-purple-400" /> Coordinates
                    </span>
                    <span className="font-semibold font-mono text-white">
                      {Math.abs(selectedWorld.coordinates[0]).toFixed(1)}°{selectedWorld.coordinates[0] >= 0 ? "N" : "S"},{" "}
                      {Math.abs(selectedWorld.coordinates[1]).toFixed(1)}°{selectedWorld.coordinates[1] >= 0 ? "E" : "W"}
                    </span>
                  </div>
                </div>

                {/* Trivia */}
                <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 space-y-1 text-xs leading-relaxed">
                  <span className="text-amber-400 font-semibold flex items-center gap-1.5">
                    <Sparkles className="size-3.5" /> Did you know?
                  </span>
                  <p className="text-slate-300">{selectedWorld.triviaFact}</p>
                </div>

                {/* Neighbors */}
                <div className="space-y-2">
                  <h4 className="text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider">
                    {selectedWorld.borders.length === 0
                      ? "Nearby Maritime Neighbors:"
                      : `Bordering Countries (${selectedWorld.borders.length}):`}
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {getEffectiveBorders(selectedWorld).map((iso) => {
                      const neighbor = COUNTRIES_BY_ID.get(iso);
                      return (
                        <button
                          key={iso}
                          onMouseEnter={() => {
                            if (neighbor) setHoveredWorld(neighbor);
                          }}
                          onMouseLeave={() => {
                            setHoveredWorld(null);
                          }}
                          onClick={() => {
                            if (neighbor) {
                              selectCountry(neighbor);
                              setHoveredWorld(null);
                              setMobileTab("map");
                            }
                          }}
                          className="px-2.5 py-1.5 rounded-lg text-xs bg-sky-950/40 border border-sky-500/30 text-sky-300 hover:bg-sky-500 hover:text-white transition-colors cursor-pointer"
                        >
                          {neighbor
                            ? `${neighbor.flagEmoji} ${neighbor.name}`
                            : iso}{" "}
                          ↗
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-6 text-center text-xs text-slate-500 mt-12 bg-[#070a12]">
        <p>Borderline • Free-Roam Atlas & Geography Explorer</p>
      </footer>
    </div>
  );
}
