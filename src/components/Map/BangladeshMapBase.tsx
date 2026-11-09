"use client";

import React from "react";
import { DISTRICTS_BY_NAME, DistrictData } from "@/data/bangladesh";
import { useMapCamera } from "@/hooks/useMapCamera";
import {
  MapCanvasBase,
  GeoFeature,
  MapFeatureStyle,
} from "@/components/Map/MapCanvasBase";

export const BD_GEO_URL = "/data/bangladesh-districts-topo.json";

export type { GeoFeature };

export function resolveDistrictFromGeo(geo: GeoFeature): DistrictData | undefined {
  const sName = (geo.properties?.shapeName as string) || "";
  return sName ? DISTRICTS_BY_NAME.get(sName.toLowerCase()) : undefined;
}

export type DistrictFeatureStyle = MapFeatureStyle;

export interface BangladeshMapBaseProps {
  camera: ReturnType<typeof useMapCamera>;
  className?: string;
  getDistrictStyle: (
    district: DistrictData | undefined,
    geo: GeoFeature,
  ) => DistrictFeatureStyle;
  onDistrictHover?: (district: DistrictData | null) => void;
  onDistrictClick?: (district: DistrictData) => void;
  onMouseLeave?: () => void;
  zoomTargetCenter?: [number, number] | null;
  resetTitle?: string;
  renderSvgLayers?: (context: {
    geographies: GeoFeature[];
    resolveDistrict: (geo: GeoFeature) => DistrictData | undefined;
    zoom: number;
  }) => React.ReactNode;
  children?: React.ReactNode;
}

export function BangladeshMapBase({
  getDistrictStyle,
  onDistrictHover,
  onDistrictClick,
  renderSvgLayers,
  resetTitle = "Recenter Bangladesh",
  ...rest
}: BangladeshMapBaseProps) {
  return (
    <MapCanvasBase<DistrictData>
      geographyUrl={BD_GEO_URL}
      projectionConfig={{
        scale: 4320,
        center: [90.3563, 23.685],
      }}
      maxZoom={50}
      minZoom={0.8}
      resetTitle={resetTitle}
      resolveItem={resolveDistrictFromGeo}
      getItemStyle={getDistrictStyle}
      onItemHover={onDistrictHover}
      onItemClick={onDistrictClick}
      renderSvgLayers={
        renderSvgLayers
          ? ({ geographies, resolveItem, zoom }) =>
              renderSvgLayers({
                geographies,
                resolveDistrict: resolveItem,
                zoom,
              })
          : undefined
      }
      {...rest}
    />
  );
}
