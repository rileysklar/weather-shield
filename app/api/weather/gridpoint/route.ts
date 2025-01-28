import { NextResponse } from 'next/server';
import { WeatherService } from '@/utils/services/weather';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { gridId, gridX, gridY } = body;

    if (!gridId || typeof gridX === 'undefined' || typeof gridY === 'undefined') {
      return NextResponse.json(
        { error: 'Grid ID, X, and Y coordinates are required' },
        { status: 400 }
      );
    }

    const gridpointData = await WeatherService.getGridpointForecast(gridId, gridX, gridY);

    return NextResponse.json(gridpointData, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60'
      }
    });
  } catch (error) {
    console.error('Error fetching gridpoint data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch gridpoint data' },
      { status: 500 }
    );
  }
} 