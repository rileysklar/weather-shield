import mapboxgl from 'mapbox-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';

// Initialize Mapbox access token
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

export interface PolygonCoordinates {
  type: 'Feature';
  geometry: {
    type: 'Polygon';
    coordinates: number[][][];
  };
  properties: any;
}

export class PolygonService {
  private draw: MapboxDraw | null = null;
  private map: mapboxgl.Map | null = null;

  initialize(map: mapboxgl.Map) {
    this.map = map;
    this.draw = new MapboxDraw({
      displayControlsDefault: false,
      controls: {
        polygon: true,
        trash: true
      },
      defaultMode: 'draw_polygon',
      styles: [
        {
          id: 'gl-draw-polygon-fill-active',
          type: 'fill',
          filter: ['all', ['==', '$type', 'Polygon'], ['==', 'active', 'true']],
          paint: {
            'fill-color': '#0066FF',
            'fill-opacity': 0.1
          }
        },
        {
          id: 'gl-draw-polygon-stroke-active',
          type: 'line',
          filter: ['all', ['==', '$type', 'Polygon'], ['==', 'active', 'true']],
          paint: {
            'line-color': '#0066FF',
            'line-width': 2
          }
        },
        {
          id: 'gl-draw-line-active',
          type: 'line',
          filter: ['all', ['==', '$type', 'LineString'], ['==', 'active', 'true']],
          paint: {
            'line-color': '#0066FF',
            'line-width': 2,
            'line-dasharray': [0.5, 2]
          }
        },
        {
          id: 'gl-draw-polygon-and-line-vertex-active',
          type: 'circle',
          filter: ['all', ['==', 'meta', 'vertex'], ['==', '$type', 'Point']],
          paint: {
            'circle-radius': 6,
            'circle-color': '#fff',
            'circle-stroke-color': '#0066FF',
            'circle-stroke-width': 2
          }
        },
        {
          id: 'gl-draw-polygon-and-line-vertex-hover',
          type: 'circle',
          filter: ['all', ['==', 'meta', 'vertex'], ['==', '$type', 'Point'], ['==', 'active', 'true']],
          paint: {
            'circle-radius': 7,
            'circle-color': '#fff',
            'circle-stroke-color': '#0066FF',
            'circle-stroke-width': 2
          }
        }
      ]
    });

    map.addControl(this.draw);

    // Add event listeners for drawing feedback
    map.on('draw.create', this.handleDrawCreate);
    map.on('draw.update', this.handleDrawUpdate);
    map.on('draw.modechange', (e: any) => {
      if (e.mode === 'draw_polygon') {
        const event = new CustomEvent('polygon.instructions', {
          detail: "Click points to draw your polygon. Click the first point again to complete."
        });
        window.dispatchEvent(event);
      }
    });
  }

  private handleDrawCreate = (e: { features: any[] }) => {
    const data = e.features[0];
    if (data?.geometry?.coordinates?.[0]) {
      window.dispatchEvent(new CustomEvent('polygon.created', { 
        detail: data 
      }));
      // Also dispatch polygon complete event with just the coordinates
      window.dispatchEvent(new CustomEvent('polygon.complete', {
        detail: data.geometry.coordinates[0]
      }));
    }
  };

  private handleDrawDelete = () => {
    window.dispatchEvent(new CustomEvent('polygon.deleted'));
  };

  private handleDrawUpdate = (e: { features: any[] }) => {
    const data = e.features[0];
    if (data?.geometry?.coordinates?.[0]) {
      window.dispatchEvent(new CustomEvent('polygon.updated', { 
        detail: data 
      }));
      // Also dispatch polygon complete event with just the coordinates
      window.dispatchEvent(new CustomEvent('polygon.complete', {
        detail: data.geometry.coordinates[0]
      }));
    }
  };

  getDrawnPolygon(): PolygonCoordinates | null {
    if (!this.draw) return null;
    const features = this.draw.getAll();
    return features.features[0] as PolygonCoordinates || null;
  }

  clearPolygon() {
    if (this.draw) {
      this.draw.deleteAll();
    }
  }

  cleanup() {
    if (this.map && this.draw) {
      this.map.off('draw.create', this.handleDrawCreate);
      this.map.off('draw.delete', this.handleDrawDelete);
      this.map.off('draw.update', this.handleDrawUpdate);
      this.map.removeControl(this.draw);
      this.draw = null;
      this.map = null;
    }
  }
} 