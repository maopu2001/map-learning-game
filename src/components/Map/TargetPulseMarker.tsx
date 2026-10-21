"use client";

import React from "react";
import { Marker, useZoomPanContext } from "react-simple-maps";

interface TargetPulseMarkerProps {
  coordinates: [number, number];
  zoom?: number;
  fillColor?: string;
}

export function TargetPulseMarker({
  coordinates,
  zoom: fallbackZoom = 1,
  fillColor = "#10b981",
}: TargetPulseMarkerProps) {
  const zoomPan = useZoomPanContext?.() as { k?: number } | undefined;
  const zoom = Math.max(0.1, zoomPan?.k || fallbackZoom || 1);

  // Screen-space sizes (pixels) bounded between min and max sizes:
  // - Inner white dot: min 4px radius (8px diameter), max 10px radius (20px diameter)
  // - Outer pulsing ring: min 7px radius (14px diameter), max 17px radius (34px diameter)
  // - Outer stroke width: min 1.5px, max 2.5px
  const scale = Math.pow(zoom, 0.4);
  const innerScreenR = Math.min(10, Math.max(4, 4 * scale));
  const outerScreenR = Math.min(17, Math.max(7, 7 * scale));
  const strokeScreenW = Math.min(2.5, Math.max(1.5, 1.5 * Math.pow(zoom, 0.2)));

  // ZoomableGroup applies transform scale(zoom), so divide screen radius by zoom
  const innerR = innerScreenR / zoom;
  const outerR = outerScreenR / zoom;
  const strokeW = strokeScreenW / zoom;

  return (
    <Marker coordinates={coordinates}>
      <circle
        r={outerR}
        fill={fillColor}
        stroke="#ffffff"
        strokeWidth={strokeW}
        className="animate-ping opacity-75"
      />
      <circle r={innerR} fill="#ffffff" />
    </Marker>
  );
}
