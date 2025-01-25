const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

interface LocationResult {
  name: string;
  lat: number;
  lng: number;
}

export async function searchLocations(query: string): Promise<LocationResult[]> {
  if (!query) return [];

  try {
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
      query
    )}.json?access_token=${MAPBOX_TOKEN}&types=place,address&limit=5&autocomplete=true`;

    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(`Failed to fetch locations: ${data.message || 'Unknown error'}`);
    }

    if (!data.features) {
      console.error('No features in response');
      return [];
    }
    
    return data.features.map((feature: any) => ({
      name: feature.place_name,
      lng: feature.center[0],
      lat: feature.center[1],
    }));
  } catch (error) {
    console.error('Error searching locations:', error);
    return [];
  }
} 