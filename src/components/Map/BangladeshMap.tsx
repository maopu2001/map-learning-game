"use client";

import React, { useMemo, useState, useRef, useEffect } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from "react-simple-maps";
import { useGameStore } from "@/lib/store";
import { DISTRICTS_BY_NAME, DistrictData } from "@/data/bangladesh";
import { TargetPulseMarker } from "@/components/Map/TargetPulseMarker";
import { MapZoomControls } from "@/components/Map/MapZoomControls";
import { DistrictReconWindow } from "@/components/Map/DistrictReconWindow";
import { DistrictReconSheet } from "@/components/Map/DistrictReconSheet";
import { MapLegend } from "@/components/Map/MapLegend";

const GEO_URL = "/data/bangladesh-districts-geo.json";

interface BangladeshMapProps {
  className?: string;
}

export function BangladeshMap({ className }: BangladeshMapProps = {}) {
  const mode = useGameStore((s) => s.mode);
  const targetDistrict = useGameStore((s) => s.targetDistrict);
  const guesses = useGameStore((s) => s.guesses);
  const gameStatus = useGameStore((s) => s.gameStatus);
  const difficulty = useGameStore((s) => s.difficulty);
  const unlockedHints = useGameStore((s) => s.unlockedHints);

  const [position, setPosition] = useState<{
    coordinates: [number, number];
    zoom: number;
  }>({
    coordinates: [90.3563, 23.685], // Center of Bangladesh
    zoom: 1,
  });

  const [inspectedDistrict, setInspectedDistrict] =
    useState<DistrictData | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  // Prevent browser viewport tab-zooming on trackpad pinch so the map zooms instead
  useEffect(() => {
    const el = mapContainerRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey) {
        // Trackpad pinch gesture
        e.preventDefault();
      }
    };

    const onGesture = (e: Event) => {
      // Safari trackpad gestures
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

  const activeNeighbors = useMemo(() => {
    if (!targetDistrict) return [];
    // In Detective Mode (all difficulties): neighbors ONLY appear when Hint 3 is unlocked!
    if (mode === "detective") {
      if (unlockedHints >= 3) {
        return targetDistrict.borders.slice(0, 1);
      }
      return [];
    }
    // In Daily/Blitz Hard Mode: Hint 2 reveals 1st neighbor, Hint 3 reveals 2nd neighbor
    if (difficulty === "hard") {
      if (unlockedHints === 2) {
        return targetDistrict.borders.slice(0, 1);
      }
      if (unlockedHints >= 3) {
        return targetDistrict.borders.slice(0, 2);
      }
      return [];
    }
    // In Daily/Blitz Normal and Easy mode: highlight adjacent borders
    return targetDistrict.borders.slice(
      0,
      Math.min(3, targetDistrict.borders.length),
    );
  }, [targetDistrict, difficulty, unlockedHints, mode]);

  const guessedDistrictsMap = useMemo(() => {
    const map = new Map<string, (typeof guesses)[0]>();
    for (const g of guesses) {
      map.set(g.country.name.toLowerCase(), g);
    }
    return map;
  }, [guesses]);

  // Recenter when target changes
  React.useEffect(() => {
    if (!targetDistrict) return;
    setPosition({
      coordinates: [90.3563, 23.685],
      zoom: 1,
    });
    setInspectedDistrict(null);
  }, [targetDistrict]);

  const handleZoomIn = () => {
    setPosition((pos) => ({ ...pos, zoom: Math.min(pos.zoom * 1.5, 15) }));
  };

  const handleZoomOut = () => {
    setPosition((pos) => ({ ...pos, zoom: Math.max(pos.zoom / 1.5, 0.8) }));
  };

  const handleResetZoom = () => {
    setPosition({
      coordinates: [90.3563, 23.685],
      zoom: 1,
    });
  };

  const lastGuess = guesses.length > 0 ? guesses[guesses.length - 1] : null;

  const isTargetHidden = mode === "detective" && gameStatus === "playing";

  // Determine if inspected district is the secret target
  const isTargetInspected =
    !isTargetHidden &&
    Boolean(
      targetDistrict &&
        inspectedDistrict &&
        inspectedDistrict.name.toLowerCase() ===
          targetDistrict.name.toLowerCase(),
    );

  return (
    <div
      ref={mapContainerRef}
      onMouseLeave={() => setInspectedDistrict(null)}
      className={
        className ||
        "relative w-full h-[55vh] sm:h-136 lg:h-[calc(100vh-80px)] min-h-[360px] sm:min-h-120 rounded-2xl overflow-hidden border border-white/10 bg-[#090d16] shadow-2xl flex flex-col items-center justify-center select-none"
      }
    >
      <div className="absolute inset-0 bg-tactical-grid opacity-40 pointer-events-none" />

      {/* Floating Zoom Controls (Top Right) */}
      <MapZoomControls
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onResetZoom={handleResetZoom}
        resetTitle="Recenter Bangladesh"
      />

      {/* Desktop Floating Reconnaissance Window */}
      <DistrictReconWindow
        mode={mode}
        difficulty={difficulty}
        inspectedDistrict={inspectedDistrict}
        activeNeighbors={activeNeighbors}
        guessedDistrictsMap={guessedDistrictsMap}
        lastGuess={lastGuess}
        isTargetInspected={isTargetInspected}
        gameStatus={gameStatus}
        targetDistrict={targetDistrict}
        unlockedHints={unlockedHints}
        guesses={guesses}
      />

      {/* SVG Canvas */}
      <ComposableMap
        width={960}
        height={580}
        projection="geoMercator"
        projectionConfig={{
          scale: 4320,
          center: [90.3563, 23.685],
        }}
        className="w-full h-full cursor-grab active:cursor-grabbing outline-none touch-none"
        style={{ touchAction: "none", shapeRendering: "geometricPrecision" }}
      >
        <ZoomableGroup
          zoom={position.zoom}
          center={position.coordinates}
          filterZoomEvent={filterZoomEvent}
          onMoveEnd={(pos) => setPosition(pos)}
          maxZoom={15}
          minZoom={0.8}
        >
          <Geographies geography={GEO_URL}>
            {({ geographies }) => {
              const strokeWidth = 0.65;
              const isGameOver = gameStatus !== "playing";

              // Find highlighted geos to overlay on top so entire perimeter borders are complete and unbroken
              const targetGeo = targetDistrict
                ? geographies.find(
                    (g) => g.properties?.shapeName === targetDistrict.name,
                  )
                : null;
              const neighborGeos = geographies.filter((g) => {
                const sName = g.properties?.shapeName as string | undefined;
                return Boolean(sName && activeNeighbors.includes(sName));
              });
              const inspectedGeo = inspectedDistrict
                ? geographies.find(
                    (g) => g.properties?.shapeName === inspectedDistrict.name,
                  )
                : null;

              return (
                <>
                  {geographies.map((geo) => {
                    const districtName =
                      (geo.properties?.shapeName as string) || "";
                    if (!districtName) return null;
                    const districtData = DISTRICTS_BY_NAME.get(
                      districtName.toLowerCase(),
                    );

                    const isTarget =
                      (!isTargetHidden || isGameOver) &&
                      Boolean(
                        targetDistrict?.name &&
                          districtName === targetDistrict.name,
                      );
                    const isNeighbor = Boolean(
                      activeNeighbors.includes(districtName),
                    );
                    const guessResult = guessedDistrictsMap.get(
                      districtName.toLowerCase(),
                    );
                    const isGuessed = Boolean(guessResult);

                    let fill = "#131b2e";
                    let stroke = "#24324a";

                    // Base fills and strokes
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
                        const dist = guessResult?.distanceKm ?? 999;
                        if (dist < 60) {
                          fill = "#c2410c";
                          stroke = "#fb923c";
                        } else if (dist < 130) {
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
                          if (districtData) setInspectedDistrict(districtData);
                        }}
                        onClick={() => {
                          if (districtData) {
                            setInspectedDistrict(districtData);
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

                  {/* OVERLAY 1: Neighbor hint districts - complete perimeter, opacity-controlled fill */}
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
                  {targetGeo && (!isTargetHidden || isGameOver) && (
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
                      const name =
                        (inspectedGeo.properties.shapeName as string) || "";
                      const isNeighbor = activeNeighbors.includes(name);
                      const isGuessed = guessedDistrictsMap.has(
                        name.toLowerCase(),
                      );
                      const isInspectionAllowed =
                        isGameOver ||
                        (mode !== "detective" && difficulty === "easy") ||
                        isNeighbor ||
                        isGuessed;

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

          {/* Target marker when game is won */}
          {gameStatus === "won" && targetDistrict && (
            <TargetPulseMarker
              coordinates={[
                targetDistrict.coordinates[1],
                targetDistrict.coordinates[0],
              ]}
              zoom={position.zoom}
            />
          )}
        </ZoomableGroup>
      </ComposableMap>

      {/* Mobile Bottom Reconnaissance Sheet */}
      <DistrictReconSheet
        mode={mode}
        inspectedDistrict={inspectedDistrict}
        onClose={() => setInspectedDistrict(null)}
        isTargetInspected={isTargetInspected}
        gameStatus={gameStatus}
        difficulty={difficulty}
        guessedDistrictsMap={guessedDistrictsMap}
        activeNeighbors={activeNeighbors}
        targetDistrict={targetDistrict}
        unlockedHints={unlockedHints}
      />

      {/* Map Legend Footer */}
      <MapLegend hotLabel="Hot (<60km)" warmLabel="Warm (60-130km)" />
    </div>
  );
}
