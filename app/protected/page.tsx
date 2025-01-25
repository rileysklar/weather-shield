'use client';

import { createClient } from "@/utils/supabase/client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Cloud, Map } from "lucide-react"
import Link from "next/link"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { useEffect, useState } from "react"
import { ForecastCards } from "@/components/forecast-cards"
import MapComponent from '@/components/map'

export default function ProtectedPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [weatherData, setWeatherData] = useState<any>(null);
  const supabase = createClient();
  const [projectSite, setProjectSite] = useState<number[][] | null>(null);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/sign-in');
      } else {
        // Simulate data loading
        setTimeout(() => {
          setWeatherData({
            recentLocations: [
              { name: 'New York', temp: '72°F', condition: 'Sunny' },
              { name: 'London', temp: '65°F', condition: 'Cloudy' },
              { name: 'Tokyo', temp: '78°F', condition: 'Clear' },
            ],
            favorites: [
              { name: 'San Francisco', temp: '68°F' },
              { name: 'Paris', temp: '70°F' },
              { name: 'Sydney', temp: '75°F' },
              { name: 'Berlin', temp: '62°F' },
            ]
          });
          setIsLoading(false);
        }, 1500);
      }
    };

    checkSession();
  }, [router]);

  const handleProjectSiteCreate = (coordinates: number[][]) => {
    setProjectSite(coordinates);
    // Here you can also save the coordinates to your backend or perform other actions
    console.log('Project site coordinates:', coordinates);
  };

  if (isLoading) {
    return (
      <div className="flex-1 w-full flex flex-col items-center">
        <div className="flex flex-col gap-8 max-w-5xl p-8 w-full">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-8 rounded-full bg-accent-foreground/20 dark:bg-muted/70 animate-[pulse_1.5s_ease-in-out_infinite]" />
              <div className="space-y-1">
                <Skeleton className="h-8 w-48 bg-accent-foreground/20 dark:bg-muted/70 animate-[pulse_1.5s_ease-in-out_infinite]" />
                <Skeleton className="h-4 w-64 bg-accent-foreground/20 dark:bg-muted/70 animate-[pulse_1.5s_ease-in-out_infinite]" />
              </div>
            </div>
            <Skeleton className="h-9 w-24 bg-accent-foreground/20 dark:bg-muted/70 animate-[pulse_1.5s_ease-in-out_infinite]" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="bg-glass backdrop-blur-sm border-foreground/10">
                <CardHeader>
                  <Skeleton className="h-6 w-32 bg-accent-foreground/20 dark:bg-muted/70 animate-[pulse_1.5s_ease-in-out_infinite]" />
                  <Skeleton className="h-4 w-24 bg-accent-foreground/20 dark:bg-muted/70 animate-[pulse_1.5s_ease-in-out_infinite]" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Skeleton className="h-8 w-16 bg-accent-foreground/20 dark:bg-muted/70 animate-[pulse_1.5s_ease-in-out_infinite]" />
                    <Skeleton className="h-4 w-20 bg-accent-foreground/20 dark:bg-muted/70 animate-[pulse_1.5s_ease-in-out_infinite]" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <ForecastCards isLoading={true} forecasts={[]} />
        </div>
      </div>
    );
  }

  // Mock forecast data - replace with real API data later
  const mockForecasts = [
    {
      date: new Date(Date.now() + 86400000).toISOString(),
      temp: { max: 75, min: 62 },
      weather: { main: "Sunny", icon: "01d" }
    },
    {
      date: new Date(Date.now() + 2 * 86400000).toISOString(),
      temp: { max: 73, min: 60 },
      weather: { main: "Partly Cloudy", icon: "02d" }
    },
    {
      date: new Date(Date.now() + 3 * 86400000).toISOString(),
      temp: { max: 70, min: 58 },
      weather: { main: "Cloudy", icon: "03d" }
    },
    {
      date: new Date(Date.now() + 4 * 86400000).toISOString(),
      temp: { max: 72, min: 59 },
      weather: { main: "Rain", icon: "10d" }
    },
    {
      date: new Date(Date.now() + 5 * 86400000).toISOString(),
      temp: { max: 74, min: 61 },
      weather: { main: "Clear", icon: "01d" }
    }
  ];

  return (
    <div className="flex-1 w-full flex flex-col items-center">
      <div className="flex flex-col gap-8 max-w-5xl p-8 w-full">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div className="flex items-center gap-2">
            
            <div className="space-y-1">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Welcome back!
              </h1>
              <p className="text-muted-foreground">
                Here's your personal weather dashboard
              </p>
            </div>
          </div>
          <Button asChild variant="default" size="lg" className="w-full sm:w-auto bg-primary hover:bg-primary/90">
            <Link href="/map">
              <Map className="mr-2 h-5 w-5" />
              View Map
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {weatherData.recentLocations.map((location: any, i: number) => (
            <Card key={i} className="bg-glass backdrop-blur-sm border-foreground/10">
              <CardHeader>
                <CardTitle>{location.name}</CardTitle>
                <CardDescription>Current Weather</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-4xl font-bold">{location.temp}</p>
                  <p className="text-muted-foreground">{location.condition}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="w-full">
          <h2 className="text-xl font-semibold mb-4">5-Day Forecast</h2>
          <ForecastCards forecasts={mockForecasts} />
        </div>
      </div>
      <div className="h-full w-full">
        <MapComponent onProjectSiteCreate={handleProjectSiteCreate} />
      </div>
    </div>
  );
}
