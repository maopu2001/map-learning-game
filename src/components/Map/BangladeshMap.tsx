"use client";

import React, { useMemo, useState, useRef, useEffect } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
  Marker,
} from "react-simple-maps";
import { useGameStore } from "@/lib/store";
import { DISTRICTS_BY_NAME, DistrictData } from "@/data/bangladesh";
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  MapPin,
  Target,
  ShieldCheck,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const GEO_URL = "/data/bangladesh-districts-geo.json";

export function BangladeshMap() {
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
    if (difficulty === "hard") {
      // In Hard Mode:
      // Hint 2 reveals 1st neighboring border district (highlighted in map and info shown)
      // Hint 3 reveals 2nd neighboring border district (highlighted in map and info shown)
      if (unlockedHints === 2) {
        return targetDistrict.borders.slice(0, 1);
      }
      if (unlockedHints >= 3) {
        return targetDistrict.borders.slice(0, 2);
      }
      return [];
    }
    // In Normal and Easy mode: highlight adjacent borders
    return targetDistrict.borders.slice(
      0,
      Math.min(3, targetDistrict.borders.length),
    );
  }, [targetDistrict, difficulty, unlockedHints]);

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

  // Determine if inspected district is the secret target
  const isTargetInspected = Boolean(
    targetDistrict &&
    inspectedDistrict &&
    inspectedDistrict.name.toLowerCase() === targetDistrict.name.toLowerCase(),
  );

  return (
    <div
      ref={mapContainerRef}
      onMouseLeave={() => setInspectedDistrict(null)}
      className="relative w-full h-112 sm:h-136 lg:h-[calc(100vh-125px)] min-h-120 rounded-2xl overflow-hidden border border-white/10 bg-[#090d16] shadow-2xl flex flex-col items-center justify-center select-none"
    >
      <div className="absolute inset-0 bg-tactical-grid opacity-40 pointer-events-none" />

      {/* Floating Zoom Controls (Top Right) */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-1.5 bg-slate-900/90 p-1.5 rounded-xl border border-slate-800 backdrop-blur-md shadow-lg">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleZoomIn}
          title="Zoom In"
          aria-label="Zoom In"
          className="size-8 rounded-lg hover:bg-slate-800 text-slate-300"
        >
          <ZoomIn className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleZoomOut}
          title="Zoom Out"
          aria-label="Zoom Out"
          className="size-8 rounded-lg hover:bg-slate-800 text-slate-300"
        >
          <ZoomOut className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleResetZoom}
          title="Recenter Bangladesh"
          aria-label="Recenter Bangladesh"
          className="size-8 rounded-lg hover:bg-slate-800 text-slate-300"
        >
          <RotateCcw className="size-4" />
        </Button>
      </div>

      {/* Scope Badge & Target Highlight Pill (Top Left) */}
      <div className="absolute top-4 left-4 z-20 flex flex-col gap-1.5 pointer-events-none">
        <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs px-3 py-1.5 rounded-full backdrop-blur-md">
          <MapPin className="size-3.5 text-emerald-400" />
          <span>Bangladesh • 64 Districts</span>
        </div>
        <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs px-2.5 py-1 rounded-full backdrop-blur-md">
          <span className="size-2 rounded-full bg-amber-400 animate-pulse" />
          <span>Target Border Highlighted</span>
        </div>
      </div>

      {/* Floating Reconnaissance Window (Top Right next to zoom controls) */}
      <div className="absolute top-4 right-16 z-20 w-64 max-w-xs rounded-xl border border-slate-700/80 bg-slate-900/95 p-3 shadow-2xl backdrop-blur-md text-xs text-slate-200 space-y-2">
        {difficulty === "hard" &&
        (!inspectedDistrict ||
          (!activeNeighbors.includes(inspectedDistrict.name) &&
            !guessedDistrictsMap.has(inspectedDistrict.name.toLowerCase()))) ? (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between pb-1 border-b border-rose-500/30 text-xs">
              <span className="font-semibold text-rose-400 flex items-center gap-1.5">
                <ShieldAlert className="size-3.5" /> Hard Mode
              </span>
              <span className="text-2xs text-slate-400">Blind Recon</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              No territory info is shown on hover or click. Unlock Hint 2 & 3 to
              reveal adjacent border districts!
            </p>
            {lastGuess && (
              <div className="text-xs flex items-center justify-between pt-1 border-t border-slate-800">
                <span className="text-slate-400">Last Guess:</span>
                <span className="font-semibold text-white">
                  {lastGuess.country.name} ({lastGuess.distanceKm}km)
                </span>
              </div>
            )}
          </div>
        ) : inspectedDistrict ? (
          <div>
            {/* If inspecting the secret target during active play: NEVER show its name/info! */}
            {isTargetInspected && gameStatus === "playing" ? (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between pb-1 border-b border-amber-500/30">
                  <span className="font-bold text-amber-400 text-sm flex items-center gap-1.5">
                    <Target className="size-4" /> Mystery Target
                  </span>
                  <span className="text-2xs text-amber-300 bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-500/30">
                    Active Target
                  </span>
                </div>
                <div className="text-xs text-slate-300 leading-relaxed">
                  Highlighted amber border. Deduce this mystery district using
                  distance clues!
                </div>
                {targetDistrict && (
                  <div className="text-2xs text-emerald-400 font-semibold pt-1 border-t border-slate-800">
                    {difficulty === "easy" || unlockedHints >= 1 ? (
                      `Hint 1: Division: ${targetDistrict.division}`
                    ) : (
                      <span className="text-slate-500 font-normal">
                        Hint 1: 🔒 Locked (Unlock in Clues drawer)
                      </span>
                    )}
                  </div>
                )}
              </div>
            ) : difficulty === "normal" &&
              !activeNeighbors.includes(inspectedDistrict.name) &&
              !guessedDistrictsMap.has(inspectedDistrict.name.toLowerCase()) &&
              gameStatus === "playing" ? (
              /* Normal mode: only highlighted adjacent borders show info! */
              <div className="space-y-1.5">
                <div className="flex items-center justify-between pb-1 border-b border-slate-800 text-xs">
                  <span className="font-semibold text-slate-400">
                    Unrevealed District
                  </span>
                  <span className="text-2xs text-slate-500">
                    Normal Mode
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Only highlighted adjacent borders and guesses show info.
                  Unlock neighbor clues or make guesses to reveal!
                </p>
              </div>
            ) : (
              <div>
                {/* Easy mode (all other info shown) OR Normal/Hard mode on revealed adjacent border / guess OR Game over */}
                <div className="flex items-center justify-between pb-1 border-b border-slate-800">
                  <span className="font-bold text-white text-sm flex items-center gap-1.5">
                    {inspectedDistrict.name}
                  </span>
                  <span className="text-2xs text-slate-400">
                    {inspectedDistrict.division} Division
                  </span>
                </div>

                {/* If guessed */}
                {guessedDistrictsMap.has(
                  inspectedDistrict.name.toLowerCase(),
                ) ? (
                  <div className="text-xs pt-1.5 space-y-1">
                    {guessedDistrictsMap.get(
                      inspectedDistrict.name.toLowerCase(),
                    )?.isCorrect ? (
                      <span className="text-emerald-400 font-semibold flex items-center gap-1">
                        <ShieldCheck className="size-3.5" /> Target Identified!
                      </span>
                    ) : (
                      <div className="flex items-center justify-between text-slate-300">
                        <span>
                          Dist:{" "}
                          <strong className="text-amber-400">
                            {
                              guessedDistrictsMap.get(
                                inspectedDistrict.name.toLowerCase(),
                              )?.distanceKm
                            }{" "}
                            km
                          </strong>
                        </span>
                        <span className="font-mono text-xs">
                          {
                            guessedDistrictsMap.get(
                              inspectedDistrict.name.toLowerCase(),
                            )?.directionEmoji
                          }{" "}
                          {
                            guessedDistrictsMap.get(
                              inspectedDistrict.name.toLowerCase(),
                            )?.direction
                          }
                        </span>
                      </div>
                    )}
                  </div>
                ) : activeNeighbors.includes(inspectedDistrict.name) ? (
                  <div className="text-xs text-sky-300 font-semibold pt-1">
                    Adjacent Border to Secret Target
                  </div>
                ) : (
                  <div className="text-2xs text-slate-400 pt-1 flex items-center justify-between">
                    <span>Unexplored Territory</span>
                    <span className="text-slate-500">Type below to guess</span>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between pb-1 border-b border-slate-800 text-xs">
              <span className="text-slate-400 font-medium flex items-center gap-1">
                <Target className="size-3 text-amber-400" /> Target Territory
              </span>
              <span className="text-amber-400 font-semibold">Amber Border</span>
            </div>

            {lastGuess ? (
              <div className="text-xs flex items-center justify-between">
                <span className="text-slate-400">Last:</span>
                <span className="font-semibold text-white">
                  {lastGuess.country.name} ({lastGuess.distanceKm}km{" "}
                  {lastGuess.directionEmoji})
                </span>
              </div>
            ) : (
              <div className="text-xs text-slate-400">
                Click or hover any district to inspect info
              </div>
            )}

            {/* Helper status */}
            <div className="text-2xs text-slate-500 pt-1 border-t border-slate-800/80 flex items-center justify-between">
              <span>Map Mode:</span>
              <span className="text-slate-400">
                Clean Cartography (Dots Only)
              </span>
            </div>
          </div>
        )}

        {/* Guessed dots row */}
        {guesses.length > 0 && (
          <div className="pt-1 border-t border-slate-800/80 flex items-center gap-1 overflow-x-auto">
            {guesses.map((g, i) => (
              <span
                key={i}
                title={`${g.country.name}: ${g.distanceKm}km`}
                className={`size-2.5 rounded-full shrink-0 ${
                  g.isCorrect
                    ? "bg-emerald-500"
                    : g.distanceKm < 60
                      ? "bg-orange-500"
                      : g.distanceKm < 130
                        ? "bg-purple-500"
                        : "bg-slate-600"
                }`}
              />
            ))}
            <span className="text-2xs text-slate-500 ml-auto">
              {guesses.length}/6
            </span>
          </div>
        )}
      </div>

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
                    (g) => g.properties.shapeName === targetDistrict.name,
                  )
                : null;
              const neighborGeos = geographies.filter((g) =>
                activeNeighbors.includes(g.properties.shapeName as string),
              );
              const inspectedGeo = inspectedDistrict
                ? geographies.find(
                    (g) => g.properties.shapeName === inspectedDistrict.name,
                  )
                : null;

              return (
                <>
                  {geographies.map((geo) => {
                    const districtName = geo.properties.shapeName as string;
                    const districtData = DISTRICTS_BY_NAME.get(
                      districtName.toLowerCase(),
                    );

                    const isTarget = Boolean(
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
                      const name =
                        (inspectedGeo.properties.shapeName as string) || "";
                      const isNeighbor = activeNeighbors.includes(name);
                      const isGuessed = guessedDistrictsMap.has(
                        name.toLowerCase(),
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

          {/* Target marker when game is won */}
          {gameStatus === "won" && targetDistrict && (
            <Marker
              coordinates={[
                targetDistrict.coordinates[1],
                targetDistrict.coordinates[0],
              ]}
            >
              <circle
                r={6}
                fill="#10b981"
                stroke="#ffffff"
                strokeWidth={2}
                className="animate-ping opacity-75"
              />
              <circle r={3.5} fill="#ffffff" />
            </Marker>
          )}
        </ZoomableGroup>
      </ComposableMap>

      {/* Map Legend Footer */}
      <div className="absolute bottom-2 left-3 right-3 sm:left-4 sm:right-auto z-10 flex flex-wrap items-center gap-2 sm:gap-3 bg-slate-900/85 px-3 py-1.5 rounded-xl border border-slate-800 text-xs text-slate-300 backdrop-blur-md shadow-lg">
        <div className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-amber-500 ring-2 ring-amber-500/20" />
          <span>Target Border</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-orange-500 ring-2 ring-orange-500/20" />
          <span>Hot (&lt;60km)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-purple-500 ring-2 ring-purple-500/20" />
          <span>Warm (60-130km)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-sky-500 ring-2 ring-sky-500/20" />
          <span>Neighbor Clue</span>
        </div>
      </div>
    </div>
  );
}
