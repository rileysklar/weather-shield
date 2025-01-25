'use server';

import { WeatherService } from "@/utils/services/weather";

export async function getWeatherData(lat: number, lon: number) {
  try {
    return await WeatherService.getWeatherData(lat, lon);
  } catch (error) {
    console.error('Error in getWeatherData action:', error);
    throw error;
  }
}

export async function getPointForecast(lat: number, lon: number) {
  try {
    const point = await WeatherService.getPoint(lat, lon);
    const forecast = await WeatherService.getForecast(point.properties.forecast);
    return forecast.properties.periods;
  } catch (error) {
    console.error('Error in getPointForecast action:', error);
    throw error;
  }
} 