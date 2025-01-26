'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Thermometer, Wind, AlertTriangle } from "lucide-react";
import { DashboardSiteData } from "@/utils/services/dashboard";
import { cn } from "@/lib/utils";
import { useEffect, useRef } from "react";

interface SiteWeatherCardProps {
  site: DashboardSiteData;
  onClick?: () => void;
  isSelected?: boolean;
}

function SiteShape({ coordinates, severity }: { coordinates: number[][], severity: string | null }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !coordinates.length) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Find bounds
    const lngs = coordinates.map(c => c[0]);
    const lats = coordinates.map(c => c[1]);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);

    // Add padding
    const padding = 8;
    const width = canvas.width - (padding * 2);
    const height = canvas.height - (padding * 2);

    // Scale coordinates to fit canvas
    const scaledCoords = coordinates.map(([lng, lat]) => [
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

    switch (severity) {
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
    ctx.lineWidth = 1.5;
    
    // Fill and stroke
    ctx.fill();
    ctx.stroke();
  }, [coordinates, severity]);

  return (
    <div className="mt-4 flex justify-center animate-in fade-in slide-in-from-bottom-4 duration-500">
      <canvas 
        ref={canvasRef} 
        width={120} 
        height={80} 
        className="opacity-90"
      />
    </div>
  );
}

export function SiteWeatherCard({ site, onClick, isSelected }: SiteWeatherCardProps) {
  const getSeverityColor = (severity: string | null) => {
    switch (severity) {
      case 'extreme': return 'bg-red-500/10 text-red-500';
      case 'severe': return 'bg-orange-500/10 text-orange-500';
      case 'moderate': return 'bg-yellow-500/10 text-yellow-500';
      case 'minor': return 'bg-blue-500/10 text-blue-500';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  return (
    <Card 
      className={cn(
        "hover:shadow-lg transition-all cursor-pointer relative",
        isSelected && "bg-muted/50 shadow-lg"
      )}
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
                "rounded-md px-2 py-1 flex items-center gap-1",
                getSeverityColor(site.alerts.highestSeverity)
              )}
            >
              <AlertTriangle className="w-3 h-3" />
              {site.alerts.count}
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
        {site.coordinates && <SiteShape coordinates={site.coordinates} severity={site.alerts.highestSeverity} />}
      </CardContent>
    </Card>
  );
} 