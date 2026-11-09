"use client";

import React from "react";
import { Geography } from "react-simple-maps";
import { TargetPulseMarker } from "@/components/Map/TargetPulseMarker";
import { GeoFeature } from "@/components/Map/WorldMapBase";

export interface ExploreOverlaysProps {
  filterMatchGeos: GeoFeature[];
  neighborGeos: GeoFeature[];
  selectedGeo?: GeoFeature | null;
  hoveredGeo?: GeoFeature | null;
  selectedCoordinates?: [number, number] | null;
  hoveredCoordinates?: [number, number] | null;
  zoom: number;
  strokeWidth?: number;
  filterFill?: string;
  filterStroke?: string;
  inspectFill?: string;
  inspectStroke?: string;
}

export function ExploreOverlays({
  filterMatchGeos,
  neighborGeos,
  selectedGeo,
  hoveredGeo,
  selectedCoordinates,
  hoveredCoordinates,
  zoom,
  strokeWidth = 0.55,
  filterFill = "var(--map-filter)",
  filterStroke = "var(--map-filter-stroke)",
  inspectFill = "var(--map-inspect-fill)",
  inspectStroke = "var(--map-inspect-stroke)",
}: ExploreOverlaysProps) {
  return (
    <>
      {/* Overlay 1: Filter matches (Continent/Subregion/Division) */}
      {filterMatchGeos.map((geo) => (
        <Geography
          key={`overlay-filter-${geo.rsmKey}`}
          geography={geo}
          style={{
            default: {
              fill: filterFill,
              fillOpacity: 0.2,
              stroke: filterStroke,
              strokeWidth: strokeWidth * 1.1,
              strokeLinejoin: "round",
              strokeLinecap: "round",
              vectorEffect: "non-scaling-stroke",
              pointerEvents: "none",
            },
            hover: {
              fill: filterFill,
              fillOpacity: 0.2,
              stroke: filterStroke,
              strokeWidth: strokeWidth * 1.1,
              vectorEffect: "non-scaling-stroke",
              pointerEvents: "none",
            },
          }}
        />
      ))}

      {/* Overlay 2: Neighboring entities */}
      {neighborGeos.map((geo) => (
        <Geography
          key={`overlay-neighbor-${geo.rsmKey}`}
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

      {/* Overlay 3: Selected territory */}
      {selectedGeo && (
        <Geography
          key={`overlay-sel-${selectedGeo.rsmKey}`}
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

      {/* Overlay 4: Hovered territory */}
      {hoveredGeo && hoveredGeo !== selectedGeo && (
        <Geography
          key={`overlay-hover-${hoveredGeo.rsmKey}`}
          geography={hoveredGeo}
          style={{
            default: {
              fill: inspectFill,
              stroke: inspectStroke,
              strokeWidth: strokeWidth * 1.6,
              strokeLinejoin: "round",
              strokeLinecap: "round",
              vectorEffect: "non-scaling-stroke",
              pointerEvents: "none",
            },
            hover: {
              fill: inspectFill,
              stroke: inspectStroke,
              strokeWidth: strokeWidth * 1.6,
              vectorEffect: "non-scaling-stroke",
              pointerEvents: "none",
            },
          }}
        />
      )}

      {/* Target marker on selected territory */}
      {selectedCoordinates && (
        <TargetPulseMarker
          coordinates={selectedCoordinates}
          zoom={zoom}
          fillColor="var(--map-target)"
        />
      )}

      {/* Target marker on hovered territory */}
      {hoveredCoordinates && (
        <TargetPulseMarker
          coordinates={hoveredCoordinates}
          zoom={zoom}
          fillColor="var(--map-neighbor-stroke)"
        />
      )}
    </>
  );
}
