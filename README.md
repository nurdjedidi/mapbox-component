# @nur_djedd/mapbox-component

A reusable React MapBox GL component with configurable language, worldview, and style overrides. Perfect for logistics and tracking applications.

## Features

- 🌍 **Configurable Language** - Set map labels language (default: `fr`)
- 🏳️ **Custom Worldview** - Set country worldview (default: `MA` for Morocco)
- 🎨 **Style Override** - Replace disputed territory labels (e.g., "Israel" → "Palestine")
- 🗺️ **Customizable Map Style** - Any MapBox style URL supported
- 📦 **TypeScript Ready** - Full type definitions included
- ⚡ **Dynamic Loading** - mapbox-gl loaded only when needed

## Installation

```bash
npm install @nur_djedd/mapbox-component mapbox-gl
```

## Quick Start

### Basic Usage

```tsx
import { MapView } from "@nur_djedd/mapbox-component";

function App() {
  return (
    <MapView
      accessToken={import.meta.env.VITE_MAPBOX_TOKEN}
    />
  );
}
```

### With Custom Configuration

```tsx
import { MapView } from "@nur_djedd/mapbox-component";

function App() {
  return (
    <MapView
      accessToken={import.meta.env.VITE_MAPBOX_TOKEN}
      language="fr"           // Map labels language
      worldview="MA"          // Country worldview (Morocco)
      style="mapbox://styles/mapbox/navigation-night-v1"
      center={[-1, 39]}       // Mediterranean center
      zoom={4.2}
      pitch={55}
      bearing={0}
      styleOverride={{
        replaceCountryCode: "IL",
        originalName: "Israel",
        newName: "Palestine",
      }}
    />
  );
}
```

### With Custom Markers and Routes

```tsx
import { MapView, createMarkerElement, splitRouteAtProgress } from "@nur_djedd/mapbox-component";
import type { Map as MapboxMap } from "mapbox-gl";

function TrackingMap({ dossiers, selectedId, onSelectDossier }) {
  const handleMapInit = (map: MapboxMap) => {
    dossiers.forEach((dossier) => {
      const { completed, remaining } = splitRouteAtProgress(
        dossier.route,
        dossier.progress
      );

      // Add route line
      map.addSource(`route-${dossier.id}`, {
        type: "geojson",
        data: {
          type: "Feature",
          geometry: { type: "LineString", coordinates: completed },
        },
      });
      map.addLayer({
        id: `route-${dossier.id}`,
        type: "line",
        source: `route-${dossier.id}`,
        paint: { "line-color": "#3b82f6", "line-width": 2 },
      });

      // Add custom marker
      const color = dossier.alertes.length > 0 ? "#dc2626" : "#059669";
      const { element } = createMarkerElement(color, {
        hasAlert: dossier.alertes.length > 0,
        onClick: () => onSelectDossier(dossier.id),
      });

      new mapboxgl.Marker({ element, anchor: "center" })
        .setLngLat(dossier.positionActuelle)
        .addTo(map);
    });
  };

  return (
    <MapView
      accessToken={import.meta.env.VITE_MAPBOX_TOKEN}
      onMapInit={handleMapInit}
      className="h-screen w-full"
    />
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `accessToken` | `string` | **required** | MapBox access token |
| `style` | `string` | `"mapbox://styles/mapbox/navigation-night-v1"` | Map style URL |
| `center` | `[number, number]` | `[-1, 39]` | Initial center coordinates [lng, lat] |
| `zoom` | `number` | `4.2` | Initial zoom level |
| `pitch` | `number` | `55` | Initial pitch (tilt) |
| `bearing` | `number` | `0` | Initial bearing (rotation) |
| `language` | `string` | `"fr"` | Map labels language |
| `worldview` | `string` | `"MA"` | Country worldview code |
| `styleOverride` | `MapStyleOverride` | `undefined` | Label override for disputed territories |
| `className` | `string` | `""` | CSS class for container |
| `loadingText` | `string` | `"Chargement de la carte..."` | Loading state text |
| `onMapLoaded` | `(map) => void` | `undefined` | Callback when map is loaded |
| `onMapInit` | `(map) => void` | `undefined` | Callback for map customization |

### MapStyleOverride Type

```typescript
interface MapStyleOverride {
  /** Country code to replace (e.g., "IL" for Israel) */
  replaceCountryCode: string;
  /** Original country name to detect (e.g., "Israel") */
  originalName: string;
  /** New label to display (e.g., "Palestine") */
  newName: string;
}
```

## Utilities

### `createMarkerElement`

Creates a styled marker element with hover and click handlers.

```typescript
function createMarkerElement(
  color: string,
  options?: {
    size?: number;
    borderSize?: number;
    hasAlert?: boolean;
    onClick?: () => void;
    onMouseEnter?: () => void;
    onMouseLeave?: () => void;
  }
): { element: HTMLElement; update: (selected: boolean) => void }
```

### `splitRouteAtProgress`

Splits a route at a given progress percentage.

```typescript
function splitRouteAtProgress(
  route: [number, number][],
  progress: number // 0 to 1
): { completed: [number, number][]; remaining: [number, number][] }
```

### `pointAlongRoute`

Gets a coordinate point along a route at a given progress.

```typescript
function pointAlongRoute(
  route: [number, number][],
  progress: number
): [number, number]
```

## Environment Variables

Add your MapBox token to your `.env` file:

```env
VITE_MAPBOX_TOKEN=pk.your_token_here
```

## Common Map Styles

```javascript
// Night navigation
"mapbox://styles/mapbox/navigation-night-v1"

// Day navigation
"mapbox://styles/mapbox/navigation-day-v1"

// Streets
"mapbox://styles/mapbox/streets-v12"

// Satellite
"mapbox://styles/mapbox/satellite-v9"

// Satellite Streets
"mapbox://styles/mapbox/satellite-streets-v12"

// Dark
"mapbox://styles/mapbox/dark-v11"

// Light
"mapbox://styles/mapbox/light-v11"
```

## License

MIT
