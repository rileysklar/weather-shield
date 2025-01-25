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

export default function Map() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number;
    lng: number;
    name?: string;
    weather?: any;
  } | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { toast } = useToast();

  const handleLocationUpdate = async (location: { lat: number; lng: number; name?: string }) => {
    if (!map.current) return;

    setIsSidebarOpen(true);
    setSelectedLocation(null); // Reset current weather data

    // Remove existing marker if any
    const existingMarker = document.querySelector('.mapboxgl-marker');
    existingMarker?.remove();

    // Create custom marker element
    const markerEl = document.createElement('div');
    markerEl.className = 'flex items-center justify-center';
    markerEl.innerHTML = `
      <div class="relative">
        <div class="absolute -inset-3 animate-ping rounded-full bg-primary/50 opacity-75"></div>
        <div class="relative rounded-full bg-primary/40 p-2 shadow-lg"></div>
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
      const [weatherData, locationName] = await Promise.all([
        getWeatherData(location.lat, location.lng),
        location.name ? Promise.resolve(location.name) : reverseGeocode(location.lng, location.lat)
      ]);
      
      setSelectedLocation({ 
        ...location, 
        weather: weatherData,
        name: locationName || undefined
      });
    } catch (error) {
      console.error('Error fetching data:', error);
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
    <div className="relative h-full w-full">
      <div ref={mapContainer} className="h-full w-full" />
      {isLoading && (
        <div className="absolute inset-0 z-[100] flex items-center justify-center backdrop-blur">
          <div className="flex items-center gap-2 rounded-xl bg-background/30 p-4 shadow-lg backdrop-blur-md">
            <Spinner className="h-6 w-6" />
            <p className="text-sm font-medium">Loading map...</p>
          </div>
        </div>
      )}
      <Sidebar 
        weatherData={selectedLocation?.weather} 
        location={selectedLocation ? { 
          lat: selectedLocation.lat, 
          lng: selectedLocation.lng,
          name: selectedLocation.name 
        } : null}
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        onLocationSelect={handleLocationUpdate}
      />
    </div>
  );
} 