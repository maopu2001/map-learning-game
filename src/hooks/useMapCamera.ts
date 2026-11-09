"use client";

import { useState, useRef, useEffect, useCallback } from "react";

export interface MapCameraOptions {
  initialCoordinates?: [number, number];
  initialZoom?: number;
  minZoom?: number;
  maxZoom?: number;
  resetCoordinates?: [number, number];
  resetZoom?: number;
  duration?: number;
}

export function useMapCamera(options: MapCameraOptions = {}) {
  const {
    initialCoordinates = [0, 20],
    initialZoom = 1,
    minZoom = 0.8,
    maxZoom = 60,
    resetCoordinates = [0, 20],
    resetZoom = 1,
    duration = 320,
  } = options;

  const [position, setPosition] = useState<{
    coordinates: [number, number];
    zoom: number;
  }>({
    coordinates: initialCoordinates,
    zoom: initialZoom,
  });

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<number | null>(null);
  const positionRef = useRef(position);
  positionRef.current = position;

  useEffect(() => {
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, []);

  const flyTo = useCallback(
    (targetCoords: [number, number], targetZoom: number) => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      const startCoords = positionRef.current.coordinates;
      const startZoom = positionRef.current.zoom;
      const startTime = performance.now();

      const step = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(1, elapsed / duration);
        const ease = 1 - Math.pow(1 - progress, 3);

        const currentLng =
          startCoords[0] + (targetCoords[0] - startCoords[0]) * ease;
        const currentLat =
          startCoords[1] + (targetCoords[1] - startCoords[1]) * ease;
        const currentZoom = startZoom + (targetZoom - startZoom) * ease;

        setPosition({
          coordinates: [currentLng, currentLat],
          zoom: currentZoom,
        });

        if (progress < 1) {
          animRef.current = requestAnimationFrame(step);
        } else {
          animRef.current = null;
        }
      };

      animRef.current = requestAnimationFrame(step);
    },
    [duration],
  );

  // Prevent browser viewport tab-zooming on trackpad pinch
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

  const filterZoomEvent = useCallback((event: unknown) => {
    if (animRef.current) {
      cancelAnimationFrame(animRef.current);
      animRef.current = null;
    }
    const e = event as { type?: string; ctrlKey?: boolean; button?: number };
    if (!e || !e.type) return true;
    if (e.type === "wheel") return true;
    if (e.type === "mousedown") return e.button === 0;
    if (e.type.startsWith("touch")) return true;
    return true;
  }, []);

  const handleZoomIn = useCallback(
    (targetCoords?: [number, number] | null) => {
      setPosition((pos) => ({
        coordinates: targetCoords || pos.coordinates,
        zoom: Math.min(pos.zoom * 1.6, maxZoom),
      }));
    },
    [maxZoom],
  );

  const handleZoomOut = useCallback(
    (targetCoords?: [number, number] | null) => {
      setPosition((pos) => {
        const nextZoom = Math.max(pos.zoom / 1.6, minZoom);
        return {
          coordinates:
            nextZoom <= resetZoom
              ? resetCoordinates
              : targetCoords || pos.coordinates,
          zoom: nextZoom,
        };
      });
    },
    [minZoom, resetCoordinates, resetZoom],
  );

  const handleResetZoom = useCallback(() => {
    flyTo(resetCoordinates, resetZoom);
  }, [flyTo, resetCoordinates, resetZoom]);

  const onMoveEnd = useCallback(
    (pos: { coordinates: [number, number]; zoom: number }) => {
      if (animRef.current) {
        cancelAnimationFrame(animRef.current);
        animRef.current = null;
      }
      setPosition(pos);
    },
    [],
  );

  return {
    position,
    setPosition,
    positionRef,
    mapContainerRef,
    flyTo,
    filterZoomEvent,
    handleZoomIn,
    handleZoomOut,
    handleResetZoom,
    onMoveEnd,
  };
}
