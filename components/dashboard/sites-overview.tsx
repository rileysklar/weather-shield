'use client';

import { useState } from 'react';
import { SiteWeatherCard } from './site-weather-card';
import { WeatherHistory } from './weather-history';
import { DashboardSiteData } from '@/utils/services/dashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle } from 'lucide-react';
import { useSiteFilter } from '@/contexts/site-filter-context';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const PROJECT_TYPES = [
  { value: 'solar_array', label: 'Solar Array' },
  { value: 'wind_farm', label: 'Wind Farm' },
  { value: 'hydroelectric', label: 'Hydroelectric' },
  { value: 'coal', label: 'Coal' },
  { value: 'natural_gas', label: 'Natural Gas' },
  { value: 'nuclear', label: 'Nuclear' },
  { value: 'geothermal', label: 'Geothermal' },
  { value: 'biomass', label: 'Biomass' },
  { value: 'other', label: 'Other' }
];

const SEVERITY_LEVELS = [
  { value: 'normal', label: 'Normal' },
  { value: 'minor', label: 'Minor' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'severe', label: 'Severe' },
  { value: 'extreme', label: 'Extreme' }
];

const formatSiteType = (type: string | undefined | null) => {
  if (!type) return 'Unknown';
  const projectType = PROJECT_TYPES.find(t => t.value === type);
  return projectType?.label || type.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
};

interface SitesOverviewProps {
  sites: DashboardSiteData[];
  onSiteSelect?: (siteId: string) => void;
}

export function SitesOverview({ sites, onSiteSelect }: SitesOverviewProps) {
  const [selectedSite, setSelectedSite] = useState<DashboardSiteData | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [sitesPerPage, setSitesPerPage] = useState(9);
  const { filteredSites } = useSiteFilter();

  // Calculate total alerts and highest severity from filtered sites
  const totalAlerts = filteredSites.reduce((sum, site) => sum + site.alerts.count, 0);
  const highestSeverity = filteredSites.reduce((highest, site) => {
    const severityOrder = { extreme: 4, severe: 3, moderate: 2, minor: 1 };
    const currentSeverity = site.alerts.highestSeverity;
    const highestValue = severityOrder[highest as keyof typeof severityOrder] || 0;
    const currentValue = severityOrder[currentSeverity as keyof typeof severityOrder] || 0;
    return currentValue > highestValue ? currentSeverity : highest;
  }, null as string | null);

  // Group filtered sites by risk level
  const sitesByRisk = filteredSites.reduce((groups, site) => {
    // Default to normal if no alerts or no highest severity
    let severity = 'normal';
    
    // If site has alerts, use the highest severity
    if (site.alerts.count > 0 && site.alerts.highestSeverity) {
      severity = site.alerts.highestSeverity;
    }
    
    if (!groups[severity]) {
      groups[severity] = [];
    }
    groups[severity].push(site);
    return groups;
  }, {} as Record<string, DashboardSiteData[]>);

  // Pagination logic
  const totalPages = Math.ceil(filteredSites.length / sitesPerPage);
  const startIndex = (currentPage - 1) * sitesPerPage;
  const endIndex = startIndex + sitesPerPage;
  const currentSites = filteredSites.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSitesPerPageChange = (value: string) => {
    setSitesPerPage(Number(value));
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  const handleSiteClick = (site: DashboardSiteData) => {
    setSelectedSite(site);
    onSiteSelect?.(site.id);
    
    // Account for the fixed navigation bar height
    const navHeight = 64; // Standard height of the nav bar
    const element = document.getElementById('selected-site-details');
    if (element) {
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - navHeight;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="space-y-8">
      <Tabs defaultValue="all" className="space-y-4">
        <div className="overflow-auto pb-2 -mb-2">
          <TabsList className="inline-flex sm:flex-wrap justify-start">
            <TabsTrigger value="all" className="text-xs sm:text-sm whitespace-nowrap">
              All Sites ({filteredSites.length})
            </TabsTrigger>
            {SEVERITY_LEVELS.map(({ value, label }) => (
              <TabsTrigger 
                key={value} 
                value={value}
                className="text-xs sm:text-sm whitespace-nowrap"
              >
                {label} ({sitesByRisk[value]?.length || 0})
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <TabsContent value="all" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {currentSites.map(site => (
              <SiteWeatherCard
                key={site.id}
                site={site}
                isSelected={selectedSite?.id === site.id}
                onClick={() => handleSiteClick(site)}
              />
            ))}
          </div>
          
          {/* Pagination Controls */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Showing {startIndex + 1}-{Math.min(endIndex, filteredSites.length)} of {filteredSites.length}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePageChange(page)}
                >
                  {page}
                </Button>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </TabsContent>

        {SEVERITY_LEVELS.map(({ value, label }) => {
          const sites = sitesByRisk[value] || [];
          const riskSites = sites.slice(startIndex, endIndex);
          const riskTotalPages = Math.ceil(sites.length / sitesPerPage);
          
          return (
            <TabsContent key={value} value={value} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {riskSites.map(site => (
                  <SiteWeatherCard
                    key={site.id}
                    site={site}
                    isSelected={selectedSite?.id === site.id}
                    onClick={() => handleSiteClick(site)}
                  />
                ))}
              </div>
              
              {/* Pagination Controls for Risk Tabs */}
              {sites.length > 0 && (
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Showing {startIndex + 1}-{Math.min(endIndex, sites.length)} of {sites.length}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    {Array.from({ length: riskTotalPages }, (_, i) => i + 1).map((page) => (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(page)}
                      >
                        {page}
                      </Button>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === riskTotalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>
          );
        })}
      </Tabs>

      {/* Selected Site Details */}
      {selectedSite && (
        <Card id="selected-site-details" className="scroll-mt-24">
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle>{selectedSite.name}</CardTitle>
                <CardDescription>
                  {selectedSite.description || `Weather and risk information for ${selectedSite.name}`}
                </CardDescription>
              </div>
              <div className="text-right">
                <span className="text-sm font-medium text-muted-foreground">Alerts</span>
                <div className="mt-1">
                  {selectedSite.alerts.count > 0 ? (
                    <span className="capitalize text-sm font-medium">
                      {selectedSite.alerts.count} {selectedSite.alerts.highestSeverity}
                    </span>
                  ) : (
                    <span className="text-sm text-muted-foreground">
                      No alerts at this time
                    </span>
                  )}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-6">
                {/* Basic Information */}
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground">Site Information</h3>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between gap-2">
                      <span className="text-muted-foreground">Type:</span>
                      <span>{formatSiteType(selectedSite.type)}</span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span className="text-muted-foreground">Location:</span>
                      <span>
                        {selectedSite.coordinates?.[0]?.[1].toFixed(4)}°N,<br/>
                        {selectedSite.coordinates?.[0]?.[0].toFixed(4)}°W
                      </span>
                    </div>
                  </div>
                </div>

                {/* Current Weather */}
                {selectedSite.currentWeather && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-muted-foreground">Current Weather</h3>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between gap-2">
                        <span className="text-muted-foreground">Temperature:</span>
                        <span>{selectedSite.currentWeather.temperature}°</span>
                      </div>
                      <div className="flex justify-between gap-2">
                        <span className="text-muted-foreground">Wind Speed:</span>
                        <span>{selectedSite.currentWeather.wind_speed} mph</span>
                      </div>
                      <div className="flex justify-between gap-2">
                        <span className="text-muted-foreground">Conditions:</span>
                        <span>{selectedSite.currentWeather.weather_condition}</span>
                      </div>
                      {selectedSite.currentWeather.humidity !== undefined && (
                        <div className="flex justify-between gap-2">
                          <span className="text-muted-foreground">Humidity:</span>
                          <span>{selectedSite.currentWeather.humidity}%</span>
                        </div>
                      )}
                      {selectedSite.currentWeather.pressure !== undefined && (
                        <div className="flex justify-between gap-2">
                          <span className="text-muted-foreground">Pressure:</span>
                          <span>{selectedSite.currentWeather.pressure} hPa</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Site Shape */}
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">Site Shape</h3>
                <div className="bg-muted/50 rounded-md p-4 flex justify-center">
                  <canvas 
                    width={200} 
                    height={200} 
                    className="opacity-90"
                    style={{ 
                      background: 'transparent',
                    }}
                    ref={(canvas) => {
                      if (!canvas) return;
                      const ctx = canvas.getContext('2d');
                      if (!ctx) return;

                      // Clear canvas
                      ctx.clearRect(0, 0, canvas.width, canvas.height);

                      // Find bounds
                      const lngs = selectedSite.coordinates.map(c => c[0]);
                      const lats = selectedSite.coordinates.map(c => c[1]);
                      const minLng = Math.min(...lngs);
                      const maxLng = Math.max(...lngs);
                      const minLat = Math.min(...lats);
                      const maxLat = Math.max(...lats);

                      // Add padding
                      const padding = 20;
                      const width = canvas.width - (padding * 2);
                      const height = canvas.height - (padding * 2);

                      // Scale coordinates to fit canvas
                      const scaledCoords = selectedSite.coordinates.map(([lng, lat]) => [
                        ((lng - minLng) / (maxLng - minLng)) * width + padding,
                        ((lat - minLat) / (maxLat - minLat)) * height + padding
                      ]);

                      // Draw polygon
                      ctx.beginPath();
                      ctx.moveTo(scaledCoords[0][0], scaledCoords[0][1]);
                      scaledCoords.slice(1).forEach(([x, y]) => {
                        ctx.lineTo(x, y);
                      });
                      ctx.closePath();

                      // Style based on severity
                      let fillColor = 'hsl(217 91% 60% / 0.2)'; // Default blue
                      let strokeColor = 'hsl(217 91% 60%)';

                      switch (selectedSite.alerts.highestSeverity) {
                        case 'extreme':
                          fillColor = 'hsl(var(--destructive) / 0.2)';
                          strokeColor = 'hsl(var(--destructive))';
                          break;
                        case 'severe':
                          fillColor = 'hsl(25 95% 53% / 0.2)'; // Orange
                          strokeColor = 'hsl(25 95% 53%)';
                          break;
                        case 'moderate':
                          fillColor = 'hsl(48 96% 53% / 0.2)'; // Yellow
                          strokeColor = 'hsl(48 96% 53%)';
                          break;
                        case 'minor':
                          fillColor = 'hsl(190 95% 39% / 0.2)'; // Cyan
                          strokeColor = 'hsl(190 95% 39%)';
                          break;
                      }
                      
                      ctx.fillStyle = fillColor;
                      ctx.strokeStyle = strokeColor;
                      ctx.lineWidth = 2;
                      
                      // Fill and stroke
                      ctx.fill();
                      ctx.stroke();

                      // Add cardinal directions
                      ctx.font = '10px system-ui';
                      ctx.fillStyle = 'hsl(var(--muted-foreground))';
                      ctx.textAlign = 'center';
                      ctx.textBaseline = 'middle';

                      // North
                      ctx.fillText('N', canvas.width / 2, padding / 2);
                      // South
                      ctx.fillText('S', canvas.width / 2, canvas.height - padding / 2);
                      // East
                      ctx.fillText('E', canvas.width - padding / 2, canvas.height / 2);
                      // West
                      ctx.fillText('W', padding / 2, canvas.height / 2);

                      // Add scale indicator
                      const scaleWidth = width / 4; // 25% of the width
                      const scaleY = canvas.height - padding / 3;
                      
                      // Draw scale line
                      ctx.beginPath();
                      ctx.moveTo(padding, scaleY);
                      ctx.lineTo(padding + scaleWidth, scaleY);
                      ctx.strokeStyle = 'hsl(var(--muted-foreground))';
                      ctx.lineWidth = 1;
                      ctx.stroke();

                      // Add scale ticks
                      ctx.beginPath();
                      ctx.moveTo(padding, scaleY - 3);
                      ctx.lineTo(padding, scaleY + 3);
                      ctx.moveTo(padding + scaleWidth, scaleY - 3);
                      ctx.lineTo(padding + scaleWidth, scaleY + 3);
                      ctx.stroke();

                      // Calculate and display scale distance
                      const distanceInDegrees = maxLng - minLng;
                      const distanceInKm = distanceInDegrees * 111; // Rough conversion from degrees to km at equator
                      const scaleText = `${Math.round(distanceInKm / 4)} km`;
                      ctx.fillText(scaleText, padding + scaleWidth / 2, scaleY - 8);
                    }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 