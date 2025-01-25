'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Thermometer, Wind, AlertTriangle } from "lucide-react";
import { DashboardSiteData } from "@/utils/services/dashboard";
import { cn } from "@/lib/utils";

interface SiteWeatherCardProps {
  site: DashboardSiteData;
  onClick?: () => void;
}

export function SiteWeatherCard({ site, onClick }: SiteWeatherCardProps) {
  const getSeverityColor = (severity: string | null) => {
    switch (severity) {
      case 'extreme': return 'bg-destructive text-destructive-foreground';
      case 'severe': return 'bg-orange-500 text-white';
      case 'moderate': return 'bg-yellow-500 text-black';
      case 'minor': return 'bg-blue-500 text-white';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  return (
    <Card 
      className="hover:shadow-lg transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{site.name}</CardTitle>
            <CardDescription>{site.type}</CardDescription>
          </div>
          {site.alerts.count > 0 && (
            <Badge 
              className={cn(
                "ml-2",
                getSeverityColor(site.alerts.highestSeverity)
              )}
            >
              <AlertTriangle className="w-3 h-3 mr-1" />
              {site.alerts.count} Alert{site.alerts.count !== 1 ? 's' : ''}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {site.currentWeather ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Thermometer className="h-4 w-4 text-muted-foreground" />
                <span className="text-2xl font-bold">
                  {site.currentWeather.temperature}°
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Wind className="h-4 w-4 text-muted-foreground" />
                <span>{site.currentWeather.wind_speed} mph</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              {site.currentWeather.weather_condition}
            </p>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No weather data available
          </p>
        )}
      </CardContent>
    </Card>
  );
} 