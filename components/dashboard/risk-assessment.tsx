import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardSiteData } from "@/utils/services/dashboard";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { AlertTriangle, Wind, CloudRain, Sun, CloudHail } from "lucide-react";

interface RiskAssessmentProps {
  sites: DashboardSiteData[];
}

interface RiskFactor {
  name: string;
  value: number;
  threshold: number;
  icon: React.ReactNode;
  description: string;
}

function getRiskFactors(site: DashboardSiteData): RiskFactor[] {
  const weather = site.currentWeather;
  if (!weather) return [];

  return [
    {
      name: 'Hail Risk',
      value: weather.weather_condition?.toLowerCase().includes('hail') ? 100 : 0,
      threshold: 50,
      icon: <CloudHail className="h-4 w-4" />,
      description: 'Potential hail damage to solar panels'
    },
    {
      name: 'Wind Speed',
      value: weather.wind_speed || 0,
      threshold: 30, // mph
      icon: <Wind className="h-4 w-4" />,
      description: 'High winds can damage panel mounting'
    },
    {
      name: 'Cloud Cover',
      value: weather.clouds_percentage || 0,
      threshold: 80, // %
      icon: <Sun className="h-4 w-4" />,
      description: 'Heavy cloud cover reduces generation'
    },
    {
      name: 'Precipitation',
      value: weather.weather_condition?.toLowerCase().includes('rain') ? 100 : 0,
      threshold: 50,
      icon: <CloudRain className="h-4 w-4" />,
      description: 'Heavy rain can affect system performance'
    }
  ];
}

export function RiskAssessment({ sites }: RiskAssessmentProps) {
  // Filter sites with high or extreme risk
  const highRiskSites = sites.filter(site => 
    site.alerts.highestSeverity === 'severe' || site.alerts.highestSeverity === 'extreme'
  );

  if (highRiskSites.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-2">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          <CardTitle>Sites at Risk</CardTitle>
        </div>
        <CardDescription>
          Solar sites with severe or extreme weather conditions that may impact performance
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {highRiskSites.map(site => (
            <div key={site.id} className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">{site.name}</h3>
                <span className="text-sm capitalize px-2 py-1 rounded-full bg-destructive/10 text-destructive">
                  {site.alerts.highestSeverity}
                </span>
              </div>
              
              <div className="text-sm text-muted-foreground">
                Primary concern: {
                  site.currentWeather?.weather_condition?.toLowerCase().includes('hail')
                    ? 'Potential hail damage to solar panels'
                    : site.currentWeather?.wind_speed && site.currentWeather.wind_speed > 30
                    ? 'High wind speeds may damage panel mounting'
                    : 'Multiple weather conditions affecting performance'
                }
              </div>
              
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={getRiskFactors(site)}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <XAxis type="number" domain={[0, 100]} />
                    <YAxis dataKey="name" type="category" width={100} />
                    <Tooltip
                      cursor={false}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload as RiskFactor;
                          return (
                            <div className="rounded-lg border bg-background p-2 shadow-sm">
                              <div className="flex items-center space-x-2">
                                {data.icon}
                                <span className="font-medium">{data.name}</span>
                              </div>
                              <div className="mt-1 text-sm text-muted-foreground">
                                {data.description}
                                <br />
                                Current: {data.value}
                                <br />
                                Risk Threshold: {data.threshold}
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar 
                      dataKey="value" 
                      fill="currentColor"
                    >
                      {getRiskFactors(site).map((entry, index) => (
                        <Cell
                          key={index}
                          fill={entry.value > entry.threshold 
                            ? 'hsl(var(--destructive)/0.4)' 
                            : 'hsl(var(--primary)/0.3)'}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="text-sm text-muted-foreground">
                {site.alerts.count} active alerts • Last updated: {
                  new Date(site.currentWeather?.timestamp || '').toLocaleTimeString()
                }
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 
