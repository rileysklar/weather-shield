import { ProcessedAlert } from './noaa';
import { DashboardSiteData } from '@/utils/services/dashboard';

export type RiskCategory = 'low' | 'moderate' | 'high' | 'severe' | 'extreme' | 'minor';

export interface RiskAssessment {
  riskLevel: number;  // 0-100
  riskCategory: RiskCategory;
  primaryRiskFactors: string[];
}

export class RiskCalculatorService {
  static calculateSiteRisk(site: DashboardSiteData, alerts: ProcessedAlert[]): RiskAssessment {
    console.log('RiskCalculator - Starting risk calculation for site:', site.name);
    console.log('RiskCalculator - Alerts received:', alerts);

    // First check for basic weather conditions that might trigger minor warnings
    const minorFactors = [];
    
    // Check for minor weather conditions that might affect the site
    if (site.currentWeather) {
      const { wind_speed, clouds_percentage, weather_condition, temperature } = site.currentWeather;
      
      console.log('RiskCalculator - Weather conditions:', {
        wind_speed,
        clouds_percentage,
        weather_condition,
        temperature
      });

      // More sensitive wind speed threshold
      if (wind_speed && wind_speed > 10) {
        minorFactors.push('Elevated Wind Speed (Minor)');
      }
      // Lower cloud cover threshold
      if (clouds_percentage && clouds_percentage > 40) {
        minorFactors.push('Significant Cloud Cover (Minor)');
      }
      // Any mention of rain or clouds in weather condition
      if (weather_condition?.toLowerCase().includes('rain') || 
          weather_condition?.toLowerCase().includes('cloud')) {
        minorFactors.push('Precipitation Risk (Minor)');
      }
      // Temperature extremes
      if (temperature && (temperature > 85 || temperature < 32)) {
        minorFactors.push('Temperature Warning (Minor)');
      }
    }

    console.log('RiskCalculator - Minor factors from weather:', minorFactors);

    // Calculate site center once
    const centerLat = site.coordinates.reduce((sum, coord) => sum + coord[1], 0) / site.coordinates.length;
    const centerLng = site.coordinates.reduce((sum, coord) => sum + coord[0], 0) / site.coordinates.length;

    // For now, consider all alerts as affecting the site
    // This is temporary until we can improve the area matching logic
    const siteAlerts = alerts;

    console.log('RiskCalculator - Filtered alerts affecting site:', siteAlerts);

    // If we have minor factors but no alerts, return minor risk
    if (siteAlerts.length === 0 && minorFactors.length > 0) {
      const assessment = {
        riskLevel: 25, // Low but non-zero risk level
        riskCategory: 'minor' as RiskCategory,
        primaryRiskFactors: minorFactors
      };
      console.log('RiskCalculator - Returning minor risk assessment:', assessment);
      return assessment;
    }

    // If no alerts and no minor factors, return low risk
    if (siteAlerts.length === 0) {
      const assessment = {
        riskLevel: 0,
        riskCategory: 'low' as RiskCategory,
        primaryRiskFactors: []
      };
      console.log('RiskCalculator - Returning low risk assessment:', assessment);
      return assessment;
    }

    // Calculate base risk from alert severity with adjusted scores
    const severityScores = {
      'Extreme': 100,
      'Severe': 75,
      'Moderate': 50,
      'Minor': 25,
      'Unknown': 15
    };

    // Calculate risk based on most severe alert and accumulate risk factors
    let maxSeverityScore = 0;
    const riskFactors: string[] = [...minorFactors]; // Include minor factors with alerts

    siteAlerts.forEach(alert => {
      const severityScore = severityScores[alert.severity as keyof typeof severityScores] || severityScores.Unknown;
      if (severityScore > maxSeverityScore) {
        maxSeverityScore = severityScore;
      }
      riskFactors.push(`${alert.event} (${alert.severity})`);
    });

    console.log('RiskCalculator - Max severity score:', maxSeverityScore);
    console.log('RiskCalculator - Risk factors:', riskFactors);

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

    console.log('RiskCalculator - Site type multiplier:', siteMultiplier);
    console.log('RiskCalculator - Final risk level:', finalRiskLevel);

    // Determine risk category based on final risk level with adjusted thresholds
    let riskCategory: RiskCategory;
    if (finalRiskLevel >= 80) riskCategory = 'extreme';
    else if (finalRiskLevel >= 60) riskCategory = 'severe';
    else if (finalRiskLevel >= 40) riskCategory = 'high';
    else if (finalRiskLevel >= 20) riskCategory = 'moderate';
    else if (finalRiskLevel > 0) riskCategory = 'minor';
    else riskCategory = 'low';

    const assessment = {
      riskLevel: finalRiskLevel,
      riskCategory,
      primaryRiskFactors: riskFactors
    };

    console.log('RiskCalculator - Final assessment:', assessment);
    return assessment;
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
      case 'minor':
        return 'text-blue-500 border-blue-500';
      default:
        return 'text-muted-foreground border-muted';
    }
  }
} 
