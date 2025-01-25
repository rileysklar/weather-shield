export interface OpenWeatherResponse {
  cod: string;
  message: number;
  cnt: number;
  list: {
    dt: number;
    main: {
      temp: number;
      feels_like: number;
      temp_min: number;
      temp_max: number;
      pressure: number;
      sea_level: number;
      grnd_level: number;
      humidity: number;
      temp_kf: number;
    };
    weather: {
      id: number;
      main: string;
      description: string;
      icon: string;
    }[];
    clouds: {
      all: number;
    };
    wind: {
      speed: number;
      deg: number;
      gust: number;
    };
    visibility: number;
    pop: number;
    sys: {
      pod: string;
    };
    dt_txt: string;
  }[];
  city: {
    id: number;
    name: string;
    coord: {
      lat: number;
      lon: number;
    };
    country: string;
    population: number;
    timezone: number;
    sunrise: number;
    sunset: number;
  };
}

export interface ProcessedForecast {
  date: string;
  temp: {
    max: number;
    min: number;
  };
  weather: {
    main: string;
    icon: string;
  };
}

export async function getForecast(lat: number, lon: number): Promise<ProcessedForecast[]> {
  try {
    const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
    if (!apiKey) {
      console.error('OpenWeather API key not found in environment variables');
      throw new Error("OpenWeather API key not found");
    }

    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=imperial`;
    console.log('Fetching weather data from:', url.replace(apiKey, '[API_KEY]'));

    const response = await fetch(url);
    console.log('API Response status:', response.status);

    if (!response.ok) {
      console.error('API Error:', response.status, response.statusText);
      throw new Error("Failed to fetch weather data");
    }

    const data: OpenWeatherResponse = await response.json();
    console.log('API Response data:', {
      city: data.city.name,
      country: data.city.country,
      forecasts: data.list.length,
      firstDay: new Date(data.list[0].dt * 1000).toLocaleDateString(),
      lastDay: new Date(data.list[data.list.length - 1].dt * 1000).toLocaleDateString()
    });

    const processed = processForecastData(data);
    console.log('Processed forecast data:', processed);
    
    return processed;

  } catch (error) {
    console.error("Error fetching weather data:", error);
    throw error; // Re-throw the error to be handled by the caller
  }
}

function processForecastData(data: OpenWeatherResponse): ProcessedForecast[] {
  const dailyForecasts = new Map<string, ProcessedForecast>();

  // Process each forecast entry
  data.list.forEach(forecast => {
    const date = new Date(forecast.dt * 1000).toISOString().split('T')[0];
    
    if (!dailyForecasts.has(date)) {
      dailyForecasts.set(date, {
        date,
        temp: {
          max: forecast.main.temp_max,
          min: forecast.main.temp_min
        },
        weather: {
          main: forecast.weather[0].main,
          icon: forecast.weather[0].icon
        }
      });
    } else {
      // Update max/min temperatures if needed
      const existing = dailyForecasts.get(date)!;
      existing.temp.max = Math.max(existing.temp.max, forecast.main.temp_max);
      existing.temp.min = Math.min(existing.temp.min, forecast.main.temp_min);
    }
  });

  // Convert to array and take first 5 days
  return Array.from(dailyForecasts.values()).slice(0, 5);
} 
