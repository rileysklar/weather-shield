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
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  };

  private static fetchOptions: RequestInit = {
    headers: this.headers,
    next: { revalidate: 300 } // Cache for 5 minutes
  };

  static async fetchWithTimeout(url: string, options: RequestInit & { params?: Record<string, any> } = {}, timeout = 10000) {
    try {
      const { params, ...fetchOptions } = options;
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
      let fullUrl = `${baseUrl}${url}`;

      // Add query parameters if provided
      if (params) {
        const searchParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined) {
            searchParams.append(key, value.toString());
          }
        });
        fullUrl += `?${searchParams.toString()}`;
      }

      // Merge default headers with provided options
      const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options.headers,
      };

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(fullUrl, {
        ...fetchOptions,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error: ${response.status} - ${errorText}`);
      }

      return response;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      throw error;
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
        const response = await this.fetchWithTimeout('/api/weather', {
          method: 'POST',
          body: JSON.stringify({ lat, lon })
        });
        
        const data = await response.json();

        // If the response indicates we're using OpenWeather
        if (data.location?.gridId === 'openweather') {
          return this.getOpenWeatherPoint();
        }

        // Convert the response to WeatherPoint format
        return {
          properties: {
            forecast: data.location?.gridId ? 
              `https://api.weather.gov/gridpoints/${data.location.gridId}/${data.location.gridX},${data.location.gridY}/forecast` : 
              'openweather',
            forecastHourly: data.location?.gridId ?
              `https://api.weather.gov/gridpoints/${data.location.gridId}/${data.location.gridX},${data.location.gridY}/forecast/hourly` :
              'openweather',
            gridId: data.location?.gridId || 'openweather',
            gridX: data.location?.gridX || -1,
            gridY: data.location?.gridY || -1
          }
        };
      } catch (error) {
        // If server request fails, use OpenWeather as fallback
        console.log('Server request failed, using OpenWeather fallback');
        await this.validateOpenWeatherConfig();
        return this.getOpenWeatherPoint();
      }
    } catch (error) {
      if (error instanceof WeatherError) {
        throw error;
      }
      console.error('Error in getPoint:', error);
      throw new WeatherError('Failed to fetch weather point', 'FETCH_ERROR', error);
    }
  }

  private static async validateOpenWeatherConfig() {
    const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
    if (!apiKey) {
      throw new WeatherError(
        'OpenWeather API key not configured',
        'FETCH_ERROR',
        'OpenWeather API key is required for locations outside US or when Weather.gov is unavailable'
      );
    }
  }

  private static getOpenWeatherPoint(): WeatherPoint {
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

      // Use server endpoint for weather.gov data
      const response = await this.fetchWithTimeout('/api/weather', {
        method: 'GET',
        headers: {
          ...this.headers,
          'Content-Type': 'application/json',
        },
        next: { revalidate: 300 }, // Cache for 5 minutes
        ...(lat !== undefined && lon !== undefined ? {
          params: new URLSearchParams({ lat: lat.toString(), lng: lon.toString() })
        } : {})
      });

      const data = await response.json();

      if (!data.forecast) {
        throw new Error('Invalid forecast data received');
      }

      return {
        properties: {
          periods: data.forecast
        }
      };
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

      const response = await this.fetchWithTimeout('/api/weather/gridpoint', {
        method: 'POST',
        body: JSON.stringify({ gridId, gridX, gridY })
      });
      
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

      if (!forecast?.properties?.periods) {
        console.error('Invalid forecast data:', forecast);
        throw new Error('Invalid forecast data received');
      }

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
      // If using OpenWeather fallback, ensure we have the API key
      if (error instanceof Error && error.message.includes('OpenWeather')) {
        const apiKey = process.env.OPENWEATHER_API_KEY;
        if (!apiKey) {
          throw new Error('OpenWeather API key not configured');
        }
      }
      throw error;
    }
  }
} 