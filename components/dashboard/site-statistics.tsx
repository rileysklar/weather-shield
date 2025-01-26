'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardSiteData } from "@/utils/services/dashboard";
import { useMemo } from "react";
import { Thermometer, Wind, CloudRain, Activity } from "lucide-react";

interface SiteStatisticsProps {
  sites: DashboardSiteData[];
}

export function SiteStatistics({ sites }: SiteStatisticsProps) {
  const stats = useMemo(() => {
    const validSites = sites.filter(site => site.currentWeather);
    if (!validSites.length) return null;

    const temperatures = validSites
      .map(site => site.currentWeather?.temperature)
      .filter((temp): temp is number => temp !== null && temp !== undefined);

    const windSpeeds = validSites
      .map(site => site.currentWeather?.wind_speed)
      .filter((speed): speed is number => speed !== null && speed !== undefined);

    const alertCounts = sites.map(site => site.alerts.count);

    return {
      avgTemp: temperatures.length ? 
        Math.round(temperatures.reduce((a, b) => a + b, 0) / temperatures.length) : null,
      maxTemp: temperatures.length ? 
        Math.round(Math.max(...temperatures)) : null,
      avgWind: windSpeeds.length ? 
        Math.round(windSpeeds.reduce((a, b) => a + b, 0) / windSpeeds.length) : null,
      maxWind: windSpeeds.length ? 
        Math.round(Math.max(...windSpeeds)) : null,
      totalAlerts: alertCounts.reduce((a, b) => a + b, 0),
      sitesWithAlerts: alertCounts.filter(count => count > 0).length,
    };
  }, [sites]);

  if (!stats) return null;

  return (
    <div className="space-y-4">
      {/* Overview Section */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Overview</span>
        </div>
        <div className="grid grid-cols-2 gap-1 text-sm">
          <span className="text-muted-foreground">Total Sites:</span>
          <span>{sites.length}</span>
          <span className="text-muted-foreground">Sites with Alerts:</span>
          <span>{stats.sitesWithAlerts} ({Math.round(stats.sitesWithAlerts / sites.length * 100)}%)</span>
          <span className="text-muted-foreground">Total Alerts:</span>
          <span>{stats.totalAlerts}</span>
        </div>
      </div>

      {/* Temperature Section */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Thermometer className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Temperature</span>
        </div>
        <div className="grid grid-cols-2 gap-1 text-sm">
          <span className="text-muted-foreground">Average:</span>
          <span>{stats.avgTemp !== null ? `${stats.avgTemp}°` : 'N/A'}</span>
          <span className="text-muted-foreground">Maximum:</span>
          <span>{stats.maxTemp !== null ? `${stats.maxTemp}°` : 'N/A'}</span>
        </div>
      </div>

      {/* Wind Speed Section */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Wind className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Wind Speed</span>
        </div>
        <div className="grid grid-cols-2 gap-1 text-sm">
          <span className="text-muted-foreground">Average:</span>
          <span>{stats.avgWind !== null ? `${stats.avgWind} mph` : 'N/A'}</span>
          <span className="text-muted-foreground">Maximum:</span>
          <span>{stats.maxWind !== null ? `${stats.maxWind} mph` : 'N/A'}</span>
        </div>
      </div>
    </div>
  );
} 