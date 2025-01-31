import { ProcessedAlert } from "@/utils/services/noaa";

export interface WeatherPeriod {
  number: number;
  name: string;
  temperature: number;
  temperatureUnit: string;
  shortForecast: string;
}

export interface WeatherData {
  id: string;
  project_site_id: string;
  timestamp: string | null;
  temperature: number | null;
  feels_like: number | null;
  humidity: number | null;
  pressure: number | null;
  wind_speed: number | null;
  wind_direction: number | null;
  clouds_percentage: number | null;
  visibility: number | null;
  weather_condition: string | null;
  weather_description: string | null;
  forecast_periods: any | null;
  alerts: any | null;
  has_active_alerts: boolean | null;
  highest_alert_severity: 'minor' | 'moderate' | 'severe' | 'extreme' | null;
  data_source: string;
  raw_response: any;
} 