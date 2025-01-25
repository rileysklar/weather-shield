'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { RiskCalculatorService, RiskAssessment } from '@/utils/services/risk-calculator';
import { ProjectSite } from '@/types/project-site';
import { ProcessedAlert } from '@/utils/services/noaa';
import { AlertTriangle, AlertCircle, Activity } from 'lucide-react';

interface RiskIndicatorProps {
  site: ProjectSite;
  alerts: ProcessedAlert[];
}

export function RiskIndicator({ site, alerts }: RiskIndicatorProps) {
  const [risk, setRisk] = useState<RiskAssessment | null>(null);

  useEffect(() => {
    console.log('RiskIndicator - Site:', site);
    console.log('RiskIndicator - Alerts:', alerts);
    const assessment = RiskCalculatorService.calculateSiteRisk(site, alerts);
    console.log('RiskIndicator - Risk Assessment:', assessment);
    setRisk(assessment);
  }, [site, alerts]);

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

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            variant="outline" 
            className={`text-xs shrink-0 gap-1 ${RiskCalculatorService.getRiskColor(risk.riskCategory)}`}
          >
            {getRiskIcon()}
            {risk.riskLevel}%
          </Badge>
        </TooltipTrigger>
        <TooltipContent className="max-w-[300px]">
          <div className="space-y-2">
            <p className="font-semibold">Risk Assessment</p>
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
