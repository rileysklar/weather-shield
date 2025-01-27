import useSWR from 'swr';
import { DashboardService, DashboardSiteData } from '@/utils/services/dashboard';

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
  const { data, error, isLoading, mutate } = useSWR(
    'dashboard-data',
    fetchDashboardData,
    {
      refreshInterval: 5 * 60 * 1000, // Refresh every 5 minutes
      revalidateOnFocus: false, // Don't revalidate on tab focus
      dedupingInterval: 30 * 1000, // Dedupe requests within 30 seconds
      fallbackData: [], // Return empty array while loading
      keepPreviousData: true, // Keep showing previous data while fetching
      revalidateIfStale: true, // Revalidate stale data in the background
      revalidateOnReconnect: true, // Revalidate when reconnecting
      suspense: false, // Don't use suspense
      revalidateOnMount: true, // Always revalidate on mount
    }
  );

  return {
    sites: data || [],
    isLoading,
    isError: error,
    mutate, // Expose mutate function for manual revalidation
  };
} 