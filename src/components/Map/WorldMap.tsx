"use client";

import React, { useMemo, useState, useRef, useEffect } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
  Line,
} from "react-simple-maps";
import { useGameStore } from "@/lib/store";
import {
  COUNTRIES_BY_ID,
  COUNTRIES_BY_NUMERIC,
  CountryData,
  getEffectiveBorders,
} from "@/data/world";
import { TargetPulseMarker } from "@/components/Map/TargetPulseMarker";
import { MapZoomControls } from "@/components/Map/MapZoomControls";
import { CountryReconWindow } from "@/components/Map/CountryReconWindow";
import { CountryReconSheet } from "@/components/Map/CountryReconSheet";
import { MapLegend } from "@/components/Map/MapLegend";

const GEO_URL = "/data/world-countries-geo-50m.json";

interface WorldMapProps {
  className?: string;
}

export function WorldMap({ className }: WorldMapProps = {}) {
  const targetCountry = useGameStore((s) => s.targetCountry);
  const guesses = useGameStore((s) => s.guesses);
  const gameStatus = useGameStore((s) => s.gameStatus);
  const difficulty = useGameStore((s) => s.difficulty);
  const unlockedHints = useGameStore((s) => s.unlockedHints);

  const [position, setPosition] = useState<{
    coordinates: [number, number];
    zoom: number;
  }>({
    coordinates: [0, 20],
    zoom: 1,
  });

  const [inspectedCountry, setInspectedCountry] = useState<CountryData | null>(
    null,
  );
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
      // Only allow zoom if it's a touchpad pinch gesture (ctrlKey: true)
      // Regular scroll wheel or 2-finger page scroll has ctrlKey: false -> disabled!
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

  // Calculate visible neighbors for clue (falls back to nearest countries if island/no border)
  const activeNeighbors = useMemo(() => {
    if (!targetCountry) return [];
    const effectiveBorders = getEffectiveBorders(targetCountry);
    if (difficulty === "hard") {
      // In Hard Mode:
      // Hint 2 reveals 1st neighboring border country / nearest country
      // Hint 3 reveals 2nd neighboring border country / 2nd nearest country
      if (unlockedHints === 2) {
        return effectiveBorders.slice(0, 1);
      }
      if (unlockedHints >= 3) {
        return effectiveBorders.slice(0, 2);
      }
      return [];
    }
    return effectiveBorders.slice(0, Math.min(3, effectiveBorders.length));
  }, [targetCountry, difficulty, unlockedHints]);

  const guessedCountriesMap = useMemo(() => {
    const map = new Map<string, (typeof guesses)[0]>();
    for (const g of guesses) {
      map.set(g.country.id.toUpperCase(), g);
    }
    return map;
  }, [guesses]);

  // Recenter to world overview when target changes
  React.useEffect(() => {
    setPosition({
      coordinates: [0, 20],
      zoom: 1,
    });
    setInspectedCountry(null);
  }, [targetCountry]);

  // Nautical arcs for island nations or countries without land borders
  const nauticalTethers = useMemo(() => {
    if (!targetCountry) return [];
    if (targetCountry.borders.length === 0 && activeNeighbors.length > 0) {
      return activeNeighbors
        .map((neighborId) => {
          const neighbor = COUNTRIES_BY_ID.get(neighborId);
          if (!neighbor) return null;
          return {
            id: neighborId,
            name: neighbor.name,
            from: [
              targetCountry.coordinates[1],
              targetCountry.coordinates[0],
            ] as [number, number],
            to: [neighbor.coordinates[1], neighbor.coordinates[0]] as [
              number,
              number,
            ],
          };
        })
        .filter(
          (
            t,
          ): t is {
            id: string;
            name: string;
            from: [number, number];
            to: [number, number];
          } => Boolean(t),
        );
    }
    return [];
  }, [targetCountry, activeNeighbors]);

  const handleZoomIn = () => {
    setPosition((pos) => ({ ...pos, zoom: Math.min(pos.zoom * 1.5, 18) }));
  };

  const handleZoomOut = () => {
    setPosition((pos) => ({ ...pos, zoom: Math.max(pos.zoom / 1.5, 1) }));
  };

  const handleResetZoom = () => {
    setPosition({ coordinates: [0, 20], zoom: 1 });
  };

  const lastGuess = guesses.length > 0 ? guesses[guesses.length - 1] : null;

  // Determine if inspected country is the secret target
  const isTargetInspected = Boolean(
    targetCountry &&
    inspectedCountry &&
    inspectedCountry.id.toUpperCase() === targetCountry.id.toUpperCase(),
  );

  return (
    <div
      ref={mapContainerRef}
      onMouseLeave={() => setInspectedCountry(null)}
      className={
        className ||
        "relative w-full h-[55vh] sm:h-136 lg:h-[calc(100vh-80px)] min-h-90 sm:min-h-120 rounded-2xl overflow-hidden border border-white/10 bg-[#090d16] shadow-2xl flex flex-col items-center justify-center select-none"
      }
    >
      {/* Background Grid */}
      <div className="absolute inset-0 bg-tactical-grid opacity-40 pointer-events-none" />

      {/* Floating Zoom Controls (Top Right) */}
      <MapZoomControls
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onResetZoom={handleResetZoom}
        resetTitle="Recenter World"
      />

      {/* Desktop Floating Reconnaissance Window */}
      <CountryReconWindow
        difficulty={difficulty}
        inspectedCountry={inspectedCountry}
        activeNeighbors={activeNeighbors}
        guessedCountriesMap={guessedCountriesMap}
        lastGuess={lastGuess}
        isTargetInspected={isTargetInspected}
        gameStatus={gameStatus}
        targetCountry={targetCountry}
        unlockedHints={unlockedHints}
        guesses={guesses}
      />

      {/* SVG Map Canvas */}
      <ComposableMap
        width={960}
        height={580}
        projection="geoMercator"
        projectionConfig={{
          scale: 155,
        }}
        className="w-full h-full cursor-grab active:cursor-grabbing outline-none touch-none"
        style={{ touchAction: "none", shapeRendering: "geometricPrecision" }}
      >
        <ZoomableGroup
          zoom={position.zoom}
          center={position.coordinates}
          filterZoomEvent={filterZoomEvent}
          onMoveEnd={(pos) => setPosition(pos)}
          maxZoom={18}
          minZoom={1}
        >
          <Geographies geography={GEO_URL}>
            {({ geographies }) => {
              const strokeWidth = 0.55;
              const isGameOver = gameStatus !== "playing";

              // Find highlighted geos to overlay on top so entire perimeter borders are complete and unbroken
              const targetGeo = targetCountry
                ? geographies.find((g) => {
                    const gid = String(g.id);
                    const c =
                      COUNTRIES_BY_NUMERIC.get(gid) ||
                      COUNTRIES_BY_NUMERIC.get(String(parseInt(gid, 10)));
                    return c?.id === targetCountry.id;
                  })
                : null;

              const neighborGeos = geographies.filter((g) => {
                const gid = String(g.id);
                const c =
                  COUNTRIES_BY_NUMERIC.get(gid) ||
                  COUNTRIES_BY_NUMERIC.get(String(parseInt(gid, 10)));
                return Boolean(c?.id && activeNeighbors.includes(c.id));
              });

              const inspectedGeo = inspectedCountry
                ? geographies.find((g) => {
                    const gid = String(g.id);
                    const c =
                      COUNTRIES_BY_NUMERIC.get(gid) ||
                      COUNTRIES_BY_NUMERIC.get(String(parseInt(gid, 10)));
                    return c?.id === inspectedCountry.id;
                  })
                : null;

              return (
                <>
                  {geographies.map((geo) => {
                    const geoId = String(geo.id);
                    const country =
                      COUNTRIES_BY_NUMERIC.get(geoId) ||
                      COUNTRIES_BY_NUMERIC.get(String(parseInt(geoId, 10)));
                    const isoId = country?.id;

                    const isTarget = Boolean(
                      targetCountry?.id && isoId === targetCountry.id,
                    );
                    const isNeighbor = Boolean(
                      isoId && activeNeighbors.includes(isoId),
                    );
                    const guessResult = isoId
                      ? guessedCountriesMap.get(isoId)
                      : undefined;
                    const isGuessed = Boolean(guessResult);

                    let fill = "#131b2e";
                    let stroke = "#24324a";

                    if (isTarget) {
                      if (isGameOver) {
                        fill = gameStatus === "won" ? "#10b981" : "#f59e0b";
                        stroke = "#34d399";
                      } else {
                        fill = isGuessed
                          ? guessResult?.isCorrect
                            ? "#10b981"
                            : fill
                          : "#1a253a";
                        stroke = "#f59e0b";
                      }
                    } else if (isGuessed) {
                      if (guessResult?.isCorrect) {
                        fill = "#10b981";
                        stroke = "#34d399";
                      } else {
                        const dist = guessResult?.distanceKm ?? 99999;
                        if (dist < 1500) {
                          fill = "#c2410c";
                          stroke = "#fb923c";
                        } else if (dist < 4000) {
                          fill = "#6d28d9";
                          stroke = "#a78bfa";
                        } else {
                          fill = "#1e293b";
                          stroke = "#475569";
                        }
                      }
                    } else if (isNeighbor) {
                      fill = "#0369a1";
                      stroke = "#38bdf8";
                    }

                    return (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        onMouseEnter={() => {
                          if (country) setInspectedCountry(country);
                        }}
                        onClick={() => {
                          if (country) {
                            setInspectedCountry(country);
                          }
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
                            fill: isGuessed ? fill : "#1e2c45",
                            stroke: isTarget
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

                  {/* OVERLAY 1: Neighbor hint countries - complete perimeter, opacity-controlled fill */}
                  {neighborGeos.map((geo) => (
                    <Geography
                      key={`overlay-neighbor-${geo.rsmKey}`}
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

                  {/* OVERLAY 2: Mystery Target - complete perimeter on top, opacity-controlled fill */}
                  {targetGeo && (
                    <Geography
                      key={`overlay-target-${targetGeo.rsmKey}`}
                      geography={targetGeo}
                      style={{
                        default: {
                          fill:
                            isGameOver && gameStatus === "won"
                              ? "rgba(16, 185, 129, 0.22)"
                              : "rgba(245, 158, 11, 0.16)",
                          stroke:
                            isGameOver && gameStatus === "won"
                              ? "#34d399"
                              : "#f59e0b",
                          strokeWidth,
                          strokeLinejoin: "round",
                          strokeLinecap: "round",
                          vectorEffect: "non-scaling-stroke",
                          pointerEvents: "none",
                        },
                        hover: {
                          fill:
                            isGameOver && gameStatus === "won"
                              ? "rgba(16, 185, 129, 0.22)"
                              : "rgba(245, 158, 11, 0.16)",
                          stroke:
                            isGameOver && gameStatus === "won"
                              ? "#34d399"
                              : "#f59e0b",
                          strokeWidth,
                          vectorEffect: "non-scaling-stroke",
                          pointerEvents: "none",
                        },
                      }}
                    />
                  )}

                  {/* OVERLAY 3: Hovered/Inspected territory - full unbroken perimeter on top, translucent fill */}
                  {inspectedGeo &&
                    inspectedGeo !== targetGeo &&
                    (() => {
                      const gid = String(inspectedGeo.id);
                      const c =
                        COUNTRIES_BY_NUMERIC.get(gid) ||
                        COUNTRIES_BY_NUMERIC.get(String(parseInt(gid, 10)));
                      const iso = c?.id;
                      const isNeighbor = Boolean(
                        iso && activeNeighbors.includes(iso),
                      );
                      const isGuessed = Boolean(
                        iso && guessedCountriesMap.has(iso),
                      );
                      const isInspectionAllowed =
                        isGameOver ||
                        difficulty === "easy" ||
                        (difficulty === "normal" && (isNeighbor || isGuessed));

                      const strokeColor = isNeighbor
                        ? "#38bdf8"
                        : isInspectionAllowed
                          ? "#60a5fa"
                          : "rgba(148, 163, 184, 0.7)";
                      const fillColor = isNeighbor
                        ? "rgba(3, 105, 161, 0.2)"
                        : isInspectionAllowed
                          ? "rgba(56, 189, 248, 0.16)"
                          : "rgba(255, 255, 255, 0.05)";

                      return (
                        <Geography
                          key={`overlay-inspected-${inspectedGeo.rsmKey}`}
                          geography={inspectedGeo}
                          style={{
                            default: {
                              fill: fillColor,
                              stroke: strokeColor,
                              strokeWidth,
                              strokeLinejoin: "round",
                              strokeLinecap: "round",
                              vectorEffect: "non-scaling-stroke",
                              pointerEvents: "none",
                            },
                            hover: {
                              fill: fillColor,
                              stroke: strokeColor,
                              strokeWidth,
                              vectorEffect: "non-scaling-stroke",
                              pointerEvents: "none",
                            },
                          }}
                        />
                      );
                    })()}
                </>
              );
            }}
          </Geographies>

          {/* Nautical Tethers for Island Isolation */}
          {nauticalTethers.map((tether, idx) => {
            if (!tether.to) return null;
            return (
              <React.Fragment key={`tether-${idx}`}>
                <Line
                  from={tether.from}
                  to={tether.to}
                  stroke="#38bdf8"
                  strokeWidth={1.2}
                  strokeDasharray="3 3"
                />
              </React.Fragment>
            );
          })}

          {/* Target marker when game is won */}
          {gameStatus === "won" && targetCountry && (
            <TargetPulseMarker
              coordinates={[
                targetCountry.coordinates[1],
                targetCountry.coordinates[0],
              ]}
              zoom={position.zoom}
            />
          )}
        </ZoomableGroup>
      </ComposableMap>

      {/* Mobile Bottom Reconnaissance Sheet */}
      <CountryReconSheet
        inspectedCountry={inspectedCountry}
        onClose={() => setInspectedCountry(null)}
        isTargetInspected={isTargetInspected}
        gameStatus={gameStatus}
        difficulty={difficulty}
        guessedCountriesMap={guessedCountriesMap}
        activeNeighbors={activeNeighbors}
        targetCountry={targetCountry}
        unlockedHints={unlockedHints}
      />

      {/* Map Legend Footer */}
      <MapLegend
        hotLabel="Hot (<1500km)"
        warmLabel="Warm (1500-4000km)"
      />
    </div>
  );
}
