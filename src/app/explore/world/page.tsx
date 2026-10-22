"use client";

import React, { useState, useRef, useEffect } from "react";
import { Header } from "@/components/Header";
import { Map, Info, ArrowRight } from "lucide-react";
import {
  COUNTRIES,
  CountryData,
  COUNTRIES_BY_NUMERIC,
  COUNTRIES_BY_NAME,
  getEffectiveBorders,
  CONTINENT_CENTERS,
  SUBREGION_CENTERS,
} from "@/data/world";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from "react-simple-maps";
import { TargetPulseMarker } from "@/components/Map/TargetPulseMarker";
import { MapZoomControls } from "@/components/Map/MapZoomControls";
import { ExploreHeader } from "@/components/Explore/ExploreHeader";
import { CountrySearch } from "@/components/Explore/CountrySearch";
import { CountryProfileCard } from "@/components/Explore/CountryProfileCard";
import {
  ContinentFilterBar,
  getContinentForCountry,
} from "@/components/Explore/RegionFilterBar";

const WORLD_GEO_URL = "/data/world-countries-geo-50m.json";

export default function WorldExplorePage() {
  const [selectedCountry, setSelectedCountry] =
    useState<CountryData | null>(null);
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

  const [position, setPosition] = useState<{
    coordinates: [number, number];
    zoom: number;
  }>({
    coordinates: [0, 20],
    zoom: 1,
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
    setPosition((pos) => ({ ...pos, zoom: Math.min(pos.zoom * 1.6, 60) }));
  };

  const handleZoomOut = () => {
    setPosition((pos) => ({ ...pos, zoom: Math.max(pos.zoom / 1.6, 0.8) }));
  };

  const handleResetZoom = () => {
    flyTo([0, 20], 1);
  };

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
  };

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

  const isFilterActive =
    continentFilter !== "All" || subregionFilter !== "All";

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

  return (
    <div className="h-dvh max-h-dvh w-full overflow-hidden flex flex-col bg-[#070a12] text-slate-100 selection:bg-sky-500 selection:text-white lg:h-auto lg:max-h-none lg:min-h-screen lg:overflow-visible">
      <Header />

      <main className="flex-1 min-h-0 w-full max-w-7xl mx-auto p-2 sm:px-4 sm:py-4 flex flex-col gap-2 sm:space-y-4 overflow-hidden lg:overflow-visible">
        {/* Top Context Subheader (Desktop only to prevent mobile vertical overflow) */}
        <div className="hidden lg:block shrink-0">
          <ExploreHeader
            title="World Countries Explorer"
            badgeText="195 Countries"
            description="Browse world nations, capitals, populations, and neighboring borders at your own pace."
            playHref="/world"
            playLabel="Play World"
            switchHref="/explore/bangladesh"
            switchLabel="Bangladesh Explorer"
            switchShortLabel="BD"
            switchEmoji="🇧🇩"
            accentColor="sky"
          />
        </div>

        {/* Mobile Tab Switcher */}
        <div className="lg:hidden grid grid-cols-2 items-center gap-1.5 p-1 rounded-2xl bg-[#0c101c] border border-white/10 shrink-0 text-xs font-semibold">
          <button
            onClick={() => setMobileTab("map")}
            className={`flex-1 py-1.5 px-3 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
              mobileTab === "map"
                ? "bg-sky-600 text-white shadow-md shadow-sky-950/60"
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
                ? "bg-amber-600 text-white shadow-md shadow-amber-950/60"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Info className="size-3.5" />
            <span className="truncate">
              {selectedCountry ? selectedCountry.name : "Info"}
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
            {/* Continent / Subregion Filter Bar */}
            <div className="shrink-0">
              <ContinentFilterBar
                selectedContinent={continentFilter}
                onSelectContinent={handleSelectContinent}
                selectedSubregion={subregionFilter}
                onSelectSubregion={handleSelectSubregion}
              />
            </div>

            {/* Map Container */}
            <div
              ref={mapContainerRef}
              onMouseLeave={() => setHoveredCountry(null)}
              className="relative w-full flex-1 min-h-0 lg:h-[calc(100vh-250px)] lg:min-h-[460px] rounded-2xl overflow-hidden border border-white/10 bg-[#090d16] shadow-2xl flex flex-col items-center justify-center select-none"
            >
              <div className="absolute inset-0 bg-tactical-grid opacity-40 pointer-events-none" />

              {/* Floating Controls */}
              <MapZoomControls
                onZoomIn={handleZoomIn}
                onZoomOut={handleZoomOut}
                onResetZoom={handleResetZoom}
                resetTitle="Recenter World Map"
              />

              {/* Top-Left Unified Callout (Selection + Hover in same overlay) */}
              <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-10 pointer-events-none select-none">
                {activeCountry ? (
                  <div
                    className={`flex items-center gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full backdrop-blur-md text-xs transition-all duration-150 ${
                      isHovering
                        ? "bg-[#0c101c]/95 border border-sky-400/50 text-slate-200 shadow-2xl ring-1 ring-sky-500/25"
                        : "bg-[#0c101c]/90 border border-amber-500/30 text-slate-200 shadow-lg"
                    }`}
                  >
                    <span
                      className={`size-1.5 sm:size-2 rounded-full shrink-0 animate-pulse ${
                        isHovering ? "bg-sky-400" : "bg-amber-400"
                      }`}
                    />
                    <span className="text-sm sm:text-base leading-none">
                      {activeCountry.flagEmoji}
                    </span>
                    <span className="font-bold text-white text-2xs sm:text-xs">
                      {activeCountry.name}
                    </span>
                    <span
                      className={`text-2xs font-mono border-l border-white/10 pl-2 ${
                        isHovering ? "text-slate-400" : "text-amber-400/90"
                      }`}
                    >
                      {activeCountry.capital || activeCountry.continent}
                    </span>
                    {isHovering && (isNeighbor || isHoverInFilterZone) && (
                      <span className="text-3xs font-mono uppercase px-1.5 py-0.5 rounded-md bg-sky-500/20 text-sky-300 border border-sky-500/40">
                        {isNeighbor
                          ? "Neighbor"
                          : subregionFilter !== "All"
                            ? hoveredCountry?.subregion
                            : hoveredCountry
                              ? getContinentForCountry(hoveredCountry)
                              : ""}
                      </span>
                    )}
                  </div>
                ) : isFilterActive ? (
                  <div className="flex items-center gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full backdrop-blur-md text-xs bg-[#0c101c]/90 border border-sky-500/30 text-slate-200 shadow-lg">
                    <span className="size-1.5 sm:size-2 rounded-full shrink-0 animate-pulse bg-sky-400" />
                    <span className="font-bold text-white text-2xs sm:text-xs">
                      {subregionFilter !== "All"
                        ? subregionFilter
                        : continentFilter}
                    </span>
                    <span className="text-3xs font-mono uppercase px-1.5 py-0.5 rounded-md bg-sky-500/20 text-sky-300 border border-sky-500/40">
                      Zone Highlighted
                    </span>
                  </div>
                ) : null}
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
                  onMoveEnd={(pos) => {
                    if (animRef.current) {
                      cancelAnimationFrame(animRef.current);
                      animRef.current = null;
                    }
                    setPosition(pos);
                  }}
                  maxZoom={60}
                  minZoom={1}
                >
                  <Geographies geography={WORLD_GEO_URL}>
                    {({ geographies }) => {
                      const strokeWidth = Math.max(
                        0.3,
                        Math.min(0.85, 0.55 / Math.sqrt(position.zoom)),
                      );

                      const getCountryFromGeo = (
                        g: (typeof geographies)[0],
                      ): CountryData | undefined => {
                        const gid = String(g.id);
                        return (
                          COUNTRIES_BY_NUMERIC.get(gid) ||
                          COUNTRIES_BY_NUMERIC.get(String(parseInt(gid, 10))) ||
                          (g.properties?.name
                            ? COUNTRIES_BY_NAME.get(
                                String(g.properties.name).toLowerCase(),
                              )
                            : undefined)
                        );
                      };

                      const selectedGeo = selectedCountry
                        ? geographies.find(
                            (g) =>
                              getCountryFromGeo(g)?.id === selectedCountry.id,
                          )
                        : null;
                      const hoveredGeo = hoveredCountry
                        ? geographies.find(
                            (g) =>
                              getCountryFromGeo(g)?.id === hoveredCountry.id,
                          )
                        : null;

                      // Highlight countries in active continent/subregion or neighbors
                      const highlightedGeos = geographies.filter((g) => {
                        const c = getCountryFromGeo(g);
                        if (!c || c.id === selectedCountry?.id) return false;
                        if (isFilterActive) {
                          return matchesFilter(c);
                        }
                        return Boolean(c.id && effectiveBorders.includes(c.id));
                      });

                      return (
                        <>
                          {geographies.map((geo) => {
                            const country = getCountryFromGeo(geo);
                            const isSelected = Boolean(
                              selectedCountry?.id &&
                                country?.id &&
                                selectedCountry.id === country.id,
                            );
                            const isNeighbor = Boolean(
                              country?.id &&
                                effectiveBorders.includes(country.id),
                            );
                            const isFilterMatch =
                              isFilterActive && matchesFilter(country);
                            const isHighlighted = isFilterActive
                              ? isFilterMatch && !isSelected
                              : isNeighbor && !isSelected;
                            const matchesActiveFilter =
                              !isFilterActive || isFilterMatch;

                            let fill = "#131b2e";
                            let stroke = "#24324a";

                            if (isSelected) {
                              fill = "#1a253a";
                              stroke = "#f59e0b";
                            } else if (isHighlighted) {
                              fill = "#0369a1";
                              stroke = "#38bdf8";
                            } else if (!matchesActiveFilter) {
                              fill = "#080c14";
                              stroke = "#141c2c";
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
                                    transition:
                                      "fill 200ms ease, stroke 200ms ease",
                                  },
                                  hover: {
                                    fill: "#1e2c45",
                                    stroke: isSelected
                                      ? "#fbbf24"
                                      : isHighlighted
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

                          {/* Overlay 1: Highlighted countries (Continent/Subregion or Neighbors) */}
                          {highlightedGeos.map((geo) => (
                            <Geography
                              key={`overlay-world-hl-${geo.rsmKey}`}
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
                  {hoveredCountry &&
                    hoveredCountry.id !== selectedCountry?.id && (
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
            </div>

            {/* Mobile Selection Callout on Map view */}
            {selectedCountry && (
              <div className="lg:hidden shrink-0 p-2.5 rounded-2xl bg-[#0c101c] border border-white/10 flex items-center justify-between text-xs shadow-xl">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-base shrink-0">
                    {selectedCountry.flagEmoji}
                  </span>
                  <div className="truncate">
                    <div className="font-bold text-white text-xs truncate">
                      {selectedCountry.name}
                    </div>
                    <span className="text-2xs text-slate-400 font-mono">
                      {selectedCountry.capital
                        ? `Capital: ${selectedCountry.capital} • `
                        : ""}
                      {selectedCountry.continent}
                      {selectedCountry.subregion
                        ? ` • ${selectedCountry.subregion}`
                        : ""}
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
            )}
          </div>

          {/* Right Column: Search Box & Country Profile (5 cols on lg, full on mobile when info tab) */}
          <div
            className={`lg:col-span-5 space-y-3 h-full min-h-0 ${
              mobileTab === "info"
                ? "flex flex-col flex-1 overflow-y-auto overscroll-contain pb-3"
                : "hidden lg:block"
            }`}
          >
            <div className="shrink-0 z-30">
              <CountrySearch
                onSelectCountry={selectCountry}
                continentFilter={continentFilter}
                subregionFilter={subregionFilter}
              />
            </div>
            <CountryProfileCard
              country={selectedCountry}
              onSelectCountry={selectCountry}
              onHoverCountry={setHoveredCountry}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
