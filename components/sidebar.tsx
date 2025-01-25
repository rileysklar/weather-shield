'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Thermometer, Wind, Droplets, Sun, CloudRain, Cloud, ArrowLeft, PanelLeftClose, PanelLeft, Moon } from "lucide-react";
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
import { ProjectSiteForm, ProjectSiteDetails } from './project-site-form';
import { ProjectSiteList } from './project-site-list';

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
    name?: string; // Optional name field for city, state
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
}

const LoadingSkeleton = () => (
  <div className="space-y-4">
    {/* Project Site Header */}
    <div className="flex items-center justify-between">
      <div className="h-6 w-32 bg-muted rounded-md animate-pulse" />
      <div className="h-6 w-6 bg-muted rounded-md animate-pulse" />
    </div>
    
    {/* Project Site Card */}
    <Card className="p-4 space-y-3">
      <div className="h-5 w-24 bg-muted rounded-md animate-pulse" />
      <div className="space-y-2">
        <div className="h-4 w-full bg-muted rounded-md animate-pulse" />
        <div className="h-4 w-3/4 bg-muted rounded-md animate-pulse" />
      </div>
      <div className="h-8 w-full bg-muted rounded-md animate-pulse" />
    </Card>

    {/* Weather Section */}
    <div className="mt-6 space-y-4">
      {/* Weather Header */}
      <div className="h-6 w-40 bg-muted rounded-md animate-pulse" />
      
      {/* Current Conditions Card */}
      <Card className="p-4 space-y-3">
        <div className="flex justify-between items-center">
          <div className="h-6 w-32 bg-muted rounded-md animate-pulse" />
          <div className="h-10 w-10 bg-muted rounded-full animate-pulse" />
        </div>
        <div className="space-y-2">
          <div className="h-8 w-24 bg-muted rounded-md animate-pulse" />
          <div className="h-4 w-full bg-muted rounded-md animate-pulse" />
        </div>
      </Card>

      {/* Forecast Card */}
      <Card className="p-4 space-y-3">
        <div className="h-6 w-28 bg-muted rounded-md animate-pulse" />
        <div className="grid grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 w-full bg-muted rounded-md animate-pulse" />
              <div className="h-8 w-8 mx-auto bg-muted rounded-full animate-pulse" />
              <div className="h-4 w-3/4 mx-auto bg-muted rounded-md animate-pulse" />
            </div>
          ))}
        </div>
      </Card>
    </div>
  </div>
);

export function Sidebar({ weatherData, location, isOpen, onToggle, onLocationSelect, onClearPolygon, isDrawingMode, onDrawingModeToggle, onPolygonComplete, showProjectForm, onProjectDetailsSubmit, projectSites = [], onProjectSiteSelect }: SidebarProps) {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, [isOpen, location]); // Trigger loading on sidebar open/close and location changes

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

  return (
    <Card 
      className={cn(
        "fixed top-20 left-4 bg-background border-border transition-all duration-300 ease-in-out",
        isOpen 
          ? "h-[calc(100vh-96px)] w-[calc(100%-36px)] sm:w-80" 
          : "h-28 sm:h-28 w-16",
        "dark:bg-background light:bg-[url('/topo-light.svg')] bg-cover bg-center bg-no-repeat"
      )}
    >
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
          ) : loading ? (
            <LoadingSkeleton />
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
            <div className="flex-1 overflow-hidden">
              {showProjectForm ? (
                <div className="space-y-4">
                  <h3 className="font-semibold">Create Project Site</h3>
                  <ProjectSiteForm onSubmit={onProjectDetailsSubmit} />
                </div>
              ) : (
                <ScrollArea className="h-[calc(100%-60px)] -mr-4 pr-4">
                  <div className="space-y-4">
                    {/* Project Site Section */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold">Project Sites</h3>
                      </div>
                      
                      <Tabs defaultValue="list" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                          <TabsTrigger value="list">
                            Sites ({projectSites.length})
                          </TabsTrigger>
                          <TabsTrigger value="create">Create</TabsTrigger>
                        </TabsList>
                        <TabsContent value="list" className="mt-4">
                          <ProjectSiteList 
                            sites={projectSites}
                            onSelect={onProjectSiteSelect}
                          />
                        </TabsContent>
                        <TabsContent value="create" className="mt-4">
                          {showProjectForm ? (
                            <ProjectSiteForm onSubmit={onProjectDetailsSubmit} />
                          ) : isDrawingMode ? (
                            <Card className="p-4 border-2 border-primary animate-pulse">
                              <p className="text-sm text-muted-foreground">
                                Draw a polygon on the map to define your project site area
                              </p>
                            </Card>
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
                    </div>

                    {/* Weather Data Section - Only show when not in drawing mode */}
                    {!isDrawingMode && !showProjectForm && (
                      <>
                        {(loading || !weatherData) ? (
                          <LoadingSkeleton />
                        ) : (
                          <>
                            {/* Current Weather */}
                            <Accordion type="single" collapsible className="w-full mt-8">
                              <AccordionItem value="details">
                                <AccordionTrigger className="hover:no-underline">
                                  <div className="flex items-center gap-2">
                                    <h3 className="font-semibold">Current Conditions</h3>
                                  </div>
                                </AccordionTrigger>
                                <AccordionContent>
                                  <div className="space-y-4 pt-2">
                                    <div className="grid grid-cols-2 gap-3">
                                      <Card className="overflow-hidden">
                                        <div className="bg-gradient-to-br from-primary/20 to-primary/5 p-4">
                                          <div className="flex flex-col gap-2">
                                            <div className="flex items-center gap-2 text-primary">
                                              <Thermometer className="h-6 w-6" />
                                              <span className="text-xs font-medium uppercase tracking-wide">Temp</span>
                                            </div>
                                            <p className="text-md font-semibold">{weatherData.forecast[0].temperature}°{weatherData.forecast[0].temperatureUnit}</p>
                                          </div>
                                        </div>
                                      </Card>
                                      <Card className="overflow-hidden">
                                        <div className="bg-gradient-to-br from-primary/20 to-primary/5 p-4">
                                          <div className="flex flex-col gap-2">
                                            <div className="flex items-center gap-2 text-primary">
                                              <Wind className="h-6 w-6" />
                                              <span className="text-xs font-medium uppercase tracking-wide">Wind</span>
                                            </div>
                                            <p className="text-md font-semibold">{weatherData.forecast[0].windSpeed}</p>
                                          </div>
                                        </div>
                                      </Card>
                                    </div>
                                    <div className="space-y-2">
                                      {weatherData.forecast.slice(0, 1).map((period) => (
                                        <Card key={period.number} className="p-4">
                                          <p className="text-sm">{period.detailedForecast}</p>
                                        </Card>
                                      ))}
                                    </div>
                                  </div>
                                </AccordionContent>
                              </AccordionItem>
                            </Accordion>

                            {/* Extended Forecast */}
                            <Accordion type="single" collapsible className="w-full">
                              <AccordionItem value="forecast">
                                <AccordionTrigger className="hover:no-underline">
                                  <div className="flex items-center gap-2">
                                    <h3 className="font-semibold">Extended Forecast</h3>
                                  </div>
                                </AccordionTrigger>
                                <AccordionContent>
                                  <div className="space-y-4 pt-2">
                                    <Card className="p-4">
                                      <TemperatureChart forecast={weatherData.forecast} />
                                    </Card>
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
              )}
            </div>
          </CardContent>
        )}

        <div className="absolute bottom-4 left-4 right-4">
          <Button 
            asChild 
            variant="outline"
            size={isOpen ? "default" : "sm"}
            className={cn(
              "transition-all duration-300",
              isOpen ? "w-full" : "w-8 h-8 mx-auto p-0"
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
