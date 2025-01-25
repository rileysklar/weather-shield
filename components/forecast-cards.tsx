import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

interface DayForecast {
  date: string
  temp: {
    max: number
    min: number
  }
  weather: {
    main: string
    icon: string
  }
}

interface ForecastCardsProps {
  forecasts: DayForecast[]
  isLoading?: boolean
}

export function ForecastCards({ forecasts, isLoading = false }: ForecastCardsProps) {
  if (isLoading) {
    return (
      <div className="w-full grid grid-cols-1 md:grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="glass p-4 flex flex-col items-center">
            <Skeleton className="h-4 w-16 bg-accent-foreground/20 dark:bg-muted/70 animate-[pulse_1.5s_ease-in-out_infinite]" />
            <Skeleton className="h-16 w-16 rounded-full my-2 bg-accent-foreground/20 dark:bg-muted/70 animate-[pulse_1.5s_ease-in-out_infinite]" />
            <div className="flex gap-2">
              <Skeleton className="h-4 w-8 bg-accent-foreground/20 dark:bg-muted/70 animate-[pulse_1.5s_ease-in-out_infinite]" />
              <Skeleton className="h-4 w-8 bg-accent-foreground/20 dark:bg-muted/70 animate-[pulse_1.5s_ease-in-out_infinite]" />
            </div>
            <Skeleton className="h-3 w-12 mt-1 bg-accent-foreground/20 dark:bg-muted/70 animate-[pulse_1.5s_ease-in-out_infinite]" />
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="w-full grid grid-cols-1 md:grid-cols-5 gap-4">
      {forecasts.map((day, index) => (
        <Card key={index} className="bg-glass backdrop-blur-sm p-4 flex flex-col items-center">
          <p className="text-sm font-medium">{new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}</p>
          <img 
            src={`https://openweathermap.org/img/wn/${day.weather.icon}@2x.png`}
            alt={day.weather.main}
            className="w-16 h-16 my-2 bg-accent-foreground/10 dark:bg-muted/70 rounded-md"
          />
          <div className="flex gap-2 text-sm">
            <span className="font-medium">{Math.round(day.temp.max)}°</span>
            <span className="text-muted-foreground">{Math.round(day.temp.min)}°</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">{day.weather.main}</p>
        </Card>
      ))}
    </div>
  )
} 