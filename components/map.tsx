'use client';

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Sidebar } from './sidebar';
import { useToast } from './ui/use-toast';
import { PolygonService } from '@/utils/services/polygon';
import { ProjectSiteForm, ProjectSiteDetails } from './project-site-form';

// Initialize with your Mapbox access token
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

async function reverseGeocode(lng: number, lat: number) {
  const response = await fetch(
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${mapboxgl.accessToken}&types=place,region`
  );
  const data = await response.json();
  
  if (data.features && data.features.length > 0) {
    const place = data.features.find((f: any) => f.place_type.includes('place'));
    const region = data.features.find((f: any) => f.place_type.includes('region'));
    
    if (place && region) {
      return `${place.text}, ${region.text}`;
    }
  }
  return null;
}

interface MapComponentProps {
  onProjectSiteCreate?: (coordinates: number[][], details: ProjectSiteDetails) => void;
}

export default function MapComponent({ onProjectSiteCreate }: MapComponentProps) {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number; name?: string } | null>(null);
  const [weatherData, setWeatherData] = useState<any>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [currentPolygon, setCurrentPolygon] = useState<number[][] | null>(null);
  const [projectSites, setProjectSites] = useState<Array<{
    id: string;
    name: string;
    description: string;
    type: string;
    coordinates: number[][];
  }>>([]);
  const polygonService = useRef<PolygonService | null>(null);
  const { toast } = useToast();

  const handleLocationUpdate = async (location: { lat: number; lng: number }) => {
    if (!map.current) return;

    // Open sidebar when location is clicked
    setIsSidebarOpen(true);
    setSelectedLocation({ ...location }); // Set initial location without name
    setWeatherData(null); // Clear previous weather data to show loading state

    // Remove existing weather marker if any
    const existingMarker = document.querySelector('.weather-marker');
    existingMarker?.remove();

    // Create custom marker element
    const markerEl = document.createElement('div');
    markerEl.className = 'weather-marker flex items-center justify-center';
    markerEl.innerHTML = `
      <div class="relative">
        <div class="absolute -inset-3 animate-ping rounded-full bg-secondary/50 opacity-75"></div>
        <div class="relative rounded-full bg-primary/70 border border-secondary/50 border-2 p-2 shadow-lg"></div>
      </div>
    `;

    // Add marker at clicked location
    new mapboxgl.Marker({
      element: markerEl,
      anchor: 'center'
    })
      .setLngLat([location.lng, location.lat])
      .addTo(map.current);

    // Fly to location
    map.current.flyTo({
      center: [location.lng, location.lat],
      zoom: 10,
      essential: true
    });

    try {
      const [weatherResponse, locationName] = await Promise.all([
        fetch('/api/weather', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ lat: location.lat, lng: location.lng }),
        }),
        reverseGeocode(location.lng, location.lat)
      ]);

      if (!weatherResponse.ok) {
        throw new Error('Failed to fetch weather data');
      }

      const weatherData = await weatherResponse.json();
      setWeatherData(weatherData);
      setSelectedLocation({ ...location, name: locationName || undefined });
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error fetching weather data",
        description: "Please try again later",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (!mapContainer.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/satellite-v9',
      center: [-98.5795, 39.8283], // Center of the US
      zoom: 3
    });

    // Initialize polygon service but don't add controls yet
    polygonService.current = new PolygonService();

    // Add source and layer for saved polygons
    map.current.on('load', () => {
      map.current?.addSource('saved-polygons', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: []
        }
      });

      map.current?.addLayer({
        id: 'saved-polygons-fill',
        type: 'fill',
        source: 'saved-polygons',
        paint: {
          'fill-color': '#0066FF',
          'fill-opacity': 0.2
        }
      });

      map.current?.addLayer({
        id: 'saved-polygons-outline',
        type: 'line',
        source: 'saved-polygons',
        paint: {
          'line-color': '#0066FF',
          'line-width': 2
        }
      });
    });

    return () => {
      polygonService.current?.cleanup();
      map.current?.remove();
    };
  }, []);

  // Calculate center of polygon
  const calculatePolygonCenter = (coordinates: number[][]): [number, number] => {
    const lngs = coordinates.map(coord => coord[0]);
    const lats = coordinates.map(coord => coord[1]);
    const centerLng = (Math.min(...lngs) + Math.max(...lngs)) / 2;
    const centerLat = (Math.min(...lats) + Math.max(...lats)) / 2;
    return [centerLng, centerLat];
  };

  // Update the map when project sites change
  useEffect(() => {
    if (!map.current) return;

    // Wait for the source to be added
    if (!map.current.getSource('saved-polygons')) {
      map.current.once('load', updatePolygons);
      return;
    }

    updatePolygons();

    function updatePolygons() {
      // Remove existing project site labels
      document.querySelectorAll('.project-site-label').forEach(el => {
        // Only remove if it's a direct label element, not a marker wrapper
        if (!el.closest('.mapboxgl-marker')) {
          el.closest('.mapboxgl-marker')?.remove();
        }
      });

      // Add labels for each project site
      projectSites.forEach(site => {
        const center = calculatePolygonCenter(site.coordinates);
        
        // Create label element
        const labelEl = document.createElement('div');
        labelEl.className = 'project-site-label bg-background/90 px-2 py-1 rounded-md shadow-md border border-border text-sm font-medium z-10';
        labelEl.textContent = site.name;

        // Add label to map
        new mapboxgl.Marker({
          element: labelEl,
          anchor: 'center'
        })
          .setLngLat(center)
          .addTo(map.current!);
      });

      // Update polygons on the map
      const geojson = {
        type: 'FeatureCollection',
        features: projectSites.map(site => ({
          type: 'Feature',
          properties: {
            id: site.id,
            name: site.name,
            type: site.type
          },
          geometry: {
            type: 'Polygon',
            coordinates: [site.coordinates]
          }
        }))
      };

      (map.current?.getSource('saved-polygons') as mapboxgl.GeoJSONSource)?.setData(geojson as any);
    }
  }, [projectSites]);

  // Toggle drawing mode and controls
  useEffect(() => {
    if (!map.current || !polygonService.current) return;

    if (isDrawingMode) {
      polygonService.current.initialize(map.current);
      
      // Add polygon complete listener
      const handlePolygonCompleteEvent = (e: CustomEvent<number[][]>) => {
        handlePolygonComplete(e.detail);
      };

      // Add instructions listener
      const handleInstructionsEvent = (e: CustomEvent<string>) => {
        toast({
          title: "Drawing Instructions",
          description: e.detail,
          duration: 10000, // Show for 10 seconds
        });
      };
      
      window.addEventListener('polygon.complete', handlePolygonCompleteEvent as EventListener);
      window.addEventListener('polygon.instructions', handleInstructionsEvent as EventListener);
      
      toast({
        title: "Project Site Creation Mode",
        description: "Draw a polygon on the map to define your project site",
        duration: 5000,
      });

      return () => {
        window.removeEventListener('polygon.complete', handlePolygonCompleteEvent as EventListener);
        window.removeEventListener('polygon.instructions', handleInstructionsEvent as EventListener);
      };
    } else {
      polygonService.current.cleanup();
    }
  }, [isDrawingMode]);

  // Handle map click for weather data
  useEffect(() => {
    if (!map.current) return;

    const handleMapClick = (e: mapboxgl.MapMouseEvent) => {
      if (isDrawingMode) return; // Don't handle weather clicks in drawing mode
      const { lat, lng } = e.lngLat;
      handleLocationUpdate({ lat, lng });
    };

    map.current.on('click', handleMapClick);
    return () => {
      map.current?.off('click', handleMapClick);
    };
  }, [isDrawingMode]);

  const handleDrawingModeToggle = () => {
    if (isDrawingMode) {
      // If we're turning off drawing mode, clean up
      polygonService.current?.cleanup();
      setShowProjectForm(false);
      setCurrentPolygon(null);
    } else {
      // If we're turning on drawing mode, create a new instance
      polygonService.current = new PolygonService();
    }
    setIsDrawingMode(!isDrawingMode);
  };

  const handlePolygonComplete = (coordinates: number[][]) => {
    setCurrentPolygon(coordinates);
    setShowProjectForm(true);
    setIsSidebarOpen(true);
    
    toast({
      title: "Project Site Area Defined",
      description: "Please fill in the project details",
      duration: 5000,
    });
  };

  const handleProjectDetailsSubmit = (details: ProjectSiteDetails) => {
    if (!currentPolygon) return;
    
    // Create new project site
    const newSite = {
      id: crypto.randomUUID(),
      name: details.name,
      description: details.description,
      type: details.type,
      coordinates: currentPolygon
    };
    
    // Add to project sites list
    setProjectSites(prev => [...prev, newSite]);
    
    // Reset all states
    onProjectSiteCreate?.(currentPolygon, details);
    
    // Clean up the polygon service
    polygonService.current?.cleanup();
    
    // Create a new instance for next use
    polygonService.current = new PolygonService();
    
    // Reset all states
    setIsDrawingMode(false);
    setShowProjectForm(false);
    setCurrentPolygon(null);
    
    // Switch back to the list tab after creation
    const listTab = document.querySelector('[value="list"]') as HTMLElement;
    if (listTab) {
      listTab.click();
    }
    
    toast({
      title: "Project Site Saved",
      description: "Your project site has been created successfully",
    });
  };

  const handleProjectSiteSelect = async (site: typeof projectSites[0]) => {
    if (!map.current) return;
    
    // Open sidebar when project site is selected
    setIsSidebarOpen(true);
    
    // Get the center point of the polygon for weather data
    const [lng, lat] = calculatePolygonCenter(site.coordinates);
    
    // Fly to the location
    map.current.flyTo({
      center: [lng, lat],
      zoom: 12,
      essential: true
    });

    // Update selected location and trigger weather fetch
    await handleLocationUpdate({ lat, lng });
    
    toast({
      title: "Project Site Selected",
      description: site.name,
    });
  };

  const handleClearPolygon = () => {
    polygonService.current?.cleanup();
    // Create a new instance for next use
    polygonService.current = new PolygonService();
    setShowProjectForm(false);
    setCurrentPolygon(null);
    setIsDrawingMode(false);
  };

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="w-full h-full" />
      <Sidebar
        weatherData={weatherData}
        location={selectedLocation}
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        onLocationSelect={handleLocationUpdate}
        onClearPolygon={handleClearPolygon}
        isDrawingMode={isDrawingMode}
        onDrawingModeToggle={handleDrawingModeToggle}
        onPolygonComplete={handlePolygonComplete}
        showProjectForm={showProjectForm}
        onProjectDetailsSubmit={handleProjectDetailsSubmit}
        projectSites={projectSites}
        onProjectSiteSelect={handleProjectSiteSelect}
      />
    </div>
  );
} 