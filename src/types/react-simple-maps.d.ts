declare module "react-simple-maps" {
  import * as React from "react";

  export interface ComposableMapProps extends React.SVGProps<SVGSVGElement> {
    width?: number;
    height?: number;
    projection?: string | ((...args: unknown[]) => unknown);
    projectionConfig?: {
      scale?: number;
      center?: [number, number];
      rotate?: [number, number, number];
      parallels?: [number, number];
    };
    children?: React.ReactNode;
  }

  export const ComposableMap: React.FC<ComposableMapProps>;

  export interface ZoomableGroupProps extends React.SVGProps<SVGGElement> {
    center?: [number, number];
    zoom?: number;
    minZoom?: number;
    maxZoom?: number;
    translateExtent?: [[number, number], [number, number]];
    filterZoomEvent?: (event: unknown) => boolean;
    onMoveEnd?: (position: { coordinates: [number, number]; zoom: number }) => void;
    children?: React.ReactNode;
  }

  export const ZoomableGroup: React.FC<ZoomableGroupProps>;

  export interface GeographiesProps {
    geography: string | Record<string, unknown> | unknown[];
    children: (props: {
      geographies: Array<{
        rsmKey: string;
        id: string | number;
        properties: Record<string, unknown>;
        geometry: Record<string, unknown>;
      }>;
    }) => React.ReactNode;
  }

  export const Geographies: React.FC<GeographiesProps>;

  export interface GeographyProps extends React.SVGProps<SVGPathElement> {
    geography: {
      rsmKey: string;
      id: string | number;
      properties: Record<string, unknown>;
      geometry: Record<string, unknown>;
    };
    style?: {
      default?: React.CSSProperties;
      hover?: React.CSSProperties;
      pressed?: React.CSSProperties;
    };
  }

  export const Geography: React.FC<GeographyProps>;

  export interface MarkerProps extends React.SVGProps<SVGGElement> {
    coordinates: [number, number];
    children?: React.ReactNode;
  }

  export const Marker: React.FC<MarkerProps>;

  export interface LineProps extends React.SVGProps<SVGPathElement> {
    from: [number, number];
    to: [number, number];
    stroke?: string;
    strokeWidth?: number;
    strokeDasharray?: string;
  }

  export const Line: React.FC<LineProps>;

  export interface SphereProps extends React.SVGProps<SVGPathElement> {
    id?: string;
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
  }

  export const Sphere: React.FC<SphereProps>;

  export interface GraticuleProps extends React.SVGProps<SVGPathElement> {
    step?: [number, number];
    stroke?: string;
    strokeWidth?: number;
  }

  export const Graticule: React.FC<GraticuleProps>;
}
