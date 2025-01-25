import { NextResponse } from 'next/server';
import { WeatherUpdateService } from '@/utils/services/weather-update';

export async function POST(request: Request) {
  try {
    const weatherUpdateService = new WeatherUpdateService();
    await weatherUpdateService.updateAllSites();
    
    return NextResponse.json({ message: 'Weather data updated successfully' });
  } catch (error) {
    console.error('Error updating weather data:', error);
    return NextResponse.json(
      { error: 'Failed to update weather data' },
      { status: 500 }
    );
  }
}

// This route will be called by a cron job every hour
export async function GET(request: Request) {
  try {
    const weatherUpdateService = new WeatherUpdateService();
    await weatherUpdateService.updateAllSites();
    
    return NextResponse.json({ message: 'Weather data updated successfully' });
  } catch (error) {
    console.error('Error updating weather data:', error);
    return NextResponse.json(
      { error: 'Failed to update weather data' },
      { status: 500 }
    );
  }
} 