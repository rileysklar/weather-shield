'use client';

import { useEffect, useState } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Bell, Info, MapPin } from 'lucide-react';
import { NOAAService, ProcessedAlert } from '@/utils/services/noaa';
import { ProjectSite } from '@/types/project-site';
import { cn } from '@/lib/utils';

interface AlertsAccordionProps {
  projectSites: ProjectSite[];
  onAlertsChange?: (alerts: ProcessedAlert[]) => void;
}

interface AlertWithSites extends ProcessedAlert {
  affectedSites: ProjectSite[];
}

export function AlertsAccordion({ projectSites, onAlertsChange }: AlertsAccordionProps) {
  const [alerts, setAlerts] = useState<AlertWithSites[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAlerts = async () => {
      if (!projectSites.length) return;
      
      setLoading(true);
      try {
        const siteAlerts = await NOAAService.getAllSiteAlerts(projectSites);
        // Match alerts with affected project sites
        const alertsWithSites = siteAlerts.map(alert => ({
          ...alert,
          affectedSites: projectSites.filter(site => {
            const centerLat = site.coordinates.reduce((sum: number, coord: number[]) => sum + coord[1], 0) / site.coordinates.length;
            const centerLng = site.coordinates.reduce((sum: number, coord: number[]) => sum + coord[0], 0) / site.coordinates.length;
            
            // Split areas into individual locations and normalize
            return alert.areas.some(area => {
              // Split by common delimiters and clean up
              const locations = area
                .split(/[,;]/)
                .map(loc => loc.trim().toLowerCase())
                .filter(loc => loc.length > 0);
              
              // Get site location name if available
              const siteName = site.name?.toLowerCase() || '';
              const siteDesc = site.description?.toLowerCase() || '';
              
              // Check each location against site info
              return locations.some(location => 
                // Check if site name or description contains the location name
                siteName.includes(location) || 
                location.includes(siteName) ||
                siteDesc.includes(location) ||
                // Also check coordinates as fallback
                location.includes(centerLat.toFixed(2)) || 
                location.includes(centerLng.toFixed(2))
              );
            });
          })
        }));
        console.log('Alerts with sites:', alertsWithSites);
        setAlerts(alertsWithSites);
        onAlertsChange?.(siteAlerts);
      } catch (error) {
        console.error('Error fetching alerts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
    // Refresh alerts every 5 minutes
    const interval = setInterval(fetchAlerts, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [projectSites, onAlertsChange]);

  if (!projectSites.length) return null;

  const getSeverityIcon = (severity: string) => {
    if (severity.includes('Extreme') || severity.includes('Severe')) {
      return <AlertTriangle className="h-4 w-4 text-destructive" />;
    }
    if (severity.includes('Moderate')) {
      return <Bell className="h-4 w-4 text-warning" />;
    }
    return <Info className="h-4 w-4 text-muted-foreground" />;
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'extreme':
        return 'bg-red-500/20 text-red-600 border-red-600 hover:bg-red-500/30';
      case 'severe':
        return 'bg-orange-500/20 text-orange-600 border-orange-600 hover:bg-orange-500/30';
      case 'moderate':
        return 'bg-yellow-500/20 text-yellow-600 border-yellow-600 hover:bg-yellow-500/30';
      case 'minor':
        return 'bg-blue-500/20 text-blue-600 border-blue-600 hover:bg-blue-500/30';
      default:
        return 'bg-green-500/20 text-green-600 border-green-500 hover:bg-green-500/30';
    }
  };

  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="alerts">
        <AccordionTrigger className="hover:no-underline">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">Weather Alerts</h3>
            {alerts.length > 0 && (
              <Badge variant="outline" className={`rounded-md bg-primary/20 px-2 py-0.5 text-xs border-2 ${getSeverityColor(alerts[0].severity)}`}>
                {alerts.length}
              </Badge>
            )}
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <div className="space-y-2">
            {loading ? (
              <Card className="p-4">
                <div className="animate-pulse space-y-2">
                  <div className="h-4 w-1/2 bg-muted rounded" />
                  <div className="h-4 w-3/4 bg-muted rounded" />
                </div>
              </Card>
            ) : alerts.length === 0 ? (
              <Card className="p-4">
                <p className="text-sm text-muted-foreground">No active weather alerts</p>
              </Card>
            ) : (
              alerts.map((alert) => (
                <Card key={alert.id} className="p-4">
                  <Accordion type="single" collapsible>
                    <AccordionItem value="details" className="border-none">
                      <AccordionTrigger className="hover:no-underline p-0 justify-start">
                        <div className="flex items-start gap-2 w-full text-left">
                          {getSeverityIcon(alert.severity)}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-medium">{alert.event}</h4>
                              <Badge 
                                variant="outline" 
                                className={cn("text-xs shrink-0 rounded-md border-2", getSeverityColor(alert.severity))}
                              >
                                {alert.severity}
                              </Badge>
                            </div>
                            <div className="flex gap-1 mt-1 flex-wrap">
                              {alert.affectedSites.map(site => (
                                <Badge 
                                  key={site.id}
                                  variant="secondary" 
                                  className="text-xs"
                                >
                                  <MapPin className="h-3 w-3 mr-1" />
                                  {site.name}
                                </Badge>
                              ))}
                            </div>
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2 break-words">{alert.headline}</p>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pt-4">
                        <div className="space-y-3 pl-6">
                          {/* Alert Metadata */}
                          <div className="text-xs space-y-1 text-muted-foreground">
                            <p><strong>Urgency:</strong> {alert.urgency}</p>
                            <p><strong>Expires:</strong> {alert.expires}</p>
                            <p className="break-words"><strong>Areas:</strong> {alert.areas.join(', ')}</p>
                          </div>

                          {/* Instructions */}
                          {alert.instruction && (
                            <div className="text-sm border-l-2 border-primary pl-2">
                              <p className="font-medium">Instructions:</p>
                              <p className="text-muted-foreground whitespace-pre-line break-words">{alert.instruction}</p>
                            </div>
                          )}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </Card>
              ))
            )}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
} 
