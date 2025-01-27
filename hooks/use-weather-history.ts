import useSWR from 'swr';
import { DashboardService } from '@/utils/services/dashboard';
import { WeatherData } from '@/types/weather';

const dashboardService = new DashboardService();

async function fetchWeatherHistory(siteId: string, days: number = 7): Promise<WeatherData[]> {
  try {
    return await dashboardService.getSiteWeatherHistory(siteId, days);
  } catch (error) {
    console.error('Error fetching weather history:', error);
    throw error;
  }
}

export function useWeatherHistory(siteId: string | null, days: number = 7) {
  const { data, error, isLoading } = useSWR(
    siteId ? ['weather-history', siteId, days] : null, // Only fetch if siteId is provided
    () => siteId ? fetchWeatherHistory(siteId, days) : null,
    {
      refreshInterval: 5 * 60 * 1000, // Refresh every 5 minutes
      revalidateOnFocus: false,
      dedupingInterval: 30 * 1000,
      fallbackData: [],
      keepPreviousData: true, // Keep showing previous data while fetching
      revalidateIfStale: true, // Revalidate stale data in the background
      revalidateOnReconnect: true, // Revalidate when reconnecting
      suspense: false, // Don't use suspense
      revalidateOnMount: true, // Always revalidate on mount
    }
  );

  return {
    history: data || [],
    isLoading,
    isError: error,
  };
} 