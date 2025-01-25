import { getForecast as getOpenWeatherForecast } from './openweather';

export class WeatherError extends Error {
  constructor(
    message: string,
    public readonly code: 'LOCATION_OUTSIDE_US' | 'FETCH_ERROR' | 'INVALID_DATA',
    public readonly details?: any
  ) {
    super(message);
    this.name = 'WeatherError';
  }
}

interface WeatherPoint {
  properties: {
    forecast: string;
    forecastHourly: string;
    gridId: string;
    gridX: number;
    gridY: number;
  };
}

interface WeatherForecast {
  properties: {
    periods: Array<{
      number: number;
      name: string;
      startTime: string;
      endTime: string;
      isDaytime: boolean;
      temperature: number;
      temperatureUnit: string;
      temperatureTrend: string | null;
      windSpeed: string;
      windDirection: string;
      icon: string;
      shortForecast: string;
      detailedForecast: string;
    }>;
  };
}

interface GridpointForecast {
  properties: {
    temperature: {
      values: Array<{
        validTime: string;
        value: number;
      }>;
    };
    windSpeed: {
      values: Array<{
        validTime: string;
        value: number;
      }>;
    };
    windDirection: {
      values: Array<{
        validTime: string;
        value: number;
      }>;
    };
    skyCover: {
      values: Array<{
        validTime: string;
        value: number;
      }>;
    };
    probabilityOfPrecipitation: {
      values: Array<{
        validTime: string;
        value: number;
      }>;
    };
  };
}

export class WeatherService {
  private static headers = {
    'User-Agent': '(weather-shield.com, contact@weather-shield.com)',
    'Accept': 'application/geo+json',
    'Content-Type': 'application/json'
  };

  private static fetchOptions: RequestInit = {
    headers: this.headers,
    next: { revalidate: 300 } // Cache for 5 minutes
  };

  private static async fetchWithTimeout(url: string): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    try {
      const response = await fetch(url, {
        ...this.fetchOptions,
        signal: controller.signal
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      return response;
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Request timed out');
        }
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Get the weather point data for a given latitude and longitude
   */
  static async getPoint(lat: number, lon: number): Promise<WeatherPoint> {
    try {
      // Validate coordinates
      if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
        throw new WeatherError('Invalid coordinates', 'INVALID_DATA');
      }

      try {
        const response = await this.fetchWithTimeout(
          `https://api.weather.gov/points/${lat.toFixed(4)},${lon.toFixed(4)}`
        );
        
        if (response.status === 404) {
          console.log('Location outside US, using OpenWeather fallback');
          return {
            properties: {
              forecast: 'openweather',
              forecastHourly: 'openweather',
              gridId: 'openweather',
              gridX: -1,
              gridY: -1
            }
          };
        }

        const data = await response.json();

        // Validate response data
        if (!data.properties?.forecast) {
          console.log('Invalid NOAA data, using OpenWeather fallback');
          return {
            properties: {
              forecast: 'openweather',
              forecastHourly: 'openweather',
              gridId: 'openweather',
              gridX: -1,
              gridY: -1
            }
          };
        }

        return data;
      } catch (error) {
        // If NOAA request fails for any reason, use OpenWeather as fallback
        console.log('NOAA request failed, using OpenWeather fallback');
        return {
          properties: {
            forecast: 'openweather',
            forecastHourly: 'openweather',
            gridId: 'openweather',
            gridX: -1,
            gridY: -1
          }
        };
      }
    } catch (error) {
      if (error instanceof WeatherError) {
        throw error;
      }
      console.error('Error in getPoint:', error);
      throw new WeatherError('Failed to fetch weather point', 'FETCH_ERROR', error);
    }
  }

  /**
   * Get the forecast for a specific point
   */
  static async getForecast(forecastUrl: string, lat?: number, lon?: number): Promise<WeatherForecast> {
    try {
      // Check if we should use OpenWeather
      if (forecastUrl === 'openweather' && lat !== undefined && lon !== undefined) {
        const openWeatherData = await getOpenWeatherForecast(lat, lon);
        
        // Convert OpenWeather format to NOAA format
        return {
          properties: {
            periods: openWeatherData.map((day, index) => ({
              number: index + 1,
              name: new Date(day.date).toLocaleDateString('en-US', { weekday: 'long' }),
              startTime: day.date,
              endTime: day.date,
              isDaytime: true,
              temperature: day.temp.max,
              temperatureUnit: "F",
              temperatureTrend: null,
              windSpeed: "10 mph", // Default value as OpenWeather doesn't provide this in the same format
              windDirection: "N", // Default value as OpenWeather doesn't provide this in the same format
              icon: `https://openweathermap.org/img/wn/${day.weather.icon}@2x.png`,
              shortForecast: day.weather.main,
              detailedForecast: `${day.weather.main} with a high of ${day.temp.max}°F and a low of ${day.temp.min}°F`
            }))
          }
        };
      }

      // Original NOAA forecast logic
      if (!forecastUrl.startsWith('https://api.weather.gov/')) {
        throw new Error('Invalid forecast URL');
      }

      const response = await this.fetchWithTimeout(forecastUrl);
      const data = await response.json();

      if (!data.properties?.periods?.length) {
        throw new Error('Invalid forecast data received');
      }

      return data;
    } catch (error) {
      console.error('Error fetching forecast:', error);
      throw new Error('Failed to fetch forecast');
    }
  }

  /**
   * Get the gridpoint forecast data (raw numerical data)
   */
  static async getGridpointForecast(gridId: string, gridX: number, gridY: number): Promise<GridpointForecast> {
    try {
      // Validate inputs
      if (!gridId || typeof gridX !== 'number' || typeof gridY !== 'number') {
        throw new Error('Invalid grid parameters');
      }

      const response = await this.fetchWithTimeout(
        `https://api.weather.gov/gridpoints/${gridId}/${gridX},${gridY}`
      );
      
      const data = await response.json();

      // Validate response data
      if (!data.properties?.temperature?.values) {
        throw new Error('Invalid gridpoint data received');
      }

      return data;
    } catch (error) {
      console.error('Error fetching gridpoint forecast:', error);
      throw new Error('Failed to fetch gridpoint forecast');
    }
  }

  /**
   * Get complete weather data for a location
   */
  static async getWeatherData(lat: number, lon: number) {
    try {
      // First, get the point data
      const pointData = await this.getPoint(lat, lon);
      
      // Then get the forecast
      const forecast = await this.getForecast(pointData.properties.forecast, lat, lon);

      // Return simplified data structure
      return {
        forecast: forecast.properties.periods,
        location: {
          gridId: pointData.properties.gridId,
          gridX: pointData.properties.gridX,
          gridY: pointData.properties.gridY
        }
      };
    } catch (error) {
      console.error('Error fetching complete weather data:', error);
      throw error;
    }
  }
} 