'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Thermometer, Wind, Droplets, Sun, CloudRain, Cloud, ArrowLeft, PanelLeftClose, PanelLeft, Moon, Pencil, X, Download, Upload, Check, Trash2 } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TemperatureChart from './temperature-chart';
import { ThemeSwitcher } from './theme-switcher';
import { SearchBar } from './search-bar';
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState } from 'react';
import { PolygonCoordinates } from './polygon-coordinates';
import { ProjectSiteForm, ProjectSiteDetails, PROJECT_TYPES } from './project-site-form';
import { ProjectSiteList } from './project-site-list';
import { Input } from '@/components/ui/input';
import { ProjectSiteService } from '@/utils/services/project-site';
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface WeatherData {
  forecast: Array<{
    number: number;
    name: string;
    temperature: number;
    temperatureUnit: string;
    windSpeed: string;
    windDirection: string;
    shortForecast: string;
    detailedForecast: string;
    icon: string;
  }>;
  city: string;
  country: string;
}

interface ProjectSite {
  id: string;
  name: string;
  description: string;
  type: string;
  coordinates: number[][];
}

interface SidebarProps {
  weatherData: WeatherData | null;
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

  return (
    <Card className={cn(
      "fixed top-20 left-4 bg-background border-border transition-all duration-300 ease-in-out z-10",
      isOpen 
        ? "h-[calc(100vh-96px)] w-[calc(100%-36px)] sm:w-80" 
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
                    <CardDescription>Select a US location on the map</CardDescription>
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
          <CardContent className="flex-1 flex flex-col overflow-hidden p-4 relative">
            <ScrollArea className="h-[calc(100%-100px)] -mr-4 pr-4">
              <div className="space-y-4">
                {/* Project Sites Section */}
                <Tabs defaultValue="list" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="list">Sites ({projectSites.length})</TabsTrigger>
                    <TabsTrigger value="create">Create</TabsTrigger>
                  </TabsList>
                  <TabsContent value="list" className="mt-4">
                    <Accordion type="single" collapsible defaultValue="sites">
                      <AccordionItem value="sites">
                        <AccordionTrigger className="hover:no-underline">
                          <div className="flex items-center justify-between w-full">
                            <h3 className="font-semibold">Project Sites</h3>
                            <span className="text-sm text-muted-foreground">
                              {projectSites.length} sites
                            </span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-2">
                            {projectSites.map((site) => (
                              <Card key={site.id} className="p-4">
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
                                        onClick={() => onProjectSiteSelect?.(site)}
                                        className="text-lg font-semibold hover:text-primary transition-colors text-left flex-1"
                                      >
                                        {site.name}
                                      </button>
                                    )}
                                    <div className="flex gap-1 shrink-0">
                                      {editingSiteId === site.id ? (
                                        <>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={handleSaveEdit}
                                            className="h-6 w-6 p-0"
                                          >
                                            <Check className="h-3 w-3" />
                                          </Button>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setEditingSiteId(null)}
                                            className="h-6 w-6 p-0"
                                          >
                                            <X className="h-3 w-3" />
                                          </Button>
                                        </>
                                      ) : (
                                        <>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleStartEdit(site)}
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
                                              >
                                                <Trash2 className="h-3 w-3" />
                                              </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                              <AlertDialogHeader>
                                                <AlertDialogTitle>Delete Project Site</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                  Are you sure you want to delete this project site? This action cannot be undone.
                                                </AlertDialogDescription>
                                              </AlertDialogHeader>
                                              <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction
                                                  onClick={() => onProjectSiteDelete?.(site.id)}
                                                  className="bg-destructive hover:bg-destructive/90"
                                                >
                                                  Delete
                                                </AlertDialogAction>
                                              </AlertDialogFooter>
                                            </AlertDialogContent>
                                          </AlertDialog>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                  {editingSiteId === site.id ? (
                                    <Input
                                      value={editingDescription}
                                      onChange={(e) => setEditingDescription(e.target.value)}
                                      placeholder="Description"
                                      className="h-8 w-full text-sm"
                                    />
                                  ) : site.description && (
                                    <p className="text-sm text-muted-foreground">{site.description}</p>
                                  )}
                                  {editingSiteId === site.id ? (
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
                                  ) : (
                                    <Badge variant="outline" className="text-xs">
                                      {formatSiteType(site.type)}
                                    </Badge>
                                  )}
                                </div>
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
                        <ProjectSiteForm onSubmit={onProjectDetailsSubmit} />
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

                {/* Weather Section - Only show when not in drawing mode */}
                {!isDrawingMode && !showProjectForm && (
                  <>
                    {(loading || !weatherData) ? (
                      <LoadingSkeleton />
                    ) : (
                      <>
                        {/* Weather Information */}
                        <Accordion type="single" collapsible className="w-full">
                          <AccordionItem value="conditions">
                            <AccordionTrigger className="hover:no-underline">
                              <div className="flex flex-col items-start gap-1">
                                {location?.projectSiteId && (
                                  <h3 className="text-lg font-semibold">
                                    {projectSites.find(site => site.id === location.projectSiteId)?.name}
                                  </h3>
                                )}
                                <p className="text-md text-muted-foreground">
                                  {location?.name || `${location?.lat.toFixed(4)}, ${location?.lng.toFixed(4)}`}
                                </p>
                                <p className="text-xs text-muted-foreground">Current Conditions</p>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent>
                              <div className="space-y-4 pt-2">
                                {/* Current Conditions */}
                                <div className="grid grid-cols-2 gap-3">
                                  <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                      <div className="flex items-center gap-3">
                                        <Thermometer className="h-6 w-6" />
                                        <span className="text-xs font-medium uppercase tracking-wide">Temp</span>
                                      </div>
                                      <p className="text-xs font-medium uppercase tracking-wide">{weatherData.forecast[0].temperature}°{weatherData.forecast[0].temperatureUnit}</p>
                                    </CardHeader>
                                  </Card>
                                  <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                      <div className="flex items-center gap-3">
                                        <Wind className="h-6 w-6" />
                                        <span className="text-xs font-medium uppercase tracking-wide">Wind</span>
                                      </div>
                                      <p className="text-xs font-medium uppercase tracking-wide">{weatherData.forecast[0].windSpeed}</p>
                                    </CardHeader>
                                  </Card>
                                </div>

                                {/* Temperature Chart */}
                                <Card className="p-4">
                                  <TemperatureChart forecast={weatherData.forecast} />
                                </Card>

                                {/* Forecast Periods */}
                                <div className="space-y-2">
                                  {weatherData.forecast.map((period) => (
                                    <Card key={period.number} className="p-4">
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                          {getWeatherIcon(period.shortForecast)}
                                          <div>
                                            <p className="font-medium">{period.name}</p>
                                            <p className="text-sm text-muted-foreground">{period.shortForecast}</p>
                                          </div>
                                        </div>
                                        <p className="font-medium">{period.temperature}°{period.temperatureUnit}</p>
                                      </div>
                                    </Card>
                                  ))}
                                </div>
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      </>
                    )}
                  </>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        )}

        <div className="absolute bottom-4 left-4 right-4 space-y-2">
          {isOpen && (
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
                        // Refresh the project sites list
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
          )}
          <Button 
            asChild 
            variant="outline"
            size={isOpen ? "default" : "sm"}
            className={cn(
              "transition-all duration-300 w-full",
              !isOpen && "w-8 h-8 mx-auto p-0"
            )}
          >
            <Link href="/protected">
              <ArrowLeft className={cn(
                "h-4 w-4",
                isOpen && "mr-2"
              )} />
              {isOpen && "Back to Dashboard"}
            </Link>
          </Button>
        </div>
      </div>
    </Card>
  );
} 
