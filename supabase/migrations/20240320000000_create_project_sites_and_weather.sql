-- Create enum for project site types
CREATE TYPE project_site_type AS ENUM (
  'solar_array',
  'wind_farm',
  'hydroelectric',
  'coal',
  'natural_gas',
  'nuclear',
  'geothermal',
  'biomass',
  'other'
);

-- Create enum for weather alert severity
CREATE TYPE weather_alert_severity AS ENUM (
  'minor',
  'moderate',
  'severe',
  'extreme'
);

-- Create the project_sites table
CREATE TABLE project_sites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  name TEXT NOT NULL,
  description TEXT,
  site_type project_site_type NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  -- Store the polygon coordinates as GeoJSON
  coordinates JSONB NOT NULL CHECK (jsonb_typeof(coordinates) = 'array'),
  center_point POINT NOT NULL -- Stored as (longitude, latitude)
);

-- Create the weather_data table
CREATE TABLE weather_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_site_id UUID NOT NULL REFERENCES project_sites(id) ON DELETE CASCADE,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Current conditions (OpenWeather)
  temperature DECIMAL,
  feels_like DECIMAL,
  humidity INTEGER,
  pressure INTEGER,
  wind_speed DECIMAL,
  wind_direction INTEGER,
  clouds_percentage INTEGER,
  visibility INTEGER,
  weather_condition TEXT,
  weather_description TEXT,
  
  -- Forecast data (Weather.gov)
  forecast_periods JSONB, -- Store detailed forecast periods
  
  -- Weather alerts and warnings
  alerts JSONB, -- Store active weather alerts
  has_active_alerts BOOLEAN DEFAULT FALSE,
  highest_alert_severity weather_alert_severity,
  
  -- Additional metadata
  data_source TEXT NOT NULL, -- 'openweather' or 'weathergov'
  raw_response JSONB -- Store complete API response for reference
);

-- Create indexes for better query performance
CREATE INDEX idx_project_sites_user ON project_sites(user_id);
CREATE INDEX idx_weather_data_project ON weather_data(project_site_id);
CREATE INDEX idx_weather_data_timestamp ON weather_data(timestamp);
CREATE INDEX idx_weather_active_alerts ON weather_data(has_active_alerts) WHERE has_active_alerts = TRUE;

-- Create a function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create a trigger to automatically update updated_at
CREATE TRIGGER update_project_sites_updated_at
    BEFORE UPDATE ON project_sites
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add RLS (Row Level Security) policies
ALTER TABLE project_sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE weather_data ENABLE ROW LEVEL SECURITY;

-- Create policies for project_sites
CREATE POLICY "Users can view their own project sites"
  ON project_sites FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own project sites"
  ON project_sites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own project sites"
  ON project_sites FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own project sites"
  ON project_sites FOR DELETE
  USING (auth.uid() = user_id);

-- Create policies for weather_data
CREATE POLICY "Users can view weather data for their project sites"
  ON weather_data FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM project_sites
    WHERE project_sites.id = weather_data.project_site_id
    AND project_sites.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert weather data for their project sites"
  ON weather_data FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM project_sites
    WHERE project_sites.id = weather_data.project_site_id
    AND project_sites.user_id = auth.uid()
  ));

CREATE POLICY "Users can update weather data for their project sites"
  ON weather_data FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM project_sites
    WHERE project_sites.id = weather_data.project_site_id
    AND project_sites.user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM project_sites
    WHERE project_sites.id = weather_data.project_site_id
    AND project_sites.user_id = auth.uid()
  )); 