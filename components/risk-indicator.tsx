'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { RiskCalculatorService, RiskAssessment } from '@/utils/services/risk-calculator';
import { ProjectSite } from '@/types/project-site';
import { ProcessedAlert } from '@/utils/services/noaa';
import { AlertTriangle, AlertCircle, Activity, MapPin } from 'lucide-react';
import { DashboardSiteData } from '@/utils/services/dashboard';
import { WeatherData } from '@/types/weather';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { SiteType } from '@/types/site';

interface RiskIndicatorProps {
  site: ProjectSite;
  alerts: ProcessedAlert[];
  weatherData?: WeatherData | null;
}

export function RiskIndicator({ site, alerts, weatherData = null }: RiskIndicatorProps) {
  const [risk, setRisk] = useState<RiskAssessment | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const calculateRisk = async () => {
      setIsLoading(true);
      try {
        // Normalize alert severities to match the expected format
        const normalizedAlerts = alerts.map(alert => ({
          ...alert,
          severity: alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1).toLowerCase()
        }));

        // Sort alerts by severity
        const sortedAlerts = [...normalizedAlerts].sort((a, b) => {
          const severityOrder = {
            'Extreme': 4,
            'Severe': 3,
            'Moderate': 2,
            'Minor': 1,
            'Unknown': 0
          };
          return (severityOrder[b.severity as keyof typeof severityOrder] || 0) - 
                (severityOrder[a.severity as keyof typeof severityOrder] || 0);
        });

        // Convert to dashboard site data format
        const dashboardSite: DashboardSiteData = {
          id: site.id,
          name: site.name,
          description: site.description,
          type: site.type as SiteType,
          coordinates: site.coordinates,
          currentWeather: weatherData,
          alerts: {
            count: sortedAlerts.length,
            highestSeverity: (sortedAlerts[0]?.severity?.toLowerCase() as 'minor' | 'moderate' | 'severe' | 'extreme' | null) || null
          }
        };

        const assessment = RiskCalculatorService.calculateSiteRisk(dashboardSite, sortedAlerts);
        setRisk(assessment);
      } catch (error) {
        console.error('Error calculating risk:', error);
      } finally {
        setIsLoading(false);
      }
    };

    calculateRisk();
  }, [site, alerts, weatherData]);

  if (isLoading) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge 
              variant="outline" 
              className="text-sm md:text-xs shrink-0 gap-1.5 transition-colors rounded-md border-2 py-1 px-2.5 cursor-wait bg-muted/20"
            >
              <Skeleton className="h-4 w-4 rounded-full" />
              <Skeleton className="h-4 w-8" />
            </Badge>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-[90vw] md:max-w-[300px] p-3">
            <div className="space-y-2">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  if (!risk) return null;

  const getRiskIcon = () => {
    switch (risk.riskCategory) {
      case 'extreme':
      case 'severe':
        return <AlertTriangle className="h-4 w-4" />;
      case 'high':
      case 'moderate':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getRiskColor = () => {
    switch (risk.riskCategory) {
      case 'extreme':
        return 'bg-red-500/20 text-red-600 border-red-600 hover:bg-red-500/30 font-semibold';
      case 'severe':
        return 'bg-orange-500/20 text-orange-600 border-orange-600 hover:bg-orange-500/30 font-semibold';
      case 'high':
        return 'bg-amber-500/20 text-amber-600 border-amber-600 hover:bg-amber-500/30';
      case 'moderate':
        return 'bg-yellow-500/20 text-yellow-600 border-yellow-600 hover:bg-yellow-500/30';
      case 'minor':
        return 'bg-blue-500/20 text-blue-600 border-blue-500 hover:bg-blue-500/30';
      default:
        return 'bg-green-500/20 text-green-600 border-green-500 hover:bg-green-500/30';
    }
  };

  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            variant="outline" 
            className={cn(
              "text-sm md:text-xs shrink-0 gap-1.5 transition-colors rounded-md border-2 py-1 px-2.5 cursor-pointer",
              getRiskColor()
            )}
          >
            {getRiskIcon()}
            {risk.riskLevel}%
          </Badge>
        </TooltipTrigger>
        <TooltipContent 
          side="top"
          className="max-w-[90vw] md:max-w-[300px] p-3"
          sideOffset={5}
        >
          <div className="space-y-2.5">
            <p className="font-semibold text-base">Risk Assessment</p>
            <Badge 
              variant="secondary" 
              className="text-sm md:text-xs rounded-md border-2 mt-1 mb-2 py-1"
            >
              <MapPin className="h-3.5 w-3.5 md:h-3 md:w-3 mr-1.5" />
              {site.name}
            </Badge>
            <div className="text-base md:text-sm space-y-1.5">
              <p>Risk Level: {risk.riskCategory.charAt(0).toUpperCase() + risk.riskCategory.slice(1)}</p>
              {risk.primaryRiskFactors.length > 0 && (
                <>
                  <p className="font-medium">Risk Factors:</p>
                  <ul className="list-disc list-inside space-y-0.5">
                    {risk.primaryRiskFactors.map((factor, index) => (
                      <li key={index} className="break-words">{factor}</li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
} 
