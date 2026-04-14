import type { LngLatLike, Map as MapboxMap } from "mapbox-gl";
import { useEffect, useRef, useState } from "react";
import type { MapViewBaseProps } from "./types.js";

export interface MapViewProps extends MapViewBaseProps {
  /** Optional callback when map is loaded */
  onMapLoaded?: (map: MapboxMap) => void;

  /** Optional callback to customize map after initialization */
  onMapInit?: (map: MapboxMap) => void;
}

const DEFAULT_STYLE = "mapbox://styles/mapbox/navigation-night-v1";
const DEFAULT_CENTER: [number, number] = [-1, 39];
const DEFAULT_ZOOM = 4.2;
const DEFAULT_PITCH = 55;
const DEFAULT_BEARING = 0;
const DEFAULT_LANGUAGE = "fr";
const DEFAULT_WORLDVIEW = "MA";
const DEFAULT_LOADING_TEXT = "Chargement de la carte...";

/**
 * MapView Component - A reusable MapBox GL component for React applications.
 *
 * Features:
 * - Configurable language, worldview, and map style
 * - Optional label override for disputed territories
 * - TypeScript support
 * - Dynamic loading of mapbox-gl
 */
export default function MapView({
  accessToken,
  style = DEFAULT_STYLE,
  center = DEFAULT_CENTER,
  zoom = DEFAULT_ZOOM,
  pitch = DEFAULT_PITCH,
  bearing = DEFAULT_BEARING,
  language = DEFAULT_LANGUAGE,
  worldview = DEFAULT_WORLDVIEW,
  styleOverride,
  className = "",
  loadingText = DEFAULT_LOADING_TEXT,
  onMapLoaded,
  onMapInit,
}: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapboxMap | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    if (!accessToken || !containerRef.current || mapRef.current) return;

    const init = async () => {
      const mapboxgl = (await import("mapbox-gl")).default;
      if (!containerRef.current) return;

      mapboxgl.accessToken = accessToken;

      const map = new mapboxgl.Map({
        container: containerRef.current,
        style,
        center,
        zoom,
        pitch,
        bearing,
        antialias: true,
        worldview,
        language,
      });

      map.showTileBoundaries = false;
      map.showCollisionBoxes = false;

      mapRef.current = map;

      const effectiveOverride = styleOverride ?? {
        replaceCountryCode: "IL",
        originalName: "Israel",
        newName: "Palestine",
      };

      map.on("style.load", () => {
        const overrideLabel = [
          "case",
          ["any",
            ["==", ["coalesce", ["get", "iso_3166_1"], ""], effectiveOverride.replaceCountryCode],
            ["in", effectiveOverride.originalName, ["coalesce", ["get", "name_en"], ""]],
          ],
          effectiveOverride.newName,
          ["coalesce", ["get", `name_${language}`], ["get", "name"]],
        ] as unknown as string; // eslint-disable-line @typescript-eslint/no-explicit-any

        map.getStyle().layers?.forEach((layer) => {
          if (layer.type !== "symbol") return;
          const field = map.getLayoutProperty(layer.id, "text-field");
          if (!field) return;
          map.setLayoutProperty(layer.id, "text-field", overrideLabel);
        });
      });

      // Call custom init callback if provided
      if (onMapInit) {
        map.on("load", () => onMapInit(map));
      }

      map.on("load", () => {
        setMapLoaded(true);
        onMapLoaded?.(map);
      });
    };

    init();

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [accessToken, style, center, zoom, pitch, bearing, worldview, language, styleOverride, onMapInit, onMapLoaded]);

  return (
    <div className={`mapbox-container ${className}`.trim()} ref={containerRef} />
  );
}

/**
 * Utility function to create a custom marker element
 */
export function createMarkerElement(
  color: string,
  options?: {
    size?: number;
    borderSize?: number;
    hasAlert?: boolean;
    onClick?: () => void;
    onMouseEnter?: () => void;
    onMouseLeave?: () => void;
  }
): { element: HTMLElement; update: (selected: boolean) => void } {
  const {
    size = 12,
    borderSize = 2,
    hasAlert = false,
    onClick,
    onMouseEnter,
    onMouseLeave,
  } = options || {};

  const wrapper = document.createElement("div");
  wrapper.style.cssText = `
    width: ${size + borderSize * 2 + 16}px; height: ${size + borderSize * 2 + 16}px;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer;
  `;

  const dot = document.createElement("div");
  dot.style.cssText = `
    width: ${size}px; height: ${size}px;
    background: ${color};
    border-radius: 50%;
    border: ${borderSize}px solid rgba(255,255,255,0.9);
    transition: transform 0.15s ease, box-shadow 0.15s ease;
    ${hasAlert ? `box-shadow: 0 0 0 4px ${color}44;` : ""}
  `;

  wrapper.appendChild(dot);
  wrapper.addEventListener("mouseenter", () => {
    dot.style.transform = "scale(1.6)";
    onMouseEnter?.();
  });
  wrapper.addEventListener("mouseleave", () => {
    dot.style.transform = "scale(1)";
    onMouseLeave?.();
  });
  wrapper.addEventListener("click", () => {
    onClick?.();
  });

  return {
    element: wrapper,
    update: (selected: boolean) => {
      if (selected) {
        dot.style.transform = "scale(1.9)";
        dot.style.boxShadow = `0 0 0 6px ${color}55, 0 0 12px ${color}88`;
        wrapper.style.zIndex = "10";
      } else {
        dot.style.transform = "scale(1)";
        dot.style.boxShadow = "";
        wrapper.style.zIndex = "1";
      }
    },
  };
}

/**
 * Utility to split a route at progress percentage
 */
export function splitRouteAtProgress(
  route: [number, number][],
  progress: number
): { completed: [number, number][]; remaining: [number, number][] } {
  if (route.length < 2) {
    return { completed: [...route], remaining: [] };
  }

  const totalPoints = route.length - 1;
  const splitIndex = Math.floor(totalPoints * progress);
  const remainder = totalPoints * progress - splitIndex;

  const completed = route.slice(0, splitIndex + 1);
  const remaining = [route[splitIndex + 1]];

  if (remainder > 0 && splitIndex + 1 < route.length) {
    remaining.unshift(route[splitIndex]);
  }

  remaining.push(...route.slice(splitIndex + 2));

  return { completed, remaining };
}

/**
 * Get a point along a route at a given progress
 */
export function pointAlongRoute(
  route: [number, number][],
  progress: number
): LngLatLike {
  if (route.length === 0) return [0, 0];
  if (progress <= 0) return route[0];
  if (progress >= 1) return route[route.length - 1];

  const totalSegments = route.length - 1;
  const segmentIndex = Math.floor(progress * totalSegments);
  const segmentProgress = (progress * totalSegments) - segmentIndex;

  const start = route[segmentIndex];
  const end = route[Math.min(segmentIndex + 1, route.length - 1)];

  return [
    start[0] + (end[0] - start[0]) * segmentProgress,
    start[1] + (end[1] - start[1]) * segmentProgress,
  ];
}
