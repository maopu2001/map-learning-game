"use client";

import React from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from "react-simple-maps";
import { MapZoomControls } from "@/components/Map/MapZoomControls";
import { useMapCamera } from "@/hooks/useMapCamera";

export type GeoFeature = {
  rsmKey: string;
  id: string | number;
  properties: Record<string, unknown>;
  geometry: Record<string, unknown>;
};

export interface MapFeatureStyle {
  fill: string;
  stroke: string;
  strokeWidth: number;
  hoverFill?: string;
  hoverStroke?: string;
  priority?: number;
}

interface GeographyItemProps<T> {
  geo: GeoFeature;
  item?: T;
  style: MapFeatureStyle;
  onHover?: (item: T | null) => void;
  onClick?: (item: T) => void;
}

const GeographyItem = React.memo(function GeographyItem<T>({
  geo,
  item,
  style,
  onHover,
  onClick,
}: GeographyItemProps<T>) {
  const handleMouseEnter = React.useCallback(() => {
    if (item) onHover?.(item);
  }, [item, onHover]);

  const handleMouseLeave = React.useCallback(() => {
    onHover?.(null);
  }, [onHover]);

  const handleClick = React.useCallback(() => {
    if (item) onClick?.(item);
  }, [item, onClick]);

  return (
    <Geography
      geography={geo}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      style={{
        default: {
          fill: style.fill,
          stroke: style.stroke,
          strokeWidth: style.strokeWidth,
          strokeLinejoin: "round",
          strokeLinecap: "round",
          vectorEffect: "non-scaling-stroke",
          outline: "none",
          transition: "fill 200ms ease, stroke 200ms ease",
        },
        hover: {
          fill: style.hoverFill || "var(--map-land-hover)",
          stroke: style.hoverStroke || "var(--map-inspect-stroke)",
          strokeWidth: style.strokeWidth * 1.5,
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
}) as <T>(props: GeographyItemProps<T>) => React.ReactElement;

export interface MapCanvasBaseProps<T> {
  camera: ReturnType<typeof useMapCamera>;
  className?: string;
  geographyUrl: string;
  projectionConfig?: { scale: number; center?: [number, number] };
  resolveItem: (geo: GeoFeature) => T | undefined;
  getItemStyle: (item: T | undefined, geo: GeoFeature) => MapFeatureStyle;
  onItemHover?: (item: T | null) => void;
  onItemClick?: (item: T) => void;
  onMouseLeave?: () => void;
  zoomTargetCenter?: [number, number] | null;
  resetTitle?: string;
  maxZoom?: number;
  minZoom?: number;
  renderSvgLayers?: (context: {
    geographies: GeoFeature[];
    resolveItem: (geo: GeoFeature) => T | undefined;
    zoom: number;
  }) => React.ReactNode;
  children?: React.ReactNode;
}

export function MapCanvasBase<T>({
  camera,
  className,
  geographyUrl,
  projectionConfig,
  resolveItem,
  getItemStyle,
  onItemHover,
  onItemClick,
  onMouseLeave,
  zoomTargetCenter,
  resetTitle = "Recenter Map",
  maxZoom = 50,
  minZoom = 1,
  renderSvgLayers,
  children,
}: MapCanvasBaseProps<T>) {
  const {
    position,
    mapContainerRef,
    filterZoomEvent,
    handleZoomIn,
    handleZoomOut,
    handleResetZoom,
    onMoveEnd,
  } = camera;

  return (
    <div
      ref={mapContainerRef}
      onMouseLeave={onMouseLeave}
      className={
        className ||
        "relative w-full h-[55vh] sm:h-136 lg:h-[calc(100vh-80px)] min-h-90 sm:min-h-120 rounded-2xl overflow-hidden border border-border bg-card/60 shadow-xl flex flex-col items-center justify-center select-none"
      }
    >
      <div className="absolute inset-0 bg-tactical-grid opacity-40 pointer-events-none" />

      <MapZoomControls
        onZoomIn={() => handleZoomIn(zoomTargetCenter)}
        onZoomOut={() => handleZoomOut(zoomTargetCenter)}
        onResetZoom={handleResetZoom}
        resetTitle={resetTitle}
      />

      <ComposableMap
        width={960}
        height={580}
        projection="geoMercator"
        projectionConfig={projectionConfig}
        className="w-full h-full cursor-grab active:cursor-grabbing outline-none touch-none"
        style={{
          touchAction: "none",
          shapeRendering: "geometricPrecision",
          backgroundColor: "var(--map-sea)",
        }}
      >
        <ZoomableGroup
          zoom={position.zoom}
          center={position.coordinates}
          filterZoomEvent={filterZoomEvent}
          onMoveEnd={onMoveEnd}
          maxZoom={maxZoom}
          minZoom={minZoom}
        >
          <Geographies geography={geographyUrl}>
            {({ geographies }: { geographies: GeoFeature[] }) => {
              const styledGeographies = geographies
                .map((geo) => {
                  const item = resolveItem(geo);
                  const style = getItemStyle(item, geo);
                  return {
                    geo,
                    item,
                    style,
                    priority: style.priority ?? 0,
                  };
                })
                .sort((a, b) => a.priority - b.priority);

              return (
                <>
                  {styledGeographies.map(({ geo, item, style }) => (
                    <GeographyItem
                      key={geo.rsmKey}
                      geo={geo}
                      item={item}
                      style={style}
                      onHover={onItemHover}
                      onClick={onItemClick}
                    />
                  ))}

                  {renderSvgLayers?.({
                    geographies,
                    resolveItem,
                    zoom: position.zoom,
                  })}
                </>
              );
            }}
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>

      {children}
    </div>
  );
}
