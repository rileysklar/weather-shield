import { Json } from './supabase';

export type SiteType = 
  | 'solar_array'
  | 'wind_farm'
  | 'hydroelectric'
  | 'coal'
  | 'natural_gas'
  | 'nuclear'
  | 'geothermal'
  | 'biomass'
  | 'other';

export interface ProjectSite {
  id: string;
  name: string;
  description: string | null;
  site_type: SiteType;
  coordinates: number[][];
  center_point: unknown;
  created_at: string | null;
  updated_at: string | null;
  user_id: string;
} 
