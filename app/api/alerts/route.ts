import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { lat, lon } = body;

    if (!lat || !lon) {
      return NextResponse.json(
        { error: 'Missing latitude or longitude' },
        { status: 400 }
      );
    }

    console.log('Fetching alerts for coordinates:', { lat, lon });
    
    // Call the NOAA API
    const noaaUrl = `https://api.weather.gov/alerts/active?point=${lat},${lon}`;
    console.log('NOAA API URL:', noaaUrl);
    
    const response = await fetch(noaaUrl, {
      headers: {
        'User-Agent': '(Weather Shield, contact@weathershield.com)',
        'Accept': 'application/geo+json',
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('NOAA API Error Response:', {
        status: response.status,
        statusText: response.statusText,
        url: noaaUrl,
        error: errorText
      });
      return NextResponse.json(
        { error: `Failed to fetch alerts from NOAA: ${errorText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('NOAA API Response:', {
      features: data.features?.length || 0,
      type: data.type,
      title: data.title
    });
    
    const alerts = data.features?.map((feature: any) => feature.properties) || [];

    return NextResponse.json({ alerts });
  } catch (error) {
    console.error('Error in alerts API:', {
      name: error instanceof Error ? error.name : 'Unknown error',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    return NextResponse.json(
      { error: `Internal server error: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 }
    );
  }
} 