// Main component
export { createMarkerElement, default as MapView, pointAlongRoute, splitRouteAtProgress } from "./MapView.js";

// Types
export type {
  Alerte, AlerteSeverite, AlerteType, DocDouane, DocumentStatut, DocumentType, Dossier, DossierStatut, MapStyleOverride, MapViewBaseProps, Port,
  // Re-export domain types
  TransportType
} from "./types.js";

// Re-export MapViewProps from MapView module
export type { MapViewProps } from "./MapView.js";
