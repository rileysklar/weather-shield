'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WeatherData } from "@/types/weather";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface WeatherHistoryProps {
  data: WeatherData[];
  title?: string;
}

export function WeatherHistory({ data, title = "Weather History" }: WeatherHistoryProps) {
  const chartData = data.map(weather => ({
    time: weather.timestamp ? new Date(weather.timestamp).toLocaleDateString() : 'No Date',
    temperature: weather.temperature,
    windSpeed: weather.wind_speed
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} className='-ml-6'>
              <XAxis 
                dataKey="time"
                stroke="currentColor"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="currentColor"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                yAxisId="temp"
                orientation="left"
                tickFormatter={(value) => `${value}°`}
              />
              <YAxis
                stroke="currentColor"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                yAxisId="wind"
                orientation="right"
                tickFormatter={(value) => `${value} mph`}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-lg border bg-background p-2 shadow-sm">
                        <div className="grid grid-cols-2 gap-2">
                          <span className="text-muted-foreground">Temperature:</span>
                          <span className="font-medium">
                            {payload[0].value}°
                          </span>
                          <span className="text-muted-foreground">Wind Speed:</span>
                          <span className="font-medium">
                            {payload[1].value} mph
                          </span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Line
                type="monotone"
                dataKey="temperature"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                yAxisId="temp"
                dot={{ fill: "hsl(var(--primary))" }}
              />
              <Line
                type="monotone"
                dataKey="windSpeed"
                stroke="hsl(var(--secondary))"
                strokeWidth={2}
                yAxisId="wind"
                dot={{ fill: "hsl(var(--secondary))" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
} 