"use client";

import React, { useState, useRef, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
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

  const [position, setPosition] = useState<{
    coordinates: [number, number];
    zoom: number;
  }>({
    coordinates: initialCountry
      ? [initialCountry.coordinates[1], initialCountry.coordinates[0]]
      : [0, 20],
    zoom: initialZoom,
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

    // Synchronize ?select= query param in URL without full page reload
    if (typeof window !== "undefined") {
      try {
        const url = new URL(window.location.href);
        if (url.searchParams.get("select") !== c.id) {
          url.searchParams.set("select", c.id);
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

  return (
    <div className="h-dvh max-h-dvh w-full overflow-hidden flex flex-col bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      <Header />

      <main className="flex-1 min-h-0 w-full max-w-7xl mx-auto p-2 sm:px-4 sm:py-3 flex flex-col gap-2 overflow-hidden">
        {/* Top Context Subheader (Desktop only to prevent vertical overflow) */}
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
            accentColor="world"
          />
        </div>

        {/* Mobile Tab Switcher */}
        <div className="lg:hidden grid grid-cols-2 items-center gap-1.5 p-1 rounded-2xl bg-card border border-border shrink-0 text-xs font-semibold">
          <button
            onClick={() => setMobileTab("map")}
            className={`flex-1 py-1.5 px-3 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
              mobileTab === "map"
                ? "bg-accent text-accent-foreground shadow-md"
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
                ? "bg-primary text-primary-foreground shadow-md"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Info className="size-3.5" />
            <span className="truncate">
              {selectedCountry ? selectedCountry.name : "Info"}
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
            {/* Continent / Subregion Filter Bar */}
            <div className="shrink-0">
              <ContinentFilterBar
                selectedContinent={continentFilter}
                onSelectContinent={handleSelectContinent}
                selectedSubregion={subregionFilter}
                onSelectSubregion={handleSelectSubregion}
              />
            </div>

            {/* Mobile Search Input pinned directly above map in mobile view */}
            <div className="lg:hidden shrink-0 z-30">
              <CountrySearch
                onSelectCountry={selectCountry}
                continentFilter={continentFilter}
                subregionFilter={subregionFilter}
              />
            </div>

            {/* Map Container */}
            <div
              ref={mapContainerRef}
              onMouseLeave={() => setHoveredCountry(null)}
              className="relative w-full flex-1 min-h-0 rounded-2xl overflow-hidden border border-border bg-card shadow-xl flex flex-col items-center justify-center select-none"
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
              <div className="hidden lg:block absolute top-3 left-3 sm:top-4 sm:left-4 z-10 pointer-events-none select-none">
                {activeCountry ? (
                  <div
                    className={`flex items-center gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full backdrop-blur-md text-xs transition-all duration-150 ${
                      isHovering
                        ? "bg-card/95 border border-primary/50 text-foreground shadow-2xl ring-1 ring-primary/25"
                        : "bg-card/90 border border-accent/30 text-foreground shadow-lg"
                    }`}
                  >
                    <span
                      className={`size-1.5 sm:size-2 rounded-full shrink-0 animate-pulse ${
                        isHovering ? "bg-primary" : "bg-accent"
                      }`}
                    />
                    <span className="text-sm sm:text-base leading-none">
                      {activeCountry.flagEmoji}
                    </span>
                    <span className="font-bold text-foreground text-2xs sm:text-xs">
                      {activeCountry.name}
                      {activeCountry.nameBn && (
                        <span className="ml-1 text-muted-foreground font-medium">
                          ({activeCountry.nameBn})
                        </span>
                      )}
                    </span>
                    <span
                      className={`text-2xs font-mono border-l border-border pl-2 ${
                        isHovering ? "text-muted-foreground" : "text-accent"
                      }`}
                    >
                      {activeCountry.capital
                        ? `${activeCountry.capital}${activeCountry.capitalBn ? ` (${activeCountry.capitalBn})` : ""}`
                        : `${activeCountry.continent}${activeCountry.continentBn ? ` (${activeCountry.continentBn})` : ""}`}
                    </span>
                    {isHovering && (isNeighbor || isHoverInFilterZone) && (
                      <span className="text-3xs font-mono uppercase px-1.5 py-0.5 rounded-md bg-accent/20 text-accent border border-accent/40">
                        {isNeighbor
                          ? "Neighbor"
                          : subregionFilter !== "All"
                            ? `${hoveredCountry?.subregion}${hoveredCountry?.subregionBn ? ` (${hoveredCountry.subregionBn})` : ""}`
                            : hoveredCountry
                              ? `${getContinentForCountry(hoveredCountry)}${hoveredCountry.continentBn ? ` (${hoveredCountry.continentBn})` : ""}`
                              : ""}
                      </span>
                    )}
                  </div>
                ) : isFilterActive ? (
                  <div className="flex items-center gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full backdrop-blur-md text-xs bg-card/90 border border-accent/30 text-foreground shadow-lg">
                    <span className="size-1.5 sm:size-2 rounded-full shrink-0 animate-pulse bg-accent" />
                    <span className="font-bold text-foreground text-2xs sm:text-xs">
                      {subregionFilter !== "All"
                        ? subregionFilter
                        : continentFilter}
                    </span>
                    <span className="text-3xs font-mono uppercase px-1.5 py-0.5 rounded-md bg-accent/20 text-accent border border-accent/40">
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

                      // Neighbors of the selected country
                      const neighborGeos = geographies.filter((g) => {
                        const c = getCountryFromGeo(g);
                        return Boolean(
                          c?.id &&
                          c.id !== selectedCountry?.id &&
                          effectiveBorders.includes(c.id),
                        );
                      });

                      // Countries matching active filter (excluding selected and neighbors)
                      const filterMatchGeos = isFilterActive
                        ? geographies.filter((g) => {
                            const c = getCountryFromGeo(g);
                            if (
                              !c ||
                              c.id === selectedCountry?.id ||
                              effectiveBorders.includes(c.id)
                            )
                              return false;
                            return matchesFilter(c);
                          })
                        : [];

                      const styledGeographies = geographies
                        .map((geo) => {
                          const country = getCountryFromGeo(geo);
                          const isSelected = Boolean(
                            selectedCountry?.id &&
                            country?.id &&
                            selectedCountry.id === country.id,
                          );
                          const isNeighbor = Boolean(
                            selectedCountry?.id &&
                            country?.id &&
                            effectiveBorders.includes(country.id),
                          );
                          const isFilterMatch =
                            isFilterActive && matchesFilter(country);

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
                            geo,
                            country,
                            priority,
                            fill,
                            stroke,
                            itemStrokeWidth,
                          };
                        })
                        .sort((a, b) => a.priority - b.priority);

                      return (
                        <>
                          {styledGeographies.map(
                            ({
                              geo,
                              country,
                              fill,
                              stroke,
                              itemStrokeWidth,
                            }) => (
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
                                    stroke: "var(--map-inspect-stroke)",
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

                          {/* Overlay 1: Filter matches (Continent/Subregion) */}
                          {filterMatchGeos.map((geo) => (
                            <Geography
                              key={`overlay-world-filter-${geo.rsmKey}`}
                              geography={geo}
                              style={{
                                default: {
                                  fill: "var(--map-filter)",
                                  fillOpacity: 0.2,
                                  stroke: "var(--map-filter-stroke)",
                                  strokeWidth: strokeWidth * 1.1,
                                  strokeLinejoin: "round",
                                  strokeLinecap: "round",
                                  vectorEffect: "non-scaling-stroke",
                                  pointerEvents: "none",
                                },
                                hover: {
                                  fill: "var(--map-filter)",
                                  fillOpacity: 0.2,
                                  stroke: "var(--map-filter-stroke)",
                                  strokeWidth: strokeWidth * 1.1,
                                  vectorEffect: "non-scaling-stroke",
                                  pointerEvents: "none",
                                },
                              }}
                            />
                          ))}

                          {/* Overlay 2: Neighboring countries */}
                          {neighborGeos.map((geo) => (
                            <Geography
                              key={`overlay-world-neighbor-${geo.rsmKey}`}
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

                          {/* Overlay 3: Selected country */}
                          {selectedGeo && (
                            <Geography
                              key={`overlay-world-sel-${selectedGeo.rsmKey}`}
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

                          {/* Overlay 4: Hovered country */}
                          {hoveredGeo && hoveredGeo !== selectedGeo && (
                            <Geography
                              key={`overlay-world-hover-${hoveredGeo.rsmKey}`}
                              geography={hoveredGeo}
                              style={{
                                default: {
                                  fill: "var(--map-inspect-fill)",
                                  stroke: "var(--map-inspect-stroke)",
                                  strokeWidth: strokeWidth * 1.6,
                                  strokeLinejoin: "round",
                                  strokeLinecap: "round",
                                  vectorEffect: "non-scaling-stroke",
                                  pointerEvents: "none",
                                },
                                hover: {
                                  fill: "var(--map-inspect-fill)",
                                  stroke: "var(--map-inspect-stroke)",
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

                  {/* Marker on selected country */}
                  {selectedCountry && (
                    <TargetPulseMarker
                      coordinates={[
                        selectedCountry.coordinates[1],
                        selectedCountry.coordinates[0],
                      ]}
                      zoom={position.zoom}
                      fillColor="var(--map-target)"
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
                  <span>Neighboring Nations</span>
                </div>
                {isFilterActive && (
                  <div className="flex items-center gap-1.5">
                    <span className="size-2.5 rounded-full bg-[var(--map-filter)] border border-[var(--map-filter-stroke)]" />
                    <span>Filter Match</span>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile Selection Callout on Map view */}
            {selectedCountry && (
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
            )}
          </div>

          {/* Right Column: Search Box & Country Profile (5 cols on lg, full on mobile when info tab) */}
          <div
            className={`lg:col-span-5 xl:col-span-4 h-full min-h-0 flex flex-col gap-2 overflow-hidden ${
              mobileTab === "info" ? "flex flex-1" : "hidden lg:flex"
            }`}
          >
            {/* Pinned Search Box (never scrolls) */}
            <div className="shrink-0 z-30">
              <CountrySearch
                onSelectCountry={selectCountry}
                continentFilter={continentFilter}
                subregionFilter={subregionFilter}
              />
            </div>

            {/* ONLY this container scrolls like in game mode */}
            <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain pr-1">
              <CountryProfileCard
                country={selectedCountry}
                onSelectCountry={selectCountry}
                onHoverCountry={setHoveredCountry}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function WorldExplorePage() {
  return (
    <Suspense>
      <WorldExploreContent />
    </Suspense>
  );
}
