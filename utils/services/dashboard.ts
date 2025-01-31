import { ProjectSiteService, WeatherData } from './project-site';
import { WeatherUpdateService } from './weather-update';
import { SiteType } from '@/types/site';

export interface DashboardSiteData {
  id: string;
  name: string;
  description: string | null;
  type: SiteType;
  coordinates: number[][];
  currentWeather: WeatherData | null;
  alerts: {
    count: number;
    highestSeverity: 'minor' | 'moderate' | 'severe' | 'extreme' | null;
  };
}

export class DashboardService {
  private projectSiteService: ProjectSiteService;
  private weatherUpdateService: WeatherUpdateService;

  constructor() {
    this.projectSiteService = new ProjectSiteService();
    this.weatherUpdateService = new WeatherUpdateService();
  }

  async getDashboardData(): Promise<DashboardSiteData[]> {
    try {
      // Get all project sites
      const sites = await this.projectSiteService.getProjectSites();
      
      // Get latest weather data for each site without updating
      const dashboardData = await Promise.all(
        sites.map(async (site) => {
          try {
            const latestWeather = await this.projectSiteService.getLatestWeatherData(site.id);
            
            // If weather data is more than 15 minutes old, trigger background update
            if (latestWeather?.timestamp && 
                new Date().getTime() - new Date(latestWeather.timestamp).getTime() > 15 * 60 * 1000) {
              this.weatherUpdateService.updateWeatherForSite(site).catch(console.error);
            }
            
            return {
              id: site.id,
              name: site.name,
              description: site.description,
              type: site.site_type,
              coordinates: site.coordinates as number[][],
              currentWeather: latestWeather,
              alerts: {
                count: Array.isArray(latestWeather?.alerts) ? latestWeather.alerts.length : 0,
                highestSeverity: latestWeather?.highest_alert_severity || null
              }
            };
          } catch (error) {
            console.error(`Error fetching data for site ${site.id}:`, error);
            return {
              id: site.id,
              name: site.name,
              description: site.description,
              type: site.site_type,
              coordinates: site.coordinates as number[][],
              currentWeather: null,
              alerts: {
                count: 0,
                highestSeverity: null
              }
            };
          }
        })
      );

      return dashboardData;
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      throw error;
    }
  }

  async getSiteWeatherHistory(siteId: string, days: number = 7): Promise<WeatherData[]> {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Get the weather history without updating
      const history = await this.projectSiteService.getWeatherHistory(siteId, startDate, endDate);

      // If the latest data is more than 15 minutes old, trigger a background update
      const latestData = history[history.length - 1];
      if (latestData?.timestamp && new Date().getTime() - new Date(latestData.timestamp).getTime() > 15 * 60 * 1000) {
        const site = await this.projectSiteService.getProjectSite(siteId);
        if (site) {
          this.weatherUpdateService.updateWeatherForSite(site).catch(console.error);
        }
      }

      return history;
    } catch (error) {
      console.error(`Error fetching weather history for site ${siteId}:`, error);
      throw error;
    }
  }
} 
