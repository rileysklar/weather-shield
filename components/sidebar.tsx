'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Thermometer, Wind, Droplets, Sun, CloudRain, Cloud, ArrowLeft, PanelLeftClose, PanelLeft, Moon, Pencil, X, Download, Upload, Check, Trash2, Icon } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TemperatureChart from './temperature-chart';
import { ThemeSwitcher } from './theme-switcher';
import { SearchBar } from './search-bar';
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState, useRef } from 'react';
import { PolygonCoordinates } from './polygon-coordinates';
import { ProjectSiteForm, ProjectSiteDetails, PROJECT_TYPES } from './project-site-form';
import { ProjectSiteList } from './project-site-list';
import { Input } from '@/components/ui/input';
import { ProjectSiteService } from '@/utils/services/project-site';
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { AlertsAccordion } from './alerts-accordion';
import { RiskIndicator } from './risk-indicator';
import { NOAAService, ProcessedAlert } from '@/utils/services/noaa';
import { WeatherService } from '@/utils/services/weather';
import { WeatherUpdateService } from '@/utils/services/weather-update';
import { DashboardSiteData } from '@/utils/services/dashboard';
import { WeatherData, WeatherPeriod } from '@/types/weather';
import { isPointInPolygon } from '@/utils/geo';
import { Logo } from './logo';

interface SidebarWeatherData {
  [siteId: string]: {
    currentWeather: WeatherData | null;
  };
}

interface ProjectSite {
  id: string;
  name: string;
  description: string;
  type: string;
  coordinates: number[][];
}

interface SidebarProps {
  weatherData: SidebarWeatherData | null;
  location: { 
    lat: number; 
    lng: number;
    name?: string;
    projectSiteId?: string; // Add this to track selected project site
  } | null;
  isOpen: boolean;
  onToggle: () => void;
  onLocationSelect: (location: { lat: number; lng: number; name: string }) => void;
  onClearPolygon?: () => void;
  isDrawingMode: boolean;
  onDrawingModeToggle: () => void;
  onPolygonComplete: (coordinates: number[][]) => void;
  showProjectForm: boolean;
  onProjectDetailsSubmit: (details: ProjectSiteDetails) => void;
  projectSites: ProjectSite[];
  onProjectSiteSelect?: (site: ProjectSite) => void;
  onCancelProjectSite: () => void;
  onProjectSiteNameEdit: (siteId: string, newName: string) => Promise<void>;
  onProjectSiteDelete: (siteId: string) => Promise<void>;
  onProjectSiteUpdate: (siteId: string, updates: Partial<ProjectSite>) => Promise<void>;
}

const LoadingSkeleton = () => (
  <div className="space-y-6 z-9999">
    {/* Project Sites Section */}
    <div className="space-y-3">
      <div className="h-6 w-32 bg-muted rounded-md animate-pulse" />
      <div className="space-y-2">
        {[...Array(2)].map((_, i) => (
          <Card key={i} className="p-3">
            <div className="flex items-center justify-between">
              <div className="h-4 w-32 bg-muted rounded-md animate-pulse" />
              <div className="flex gap-1">
                <div className="h-6 w-6 bg-muted rounded-md animate-pulse" />
                <div className="h-6 w-6 bg-muted rounded-md animate-pulse" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>

    {/* Weather Section */}
    <div className="space-y-4">
      {/* Current Conditions */}
      <div className="space-y-3">
        <div className="h-6 w-40 bg-muted rounded-md animate-pulse" />
        <div className="grid grid-cols-2 gap-3">
          <Card className="p-4">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 bg-muted rounded-full animate-pulse" />
                <div className="h-4 w-16 bg-muted rounded-md animate-pulse" />
              </div>
              <div className="h-5 w-12 bg-muted rounded-md animate-pulse" />
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 bg-muted rounded-full animate-pulse" />
                <div className="h-4 w-16 bg-muted rounded-md animate-pulse" />
              </div>
              <div className="h-5 w-20 bg-muted rounded-md animate-pulse" />
            </div>
          </Card>
        </div>
        <Card className="p-4">
          <div className="space-y-2">
            <div className="h-4 w-full bg-muted rounded-md animate-pulse" />
            <div className="h-4 w-3/4 bg-muted rounded-md animate-pulse" />
          </div>
        </Card>
      </div>

      {/* Extended Forecast */}
      <div className="space-y-3">
        <div className="h-6 w-36 bg-muted rounded-md animate-pulse" />
        
      </div>
    </div>
  </div>
);

const projectSiteService = new ProjectSiteService();

const formatSiteType = (type: string | undefined) => {
  if (!type) {
    return PROJECT_TYPES[0].label;
  }
  const projectType = PROJECT_TYPES.find(t => t.value === type);
  return projectType?.label || type;
};

export function Sidebar({ 
  weatherData,
  location,
  isOpen,
  onToggle,
  onLocationSelect,
  onClearPolygon,
  isDrawingMode,
  onDrawingModeToggle,
  showProjectForm,
  onProjectDetailsSubmit,
  projectSites = [],
  onProjectSiteSelect,
  onCancelProjectSite,
  onProjectSiteNameEdit,
  onProjectSiteDelete,
  onProjectSiteUpdate,
}: SidebarProps) {
  const [loading, setLoading] = useState(false);
  const [editingSiteId, setEditingSiteId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [editingDescription, setEditingDescription] = useState('');
  const [editingType, setEditingType] = useState('');
  const [siteAlerts, setSiteAlerts] = useState<Record<string, ProcessedAlert[]>>({});
  const [activeTab, setActiveTab] = useState('list');

  // Update active tab when showProjectForm changes
  useEffect(() => {
    if (showProjectForm) {
      setActiveTab('create');
    }
  }, [showProjectForm]);

  // Fetch alerts for each site
  useEffect(() => {
    const fetchSiteAlerts = async () => {
      console.log('Sidebar - Starting to fetch alerts for sites:', projectSites);
      const alertsMap: Record<string, ProcessedAlert[]> = {};
      
      for (const site of projectSites) {
        try {
          console.log(`Sidebar - Fetching alerts for site ${site.id}:`, site);
          const alerts = await NOAAService.getAlertsForSite({
            coordinates: site.coordinates
          });
          console.log(`Sidebar - Received alerts for site ${site.id}:`, alerts);
          alertsMap[site.id] = alerts;
        } catch (error) {
          console.error(`Error fetching alerts for site ${site.id}:`, error);
          alertsMap[site.id] = [];
        }
      }
      
      console.log('Sidebar - Final alerts map:', alertsMap);
      setSiteAlerts(alertsMap);
    };

    fetchSiteAlerts();
  }, [projectSites]);

  // Debug log whenever siteAlerts changes
  useEffect(() => {
    console.log('Sidebar - Site alerts state updated:', siteAlerts);
  }, [siteAlerts]);

  // Debug log whenever weatherData changes
  useEffect(() => {
    console.log('Sidebar - Weather data updated:', weatherData);
  }, [weatherData]);

  useEffect(() => {
    if (location) {
      setLoading(true);
      const timer = setTimeout(() => {
        setLoading(false);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [location]); // Only trigger loading when location changes

  const getWeatherIcon = (forecast: string) => {
    const lowercaseForecast = forecast.toLowerCase();
    if (lowercaseForecast.includes('rain') || lowercaseForecast.includes('shower')) {
      return <CloudRain className="h-5 w-5" />;
    } else if (lowercaseForecast.includes('cloud')) {
      return <Cloud className="h-5 w-5" />;
    } else if (lowercaseForecast.includes('sun') || lowercaseForecast.includes('clear')) {
      return <Sun className="h-5 w-5" />;
    }
    return <Sun className="h-5 w-5" />;
  };

  const handleStartEdit = (site: ProjectSite) => {
    setEditingSiteId(site.id);
    setEditingName(site.name);
    setEditingDescription(site.description);
    setEditingType(site.type);
  };

  const handleSaveEdit = async () => {
    if (!editingSiteId) return;
    
    const site = projectSites.find(s => s.id === editingSiteId);
    if (!site) return;

    // Only update if there are changes
    const hasChanges = 
      site.name !== editingName.trim() ||
      site.description !== editingDescription.trim() ||
      site.type !== editingType;

    if (hasChanges) {
      await onProjectSiteUpdate(editingSiteId, {
        name: editingName.trim(),
        description: editingDescription.trim(),
        type: editingType
      });
    }
    
    setEditingSiteId(null);
  };

  const handleAlertsChange = (alerts: ProcessedAlert[]) => {
    const alertsMap: Record<string, ProcessedAlert[]> = {};
    projectSites.forEach(site => {
      if (site.coordinates) {
        // Filter alerts based on whether their areas contain the site's location
        alertsMap[site.id] = alerts.filter(alert => {
          const centerLat = site.coordinates.reduce((sum, coord) => sum + coord[1], 0) / site.coordinates.length;
          const centerLng = site.coordinates.reduce((sum, coord) => sum + coord[0], 0) / site.coordinates.length;
          
          return alert.areas.some(area => {
            const locations = area
              .split(/[,;]/)
              .map(loc => loc.trim().toLowerCase())
              .filter(loc => loc.length > 0);
            
            const siteName = site.name?.toLowerCase() || '';
            const siteDesc = site.description?.toLowerCase() || '';
            
            return locations.some(location => 
              siteName.includes(location) || 
              location.includes(siteName) ||
              siteDesc.includes(location) ||
              location.includes(centerLat.toFixed(2)) || 
              location.includes(centerLng.toFixed(2))
            );
          });
        });
      } else {
        alertsMap[site.id] = [];
      }
    });
    setSiteAlerts(alertsMap);
  };

  return (
    <Card className={cn(
      "fixed top-20 left-4 bg-background border-border transition-all duration-50 ease-in-out z-10",
      isOpen 
        ? "h-[calc(100svh-96px)] w-[calc(100%-36px)] sm:w-80" 
        : "h-28 sm:h-28 w-16",
      "dark:bg-background light:bg-[url('/topo-light.svg')] bg-cover bg-center bg-no-repeat"
    )}>
      <div className="h-full flex flex-col">
        <CardHeader className="flex-none p-4 space-y-4">
          {!isOpen ? (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={onToggle}
              className="h-8 w-8 p-0 hover:bg-accent"
            >
              <PanelLeft className="h-4 w-4" />
            </Button>
          ) : (
            <div className="flex flex-col space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  {location ? (
                    <CardTitle>{location.name || `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`}</CardTitle>
                  ) : (
                    <Logo />
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <ThemeSwitcher />
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={onToggle}
                    className="h-8 w-8 p-0 hover:bg-accent"
                  >
                    <PanelLeftClose className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <SearchBar onLocationSelect={onLocationSelect} />
            </div>
          )}
        </CardHeader>

        {isOpen && (
          <>
            <CardContent className="flex-1 flex flex-col overflow-hidden p-4">
              <ScrollArea className="flex-1">
                <div className="space-y-4 pr-4">
                  {/* Project Sites Section */}
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="list">Sites ({projectSites.length})</TabsTrigger>
                      <TabsTrigger value="create">Create</TabsTrigger>
                    </TabsList>
                    <TabsContent value="list" className="mt-4">
                      <Accordion type="single" collapsible>
                        <AccordionItem value="sites">
                          <AccordionTrigger className="hover:no-underline">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">Project Sites</h3>
                              <Badge variant="secondary" className="rounded-md bg-primary/20 border-2 border-primary/30 px-2 py-0.5 text-xs">
                                {projectSites.length}
                              </Badge>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="space-y-2">
                              {projectSites.map((site) => (
                                <Card
                                  key={site.id}
                                  className={cn(
                                    "cursor-pointer hover:bg-accent/50 transition-colors",
                                    location?.projectSiteId === site.id && "bg-accent"
                                  )}
                                  onClick={() => onProjectSiteSelect?.(site)}
                                >
                                  <CardContent className="p-4 space-y-2">
                                    <div className="space-y-2">
                                      <div className="flex items-center justify-between">
                                        {editingSiteId === site.id ? (
                                          <Input
                                            value={editingName}
                                            onChange={(e) => setEditingName(e.target.value)}
                                            onKeyDown={(e) => {
                                              if (e.key === 'Enter') handleSaveEdit();
                                              if (e.key === 'Escape') setEditingSiteId(null);
                                            }}
                                            className="h-8 flex-1 mr-2"
                                            autoFocus
                                          />
                                        ) : (
                                          <button
                                            className="text-lg font-semibold hover:text-primary transition-colors text-left w-full"
                                          >
                                            {site.name}
                                          </button>
                                        )}
                                      </div>
                                      {editingSiteId === site.id ? (
                                        <>
                                          <Input
                                            value={editingDescription}
                                            onChange={(e) => setEditingDescription(e.target.value)}
                                            placeholder="Description"
                                            className="h-8 w-full text-sm"
                                          />
                                          <select
                                            value={editingType}
                                            onChange={(e) => setEditingType(e.target.value)}
                                            className="h-8 w-full text-xs rounded-md border border-input bg-background px-3"
                                          >
                                            {PROJECT_TYPES.map(type => (
                                              <option key={type.value} value={type.value}>
                                                {type.label}
                                              </option>
                                            ))}
                                          </select>
                                        </>
                                      ) : (
                                        <>
                                          {site.description && (
                                            <p className="text-sm text-muted-foreground">{site.description}</p>
                                          )}
                                          <div className="flex items-center justify-between gap-2">
                                            <div className="flex items-center gap-2">
                                              <Badge variant="outline" className="text-xs rounded-md border-2 px-2 py-1">
                                                {formatSiteType(site.type)}
                                              </Badge>
                                              <RiskIndicator 
                                                site={site} 
                                                alerts={siteAlerts[site.id] || []} 
                                                weatherData={weatherData?.[site.id]?.currentWeather || null}
                                              />
                                            </div>
                                            <div className="flex gap-1 shrink-0">
                                              <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  handleStartEdit(site);
                                                }}
                                                className="h-6 w-6 p-0"
                                              >
                                                <Pencil className="h-3 w-3" />
                                              </Button>
                                              <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                  <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-6 w-6 p-0 hover:text-destructive"
                                                    onClick={(e) => e.stopPropagation()}
                                                  >
                                                    <Trash2 className="h-3 w-3" />
                                                  </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent className="sm:max-w-[425px]">
                                                  <AlertDialogHeader>
                                                    <AlertDialogTitle>Delete Project Site</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                      Are you sure you want to delete this project site? This action cannot be undone.
                                                    </AlertDialogDescription>
                                                  </AlertDialogHeader>
                                                  <AlertDialogFooter>
                                                    <AlertDialogCancel onClick={(e) => e.stopPropagation()}>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction
                                                      onClick={(e) => {
                                                        e.stopPropagation();
                                                        onProjectSiteDelete?.(site.id);
                                                      }}
                                                      className="bg-destructive hover:bg-destructive/90"
                                                    >
                                                      Delete
                                                    </AlertDialogAction>
                                                  </AlertDialogFooter>
                                                </AlertDialogContent>
                                              </AlertDialog>
                                            </div>
                                          </div>
                                        </>
                                      )}
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </TabsContent>
                    <TabsContent value="create" className="mt-4">
                      {showProjectForm ? (
                        <div className="space-y-4">
                          <ProjectSiteForm 
                            onSubmit={async (details) => {
                              await onProjectDetailsSubmit(details);
                              // Reset drawing mode and close form
                              if (onCancelProjectSite) {
                                onCancelProjectSite();
                              }
                            }} 
                          />
                          <Button 
                            variant="outline" 
                            className="w-full" 
                            onClick={onCancelProjectSite}
                          >
                            <X className="mr-2 h-4 w-4" />
                            Cancel Project Site
                          </Button>
                        </div>
                      ) : isDrawingMode ? (
                        <div className="space-y-4">
                          <Card className="p-4 border-2 border-primary animate-pulse">
                            <p className="text-sm text-muted-foreground">
                              Draw a polygon on the map to define your project site area
                            </p>
                          </Card>
                          <Button 
                            variant="outline" 
                            className="w-full" 
                            onClick={onCancelProjectSite}
                          >
                            <X className="mr-2 h-4 w-4" />
                            Cancel Drawing
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <Button
                            variant="default"
                            size="lg"
                            className="w-full"
                            onClick={onDrawingModeToggle}
                          >
                            Create Project Site
                          </Button>
                          <PolygonCoordinates onClear={onClearPolygon} />
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>

                  {/* Weather Alerts Section */}
                  <AlertsAccordion 
                    projectSites={projectSites} 
                    onAlertsChange={handleAlertsChange}
                  />

                  {/* Weather Conditions Section */}
                  {location?.projectSiteId && 
                    weatherData?.[location.projectSiteId]?.currentWeather && 
                    weatherData[location.projectSiteId]?.currentWeather?.forecast_periods && (
                    <div className="space-y-4">
                      {weatherData[location.projectSiteId]?.currentWeather?.forecast_periods?.map((period: WeatherPeriod) => (
                        <Card key={period.number} className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {getWeatherIcon(period.shortForecast)}
                              <span className="font-medium">{period.name}</span>
                            </div>
                            <span>{period.temperature}°{period.temperatureUnit}</span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-2">{period.shortForecast}</p>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>

            <div className="p-4 border-t bg-background">
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      try {
                        const url = await projectSiteService.downloadProjectSites();
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = 'project-sites.json';
                        a.click();
                        URL.revokeObjectURL(url);
                      } catch (error) {
                        console.error('Error downloading sites:', error);
                      }
                    }}
                    className="flex items-center justify-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Export Sites
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.accept = '.json';
                      input.onchange = async (e) => {
                        const file = (e.target as HTMLInputElement).files?.[0];
                        if (file) {
                          try {
                            await projectSiteService.uploadProjectSites(file);
                            window.location.reload();
                          } catch (error) {
                            console.error('Error uploading sites:', error);
                          }
                        }
                      };
                      input.click();
                    }}
                    className="flex items-center justify-center gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    Import Sites
                  </Button>
                </div>
                <Button 
                  asChild 
                  variant="outline"
                  size="default"
                  className="w-full"
                >
                  <Link href="/protected">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Dashboard
                  </Link>
                </Button>
              </div>
            </div>
          </>
        )}

        {!isOpen && (
          <div className="absolute bottom-4 left-4 right-4">
            <Button 
              asChild 
              variant="outline"
              size="sm"
              className="w-8 h-8 mx-auto p-0"
            >
              <Link href="/protected">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
} 
