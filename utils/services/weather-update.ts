import { ProjectSiteService, ProjectSite } from './project-site';
import { WeatherService } from './weather';
import { NOAAService, ProcessedAlert } from './noaa';
import { WeatherData } from '@/types/weather';

export class WeatherUpdateService {
  private projectSiteService: ProjectSiteService;

  constructor() {
    this.projectSiteService = new ProjectSiteService();
  }

  async updateWeatherForSite(site: ProjectSite) {
    try {
      if (!site.coordinates || !Array.isArray(site.coordinates) || site.coordinates.length === 0) {
        throw new Error('Invalid site coordinates');
      }

      // Calculate center point of the site
      const coordinates = site.coordinates as number[][];
      const centerLat = coordinates.reduce((sum: number, coord: number[]) => sum + coord[1], 0) / coordinates.length;
      const centerLng = coordinates.reduce((sum: number, coord: number[]) => sum + coord[0], 0) / coordinates.length;

      try {
        // Get weather data from Weather.gov/OpenWeather
        const weatherData = await WeatherService.getWeatherData(centerLat, centerLng);
        
        if (!weatherData || !weatherData.forecast || !Array.isArray(weatherData.forecast)) {
          console.error('Invalid weather data received:', weatherData);
          throw new Error('Invalid weather data format');
        }

        // Get alerts for the site
        const alerts = await NOAAService.getAlertsForSite({ coordinates });

        const firstPeriod = weatherData.forecast[0];
        
        // Prepare weather data for database with null checks
        const weatherDataEntry: Omit<WeatherData, 'id' | 'timestamp'> = {
          project_site_id: site.id,
          temperature: firstPeriod?.temperature ?? null,
          feels_like: firstPeriod?.temperature ?? null, // Using temperature as feels_like since Weather.gov doesn't provide this
          humidity: null, // Weather.gov doesn't provide this
          pressure: null, // Weather.gov doesn't provide this
          wind_speed: firstPeriod?.windSpeed ? parseFloat(firstPeriod.windSpeed.split(' ')[0]) : null,
          wind_direction: null, // Weather.gov provides this as string, we'd need to convert
          clouds_percentage: null, // Weather.gov doesn't provide this
          visibility: null, // Weather.gov doesn't provide this
          weather_condition: firstPeriod?.shortForecast ?? null,
          weather_description: firstPeriod?.detailedForecast ?? null,
          forecast_periods: weatherData.forecast,
          alerts: alerts,
          has_active_alerts: alerts.length > 0,
          highest_alert_severity: this.getHighestSeverity(alerts),
          data_source: weatherData.location?.gridId === 'openweather' ? 'openweather' : 'weathergov',
          raw_response: weatherData
        };

        // Store in database
        const result = await this.projectSiteService.createWeatherData(weatherDataEntry);
        if (!result) {
          throw new Error('Failed to save weather data to database');
        }
        return result;

      } catch (error: any) {
        if (error.message.includes('OpenWeather API key')) {
          console.error('OpenWeather API key error:', error);
          throw new Error('Weather service configuration error: OpenWeather API key not found');
        } else if (error.message.includes('Invalid forecast URL')) {
          console.error('Weather.gov API error:', error);
          throw new Error('Weather service error: Unable to fetch forecast from Weather.gov');
        } else if (error.message.includes('Failed to save weather data')) {
          console.error('Database error:', error);
          throw new Error('Database error: Failed to save weather data');
        }
        throw error;
      }
    } catch (error) {
      console.error(`Error updating weather for site ${site.id}:`, error);
      throw error;
    }
  }

  private getHighestSeverity(alerts: ProcessedAlert[]): 'minor' | 'moderate' | 'severe' | 'extreme' | null {
    if (!alerts || alerts.length === 0) return null;

    const severityOrder = {
      'Minor severity - Use caution': 'minor',
      'Moderate severity - Be aware': 'moderate',
      'Severe conditions - Take precautions': 'severe',
      'Extreme conditions - Take immediate action': 'extreme'
    } as const;

    let highestSeverity: 'minor' | 'moderate' | 'severe' | 'extreme' | null = null;

    for (const alert of alerts) {
      const currentSeverity = severityOrder[alert.severity as keyof typeof severityOrder];
      if (currentSeverity) {
        if (!highestSeverity || 
            Object.values(severityOrder).indexOf(currentSeverity) > 
            Object.values(severityOrder).indexOf(highestSeverity)) {
          highestSeverity = currentSeverity;
        }
      }
    }

    return highestSeverity;
  }

  async updateAllSites() {
    try {
      const sites = await this.projectSiteService.getProjectSites();
      for (const site of sites) {
        try {
          await this.updateWeatherForSite(site);
        } catch (error) {
          console.error(`Failed to update weather for site ${site.id}:`, error);
          // Continue with other sites even if one fails
          continue;
        }
      }
    } catch (error) {
      console.error('Error updating all sites:', error);
      throw error;
    }
  }
} 
