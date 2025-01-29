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

interface RiskIndicatorProps {
  site: ProjectSite;
  alerts: ProcessedAlert[];
  weatherData?: WeatherData | null;
}

export function RiskIndicator({ site, alerts, weatherData = null }: RiskIndicatorProps) {
  const [risk, setRisk] = useState<RiskAssessment | null>(null);

  useEffect(() => {
    console.log(`RiskIndicator - Processing site "${site.name}" (${site.id}):`, {
      site,
      alerts,
      weatherData,
      coordinates: site.coordinates,
      type: site.type
    });

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

    console.log(`RiskIndicator - "${site.name}" sorted alerts:`, sortedAlerts);

    // Convert ProjectSite to DashboardSiteData
    const dashboardSite: DashboardSiteData = {
      id: site.id,
      name: site.name,
      description: site.description,
      type: site.type,
      coordinates: site.coordinates,
      currentWeather: weatherData,
      alerts: {
        count: sortedAlerts.length,
        highestSeverity: (sortedAlerts[0]?.severity?.toLowerCase() as 'minor' | 'moderate' | 'severe' | 'extreme' | null) || null
      }
    };

    console.log(`RiskIndicator - "${site.name}" dashboard site data:`, dashboardSite);

    const assessment = RiskCalculatorService.calculateSiteRisk(dashboardSite, sortedAlerts);
    console.log(`RiskIndicator - "${site.name}" risk assessment:`, assessment);
    
    setRisk(assessment);
  }, [site, alerts, weatherData]);

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
        return 'bg-destructive/20 text-destructive border-destructive hover:bg-destructive/20';
      case 'severe':
        return 'bg-destructive/20 text-destructive/80 border-destructive/50 hover:bg-destructive/30';
      case 'high':
        return 'bg-warning/10 text-warning border-warning hover:bg-warning/20';
      case 'moderate':
        return 'bg-warning/5 text-warning/80 border-warning/50 hover:bg-warning/10';
      case 'minor':
        return 'bg-blue-500/10 text-blue-500 border-blue-500 hover:bg-blue-500/20';
      default:
        return 'bg-muted/50 text-muted-foreground border-muted hover:bg-muted';
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            variant="outline" 
            className={cn(
              "text-xs shrink-0 gap-1 transition-colors rounded-md border-2",
              getRiskColor()
            )}
          >
            {getRiskIcon()}
            {risk.riskLevel}%
          </Badge>
        </TooltipTrigger>
        <TooltipContent className="max-w-[300px]">
          <div className="space-y-2">
            <p className="font-semibold">Risk Assessment</p>
            <Badge 
              variant="secondary" 
              className="text-xs rounded-md border-2 mt-1 mb-2"
            >
              <MapPin className="h-3 w-3 mr-1" />
              {site.name}
            </Badge>
            <div className="text-sm space-y-1">
              <p>Risk Level: {risk.riskCategory.charAt(0).toUpperCase() + risk.riskCategory.slice(1)}</p>
              {risk.primaryRiskFactors.length > 0 && (
                <>
                  <p className="font-medium">Risk Factors:</p>
                  <ul className="list-disc list-inside">
                    {risk.primaryRiskFactors.map((factor, index) => (
                      <li key={index}>{factor}</li>
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
