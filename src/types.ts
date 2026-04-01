import type { LngLatLike } from "mapbox-gl";

export type TransportType = "maritime" | "routier" | "aerien";
export type DossierStatut = "en_transit" | "au_port" | "dedouane" | "livre";
export type DocumentType = "facture" | "certificat_origine" | "eur1" | "cmr" | "bl" | "packing_list";
export type DocumentStatut = "recu" | "en_attente" | "manquant";
export type AlerteType = "surestaries" | "geofencing" | "retard" | "docs_manquants";
export type AlerteSeverite = "haute" | "moyenne" | "basse";

export interface Port {
  lat: number;
  lng: number;
  nom: string;
}

export interface DocDouane {
  type: DocumentType;
  libelle: string;
  statut: DocumentStatut;
  dateReception?: string;
  fournisseur?: string;
  derniereRelance?: string;
}

export interface Alerte {
  type: AlerteType;
  severite: AlerteSeverite;
  message: string;
  timestamp: string;
}

export interface Dossier {
  id: string;
  type: TransportType;
  vehiculeId: string;
  origine: Port;
  destination: Port;
  depart: string;
  eta: string;
  route: [number, number][];
  progress: number;
  positionActuelle: LngLatLike;
  statut: DossierStatut;
  documents: DocDouane[];
  alertes: Alerte[];
  fournisseur: string;
}

export interface MapStyleOverride {
  /** Country code to replace (e.g., "IL" for Israel) */
  replaceCountryCode: string;
  /** Original country name to detect (e.g., "Israel") */
  originalName: string;
  /** New label to display (e.g., "Palestine") */
  newName: string;
}

export interface MapViewBaseProps {
  /** MapBox access token (required) */
  accessToken: string;
  
  /** Map style URL (default: "mapbox://styles/mapbox/navigation-night-v1") */
  style?: string;
  
  /** Initial center coordinates [lng, lat] (default: [-1, 39]) */
  center?: [number, number];
  
  /** Initial zoom level (default: 4.2) */
  zoom?: number;
  
  /** Initial pitch (default: 55) */
  pitch?: number;
  
  /** Initial bearing (default: 0) */
  bearing?: number;
  
  /** Map language (default: "fr") */
  language?: string;
  
  /** Map worldview (default: "MA") */
  worldview?: string;
  
  /** Enable label override for specific countries */
  styleOverride?: MapStyleOverride;
  
  /** CSS class for the map container */
  className?: string;
  
  /** Loading state text */
  loadingText?: string;
}
