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
  Marker,
} from "react-simple-maps";
import {
  BookOpen,
  Search,
  Globe2,
  MapPin,
  Users,
  Compass,
  Sparkles,
  Layers,
  ZoomIn,
  ZoomOut,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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

export default function ExplorePage() {
  const [realm, setRealm] = useState<"bangladesh" | "world">("bangladesh");
  const [selectedBD, setSelectedBD] = useState<DistrictData>(
    BANGLADESH_DISTRICTS[0],
  );
  const [selectedWorld, setSelectedWorld] = useState<CountryData>(COUNTRIES[0]);
  const [searchQuery, setSearchQuery] = useState("");
  const [divisionFilter, setDivisionFilter] = useState("All");

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
    if (newRealm === "bangladesh") {
      setPosition({ coordinates: [90.3563, 23.685], zoom: 1 });
    } else {
      setPosition({ coordinates: [0, 20], zoom: 1 });
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
    setPosition({
      coordinates: [dist.coordinates[1], dist.coordinates[0]],
      zoom: 3.5,
    });
  };

  // Inspect country
  const selectCountry = (c: CountryData) => {
    setSelectedWorld(c);
    setPosition({
      coordinates: [c.coordinates[1], c.coordinates[0]],
      zoom: c.area < 100000 ? 4 : 2.5,
    });
  };

  const filteredDistricts = useMemo(() => {
    return BANGLADESH_DISTRICTS.filter((d) => {
      const matchesSearch =
        d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.division.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDivision =
        divisionFilter === "All" || d.division === divisionFilter;
      return matchesSearch && matchesDivision;
    });
  }, [searchQuery, divisionFilter]);

  const filteredCountries = useMemo(() => {
    return COUNTRIES.filter((c) => {
      return (
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.region.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.capital.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  }, [searchQuery]);

  return (
    <div className="flex flex-col min-h-screen bg-[#070a12] text-slate-100 selection:bg-purple-500 selection:text-white">
      <Header />

      <main className="flex-1 w-full px-2 sm:px-3 py-2 sm:py-2.5 space-y-2.5">
        {/* Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-3 sm:p-3.5 rounded-xl border border-white/[0.08] bg-[#0c101c] shadow-lg">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <BookOpen className="size-4" />
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-wide">
                Tactical Geography Atlas & Dossier
              </h2>
            </div>
            <p className="text-xs text-slate-400">
              Free-roam exploration desk. Click any shape to inspect borders,
              demographic figures, and cultural trivia.
            </p>
          </div>

          {/* Realm Switcher */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleRealmChange("bangladesh")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 border transition-all ${
                realm === "bangladesh"
                  ? "bg-emerald-600 border-emerald-500 text-white shadow-lg shadow-emerald-950/50"
                  : "bg-black/40 border-white/[0.06] text-slate-400 hover:text-white"
              }`}
            >
              <span>🇧🇩</span> Bangladesh (64)
            </button>
            <button
              onClick={() => handleRealmChange("world")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 border transition-all ${
                realm === "world"
                  ? "bg-sky-600 border-sky-500 text-white shadow-lg shadow-sky-950/50"
                  : "bg-black/40 border-white/[0.06] text-slate-400 hover:text-white"
              }`}
            >
              <Globe2 className="size-3.5 text-sky-400" /> World (195)
            </button>
          </div>
        </div>

        {/* 2-Column Command Desk: Map (7) + Dossier (5) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Map Column (7 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-3">
            {/* Division Filters (Bangladesh) */}
            {realm === "bangladesh" && (
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                <span className="text-[11px] font-mono text-slate-400 font-medium shrink-0 flex items-center gap-1 mr-1">
                  <Layers className="size-3 text-emerald-400" /> Division:
                </span>
                {BD_DIVISIONS.map((div) => (
                  <button
                    key={div}
                    onClick={() => setDivisionFilter(div)}
                    className={`px-2.5 py-1 rounded-lg shrink-0 text-[11px] font-medium border transition-colors ${
                      divisionFilter === div
                        ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                        : "bg-black/40 text-slate-400 border-white/[0.06] hover:text-white"
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
              className="relative w-full h-[450px] sm:h-[540px] lg:h-[calc(100vh-140px)] min-h-[480px] rounded-2xl overflow-hidden border border-white/[0.08] bg-[#090d16] shadow-2xl flex flex-col items-center justify-center select-none"
            >
              <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />

              {/* Floating Controls */}
              <div className="absolute top-4 right-4 z-10 flex flex-col gap-1.5 bg-[#0c101c]/90 p-1.5 rounded-xl border border-white/10 backdrop-blur-md shadow-lg">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleZoomIn}
                  title="Zoom In"
                  aria-label="Zoom In"
                  className="size-8 rounded-lg hover:bg-white/[0.06] text-slate-300"
                >
                  <ZoomIn className="size-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleZoomOut}
                  title="Zoom Out"
                  aria-label="Zoom Out"
                  className="size-8 rounded-lg hover:bg-white/[0.06] text-slate-300"
                >
                  <ZoomOut className="size-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleResetZoom}
                  title="Recenter"
                  aria-label="Recenter"
                  className="size-8 rounded-lg hover:bg-white/[0.06] text-slate-300"
                >
                  <RotateCcw className="size-4" />
                </Button>
              </div>

              {/* Active Selection Callout */}
              <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-[#0c101c]/90 border border-white/10 text-slate-200 text-xs px-3 py-1.5 rounded-full backdrop-blur-md">
                <span className="text-base">
                  {realm === "bangladesh"
                    ? selectedBD?.flagEmoji
                    : selectedWorld?.flagEmoji}
                </span>
                <span className="font-bold">
                  {realm === "bangladesh"
                    ? selectedBD?.name
                    : selectedWorld?.name}
                </span>
                <span className="text-slate-400 text-[10px] hidden sm:inline">
                  (Click any shape to inspect)
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
                        const selectedGeo = selectedBD
                          ? geographies.find(
                              (g) =>
                                (
                                  g.properties.shapeName as string
                                ).toLowerCase() ===
                                selectedBD.name.toLowerCase(),
                            )
                          : null;
                        const neighborGeos = selectedBD
                          ? geographies.filter((g) =>
                              selectedBD.borders.some(
                                (b) =>
                                  b.toLowerCase() ===
                                  (
                                    g.properties.shapeName as string
                                  ).toLowerCase(),
                              ),
                            )
                          : [];

                        return (
                          <>
                            {geographies.map((geo) => {
                              const districtName = geo.properties
                                .shapeName as string;
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
                                ? "#162035"
                                : "#0d1320";
                              let stroke = isInFilteredDivision
                                ? "#2b3b57"
                                : "#1c2638";

                              if (isSelected) {
                                fill = "#10b981"; // Emerald selected
                                stroke = "#34d399";
                              } else if (isNeighbor) {
                                fill = "#0284c7"; // Cyan neighbor
                                stroke = "#38bdf8";
                              }

                              return (
                                <Geography
                                  key={geo.rsmKey}
                                  geography={geo}
                                  onClick={() => {
                                    if (district) selectDistrict(district);
                                  }}
                                  style={{
                                    default: {
                                      fill,
                                      stroke,
                                      strokeWidth: 0.65,
                                      vectorEffect: "non-scaling-stroke",
                                      outline: "none",
                                      transition: "fill 200ms ease",
                                    },
                                    hover: {
                                      fill: isSelected ? fill : "#1e3a5f",
                                      stroke: "#60a5fa",
                                      strokeWidth: 0.65,
                                      vectorEffect: "non-scaling-stroke",
                                      outline: "none",
                                      cursor: "pointer",
                                    },
                                  }}
                                />
                              );
                            })}

                            {/* Overlays for selected territory & borders: unbroken perimeter, translucent fill */}
                            {neighborGeos.map((geo) => (
                              <Geography
                                key={`overlay-bd-nb-${geo.rsmKey}`}
                                geography={geo}
                                style={{
                                  default: {
                                    fill: "rgba(2, 132, 199, 0.2)",
                                    stroke: "#38bdf8",
                                    strokeWidth: 0.65,
                                    vectorEffect: "non-scaling-stroke",
                                    pointerEvents: "none",
                                  },
                                  hover: {
                                    fill: "rgba(2, 132, 199, 0.2)",
                                    stroke: "#38bdf8",
                                    strokeWidth: 0.65,
                                    vectorEffect: "non-scaling-stroke",
                                    pointerEvents: "none",
                                  },
                                }}
                              />
                            ))}

                            {selectedGeo && (
                              <Geography
                                key={`overlay-bd-sel-${selectedGeo.rsmKey}`}
                                geography={selectedGeo}
                                style={{
                                  default: {
                                    fill: "rgba(16, 185, 129, 0.2)",
                                    stroke: "#34d399",
                                    strokeWidth: 0.65,
                                    vectorEffect: "non-scaling-stroke",
                                    pointerEvents: "none",
                                  },
                                  hover: {
                                    fill: "rgba(16, 185, 129, 0.2)",
                                    stroke: "#34d399",
                                    strokeWidth: 0.65,
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
                      <Marker
                        coordinates={[
                          selectedBD.coordinates[1],
                          selectedBD.coordinates[0],
                        ]}
                      >
                        <circle
                          r={5}
                          fill="#10b981"
                          stroke="#ffffff"
                          strokeWidth={1.5}
                          className="animate-ping opacity-75"
                        />
                        <circle r={3} fill="#ffffff" />
                      </Marker>
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
                              const isNeighbor =
                                country?.id &&
                                effectiveBorders.includes(country.id);

                              let fill = "#131b2e";
                              let stroke = "#24324a";

                              if (isSelected) {
                                fill = "#0284c7";
                                stroke = "#38bdf8";
                              } else if (isNeighbor) {
                                fill = "#4f46e5";
                                stroke = "#818cf8";
                              }

                              return (
                                <Geography
                                  key={geo.rsmKey}
                                  geography={geo}
                                  onClick={() => {
                                    if (country) selectCountry(country);
                                  }}
                                  style={{
                                    default: {
                                      fill,
                                      stroke,
                                      strokeWidth: 0.55,
                                      vectorEffect: "non-scaling-stroke",
                                      outline: "none",
                                    },
                                    hover: {
                                      fill: isSelected ? fill : "#1e2c45",
                                      stroke: "#94a3b8",
                                      strokeWidth: 0.55,
                                      vectorEffect: "non-scaling-stroke",
                                      outline: "none",
                                      cursor: "pointer",
                                    },
                                  }}
                                />
                              );
                            })}

                            {/* Overlays for selected country & borders: unbroken perimeter, translucent fill */}
                            {neighborGeos.map((geo) => (
                              <Geography
                                key={`overlay-world-nb-${geo.rsmKey}`}
                                geography={geo}
                                style={{
                                  default: {
                                    fill: "rgba(79, 70, 229, 0.2)",
                                    stroke: "#818cf8",
                                    strokeWidth: 0.55,
                                    vectorEffect: "non-scaling-stroke",
                                    pointerEvents: "none",
                                  },
                                  hover: {
                                    fill: "rgba(79, 70, 229, 0.2)",
                                    stroke: "#818cf8",
                                    strokeWidth: 0.55,
                                    vectorEffect: "non-scaling-stroke",
                                    pointerEvents: "none",
                                  },
                                }}
                              />
                            ))}

                            {selectedGeo && (
                              <Geography
                                key={`overlay-world-sel-${selectedGeo.rsmKey}`}
                                geography={selectedGeo}
                                style={{
                                  default: {
                                    fill: "rgba(2, 132, 199, 0.22)",
                                    stroke: "#38bdf8",
                                    strokeWidth: 0.55,
                                    vectorEffect: "non-scaling-stroke",
                                    pointerEvents: "none",
                                  },
                                  hover: {
                                    fill: "rgba(2, 132, 199, 0.22)",
                                    stroke: "#38bdf8",
                                    strokeWidth: 0.55,
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
                      <Marker
                        coordinates={[
                          selectedWorld.coordinates[1],
                          selectedWorld.coordinates[0],
                        ]}
                      >
                        <circle
                          r={5}
                          fill="#0284c7"
                          stroke="#ffffff"
                          strokeWidth={1.5}
                          className="animate-ping opacity-75"
                        />
                        <circle r={3} fill="#ffffff" />
                      </Marker>
                    )}
                  </ZoomableGroup>
                </ComposableMap>
              )}

              {/* Legend */}
              <div className="absolute bottom-2 left-3 right-3 sm:left-4 sm:right-auto z-10 flex flex-wrap items-center gap-2 sm:gap-3 bg-[#0c101c]/90 px-3 py-1.5 rounded-xl border border-white/10 text-[11px] text-slate-300 backdrop-blur-md">
                <div className="flex items-center gap-1.5">
                  <span className="size-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-500/20" />
                  <span>Selected</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="size-2.5 rounded-full bg-sky-500 ring-2 ring-sky-500/20" />
                  <span>Border Neighbor</span>
                </div>
              </div>
            </div>
          </div>

          {/* Dossier & Quick Search Column (5 cols) */}
          <div className="lg:col-span-5 space-y-3 lg:h-[calc(100vh-140px)] lg:overflow-y-auto pr-0 lg:pr-1">
            {/* Search Input */}
            <div className="relative">
              <Search className="size-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="text"
                placeholder={
                  realm === "bangladesh"
                    ? "Search 64 districts (e.g. Bogura, Sylhet)..."
                    : "Search 195 countries or capitals..."
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[#0c101c] border border-white/10 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/40"
              />
            </div>

            {/* Dossier Card */}
            {realm === "bangladesh" && selectedBD ? (
              <div className="rounded-2xl border border-white/[0.08] bg-[#0c101c] p-5 shadow-2xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{selectedBD.flagEmoji}</span>
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
                    className="border-emerald-500/30 text-emerald-300 font-mono text-[10px]"
                  >
                    {selectedBD.isCoastal
                      ? "Coastal District"
                      : "Inland District"}
                  </Badge>
                </div>

                {/* Spatial Specs */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-3 rounded-xl bg-black/40 border border-white/[0.06] space-y-1">
                    <span className="text-slate-400 text-[11px] flex items-center gap-1">
                      <Compass className="size-3 text-sky-400" /> Centroid
                      Coordinates
                    </span>
                    <span className="font-mono text-white font-semibold">
                      {selectedBD.coordinates[0].toFixed(2)}°N,{" "}
                      {selectedBD.coordinates[1].toFixed(2)}°E
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-black/40 border border-white/[0.06] space-y-1">
                    <span className="text-slate-400 text-[11px] flex items-center gap-1">
                      <Layers className="size-3 text-emerald-400" /> Bordering
                      Count
                    </span>
                    <span className="font-mono text-white font-semibold">
                      {selectedBD.borders.length} Adjacent Districts
                    </span>
                  </div>
                </div>

                {/* Trivia Fact */}
                <div className="p-3.5 rounded-xl bg-black/40 border border-white/[0.06] space-y-1 text-xs leading-relaxed">
                  <span className="text-amber-400 font-semibold flex items-center gap-1.5">
                    <Sparkles className="size-3.5" /> Cultural & Cartographic
                    Fact
                  </span>
                  <p className="text-slate-300">{selectedBD.triviaFact}</p>
                </div>

                {/* Bordering Neighbors Interactive List */}
                <div className="space-y-2">
                  <h4 className="text-[11px] font-mono font-semibold text-slate-400 uppercase tracking-wider">
                    Bordering Districts (Click to Pan):
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedBD.borders.map((neighborName) => {
                      const neighborData = DISTRICTS_BY_NAME.get(
                        neighborName.toLowerCase(),
                      );
                      return (
                        <button
                          key={neighborName}
                          onClick={() => {
                            if (neighborData) selectDistrict(neighborData);
                          }}
                          className="px-2.5 py-1 rounded-lg text-xs bg-sky-950/40 border border-sky-500/30 text-sky-300 hover:bg-sky-500 hover:text-white transition-colors"
                        >
                          {neighborName} ↗
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : selectedWorld ? (
              <div className="rounded-2xl border border-white/[0.08] bg-[#0c101c] p-5 shadow-2xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{selectedWorld.flagEmoji}</span>
                    <div>
                      <h3 className="text-xl font-black text-white">
                        {selectedWorld.name}
                      </h3>
                      <p className="text-xs text-sky-400 font-medium">
                        {selectedWorld.region} • {selectedWorld.subregion}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className="border-sky-500/30 text-sky-300 font-mono text-[10px]"
                  >
                    {selectedWorld.id}
                  </Badge>
                </div>

                {/* Specs */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-3 rounded-xl bg-black/40 border border-white/[0.06] space-y-1">
                    <span className="text-slate-400 text-[11px] flex items-center gap-1">
                      <MapPin className="size-3 text-emerald-400" /> Capital
                      City
                    </span>
                    <span className="font-semibold text-white">
                      {selectedWorld.capital}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-black/40 border border-white/[0.06] space-y-1">
                    <span className="text-slate-400 text-[11px] flex items-center gap-1">
                      <Users className="size-3 text-sky-400" /> Population
                    </span>
                    <span className="font-semibold font-mono text-white">
                      {selectedWorld.population.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Trivia */}
                <div className="p-3.5 rounded-xl bg-black/40 border border-white/[0.06] space-y-1 text-xs leading-relaxed">
                  <span className="text-amber-400 font-semibold flex items-center gap-1.5">
                    <Sparkles className="size-3.5" /> Cartographic Dossier
                  </span>
                  <p className="text-slate-300">{selectedWorld.triviaFact}</p>
                </div>

                {/* Neighbors */}
                <div className="space-y-2">
                  <h4 className="text-[11px] font-mono font-semibold text-slate-400 uppercase tracking-wider">
                    {selectedWorld.borders.length === 0
                      ? "Nearest Neighbor Nations (Click to Pan):"
                      : "Land Borders (Click to Pan):"}
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {getEffectiveBorders(selectedWorld).map((iso) => {
                      const neighbor = COUNTRIES_BY_ID.get(iso);
                      return (
                        <button
                          key={iso}
                          onClick={() => {
                            if (neighbor) selectCountry(neighbor);
                          }}
                          className="px-2.5 py-1 rounded-lg text-xs bg-sky-950/40 border border-sky-500/30 text-sky-300 hover:bg-sky-500 hover:text-white transition-colors"
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

            {/* Autocomplete list when typing */}
            {searchQuery.trim().length > 0 && (
              <div className="rounded-xl border border-white/10 bg-[#0c101c]/95 max-h-48 overflow-y-auto p-1.5 space-y-1 shadow-2xl">
                {realm === "bangladesh"
                  ? filteredDistricts.map((d) => (
                      <button
                        key={d.id}
                        onClick={() => selectDistrict(d)}
                        className="w-full text-left px-3 py-1.5 rounded-lg text-xs hover:bg-white/[0.06] flex items-center justify-between text-slate-300 hover:text-white"
                      >
                        <span className="font-semibold">{d.name}</span>
                        <span className="text-[11px] font-mono text-slate-500">
                          {d.division}
                        </span>
                      </button>
                    ))
                  : filteredCountries.slice(0, 20).map((c) => (
                      <button
                        key={c.id}
                        onClick={() => selectCountry(c)}
                        className="w-full text-left px-3 py-1.5 rounded-lg text-xs hover:bg-white/[0.06] flex items-center justify-between text-slate-300 hover:text-white"
                      >
                        <span className="font-semibold">
                          {c.flagEmoji} {c.name}
                        </span>
                        <span className="text-[11px] font-mono text-slate-500">
                          {c.capital}
                        </span>
                      </button>
                    ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] py-6 text-center text-xs text-slate-500 mt-12 bg-[#070a12]">
        <p>Borderline • Free-Roam Atlas & Geography Explorer</p>
      </footer>
    </div>
  );
}
