'use client';

import mapboxgl, { MapMouseEvent } from 'mapbox-gl';
import { useEffect, useRef, useState } from 'react';
import 'mapbox-gl/dist/mapbox-gl.css';
import { getWeatherData } from '@/app/actions/weather';
import { Sidebar } from './sidebar';
import { cn } from '@/lib/utils';
import { Spinner } from './ui/spinner';
import { useToast } from '@/components/ui/use-toast';
import { WeatherError } from '@/utils/services/weather';

// Initialize with your Mapbox access token
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

export default function Map() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number;
    lng: number;
    weather?: any;
  } | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { toast } = useToast();

  const handleLocationUpdate = async (location: { lat: number; lng: number; name?: string }) => {
    if (!map.current) return;

    setIsSidebarOpen(true);

    // Remove existing marker if any
    const existingMarker = document.querySelector('.mapboxgl-marker');
    existingMarker?.remove();

    // Create custom marker element
    const markerEl = document.createElement('div');
    markerEl.className = 'flex items-center justify-center';
    markerEl.innerHTML = `
      <div class="relative">
        <div class="absolute -inset-3 animate-ping rounded-full bg-primary/50 opacity-75"></div>
        <div class="relative rounded-full bg-primary p-2 shadow-lg"></div>
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
      const weatherData = await getWeatherData(location.lat, location.lng);
      setSelectedLocation({ ...location, weather: weatherData });
    } catch (error) {
      console.error('Error fetching weather data:', error);
      if (error instanceof WeatherError && error.code === 'LOCATION_OUTSIDE_US') {
        toast({
          title: "Location Outside US",
          description: "NOAA only provides weather data for locations within the United States. Try clicking somewhere within the US borders.",
          variant: "destructive",
          duration: 5000,
        });
      } else {
        toast({
          title: "Location Outside US",
          description: "NOAA only provides weather data for locations within the United States. Try clicking somewhere within the US borders.",
          variant: "destructive",
          duration: 5000,
        });
      }
      setSelectedLocation(null);
      setIsSidebarOpen(false);
      existingMarker?.remove();
    }
  };

  const handleMapClick = (e: MapMouseEvent) => {
    const { lng, lat } = e.lngLat;
    handleLocationUpdate({ lng, lat });
  };

  useEffect(() => {
    if (mapContainer.current) {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/satellite-v9',
        center: [-98.5795, 39.8283], // Center of US
        zoom: 4,
        minZoom: 1,
        maxZoom: 18
      });

      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

      map.current.on('load', () => {
        setIsLoading(false);
      });

      map.current.on('click', handleMapClick);
    }

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50">
      <div ref={mapContainer} className="w-full h-full" />
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm">
          <div className="flex items-center gap-2 rounded-lg border bg-background p-4">
            <Spinner className="h-6 w-6" />
            <p className="text-sm font-medium">Loading map...</p>
          </div>
        </div>
      )}
      <Sidebar 
        weatherData={selectedLocation?.weather} 
        location={selectedLocation ? { lat: selectedLocation.lat, lng: selectedLocation.lng } : null}
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        onLocationSelect={handleLocationUpdate}
      />
    </div>
  );
} 