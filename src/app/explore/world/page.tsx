"use client";

import React, { useState, useRef, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import {
  COUNTRIES,
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
import { MapZoomControls } from "@/components/Map/MapZoomControls";
import { ExploreHeader } from "@/components/Explore/ExploreHeader";
import { MapHoverPill } from "@/components/Explore/MapHoverPill";
import { CountrySearch } from "@/components/Explore/CountrySearch";
import { CountryProfileCard } from "@/components/Explore/CountryProfileCard";

const WORLD_GEO_URL = "/data/world-countries-geo-50m.json";

const DEFAULT_COUNTRY =
  COUNTRIES.find((c) => c.id === "BGD") || COUNTRIES[0];

export default function WorldExplorePage() {
  const [selectedCountry, setSelectedCountry] =
    useState<CountryData>(DEFAULT_COUNTRY);
  const [hoveredCountry, setHoveredCountry] = useState<CountryData | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);

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
    setPosition({
      coordinates: [c.coordinates[1], c.coordinates[0]],
      zoom: c.area < 100000 ? 4 : 2.5,
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#070a12] text-slate-100 selection:bg-sky-500 selection:text-white">
      <Header />

      <main className="flex-1 w-full max-w-7xl mx-auto px-2 sm:px-4 py-3 sm:py-4 space-y-4">
        {/* Top Context Subheader */}
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
              <MapZoomControls
                onZoomIn={handleZoomIn}
                onZoomOut={handleZoomOut}
                onResetZoom={handleResetZoom}
                resetTitle="Recenter World Map"
              />

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
                <MapHoverPill
                  mousePos={mousePos}
                  leading={
                    <span className="text-base leading-none">
                      {hoveredCountry.flagEmoji}
                    </span>
                  }
                  title={hoveredCountry.name}
                  subtitle={hoveredCountry.capital || hoveredCountry.region}
                />
              )}
            </div>
          </div>

          {/* Right Column: Search Box & Country Profile (5 cols) */}
          <div className="lg:col-span-5 space-y-3">
            <CountrySearch onSelectCountry={selectCountry} />
            <CountryProfileCard
              country={selectedCountry}
              onSelectCountry={selectCountry}
              onHoverCountry={setHoveredCountry}
            />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
