import { createClient } from '@/lib/supabase/client';
import { Database } from '@/lib/supabase/database.types';

export type ProjectSite = Database['public']['Tables']['project_sites']['Row'];
export type ProjectSiteInsert = Database['public']['Tables']['project_sites']['Insert'];

export interface WeatherData {
  id: string;
  project_site_id: string;
  timestamp: string;
  temperature: number | null;
  feels_like: number | null;
  humidity: number | null;
  pressure: number | null;
  wind_speed: number | null;
  wind_direction: number | null;
  clouds_percentage: number | null;
  visibility: number | null;
  weather_condition: string | null;
  weather_description: string | null;
  forecast_periods: any | null;
  alerts: any | null;
  has_active_alerts: boolean;
  highest_alert_severity: 'minor' | 'moderate' | 'severe' | 'extreme' | null;
  data_source: 'openweather' | 'weathergov';
  raw_response: any;
}

export class ProjectSiteService {
  private supabase = createClient();

  async createProjectSite(data: Omit<ProjectSite, 'id' | 'created_at' | 'updated_at'>) {
    const { data: site, error } = await this.supabase
      .from('project_sites')
      .insert([data])
      .select()
      .single();

    if (error) throw error;
    return site;
  }

  async getProjectSites() {
    const { data: sites, error } = await this.supabase
      .from('project_sites')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return sites;
  }

  async getProjectSite(id: string) {
    const { data: site, error } = await this.supabase
      .from('project_sites')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return site;
  }

  async updateProjectSite(id: string, updates: Partial<Omit<ProjectSite, 'id' | 'created_at' | 'updated_at'>>) {
    const { data: site, error } = await this.supabase
      .from('project_sites')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return site;
  }

  async deleteProjectSite(id: string) {
    const { error } = await this.supabase
      .from('project_sites')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  async createWeatherData(data: Omit<WeatherData, 'id' | 'timestamp'>) {
    const { data: weatherData, error } = await this.supabase
      .from('weather_data')
      .insert([data])
      .select()
      .single();

    if (error) throw error;
    return weatherData;
  }

  async getLatestWeatherData(projectSiteId: string) {
    const { data: weatherData, error } = await this.supabase
      .from('weather_data')
      .select('*')
      .eq('project_site_id', projectSiteId)
      .order('timestamp', { ascending: false })
      .limit(1)
      .single();

    if (error) throw error;
    return weatherData;
  }

  async getWeatherHistory(projectSiteId: string, startDate: Date, endDate: Date) {
    const { data: weatherData, error } = await this.supabase
      .from('weather_data')
      .select('*')
      .eq('project_site_id', projectSiteId)
      .gte('timestamp', startDate.toISOString())
      .lte('timestamp', endDate.toISOString())
      .order('timestamp', { ascending: true });

    if (error) throw error;
    return weatherData;
  }

  async getActiveAlerts(projectSiteId: string) {
    const { data: weatherData, error } = await this.supabase
      .from('weather_data')
      .select('*')
      .eq('project_site_id', projectSiteId)
      .eq('has_active_alerts', true)
      .order('timestamp', { ascending: false })
      .limit(1)
      .single();

    if (error) throw error;
    return weatherData;
  }

  async downloadProjectSites(): Promise<string> {
    const supabase = createClient();
    const { data: sites, error } = await supabase
      .from('project_sites')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) throw error;

    const jsonData = JSON.stringify(sites, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    return URL.createObjectURL(blob);
  }

  async uploadProjectSites(file: File): Promise<void> {
    const supabase = createClient();
    
    try {
      const jsonContent = await file.text();
      const sites = JSON.parse(jsonContent) as ProjectSite[];
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Get existing sites for this user
      const { data: existingSites } = await supabase
        .from('project_sites')
        .select('name')
        .eq('user_id', user.id);

      const existingNames = new Set(existingSites?.map(site => site.name) || []);

      // Filter out duplicates and prepare sites for insertion
      const sitesToInsert = sites
        .filter(site => !existingNames.has(site.name))
        .map(site => ({
          name: site.name,
          description: site.description,
          site_type: site.site_type,
          coordinates: site.coordinates,
          center_point: site.center_point,
          user_id: user.id,
          // Don't include id, created_at, or updated_at - let Supabase handle these
        }));

      if (sitesToInsert.length === 0) {
        console.log('No new sites to insert');
        return;
      }

      // Insert new sites
      const { error: insertError } = await supabase
        .from('project_sites')
        .insert(sitesToInsert);

      if (insertError) {
        console.error('Insert error:', insertError);
        throw insertError;
      }
    } catch (error) {
      console.error('Error uploading project sites:', error);
      throw error;
    }
  }

  async getSiteTypes() {
    const { data, error } = await this.supabase
      .from('project_sites')
      .select('site_type')
      .limit(1);

    if (error) throw error;
    return ['solar_array', 'wind_farm', 'hydroelectric', 'coal', 'natural_gas', 'nuclear', 'geothermal', 'biomass', 'other'];
  }
} 