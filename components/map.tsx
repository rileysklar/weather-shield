'use client';

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Sidebar } from './sidebar';
import { useToast } from './ui/use-toast';
import { PolygonService } from '@/utils/services/polygon';
import { ProjectSiteForm, ProjectSiteDetails } from './project-site-form';
import { ProjectSiteService } from '@/utils/services/project-site';
import { useUser } from '@/lib/hooks/use-user';
import { toast } from "@/components/ui/use-toast";
import { WeatherUpdateService } from '@/utils/services/weather-update';
import { Json } from '@/types/supabase';
import { SiteType, ProjectSite as DBProjectSite } from '@/types/site';
import { ProjectSite, ProjectSiteUpdateInput } from '@/types/ui';

// Initialize with your Mapbox access token
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

const PROJECT_TYPES = [
  { value: 'solar_array', label: 'Solar Array' },
  { value: 'wind_farm', label: 'Wind Farm' },
  { value: 'hydroelectric', label: 'Hydroelectric' },
  { value: 'coal', label: 'Coal' },
  { value: 'natural_gas', label: 'Natural Gas' },
  { value: 'nuclear', label: 'Nuclear' },
  { value: 'geothermal', label: 'Geothermal' },
  { value: 'biomass', label: 'Biomass' },
  { value: 'other', label: 'Other' }
];

const getSiteTypeLabel = (type: string) => {
  const projectType = PROJECT_TYPES.find(t => t.value === type);
  return projectType?.label || type;
};

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
  onProjectSiteCreate?: (site: DBProjectSite) => void;
}

// Add type guard for coordinates
const isValidCoordinates = (coords: unknown): coords is number[][] => {
  return Array.isArray(coords) && 
    coords.every(point => Array.isArray(point) && 
    point.every(num => typeof num === 'number'));
};

// Convert DB site to UI site, with type assertion for coordinates
const toUIProjectSite = (dbSite: DBProjectSite): ProjectSite | null => {
  const coordinates = dbSite.coordinates;
  
  // Skip sites with invalid coordinates
  if (!isValidCoordinates(coordinates)) {
    console.error('Invalid coordinates format:', coordinates);
    return null;
  }

  return {
    id: dbSite.id,
    name: dbSite.name,
    description: dbSite.description || '',
    type: dbSite.site_type,
    coordinates
  };
};

const toDBProjectSite = (uiSite: Partial<ProjectSite>): Partial<DBProjectSite> => {
  const dbSite: Partial<DBProjectSite> = {};
  
  if (uiSite.name !== undefined) dbSite.name = uiSite.name;
  if (uiSite.description !== undefined) dbSite.description = uiSite.description;
  if (uiSite.type !== undefined) dbSite.site_type = uiSite.type as SiteType;
  if (uiSite.coordinates !== undefined) dbSite.coordinates = uiSite.coordinates;
  
  return dbSite;
};

export default function MapComponent({ onProjectSiteCreate }: MapComponentProps) {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number; name?: string } | null>(null);
  const [weatherData, setWeatherData] = useState<any>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [currentPolygon, setCurrentPolygon] = useState<number[][] | null>(null);
  const [projectSites, setProjectSites] = useState<ProjectSite[]>([]);
  const polygonService = useRef<PolygonService | null>(null);
  const projectSiteService = useRef(new ProjectSiteService());
  const { user } = useUser();

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

    // Fly to location with second strongest zoom level
    map.current.flyTo({
      center: [location.lng, location.lat],
      zoom: 14,
      essential: true
    });

    try {
      const [weatherResponse, locationName] = await Promise.all([
        fetch('/api/weather', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ lat: location.lat, lon: location.lng }),
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
      style: 'mapbox://styles/rileysklar1/cm6374obn005d01s6eas16xay',
      center: [-98.5795, 39.8283], // Center of the US
      zoom: 3
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

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
        if (!el.closest('.mapboxgl-marker')) {
          el.closest('.mapboxgl-marker')?.remove();
        }
      });

      // Add labels for each project site
      projectSites.forEach(site => {
        if (!site.coordinates) return; // Skip sites without coordinates
        
        const center = calculatePolygonCenter(site.coordinates);
        
        // Create label element
        const labelEl = document.createElement('div');
        labelEl.className = 'project-site-label bg-background/90 px-2 py-1 rounded-md shadow-md border border-border text-sm font-medium cursor-pointer hover:bg-accent/50 transition-colors';
        labelEl.style.zIndex = '1';
        labelEl.textContent = `${site.name} (${getSiteTypeLabel(site.type)})`;

        // Add click handler
        labelEl.addEventListener('click', (e) => {
          e.stopPropagation();
          handleProjectSiteSelect(site);
        });

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
        features: projectSites
          .filter(site => site.coordinates !== null)
          .map(site => ({
            type: 'Feature',
            properties: {
              id: site.id,
              name: site.name,
              type: site.type
            },
            geometry: {
              type: 'Polygon',
              coordinates: [site.coordinates!]
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
        console.log('MapComponent - handlePolygonCompleteEvent - Raw event:', e);
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
    console.log('MapComponent - handlePolygonComplete - Received coordinates:', coordinates);
    setCurrentPolygon(coordinates);
    setShowProjectForm(true);
    setIsSidebarOpen(true);
    setIsDrawingMode(false); // Exit drawing mode
    
    toast({
      title: "Project Site Area Defined",
      description: "Please fill in the project details",
      duration: 5000,
    });
  };

  const handleProjectSiteCreate = async (details: ProjectSiteDetails) => {
    try {
      if (!currentPolygon || !user) return;

      const [centerLng, centerLat] = calculatePolygonCenter(currentPolygon);

      const newSite = await projectSiteService.current.createProjectSite({
        name: details.name,
        description: details.description,
        site_type: details.type,
        coordinates: currentPolygon,
        center_point: `(${centerLng},${centerLat})`,
        user_id: user.id
      });

      const uiSite = toUIProjectSite(newSite);
      if (uiSite) {
        setProjectSites(prev => [...prev, uiSite]);
      }

      // Reset all states
      setShowProjectForm(false);
      setCurrentPolygon(null);
      polygonService.current?.clearPolygon();

      // Notify parent
      onProjectSiteCreate?.(newSite);

      toast({
        title: "Success",
        description: "Project site created successfully.",
      });
    } catch (error) {
      console.error('Error creating project site:', error);
      toast({
        title: "Error",
        description: "Failed to create project site. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Load project sites on mount
  useEffect(() => {
    if (!user) return;

    const loadProjectSites = async () => {
      try {
        const sites = await projectSiteService.current.getProjectSites();
        // Convert DB sites to UI sites, filtering out invalid ones
        const validSites = sites
          .map(site => toUIProjectSite(site))
          .filter((site): site is ProjectSite => site !== null);
        setProjectSites(validSites);
      } catch (error) {
        console.error('Error loading project sites:', error);
        toast({
          title: "Error loading project sites",
          description: "Please try again later",
          variant: "destructive",
        });
      }
    };

    loadProjectSites();
  }, [user]);

  const handleProjectSiteSelect = async (site: ProjectSite) => {
    if (!map.current || !site.coordinates) return;
    
    // Open sidebar when project site is selected
    setIsSidebarOpen(true);
    
    // Get the center point of the polygon for weather data
    const [lng, lat] = calculatePolygonCenter(site.coordinates);
    
    // Fly to the location with second strongest zoom level
    map.current.flyTo({
      center: [lng, lat],
      zoom: 14,
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
    console.log('MapComponent - handleClearPolygon - Cleaning up polygon');
    polygonService.current?.cleanup();
    polygonService.current = new PolygonService();
    setCurrentPolygon(null);
  };

  const handleCancelProjectSite = () => {
    // Clean up the polygon service
    polygonService.current?.cleanup();
    // Create a new instance for next use
    polygonService.current = new PolygonService();
    // Reset states
    setIsDrawingMode(false);
    setShowProjectForm(false);
    setCurrentPolygon(null);
    
    toast({
      title: "Project Site Creation Cancelled",
      description: "You can start over by clicking 'Create Project Site'",
    });
  };

  const handleProjectSiteNameEdit = async (siteId: string, newName: string) => {
    try {
      await projectSiteService.current.updateProjectSite(siteId, { name: newName });
      setProjectSites(prevSites => 
        prevSites.map(site => site.id === siteId ? { ...site, name: newName } : site)
      );
      toast({
        title: "Success",
        description: "Project site name updated successfully"
      });
    } catch (error) {
      console.error('Error updating project site name:', error);
      toast({
        title: "Error",
        description: "Failed to update project site name",
        variant: "destructive"
      });
    }
  };

  const handleProjectSiteUpdate = async (siteId: string, updates: ProjectSiteUpdateInput) => {
    try {
      // Convert UI updates to DB updates
      const dbUpdates = toDBProjectSite(updates);
      await projectSiteService.current.updateProjectSite(siteId, dbUpdates);
      
      // Update local state with UI types
      setProjectSites(prevSites =>
        prevSites.map(site => {
          if (site.id === siteId) {
            return {
              ...site,
              ...updates
            };
          }
          return site;
        })
      );
    } catch (error) {
      console.error('Error updating project site:', error);
      toast({
        title: "Error updating project site",
        description: "Please try again later",
        variant: "destructive",
      });
    }
  };

  const handleProjectSiteDelete = async (siteId: string) => {
    try {
      const siteToDelete = projectSites.find(site => site.id === siteId);
      if (!siteToDelete) return;

      await projectSiteService.current.deleteProjectSite(siteId);
      
      // Update local state first
      setProjectSites(prev => prev.filter(site => site.id !== siteId));
      
      // Force a cleanup of all markers and redraw
      if (map.current) {
        // Remove all existing markers
        document.querySelectorAll('.mapboxgl-marker').forEach(marker => marker.remove());
        
        // Clear the polygon source
        (map.current.getSource('saved-polygons') as mapboxgl.GeoJSONSource)?.setData({
          type: 'FeatureCollection',
          features: []
        });
      }
      
      toast({
        title: "Project Site Deleted",
        description: "The project site has been deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting project site:', error);
      toast({
        title: "Error",
        description: "Failed to delete project site",
        variant: "destructive",
      });
    }
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
        onProjectDetailsSubmit={handleProjectSiteCreate}
        onCancelProjectSite={handleCancelProjectSite}
        onProjectSiteNameEdit={handleProjectSiteNameEdit}
        onProjectSiteUpdate={handleProjectSiteUpdate}
        onProjectSiteDelete={handleProjectSiteDelete}
        projectSites={projectSites}
        onProjectSiteSelect={handleProjectSiteSelect}
      />
    </div>
  );
} 