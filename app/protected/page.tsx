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
  const [loading, setLoading] = useState(true);
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
      setLoading(true);
      const data = await dashboardService.getDashboardData();
      setSites(data);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError('Failed to load dashboard data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleSiteSelect = async (siteId: string) => {
    try {
      const history = await dashboardService.getSiteWeatherHistory(siteId);
      setSelectedSiteHistory(history);
    } catch (err) {
      console.error('Error loading site history:', err);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-8 space-y-8">
        {/* Header Section */}
        <div className="space-y-4">
          <Skeleton className="h-10 w-[300px]" />
          <Skeleton className="h-5 w-[450px]" />
        </div>
        
        {/* Sites Overview Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-3 p-4 border rounded-lg">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-10 w-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </div>
          ))}
        </div>

        {/* Weather History Section */}
        <div className="space-y-4">
          <Skeleton className="h-8 w-[250px]" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="p-4 border rounded-lg space-y-3">
                <Skeleton className="h-5 w-2/3" />
                <Skeleton className="h-24 w-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-4/5" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

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
          <Card className="h-fit sticky top-8 p-4">
            <SiteFilters />
          </Card>
          
          <div className="space-y-8">
            <SitesOverview 
              sites={sites} 
              onSiteSelect={handleSiteSelect} 
            />

            {selectedSiteHistory.length > 0 && (
              <WeatherHistory 
                data={selectedSiteHistory}
                title={`${sites.find(s => s.id === selectedSiteHistory[0]?.project_site_id)?.name || 'Selected Site'} Weather - Last 7 Days`}
              />
            )}

            <RiskAssessment sites={sites} />
          </div>
        </div>
      </div>
    </SiteFilterProvider>
  );
}
