"use client";

import React, { useMemo, useState } from "react";
import { Geography } from "react-simple-maps";
import { useGameStore } from "@/lib/store";
import { DistrictData } from "@/data/bangladesh";
import { TargetPulseMarker } from "@/components/Map/TargetPulseMarker";
import { TerritoryReconWindow } from "@/components/Map/TerritoryReconWindow";
import { TerritoryReconSheet } from "@/components/Map/TerritoryReconSheet";
import { MapLegend } from "@/components/Map/MapLegend";
import { useMapCamera } from "@/hooks/useMapCamera";
import {
  BangladeshMapBase,
  DistrictFeatureStyle,
  GeoFeature,
} from "@/components/Map/BangladeshMapBase";

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

  const camera = useMapCamera({
    initialCoordinates: [90.3563, 23.685],
    initialZoom: 1,
    resetCoordinates: [90.3563, 23.685],
    resetZoom: 1,
    maxZoom: 50,
    minZoom: 0.8,
  });

  const [inspectedDistrict, setInspectedDistrict] =
    useState<DistrictData | null>(null);

  const activeNeighbors = useMemo(() => {
    if (!targetDistrict) return [];
    if (mode === "detective") {
      return unlockedHints >= 3 ? targetDistrict.borders.slice(0, 1) : [];
    }
    if (difficulty === "hard") {
      if (unlockedHints === 2) return targetDistrict.borders.slice(0, 1);
      if (unlockedHints >= 3) return targetDistrict.borders.slice(0, 2);
      return [];
    }
    return targetDistrict.borders.slice(0, Math.min(3, targetDistrict.borders.length));
  }, [targetDistrict, difficulty, unlockedHints, mode]);

  const guessedDistrictsMap = useMemo(() => {
    const map = new Map<string, (typeof guesses)[0]>();
    for (const g of guesses) {
      map.set(g.country.name.toLowerCase(), g);
    }
    return map;
  }, [guesses]);

  // Recenter to Bangladesh overview when target changes
  React.useEffect(() => {
    camera.setPosition({
      coordinates: [90.3563, 23.685],
      zoom: 1,
    });
    setInspectedDistrict(null);
  }, [targetDistrict]);

  const targetCenter = useMemo<[number, number] | null>(() => {
    if ((mode === "daily" || mode === "blitz") && targetDistrict?.coordinates) {
      return [targetDistrict.coordinates[1], targetDistrict.coordinates[0]];
    }
    return null;
  }, [mode, targetDistrict]);

  const isGameOver = gameStatus !== "playing";
  const isTargetHidden = mode === "detective" && gameStatus === "playing";
  const isTargetInspected =
    !isTargetHidden &&
    Boolean(
      targetDistrict &&
        inspectedDistrict &&
        inspectedDistrict.name.toLowerCase() ===
          targetDistrict.name.toLowerCase(),
    );
  const lastGuess = guesses.length > 0 ? guesses[guesses.length - 1] : null;

  const strokeWidth = 0.65;

  const getDistrictStyle = React.useCallback(
    (districtData: DistrictData | undefined): DistrictFeatureStyle => {
      const dName = districtData?.name;
      const isTarget =
        (!isTargetHidden || isGameOver) &&
        Boolean(
          targetDistrict &&
            dName &&
            dName.toLowerCase() === targetDistrict.name.toLowerCase(),
        );
      const isNeighbor = Boolean(
        dName &&
          activeNeighbors.some(
            (neighbor) => neighbor.toLowerCase() === dName.toLowerCase(),
          ),
      );
      const guessResult = dName
        ? guessedDistrictsMap.get(dName.toLowerCase())
        : undefined;
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
          if (dist < 50) {
            priority = 3;
            fill = "var(--map-hot)";
            stroke = "var(--map-hot-stroke)";
            itemStrokeWidth = strokeWidth * 1.25;
          } else if (dist < 120) {
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
      targetDistrict,
      activeNeighbors,
      guessedDistrictsMap,
      gameStatus,
      strokeWidth,
    ],
  );

  return (
    <BangladeshMapBase
      camera={camera}
      className={className}
      getDistrictStyle={getDistrictStyle}
      onDistrictHover={setInspectedDistrict}
      onDistrictClick={setInspectedDistrict}
      onMouseLeave={() => setInspectedDistrict(null)}
      zoomTargetCenter={targetCenter}
      resetTitle="Recenter Bangladesh"
      renderSvgLayers={({ geographies, resolveDistrict, zoom }) => {
        let targetGeo: GeoFeature | null = null;
        let inspectedGeo: GeoFeature | null = null;
        const neighborGeos: GeoFeature[] = [];

        for (const g of geographies) {
          const d = resolveDistrict(g);
          if (!d) continue;
          const lowerName = d.name.toLowerCase();
          if (
            targetDistrict &&
            lowerName === targetDistrict.name.toLowerCase()
          ) {
            targetGeo = g;
          }
          if (
            inspectedDistrict &&
            lowerName === inspectedDistrict.name.toLowerCase()
          ) {
            inspectedGeo = g;
          }
          if (
            activeNeighbors.some((n) => n.toLowerCase() === lowerName) &&
            !guessedDistrictsMap.has(lowerName)
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

            {/* Target marker when game is won or lost */}
            {isGameOver && targetDistrict && (
              <TargetPulseMarker
                coordinates={[
                  targetDistrict.coordinates[1],
                  targetDistrict.coordinates[0],
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
        inspectedTerritory={inspectedDistrict}
        activeNeighbors={activeNeighbors}
        guessedMap={guessedDistrictsMap}
        lastGuess={lastGuess}
        isTargetInspected={isTargetInspected}
        gameStatus={gameStatus}
        targetTerritory={targetDistrict}
        unlockedHints={unlockedHints}
      />

      <TerritoryReconSheet
        mode={mode}
        inspectedTerritory={inspectedDistrict}
        onClose={() => setInspectedDistrict(null)}
        isTargetInspected={isTargetInspected}
        gameStatus={gameStatus}
        difficulty={difficulty}
        guessedMap={guessedDistrictsMap}
        activeNeighbors={activeNeighbors}
        targetTerritory={targetDistrict}
        unlockedHints={unlockedHints}
      />

      <MapLegend hotLabel="Hot (<50km)" warmLabel="Warm (50-120km)" />
    </BangladeshMapBase>
  );
}
