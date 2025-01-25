'use client';

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Card } from './ui/card';
import { Skeleton } from './ui/skeleton';

interface TemperatureChartProps {
  forecast?: Array<{
    number: number;
    name: string;
    temperature: number;
    temperatureUnit: string;
  }>;
}

export default function TemperatureChart({ forecast }: TemperatureChartProps) {
  if (!forecast) {
    return (
      <Card className="border-none">
        <div className="h-[200px] w-full">
          <Skeleton className="h-full w-full" />
        </div>
      </Card>
    );
  }

  const data = forecast.map(period => ({
    time: period.name,
    temp: period.temperature
  }));

  return (
    <Card className="border-none">
      <div className="h-[200px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} className='-ml-6'>
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
              tickFormatter={(value) => `${value}°`}
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
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Line
              type="monotone"
              dataKey="temp"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={{ fill: "hsl(var(--primary))" }}
              activeDot={{
                r: 4,
                fill: "hsl(var(--primary))",
                stroke: "hsl(var(--background))",
                strokeWidth: 2,
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
} 
