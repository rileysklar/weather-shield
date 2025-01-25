import { ProcessedAlert } from './noaa';
import { ProjectSite } from '@/types/project-site';

export type RiskCategory = 'low' | 'moderate' | 'high' | 'severe' | 'extreme';

export interface RiskAssessment {
  riskLevel: number;  // 0-100
  riskCategory: RiskCategory;
  primaryRiskFactors: string[];
}

export class RiskCalculatorService {
  static calculateSiteRisk(site: ProjectSite, alerts: ProcessedAlert[]): RiskAssessment {
    // Filter alerts that affect this site
    const siteAlerts = alerts.filter(alert => {
      // Calculate site center
      const centerLat = site.coordinates.reduce((sum, coord) => sum + coord[1], 0) / site.coordinates.length;
      const centerLng = site.coordinates.reduce((sum, coord) => sum + coord[0], 0) / site.coordinates.length;

      // Check if any alert area contains the site's location
      return alert.areas.some(area => {
        // Convert coordinates to strings for comparison
        const latStr = centerLat.toFixed(2);
        const lngStr = centerLng.toFixed(2);
        const areaLower = area.toLowerCase();

        // Check for county/region match
        const locationParts = area.split(',').map(part => part.trim().toLowerCase());
        const hasLocationMatch = locationParts.some(part => 
          // Match against common location formats
          part.includes('county') || 
          part.includes('region') || 
          part.includes('area') ||
          part.includes('zone')
        );

        // If we have a location match or coordinate match, consider it affecting the site
        return hasLocationMatch || areaLower.includes(latStr) || areaLower.includes(lngStr);
      });
    });

    if (siteAlerts.length === 0) {
      return {
        riskLevel: 0,
        riskCategory: 'low',
        primaryRiskFactors: []
      };
    }

    // Calculate base risk from alert severity
    const severityScores = {
      'Extreme': 100,
      'Severe': 80,
      'Moderate': 60,
      'Minor': 40,
      'Unknown': 20
    };

    // Calculate risk based on most severe alert and accumulate risk factors
    let maxSeverityScore = 0;
    const riskFactors: string[] = [];

    siteAlerts.forEach(alert => {
      const severityScore = severityScores[alert.severity as keyof typeof severityScores] || severityScores.Unknown;
      if (severityScore > maxSeverityScore) {
        maxSeverityScore = severityScore;
      }
      riskFactors.push(`${alert.event} (${alert.severity})`);
    });

    // Adjust risk based on site type and its vulnerability to weather
    const siteTypeMultipliers: Record<string, number> = {
      'solar_array': 1.2,  // More sensitive to severe weather
      'wind_farm': 1.3,    // Most sensitive to severe weather
      'hydroelectric': 1.1,
      'coal': 0.9,
      'natural_gas': 0.9,
      'nuclear': 0.8,      // Most resilient to weather
      'geothermal': 0.9,
      'biomass': 0.9,
      'other': 1.0
    };

    const siteMultiplier = siteTypeMultipliers[site.type] || 1.0;
    const finalRiskLevel = Math.min(100, Math.round(maxSeverityScore * siteMultiplier));

    // Determine risk category based on final risk level
    let riskCategory: RiskCategory;
    if (finalRiskLevel >= 90) riskCategory = 'extreme';
    else if (finalRiskLevel >= 70) riskCategory = 'severe';
    else if (finalRiskLevel >= 50) riskCategory = 'high';
    else if (finalRiskLevel >= 30) riskCategory = 'moderate';
    else riskCategory = 'low';

    return {
      riskLevel: finalRiskLevel,
      riskCategory,
      primaryRiskFactors: riskFactors
    };
  }

  static getRiskColor(category: RiskCategory): string {
    switch (category) {
      case 'extreme':
        return 'text-destructive border-destructive';
      case 'severe':
        return 'text-destructive/80 border-destructive/80';
      case 'high':
        return 'text-warning border-warning';
      case 'moderate':
        return 'text-warning/80 border-warning/80';
      default:
        return 'text-muted-foreground border-muted';
    }
  }
} 
