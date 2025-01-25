'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Thermometer, Wind, Droplets, Sun, CloudRain, Cloud, ArrowLeft, PanelLeftClose, PanelLeft, Moon } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import TemperatureChart from './temperature-chart';
import { ThemeSwitcher } from './theme-switcher';
import { SearchBar } from './search-bar';
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState } from 'react';

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

interface SidebarProps {
  weatherData: WeatherData | null;
  location: { lat: number; lng: number } | null;
  isOpen: boolean;
  onToggle: () => void;
  onLocationSelect: (location: { lat: number; lng: number; name: string }) => void;
}

export function Sidebar({ weatherData, location, isOpen, onToggle, onLocationSelect }: SidebarProps) {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      const timer = setTimeout(() => {
        setLoading(false);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

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
        "fixed top-4 left-4 h-[calc(100vh-32px)] bg-background border-border transition-all duration-300 ease-in-out",
        isOpen ? "w-[calc(100%-36px)] sm:w-80" : "w-16",
        "dark:bg-background light:bg-[url('/topo-light.svg')] bg-cover bg-center bg-no-repeat"
      )}
    >
      <div className="h-full flex flex-col">
        <CardHeader className="flex-none p-4 space-y-4">
          {!isOpen ? (
            loading ? (
              <Skeleton className="h-8 w-8 rounded-md" />
            ) : (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={onToggle}
                className="h-8 w-8 p-0 hover:bg-accent"
              >
                <PanelLeft className="h-4 w-4" />
              </Button>
            )
          ) : loading ? (
            <div className="flex flex-col space-y-4 animate-in fade-in duration-300">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-8 w-8 rounded-md" />
                </div>
              </div>
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <div className="flex flex-col space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <CardTitle>Weather Details</CardTitle>
                  {location ? (
                    <CardDescription>
                      {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                    </CardDescription>
                  ) : (
                    <CardDescription>Select a location on the map</CardDescription>
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
              {weatherData ? (
                <ScrollArea className="h-[calc(100%-60px)] -mr-4 pr-4">
                  <div className="space-y-6">
                    {/* Current Weather */}
                    <div className="space-y-4">
                      <h3 className="font-semibold">Current Conditions</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <Card className="p-4 flex items-center gap-2">
                          <Thermometer className="h-4 w-4 text-primary" />
                          <div>
                            <p className="text-sm text-muted-foreground">Temperature</p>
                            <p className="font-medium">{weatherData.forecast[0].temperature}°{weatherData.forecast[0].temperatureUnit}</p>
                          </div>
                        </Card>
                        <Card className="p-4 flex items-center gap-2">
                          <Wind className="h-4 w-4 text-primary" />
                          <div>
                            <p className="text-sm text-muted-foreground">Wind</p>
                            <p className="font-medium">{weatherData.forecast[0].windSpeed}</p>
                          </div>
                        </Card>
                      </div>
                    </div>

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

                      {/* Detailed Forecast */}
                      <AccordionItem value="details">
                        <AccordionTrigger className="hover:no-underline">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">Detailed Forecast</h3>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-2 pt-2">
                            {weatherData.forecast.slice(0, 1).map((period) => (
                              <Card key={period.number} className="p-4">
                                <p className="text-sm">{period.detailedForecast}</p>
                              </Card>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </div>
                </ScrollArea>
              ) : (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <Skeleton className="h-6 w-32" />
                    <div className="grid grid-cols-2 gap-4">
                      <Skeleton className="h-24" />
                      <Skeleton className="h-24" />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <Skeleton className="h-6 w-40" />
                    <div className="space-y-2">
                      <Skeleton className="h-[200px]" />
                      {[1, 2].map((i) => (
                        <Skeleton key={i} className="h-16" />
                      ))}
                    </div>
                  </div>
                </div>
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
