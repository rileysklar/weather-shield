'use client';

import { useState, useEffect } from 'react';
import { WeatherData } from '@/types/weather';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Map, RefreshCw, Home, Shield } from 'lucide-react';
import { RiskAssessment } from '@/components/dashboard/risk-assessment';
import { SiteFilterProvider } from '@/contexts/site-filter-context';
import { SiteFilters } from '@/components/dashboard/site-filters';
import { Card } from '@/components/ui/card';
import { format } from 'date-fns';
import { SitesOverview } from '@/components/dashboard/sites-overview';
import { WeatherHistory } from '@/components/dashboard/weather-history';
import { useDashboardData } from '@/hooks/use-dashboard-data';
import { useWeatherHistory } from '@/hooks/use-weather-history';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default function ProtectedPage() {
  const router = useRouter();
  const [selectedSiteId, setSelectedSiteId] = useState<string | null>(null);
  const { sites, isLoading: loadingSites, isError, mutate: refreshDashboard } = useDashboardData();
  const { history, isLoading: loadingHistory } = useWeatherHistory(selectedSiteId);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (isError) {
      router.push('/sign-in');
    }
  }, [isError, router]);

  useEffect(() => {
    refreshDashboard();
  }, [refreshDashboard]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        document.getElementById('site-search')?.focus();
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshDashboard();
    } catch (error) {
      console.error('Error refreshing dashboard:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  if (loadingSites) {
    return (
      <div className="container mx-auto p-6">
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="p-4">
                <div className="space-y-3">
                  <Skeleton className="h-6 w-3/4" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
            Refresh
          </Button>
          <Link href="/protected/map">
            <Button variant="outline" size="sm" className="gap-2 bg-blue-500 text-white">
              <Map className="h-4 w-4" />
              Map View
            </Button>
          </Link>
        </div>
      </div>

      <SiteFilterProvider>
        <div className="lg:grid lg:grid-cols-[300px,1fr] lg:gap-8">
          {/* Filters - Sticky on mobile */}
          <div className="relative mb-6 lg:mb-0">
            <div className="lg:h-[calc(100vh-12rem)] sticky top-[5rem] overflow-y-auto">
              <SiteFilters />
              <div className="space-y-2 mt-4">
              <Button variant="outline" asChild className="w-full justify-start">
                <Link href="/home" className="flex items-center space-x-2 bg-background">
                  <Home className="h-4 w-4" />
                  <span>Back to Home</span>
                </Link>
              </Button>
              <Button variant="outline" asChild className="w-full justify-start">
                <Link href="/protected" className="flex items-center space-x-2 bg-background">
                  <Shield className="h-4 w-4" />
                  <span>Dashboard</span>
                </Link>
              </Button>
              <Button variant="outline" asChild className="w-full justify-start">
                <Link href="/protected/map" className="flex items-center space-x-2 bg-background">
                  <Map className="h-4 w-4" />
                  <span>Map</span>
                </Link>
              </Button>
            </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="min-w-0 space-y-6">
            {/* Sites Overview */}
            <SitesOverview
              sites={sites || []}
              onSiteSelect={(siteId) => setSelectedSiteId(siteId)}
            />

            {/* Weather History */}
            {selectedSiteId && (
              loadingHistory ? (
                <Card className="p-6">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-7 w-64" />
                      <Skeleton className="h-9 w-24" />
                    </div>
                    <Skeleton className="h-[300px] w-full" />
                  </div>
                </Card>
              ) : (
                <WeatherHistory
                  data={history}
                  title={`Weather History - ${sites?.find(s => s.id === selectedSiteId)?.name}`}
                />
              )
            )}

            {/* Risk Assessment */}
            {!loadingSites && sites && <RiskAssessment sites={sites} />}
          </div>
        </div>
      </SiteFilterProvider>
    </div>
  );
} 