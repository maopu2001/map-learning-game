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
  COUNTRIES_BY_NAME,
  CountryData,
  getEffectiveBorders,
} from "@/data/world";
import { TargetPulseMarker } from "@/components/Map/TargetPulseMarker";
import { MapZoomControls } from "@/components/Map/MapZoomControls";
import { CountryReconWindow } from "@/components/Map/CountryReconWindow";
import { CountryReconSheet } from "@/components/Map/CountryReconSheet";
import { MapLegend } from "@/components/Map/MapLegend";

const GEO_URL = "/data/world-countries-geo-50m.json";

type GeoFeature = {
  rsmKey: string;
  id: string | number;
  properties: Record<string, unknown>;
  geometry: Record<string, unknown>;
};

interface CountryGeographyItemProps {
  geo: GeoFeature;
  country?: CountryData;
  fill: string;
  stroke: string;
  hoverFill: string;
  hoverStroke: string;
  strokeWidth: number;
  onSelect: (country: CountryData) => void;
}

const CountryGeographyItem = React.memo(function CountryGeographyItem({
  geo,
  country,
  fill,
  stroke,
  hoverFill,
  hoverStroke,
  strokeWidth,
  onSelect,
}: CountryGeographyItemProps) {
  const handleAction = React.useCallback(() => {
    if (country) onSelect(country);
  }, [country, onSelect]);

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

interface WorldGeographiesContentProps {
  geographies: GeoFeature[];
  strokeWidth: number;
  isGameOver: boolean;
  isTargetHidden: boolean;
  targetCountry: CountryData | null;
  activeNeighbors: string[];
  guessedCountriesMap: Map<string, any>;
  gameStatus: string;
  mode: string;
  difficulty: string;
  inspectedCountry: CountryData | null;
  onSelectCountry: (country: CountryData) => void;
}

function WorldGeographiesContent({
  geographies,
  strokeWidth,
  isGameOver,
  isTargetHidden,
  targetCountry,
  activeNeighbors,
  guessedCountriesMap,
  gameStatus,
  mode,
  difficulty,
  inspectedCountry,
  onSelectCountry,
}: WorldGeographiesContentProps) {
  const geoIndex = useMemo(() => {
    const byIso = new Map<string, GeoFeature>();
    const countryByGeo = new Map<GeoFeature, CountryData>();
    for (const g of geographies) {
      const gid = String(g.id);
      const c =
        COUNTRIES_BY_NUMERIC.get(gid) ||
        COUNTRIES_BY_NUMERIC.get(String(parseInt(gid, 10))) ||
        (g.properties?.name
          ? COUNTRIES_BY_NAME.get(String(g.properties.name).toLowerCase())
          : undefined);
      if (c) {
        byIso.set(c.id, g);
        countryByGeo.set(g, c);
      }
    }
    return { byIso, countryByGeo };
  }, [geographies]);

  const targetGeo = targetCountry?.id
    ? geoIndex.byIso.get(targetCountry.id) ?? null
    : null;
  const neighborGeos = useMemo(
    () =>
      activeNeighbors
        .filter((id) => !guessedCountriesMap.has(id.toUpperCase()))
        .map((id) => geoIndex.byIso.get(id))
        .filter((g): g is GeoFeature => Boolean(g)),
    [activeNeighbors, geoIndex, guessedCountriesMap],
  );
  const inspectedGeo = inspectedCountry?.id
    ? geoIndex.byIso.get(inspectedCountry.id) ?? null
    : null;

  const styledGeographies = useMemo(() => {
    return geographies
      .map((geo) => {
        const country = geoIndex.countryByGeo.get(geo);
        const isoId = country?.id;

        const isTarget =
          (!isTargetHidden || isGameOver) &&
          Boolean(targetCountry?.id && isoId && isoId === targetCountry.id);
        const isNeighbor = Boolean(
          isoId && activeNeighbors.includes(isoId),
        );
        const guessResult = isoId
          ? guessedCountriesMap.get(isoId)
          : undefined;
        const isGuessed = Boolean(guessResult);

        let priority = 0;
        let fill = "var(--map-land)";
        let stroke = "var(--map-land-border)";
        let itemStrokeWidth = strokeWidth * 0.9;

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
            const dist = guessResult?.distanceKm ?? 99999;
            if (dist < 1500) {
              priority = 3;
              fill = "var(--map-hot)";
              stroke = "var(--map-hot-stroke)";
              itemStrokeWidth = strokeWidth * 1.25;
            } else if (dist < 4000) {
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
        const hoverStroke = "var(--map-inspect-stroke)";

        return {
          geo,
          country,
          priority,
          fill,
          stroke,
          hoverFill,
          hoverStroke,
          itemStrokeWidth,
        };
      })
      .sort((a, b) => a.priority - b.priority);
  }, [
    geographies,
    geoIndex,
    isTargetHidden,
    isGameOver,
    targetCountry,
    activeNeighbors,
    guessedCountriesMap,
    gameStatus,
    strokeWidth,
  ]);

  return (
    <>
      {styledGeographies.map(
        ({
          geo,
          country,
          fill,
          stroke,
          hoverFill,
          hoverStroke,
          itemStrokeWidth,
        }) => (
          <CountryGeographyItem
            key={geo.rsmKey}
            geo={geo}
            country={country}
            fill={fill}
            stroke={stroke}
            hoverFill={hoverFill}
            hoverStroke={hoverStroke}
            strokeWidth={itemStrokeWidth}
            onSelect={onSelectCountry}
          />
        ),
      )}

      {/* OVERLAY 1: Neighbor hint countries - complete perimeter, opacity-controlled fill */}
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
          const strokeColor = "var(--map-inspect-stroke)";
          const fillColor = "var(--map-inspect-fill)";

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

interface WorldMapProps {
  className?: string;
}

export function WorldMap({ className }: WorldMapProps = {}) {
  const mode = useGameStore((s) => s.mode);
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

  // Calculate visible neighbors for clue (falls back to nearest countries if island/no border)
  const activeNeighbors = useMemo(() => {
    if (!targetCountry) return [];
    const effectiveBorders = getEffectiveBorders(targetCountry);
    // In Detective Mode (all difficulties): neighbors ONLY appear when Hint 3 is unlocked!
    if (mode === "detective") {
      if (unlockedHints >= 3) {
        return effectiveBorders.slice(0, 1);
      }
      return [];
    }
    // In Daily/Blitz Hard Mode: Hint 2 reveals 1st neighbor, Hint 3 reveals 2nd neighbor
    if (difficulty === "hard") {
      if (unlockedHints === 2) {
        return effectiveBorders.slice(0, 1);
      }
      if (unlockedHints >= 3) {
        return effectiveBorders.slice(0, 2);
      }
      return [];
    }
    return effectiveBorders.slice(0, Math.min(3, effectiveBorders.length));
  }, [targetCountry, difficulty, unlockedHints, mode]);

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
    setPosition((pos) => ({ ...pos, zoom: Math.min(pos.zoom * 1.6, 30) }));
  };

  const handleZoomOut = () => {
    setPosition((pos) => ({ ...pos, zoom: Math.max(pos.zoom / 1.6, 1) }));
  };

  const handleResetZoom = () => {
    setPosition({ coordinates: [0, 20], zoom: 1 });
  };

  const handleSelectCountry = React.useCallback((country: CountryData) => {
    setInspectedCountry(country);
  }, []);

  const lastGuess = guesses.length > 0 ? guesses[guesses.length - 1] : null;

  const isTargetHidden = mode === "detective" && gameStatus === "playing";

  // Determine if inspected country is the secret target
  const isTargetInspected =
    !isTargetHidden &&
    Boolean(
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
        "relative w-full h-[55vh] sm:h-136 lg:h-[calc(100vh-80px)] min-h-90 sm:min-h-120 rounded-2xl overflow-hidden border border-border bg-card/60 shadow-xl flex flex-col items-center justify-center select-none"
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
        mode={mode}
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
        style={{ touchAction: "none", shapeRendering: "geometricPrecision", backgroundColor: "var(--map-sea)" }}
      >
        <ZoomableGroup
          zoom={position.zoom}
          center={position.coordinates}
          filterZoomEvent={filterZoomEvent}
          onMoveEnd={(pos) => setPosition(pos)}
          maxZoom={30}
          minZoom={1}
        >
          <Geographies geography={GEO_URL}>
            {({ geographies }) => (
              <WorldGeographiesContent
                geographies={geographies}
                strokeWidth={0.55}
                isGameOver={gameStatus !== "playing"}
                isTargetHidden={isTargetHidden}
                targetCountry={targetCountry}
                activeNeighbors={activeNeighbors}
                guessedCountriesMap={guessedCountriesMap}
                gameStatus={gameStatus}
                mode={mode}
                difficulty={difficulty}
                inspectedCountry={inspectedCountry}
                onSelectCountry={handleSelectCountry}
              />
            )}
          </Geographies>

          {/* Nautical Tethers for Island Isolation */}
          {nauticalTethers.map((tether, idx) => {
            if (!tether.to) return null;
            return (
              <React.Fragment key={`tether-${idx}`}>
                <Line
                  from={tether.from}
                  to={tether.to}
                  stroke="var(--map-neighbor-stroke)"
                  strokeWidth={1.2}
                  strokeDasharray="3 3"
                  style={{ vectorEffect: "non-scaling-stroke" }}
                />
              </React.Fragment>
            );
          })}

          {/* Target marker when game is won or lost */}
          {gameStatus !== "playing" && targetCountry && (
            <TargetPulseMarker
              coordinates={[
                targetCountry.coordinates[1],
                targetCountry.coordinates[0],
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
      <CountryReconSheet
        mode={mode}
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
      <MapLegend hotLabel="Hot (<1500km)" warmLabel="Warm (1500-4000km)" />
    </div>
  );
}
