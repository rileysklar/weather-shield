import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { gridId, gridX, gridY } = await request.json();
    
    if (!gridId || typeof gridX !== 'number' || typeof gridY !== 'number') {
      return NextResponse.json(
        { error: 'Grid ID, X, and Y coordinates are required' },
        { status: 400 }
      );
    }

    const headers = {
      'User-Agent': '(weather-shield.com, contact@weather-shield.com)',
      'Accept': 'application/geo+json'
    };

    const response = await fetch(
      `https://api.weather.gov/gridpoints/${gridId}/${gridX},${gridY}`,
      { headers }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Weather.gov API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching gridpoint forecast:', error);
    return NextResponse.json(
      { error: 'Failed to fetch gridpoint forecast' },
      { status: 500 }
    );
  }
} 