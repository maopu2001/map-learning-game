"use client";

import React from "react";
import {
  COUNTRIES_BY_NUMERIC,
  COUNTRIES_BY_NAME,
  CountryData,
} from "@/data/world";
import { useMapCamera } from "@/hooks/useMapCamera";
import {
  MapCanvasBase,
  GeoFeature,
  MapFeatureStyle,
} from "@/components/Map/MapCanvasBase";

export const WORLD_GEO_URL = "/data/world-countries-geo-50m.json";

export type { GeoFeature };

export function resolveCountryFromGeo(geo: GeoFeature): CountryData | undefined {
  const gid = String(geo.id);
  return (
    COUNTRIES_BY_NUMERIC.get(gid) ||
    COUNTRIES_BY_NUMERIC.get(String(parseInt(gid, 10))) ||
    (geo.properties?.name
      ? COUNTRIES_BY_NAME.get(String(geo.properties.name).toLowerCase())
      : undefined)
  );
}

export type CountryFeatureStyle = MapFeatureStyle;

export interface WorldMapBaseProps {
  camera: ReturnType<typeof useMapCamera>;
  className?: string;
  getCountryStyle: (
    country: CountryData | undefined,
    geo: GeoFeature,
  ) => CountryFeatureStyle;
  onCountryHover?: (country: CountryData | null) => void;
  onCountryClick?: (country: CountryData) => void;
  onMouseLeave?: () => void;
  zoomTargetCenter?: [number, number] | null;
  resetTitle?: string;
  renderSvgLayers?: (context: {
    geographies: GeoFeature[];
    resolveCountry: (geo: GeoFeature) => CountryData | undefined;
    zoom: number;
  }) => React.ReactNode;
  children?: React.ReactNode;
}

export function WorldMapBase({
  getCountryStyle,
  onCountryHover,
  onCountryClick,
  renderSvgLayers,
  resetTitle = "Recenter World",
  ...rest
}: WorldMapBaseProps) {
  return (
    <MapCanvasBase<CountryData>
      geographyUrl={WORLD_GEO_URL}
      projectionConfig={{ scale: 155 }}
      maxZoom={60}
      minZoom={1}
      resetTitle={resetTitle}
      resolveItem={resolveCountryFromGeo}
      getItemStyle={getCountryStyle}
      onItemHover={onCountryHover}
      onItemClick={onCountryClick}
      renderSvgLayers={
        renderSvgLayers
          ? ({ geographies, resolveItem, zoom }) =>
              renderSvgLayers({
                geographies,
                resolveCountry: resolveItem,
                zoom,
              })
          : undefined
      }
      {...rest}
    />
  );
}
