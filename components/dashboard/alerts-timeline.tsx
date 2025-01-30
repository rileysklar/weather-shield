'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardSiteData } from "@/utils/services/dashboard";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertTriangle, Clock } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface AlertsTimelineProps {
  sites: DashboardSiteData[];
}

interface Alert {
  id: string;
  event: string;
  headline: string;
  description: string;
  severity: string;
  expires: string;
  siteName: string;
}

export function AlertsTimeline({ sites }: AlertsTimelineProps) {
  const [timeLeft, setTimeLeft] = useState<{[key: string]: string}>({});
  const [alerts, setAlerts] = useState<Alert[]>([]);

  // Process alerts when sites change
  useEffect(() => {
    const processedAlerts = sites.flatMap(site => 
      site.currentWeather?.alerts?.map(alert => ({
        ...alert,
        siteName: site.name
      })) || []
    ).sort((a, b) => new Date(b.expires).getTime() - new Date(a.expires).getTime());
    
    setAlerts(processedAlerts);
  }, [sites]);

  // Update timers
  useEffect(() => {
    const calculateTimeLeft = (expires: string) => {
      const now = new Date().getTime();
      const expiryTime = new Date(expires).getTime();
      const diff = expiryTime - now;

      if (diff <= 0) return 'Expired';

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      return `${hours}h ${minutes}m`;
    };

    const updateTimers = () => {
      const newTimeLeft = alerts.reduce((acc, alert) => ({
        ...acc,
        [alert.id]: calculateTimeLeft(alert.expires)
      }), {});
      setTimeLeft(newTimeLeft);
    };

    if (alerts.length > 0) {
      updateTimers();
      const interval = setInterval(updateTimers, 60000); // Update every minute
      return () => clearInterval(interval);
    }
  }, [alerts]);

  if (!alerts.length) return null;

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'extreme': return 'bg-red-500/10 text-red-500 border-red-500 hover:bg-red-500/20 hover:text-red-500';
      case 'severe': return 'bg-orange-500/10 text-orange-500 border-orange-500 hover:bg-orange-500/20 hover:text-orange-500';
      case 'moderate': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500 hover:bg-yellow-500/20 hover:text-yellow-500';
      case 'minor': return 'bg-blue-500/10 text-blue-500 border-blue-500 hover:bg-blue-500/20 hover:text-blue-500';
      default: return 'bg-secondary text-secondary-foreground border-secondary hover:bg-secondary/20 hover:text-secondary';
    }
  };

  return (
    <ScrollArea className=" pr-4">
      <div className="space-y-4">
        {alerts.map(alert => (
          <div key={alert.id} className="space-y-2">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">{alert.siteName}</span>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {alert.event}: {alert.headline}
            </p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>Expires in: {timeLeft[alert.id]}</span>
              </div>
              <Badge className={cn("rounded-md border-2 px-3 py-1", getSeverityColor(alert.severity))}>
                {alert.severity}
              </Badge>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
} 
