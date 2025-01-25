'use client';

import { useState } from 'react';
import { SiteWeatherCard } from './site-weather-card';
import { WeatherHistory } from './weather-history';
import { DashboardSiteData } from '@/utils/services/dashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle } from 'lucide-react';
import { useSiteFilter } from '@/contexts/site-filter-context';

interface SitesOverviewProps {
  sites: DashboardSiteData[];
  onSiteSelect?: (siteId: string) => void;
}

export function SitesOverview({ sites, onSiteSelect }: SitesOverviewProps) {
  const [selectedSite, setSelectedSite] = useState<DashboardSiteData | null>(null);
  const { filteredSites = [] } = useSiteFilter();

  // Group filtered sites by risk level
  const sitesByRisk = filteredSites.reduce((groups, site) => {
    const severity = site.alerts?.highestSeverity || 'normal';
    if (!groups[severity]) groups[severity] = [];
    groups[severity].push(site);
    return groups;
  }, {} as Record<string, DashboardSiteData[]>);

  return (
    <div className="space-y-8">
      {/* Sites by Risk Level */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Sites ({filteredSites.length})</TabsTrigger>
          {Object.entries(sitesByRisk).map(([risk, sites]) => (
            <TabsTrigger key={risk} value={risk}>
              {risk.charAt(0).toUpperCase() + risk.slice(1)} ({sites.length})
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredSites.map(site => (
              <SiteWeatherCard
                key={site.id}
                site={site}
                onClick={() => {
                  setSelectedSite(site);
                  onSiteSelect?.(site.id);
                }}
              />
            ))}
          </div>
        </TabsContent>

        {Object.entries(sitesByRisk).map(([risk, sites]) => (
          <TabsContent key={risk} value={risk} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {sites.map(site => (
                <SiteWeatherCard
                  key={site.id}
                  site={site}
                  onClick={() => {
                    setSelectedSite(site);
                    onSiteSelect?.(site.id);
                  }}
                />
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Selected Site Details */}
      {selectedSite && (
        <Card>
          <CardHeader>
            <CardTitle>{selectedSite.name} Details</CardTitle>
            <CardDescription>
              {selectedSite.description || `Weather and risk information for ${selectedSite.name}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {selectedSite.currentWeather && (
                <WeatherHistory 
                  data={[selectedSite.currentWeather]}
                  title="Current Conditions"
                />
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 