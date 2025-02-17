/// <reference types="@types/google.maps" />

declare global {
  interface Window {
    google: typeof google;
    mapkit: typeof mapkit & {
      init: (options: { authorizationCallback: (done: (token: string) => void) => void }) => void;
      Map: typeof mapkit.Map;
      Coordinate: typeof mapkit.Coordinate;
      CoordinateRegion: typeof mapkit.CoordinateRegion;
      CoordinateSpan: typeof mapkit.CoordinateSpan;
      MarkerAnnotation: typeof mapkit.MarkerAnnotation;
      Padding: typeof mapkit.Padding;
      MapSnapshot: typeof mapkit.MapSnapshot;
      PointOfInterestFilter: typeof mapkit.PointOfInterestFilter;
      PointOfInterestCategory: typeof mapkit.PointOfInterestCategory;
    }
  }
}

declare namespace google.maps {
  export class Map {
    constructor(
      mapDiv: Element | null,
      opts?: MapOptions
    );
  }
  
  export class Marker {
    constructor(opts: MarkerOptions);
    addListener(eventName: string, handler: Function): void;
  }
  
  export class InfoWindow {
    constructor(opts?: InfoWindowOptions);
    open(map?: Map, anchor?: Marker): void;
  }
}

declare namespace mapkit {
  export class Map {
    constructor(
      container: HTMLElement,
      options: {
        center: Coordinate;
        zoom: number;
        showsMapTypeControl: boolean;
        showsZoomControl: boolean;
        showsUserLocationControl: boolean;
        padding: Padding;
      }
    );
    addAnnotation(annotation: MarkerAnnotation): void;
    region: CoordinateRegion;
  }

  export class Coordinate {
    constructor(latitude: number, longitude: number);
  }

  export class CoordinateRegion {
    constructor(
      center: Coordinate,
      span: CoordinateSpan
    );
  }

  export class CoordinateSpan {
    constructor(
      latitudeDelta: number,
      longitudeDelta: number
    );
  }

  export class MarkerAnnotation {
    constructor(
      coordinate: Coordinate,
      options: {
        title: string;
        subtitle: string;
        color?: string;
        glyphText?: string;
        displayPriority?: number;
        size?: { width: number; height: number };
        callout?: {
          title: string;
          subtitle: string;
        };
      }
    );
  }

  export class Padding {
    constructor(top: number, right: number, bottom: number, left: number);
  }

  export class MapSnapshot {
    constructor(options: {
      size: { width: number; height: number };
      region: CoordinateRegion;
      scale: number;
      colorScheme?: "light" | "dark";
      annotations?: MarkerAnnotation[];
      pointOfInterestFilter?: PointOfInterestFilter;
      showsPointsOfInterest?: boolean;
      showsMapTypeControl?: boolean;
      showsZoomControl?: boolean;
      showsUserLocationControl?: boolean;
      tintColor?: string;
    });
    takeSnapshot(): Promise<{ imageData: string }>;
  }

  export class PointOfInterestFilter {
    static including(categories: PointOfInterestCategory[]): PointOfInterestFilter;
  }

  export enum PointOfInterestCategory {
    Airport = "airport",
    Hospital = "hospital",
    Hotel = "hotel",
    MedicalService = "medical-service",
    Park = "park",
    Restaurant = "restaurant",
    Store = "store",
    Theater = "theater"
  }

  export function init(options: { 
    authorizationCallback: (done: (token: string) => void) => void 
  }): void;
}

// This export is needed to make this a module
export {}; 