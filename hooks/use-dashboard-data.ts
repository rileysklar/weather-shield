import { DashboardService, DashboardSiteData } from '@/utils/services/dashboard';
import useSWRImmutable from 'swr/immutable';

const dashboardService = new DashboardService();

async function fetchDashboardData(): Promise<DashboardSiteData[]> {
  try {
    return await dashboardService.getDashboardData();
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    throw error;
  }
}

export function useDashboardData() {
  const { data, error, isLoading, mutate } = useSWRImmutable<DashboardSiteData[]>(
    'dashboard-data',
    fetchDashboardData,
    {
      refreshInterval: 5 * 60 * 1000, // Refresh every 5 minutes
      dedupingInterval: 30 * 1000, // Dedupe requests within 30 seconds
      fallbackData: [], // Return empty array while loading
      keepPreviousData: true, // Keep showing previous data while fetching
    }
  );

  return {
    sites: data || [],
    isLoading,
    isError: error,
    mutate, // Expose mutate function for manual revalidation
  };
} 