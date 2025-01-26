'use client';

import { useEffect, useState } from 'react';
import { DashboardService, DashboardSiteData } from '@/utils/services/dashboard';
import { SitesOverview } from '@/components/dashboard/sites-overview';
import { WeatherHistory } from '@/components/dashboard/weather-history';
import { WeatherData } from '@/types/weather';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Map } from 'lucide-react';
import { RiskAssessment } from '@/components/dashboard/risk-assessment';
import { SiteFilterProvider } from '@/contexts/site-filter-context';
import { SiteFilters } from '@/components/dashboard/site-filters';
import { Card } from '@/components/ui/card';

export default function ProtectedPage() {
  const [sites, setSites] = useState<DashboardSiteData[]>([]);
  const [selectedSiteHistory, setSelectedSiteHistory] = useState<WeatherData[]>([]);
  const [loadingStates, setLoadingStates] = useState({
    filters: true,
    overview: true,
    history: false,
    risk: true
  });
  const [error, setError] = useState<string | null>(null);

  const dashboardService = new DashboardService();

  useEffect(() => {
    loadDashboardData();
    // Set up periodic refresh every 5 minutes
    const interval = setInterval(loadDashboardData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      const data = await dashboardService.getDashboardData();
      setSites(data);
      
      // Progressive loading of data-dependent components
      setTimeout(() => setLoadingStates(prev => ({ ...prev, filters: false })), 300);
      setTimeout(() => setLoadingStates(prev => ({ ...prev, overview: false })), 600);
      setTimeout(() => setLoadingStates(prev => ({ ...prev, risk: false })), 900);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError('Failed to load dashboard data. Please try again later.');
    }
  };

  const handleSiteSelect = async (siteId: string) => {
    try {
      setLoadingStates(prev => ({ ...prev, history: true }));
      const history = await dashboardService.getSiteWeatherHistory(siteId);
      setSelectedSiteHistory(history);
    } catch (err) {
      console.error('Error loading site history:', err);
    } finally {
      setLoadingStates(prev => ({ ...prev, history: false }));
    }
  };

  if (error) {
    return (
      <div className="container mx-auto p-8">
        <div className="bg-destructive/10 text-destructive p-4 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  return (
    <SiteFilterProvider sites={sites}>
      <div className="container mx-auto p-8 space-y-8">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Project Sites Dashboard</h1>
            <p className="text-muted-foreground">
              Monitor weather conditions and alerts across all your project sites
            </p>
          </div>
          <Button asChild size="lg" className="gap-2">
            <Link href="/map">
              <Map className="h-5 w-5" />
              Project Site Map
            </Link>
          </Button>
        </div>

        <div className="grid gap-8 lg:grid-cols-[300px,1fr]">
          <Card className="h-fit sticky backdrop-blur-sm top-8 p-4">
            {loadingStates.filters ? (
              <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <div className="flex gap-2">
                    {[...Array(4)].map((_, i) => (
                      <Skeleton key={i} className="h-6 w-16" />
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <div className="flex gap-2">
                    {[...Array(3)].map((_, i) => (
                      <Skeleton key={i} className="h-6 w-20" />
                    ))}
                  </div>
                </div>
                <Skeleton className="h-[200px] w-full" />
              </div>
            ) : (
              <SiteFilters />
            )}
          </Card>
          
          <div className="space-y-8">
            {loadingStates.overview ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="p-4 border rounded-lg space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                      <Skeleton className="h-6 w-16" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                      <div className="flex justify-between">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <SitesOverview 
                sites={sites} 
                onSiteSelect={handleSiteSelect} 
              />
            )}

            {selectedSiteHistory.length > 0 && (
              loadingStates.history ? (
                <div className="space-y-4">
                  <Skeleton className="h-8 w-[250px]" />
                  <div className="h-[300px] w-full">
                    <Skeleton className="h-full w-full" />
                  </div>
                </div>
              ) : (
                <WeatherHistory 
                  data={selectedSiteHistory}
                  title={`${sites.find(s => s.id === selectedSiteHistory[0]?.project_site_id)?.name || 'Selected Site'} Weather - Last 7 Days`}
                />
              )
            )}

            {loadingStates.risk ? (
              <Card>
                <div className="p-6 space-y-4">
                  <div className="flex items-center space-x-2">
                    <Skeleton className="h-5 w-5" />
                    <Skeleton className="h-6 w-32" />
                  </div>
                  <Skeleton className="h-4 w-full" />
                  <div className="space-y-4">
                    {[...Array(2)].map((_, i) => (
                      <div key={i} className="space-y-3">
                        <div className="flex justify-between">
                          <Skeleton className="h-5 w-48" />
                          <Skeleton className="h-5 w-24" />
                        </div>
                        <Skeleton className="h-[200px] w-full" />
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            ) : (
              <RiskAssessment sites={sites} />
            )}
          </div>
        </div>
      </div>
    </SiteFilterProvider>
  );
}
