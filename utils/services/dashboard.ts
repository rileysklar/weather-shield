import { ProjectSiteService } from './project-site';
import { WeatherData } from '@/types/weather';
import { WeatherUpdateService } from './weather-update';

export interface DashboardSiteData {
  id: string;
  name: string;
  description: string | null;
  type: string;
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
      
      // Update weather data for all sites
      await this.weatherUpdateService.updateAllSites();
      
      // Get latest weather data for each site
      const dashboardData = await Promise.all(
        sites.map(async (site) => {
          try {
            const latestWeather = await this.projectSiteService.getLatestWeatherData(site.id);
            
            return {
              id: site.id,
              name: site.name,
              description: site.description,
              type: site.type,
              currentWeather: latestWeather,
              alerts: {
                count: latestWeather?.alerts?.length || 0,
                highestSeverity: latestWeather?.highest_alert_severity || null
              }
            };
          } catch (error) {
            console.error(`Error fetching data for site ${site.id}:`, error);
            return {
              id: site.id,
              name: site.name,
              description: site.description,
              type: site.type,
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
      // Update weather data for this site first
      const site = await this.projectSiteService.getProjectSite(siteId);
      if (site) {
        await this.weatherUpdateService.updateWeatherForSite(site);
      }

      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      return await this.projectSiteService.getWeatherHistory(siteId, startDate, endDate);
    } catch (error) {
      console.error(`Error fetching weather history for site ${siteId}:`, error);
      throw error;
    }
  }
} 
