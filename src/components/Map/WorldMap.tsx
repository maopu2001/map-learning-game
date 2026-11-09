"use client";

import React, { useMemo, useState } from "react";
import { Geography, Line } from "react-simple-maps";
import { useGameStore } from "@/lib/store";
import {
  COUNTRIES_BY_ID,
  CountryData,
  getEffectiveBorders,
} from "@/data/world";
import { TargetPulseMarker } from "@/components/Map/TargetPulseMarker";
import { TerritoryReconWindow } from "@/components/Map/TerritoryReconWindow";
import { TerritoryReconSheet } from "@/components/Map/TerritoryReconSheet";
import { MapLegend } from "@/components/Map/MapLegend";
import { useMapCamera } from "@/hooks/useMapCamera";
import {
  WorldMapBase,
  CountryFeatureStyle,
  GeoFeature,
} from "@/components/Map/WorldMapBase";

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

  const camera = useMapCamera({
    initialCoordinates: [0, 20],
    initialZoom: 1,
    resetCoordinates: [0, 20],
    resetZoom: 1,
    maxZoom: 30,
    minZoom: 1,
  });

  const [inspectedCountry, setInspectedCountry] = useState<CountryData | null>(
    null,
  );

  const activeNeighbors = useMemo(() => {
    if (!targetCountry) return [];
    const effectiveBorders = getEffectiveBorders(targetCountry);
    if (mode === "detective") {
      return unlockedHints >= 3 ? effectiveBorders.slice(0, 1) : [];
    }
    if (difficulty === "hard") {
      if (unlockedHints === 2) return effectiveBorders.slice(0, 1);
      if (unlockedHints >= 3) return effectiveBorders.slice(0, 2);
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
    camera.setPosition({
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

  const targetCenter = useMemo<[number, number] | null>(() => {
    if ((mode === "daily" || mode === "blitz") && targetCountry?.coordinates) {
      return [targetCountry.coordinates[1], targetCountry.coordinates[0]];
    }
    return null;
  }, [mode, targetCountry]);

  const isGameOver = gameStatus !== "playing";
  const isTargetHidden = mode === "detective" && gameStatus === "playing";
  const isTargetInspected =
    !isTargetHidden &&
    Boolean(
      targetCountry &&
      inspectedCountry &&
      inspectedCountry.id.toUpperCase() === targetCountry.id.toUpperCase(),
    );
  const lastGuess = guesses.length > 0 ? guesses[guesses.length - 1] : null;

  const strokeWidth = 0.55;

  const getCountryStyle = React.useCallback(
    (country: CountryData | undefined): CountryFeatureStyle => {
      const isoId = country?.id;
      const isTarget =
        (!isTargetHidden || isGameOver) &&
        Boolean(targetCountry?.id && isoId && isoId === targetCountry.id);
      const isNeighbor = Boolean(isoId && activeNeighbors.includes(isoId));
      const guessResult = isoId ? guessedCountriesMap.get(isoId) : undefined;
      const isGuessed = Boolean(guessResult);

      let priority = 0;
      let fill = "var(--map-land)";
      let stroke = "var(--map-land-border)";
      let itemStrokeWidth = strokeWidth * 1.1;

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

      return {
        fill,
        stroke,
        strokeWidth: itemStrokeWidth,
        hoverFill: isGuessed ? fill : "var(--map-land-hover)",
        hoverStroke: "var(--map-inspect-stroke)",
        priority,
      };
    },
    [
      isTargetHidden,
      isGameOver,
      targetCountry,
      activeNeighbors,
      guessedCountriesMap,
      gameStatus,
      strokeWidth,
    ],
  );

  return (
    <WorldMapBase
      camera={camera}
      className={className}
      getCountryStyle={getCountryStyle}
      onCountryHover={setInspectedCountry}
      onCountryClick={setInspectedCountry}
      onMouseLeave={() => setInspectedCountry(null)}
      zoomTargetCenter={targetCenter}
      resetTitle="Recenter World"
      renderSvgLayers={({ geographies, resolveCountry, zoom }) => {
        let targetGeo: GeoFeature | null = null;
        let inspectedGeo: GeoFeature | null = null;
        const neighborGeos: GeoFeature[] = [];

        for (const g of geographies) {
          const c = resolveCountry(g);
          if (!c) continue;
          if (targetCountry?.id && c.id === targetCountry.id) {
            targetGeo = g;
          }
          if (inspectedCountry?.id && c.id === inspectedCountry.id) {
            inspectedGeo = g;
          }
          if (
            activeNeighbors.includes(c.id) &&
            !guessedCountriesMap.has(c.id.toUpperCase())
          ) {
            neighborGeos.push(g);
          }
        }

        return (
          <>
            {/* Neighbor hint perimeters */}
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

            {/* Target perimeter */}
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
                    fillOpacity: isGameOver ? 0.35 : 0.24,
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
                    fillOpacity: isGameOver ? 0.35 : 0.24,
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

            {/* Inspected territory perimeter */}
            {inspectedGeo && inspectedGeo !== targetGeo && (
              <Geography
                key={`overlay-inspected-${inspectedGeo.rsmKey}`}
                geography={inspectedGeo}
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

            {/* Nautical Tethers for Island Isolation */}
            {nauticalTethers.map((tether, idx) => (
              <Line
                key={`tether-${idx}`}
                from={tether.from}
                to={tether.to}
                stroke="var(--map-neighbor-stroke)"
                strokeWidth={1.2}
                strokeDasharray="3 3"
                style={{ vectorEffect: "non-scaling-stroke" }}
              />
            ))}

            {/* Target marker when game is won or lost */}
            {isGameOver && targetCountry && (
              <TargetPulseMarker
                coordinates={[
                  targetCountry.coordinates[1],
                  targetCountry.coordinates[0],
                ]}
                zoom={zoom}
                fillColor={
                  gameStatus === "won"
                    ? "var(--map-correct)"
                    : "var(--destructive)"
                }
              />
            )}
          </>
        );
      }}
    >
      <TerritoryReconWindow
        mode={mode}
        difficulty={difficulty}
        inspectedTerritory={inspectedCountry}
        activeNeighbors={activeNeighbors}
        guessedMap={guessedCountriesMap}
        lastGuess={lastGuess}
        isTargetInspected={isTargetInspected}
        gameStatus={gameStatus}
        targetTerritory={targetCountry}
        unlockedHints={unlockedHints}
      />

      <TerritoryReconSheet
        mode={mode}
        inspectedTerritory={inspectedCountry}
        onClose={() => setInspectedCountry(null)}
        isTargetInspected={isTargetInspected}
        gameStatus={gameStatus}
        difficulty={difficulty}
        guessedMap={guessedCountriesMap}
        activeNeighbors={activeNeighbors}
        targetTerritory={targetCountry}
        unlockedHints={unlockedHints}
      />

      <MapLegend hotLabel="Hot (<1500km)" warmLabel="Warm (1500-4000km)" />
    </WorldMapBase>
  );
}
