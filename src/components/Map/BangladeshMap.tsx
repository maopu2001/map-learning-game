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

const GEO_URL = "/data/bangladesh-districts-topo.json";

type GeoFeature = {
  rsmKey: string;
  id: string | number;
  properties: Record<string, unknown>;
  geometry: Record<string, unknown>;
};

interface DistrictGeographyItemProps {
  geo: GeoFeature;
  districtData?: DistrictData;
  fill: string;
  stroke: string;
  hoverFill: string;
  hoverStroke: string;
  strokeWidth: number;
  onSelect: (district: DistrictData) => void;
}

const DistrictGeographyItem = React.memo(function DistrictGeographyItem({
  geo,
  districtData,
  fill,
  stroke,
  hoverFill,
  hoverStroke,
  strokeWidth,
  onSelect,
}: DistrictGeographyItemProps) {
  const handleAction = React.useCallback(() => {
    if (districtData) onSelect(districtData);
  }, [districtData, onSelect]);

  return (
    <Geography
      geography={geo}
      onMouseEnter={handleAction}
      onClick={handleAction}
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
          fill: hoverFill,
          stroke: hoverStroke,
          strokeWidth,
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
  );
});

interface BangladeshGeographiesContentProps {
  geographies: GeoFeature[];
  strokeWidth: number;
  isGameOver: boolean;
  isTargetHidden: boolean;
  targetDistrict: DistrictData | null;
  activeNeighbors: string[];
  guessedDistrictsMap: Map<string, any>;
  gameStatus: string;
  mode: string;
  difficulty: string;
  inspectedDistrict: DistrictData | null;
  onSelectDistrict: (district: DistrictData) => void;
}

function BangladeshGeographiesContent({
  geographies,
  strokeWidth,
  isGameOver,
  isTargetHidden,
  targetDistrict,
  activeNeighbors,
  guessedDistrictsMap,
  gameStatus,
  mode,
  difficulty,
  inspectedDistrict,
  onSelectDistrict,
}: BangladeshGeographiesContentProps) {
  const geoIndex = useMemo(() => {
    const byName = new Map<string, GeoFeature>();
    const districtByGeo = new Map<GeoFeature, DistrictData>();
    for (const g of geographies) {
      const sName = (g.properties?.shapeName as string) || "";
      if (sName) {
        const lower = sName.toLowerCase();
        byName.set(lower, g);
        const data = DISTRICTS_BY_NAME.get(lower);
        if (data) {
          districtByGeo.set(g, data);
        }
      }
    }
    return { byName, districtByGeo };
  }, [geographies]);

  const targetGeo = targetDistrict
    ? geoIndex.byName.get(targetDistrict.name.toLowerCase()) ?? null
    : null;
  const neighborGeos = useMemo(
    () =>
      activeNeighbors
        .filter((n) => !guessedDistrictsMap.has(n.toLowerCase()))
        .map((n) => geoIndex.byName.get(n.toLowerCase()))
        .filter((g): g is GeoFeature => Boolean(g)),
    [activeNeighbors, geoIndex, guessedDistrictsMap],
  );
  const inspectedGeo = inspectedDistrict
    ? geoIndex.byName.get(inspectedDistrict.name.toLowerCase()) ?? null
    : null;

  const styledGeographies = useMemo(() => {
    return geographies
      .map((geo) => {
        const districtName = (geo.properties?.shapeName as string) || "";
        if (!districtName) return null;
        const districtData = geoIndex.districtByGeo.get(geo);

        const isTarget =
          (!isTargetHidden || isGameOver) &&
          Boolean(
            targetDistrict?.name && districtName === targetDistrict.name,
          );
        const isNeighbor = Boolean(activeNeighbors.includes(districtName));
        const guessResult = guessedDistrictsMap.get(districtName.toLowerCase());
        const isGuessed = Boolean(guessResult);

        let priority = 0;
        let fill = "var(--map-land)";
        let stroke = "var(--map-land-border)";
        let itemStrokeWidth = strokeWidth * 0.9;

        // Base fills and strokes
        if (isTarget) {
          priority = 5;
          if (isGameOver) {
            fill =
              gameStatus === "won"
                ? "var(--map-correct)"
                : gameStatus === "lost"
                  ? "var(--map-wrong)"
                  : "var(--map-target)";
            stroke =
              gameStatus === "won"
                ? "var(--map-correct-stroke)"
                : gameStatus === "lost"
                  ? "var(--map-wrong-stroke)"
                  : "var(--map-target-stroke)";
          } else {
            fill = isGuessed
              ? guessResult?.isCorrect
                ? "var(--map-correct)"
                : fill
              : "var(--map-land-hover)";
            stroke = "var(--map-target-stroke)";
          }
          itemStrokeWidth = strokeWidth * 1.6;
        } else if (isGuessed) {
          if (guessResult?.isCorrect) {
            priority = 5;
            fill = "var(--map-correct)";
            stroke = "var(--map-correct-stroke)";
            itemStrokeWidth = strokeWidth * 1.6;
          } else {
            const dist = guessResult?.distanceKm ?? 999;
            if (dist < 60) {
              priority = 3;
              fill = "var(--map-hot)";
              stroke = "var(--map-hot-stroke)";
              itemStrokeWidth = strokeWidth * 1.25;
            } else if (dist < 130) {
              priority = 2;
              fill = "var(--map-warm)";
              stroke = "var(--map-warm-stroke)";
              itemStrokeWidth = strokeWidth * 1.1;
            } else {
              priority = 1;
              fill = "var(--map-wrong)";
              stroke = "var(--map-wrong-stroke)";
              itemStrokeWidth = strokeWidth;
            }
          }
        } else if (isNeighbor) {
          priority = 4;
          fill = "var(--map-neighbor)";
          stroke = "var(--map-neighbor-stroke)";
          itemStrokeWidth = strokeWidth * 1.35;
        }

        const hoverFill = isGuessed ? fill : "var(--map-land-hover)";
        const hoverStroke = "var(--map-inspect-stroke-bd)";

        return {
          geo,
          districtData,
          priority,
          fill,
          stroke,
          hoverFill,
          hoverStroke,
          itemStrokeWidth,
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null)
      .sort((a, b) => a.priority - b.priority);
  }, [
    geographies,
    geoIndex,
    isTargetHidden,
    isGameOver,
    targetDistrict,
    activeNeighbors,
    guessedDistrictsMap,
    gameStatus,
    strokeWidth,
  ]);

  return (
    <>
      {styledGeographies.map(
        ({
          geo,
          districtData,
          fill,
          stroke,
          hoverFill,
          hoverStroke,
          itemStrokeWidth,
        }) => (
          <DistrictGeographyItem
            key={geo.rsmKey}
            geo={geo}
            districtData={districtData}
            fill={fill}
            stroke={stroke}
            hoverFill={hoverFill}
            hoverStroke={hoverStroke}
            strokeWidth={itemStrokeWidth}
            onSelect={onSelectDistrict}
          />
        ),
      )}

      {/* OVERLAY 1: Neighbor hint districts - complete perimeter, opacity-controlled fill */}
      {neighborGeos.map((geo) => (
        <Geography
          key={`overlay-neighbor-${geo.rsmKey}`}
          geography={geo}
          style={{
            default: {
              fill: "var(--map-neighbor)",
              fillOpacity: 0.22,
              stroke: "var(--map-neighbor-stroke)",
              strokeWidth,
              strokeLinejoin: "round",
              strokeLinecap: "round",
              vectorEffect: "non-scaling-stroke",
              pointerEvents: "none",
            },
            hover: {
              fill: "var(--map-neighbor)",
              fillOpacity: 0.22,
              stroke: "var(--map-neighbor-stroke)",
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
                  ? "var(--map-correct)"
                  : isGameOver && gameStatus === "lost"
                    ? "var(--map-wrong)"
                    : "var(--map-target)",
              fillOpacity:
                isGameOver && gameStatus === "won"
                  ? 0.35
                  : isGameOver && gameStatus === "lost"
                    ? 0.35
                    : 0.24,
              stroke:
                isGameOver && gameStatus === "won"
                  ? "var(--map-correct-stroke)"
                  : isGameOver && gameStatus === "lost"
                    ? "var(--map-wrong-stroke)"
                    : "var(--map-target-stroke)",
              strokeWidth: strokeWidth * 1.6,
              strokeLinejoin: "round",
              strokeLinecap: "round",
              vectorEffect: "non-scaling-stroke",
              pointerEvents: "none",
            },
            hover: {
              fill:
                isGameOver && gameStatus === "won"
                  ? "var(--map-correct)"
                  : isGameOver && gameStatus === "lost"
                    ? "var(--map-wrong)"
                    : "var(--map-target)",
              fillOpacity:
                isGameOver && gameStatus === "won"
                  ? 0.35
                  : isGameOver && gameStatus === "lost"
                    ? 0.35
                    : 0.24,
              stroke:
                isGameOver && gameStatus === "won"
                  ? "var(--map-correct-stroke)"
                  : isGameOver && gameStatus === "lost"
                    ? "var(--map-wrong-stroke)"
                    : "var(--map-target-stroke)",
              strokeWidth: strokeWidth * 1.6,
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
          const strokeColor = "var(--map-inspect-stroke-bd)";
          const fillColor = "var(--map-inspect-fill-bd)";

          return (
            <Geography
              key={`overlay-inspected-${inspectedGeo.rsmKey}`}
              geography={inspectedGeo}
              style={{
                default: {
                  fill: fillColor,
                  stroke: strokeColor,
                  strokeWidth: strokeWidth * 1.6,
                  strokeLinejoin: "round",
                  strokeLinecap: "round",
                  vectorEffect: "non-scaling-stroke",
                  pointerEvents: "none",
                },
                hover: {
                  fill: fillColor,
                  stroke: strokeColor,
                  strokeWidth: strokeWidth * 1.6,
                  vectorEffect: "non-scaling-stroke",
                  pointerEvents: "none",
                },
              }}
            />
          );
        })()}
    </>
  );
}

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
      e.preventDefault();
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
      return true;
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
    setPosition((pos) => ({ ...pos, zoom: Math.min(pos.zoom * 1.6, 50) }));
  };

  const handleZoomOut = () => {
    setPosition((pos) => ({ ...pos, zoom: Math.max(pos.zoom / 1.6, 0.8) }));
  };

  const handleResetZoom = () => {
    setPosition({
      coordinates: [90.3563, 23.685],
      zoom: 1,
    });
  };

  const handleSelectDistrict = React.useCallback((district: DistrictData) => {
    setInspectedDistrict(district);
  }, []);

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
        "relative w-full h-[55vh] sm:h-136 lg:h-[calc(100vh-80px)] min-h-[360px] sm:min-h-120 rounded-2xl overflow-hidden border border-border bg-card/60 shadow-xl flex flex-col items-center justify-center select-none"
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
        style={{ touchAction: "none", shapeRendering: "geometricPrecision", backgroundColor: "var(--map-sea)" }}
      >
        <ZoomableGroup
          zoom={position.zoom}
          center={position.coordinates}
          filterZoomEvent={filterZoomEvent}
          onMoveEnd={(pos) => setPosition(pos)}
          maxZoom={50}
          minZoom={0.8}
        >
          <Geographies geography={GEO_URL}>
            {({ geographies }) => (
              <BangladeshGeographiesContent
                geographies={geographies}
                strokeWidth={0.65}
                isGameOver={gameStatus !== "playing"}
                isTargetHidden={isTargetHidden}
                targetDistrict={targetDistrict}
                activeNeighbors={activeNeighbors}
                guessedDistrictsMap={guessedDistrictsMap}
                gameStatus={gameStatus}
                mode={mode}
                difficulty={difficulty}
                inspectedDistrict={inspectedDistrict}
                onSelectDistrict={handleSelectDistrict}
              />
            )}
          </Geographies>

          {/* Target marker when game is won or lost */}
          {gameStatus !== "playing" && targetDistrict && (
            <TargetPulseMarker
              coordinates={[
                targetDistrict.coordinates[1],
                targetDistrict.coordinates[0],
              ]}
              zoom={position.zoom}
              fillColor={
                gameStatus === "won"
                  ? "var(--map-correct)"
                  : "var(--destructive)"
              }
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
