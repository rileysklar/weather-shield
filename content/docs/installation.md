# Installation Guide

This guide will walk you through setting up Weather Shield for development or production use.

## Prerequisites

Before you begin, ensure you have:

- Node.js 18.x or later
- npm or yarn package manager
- Git (for version control)
- A Supabase account
- An OpenWeather API key (optional, for fallback weather data)

## Environment Setup

1. Clone the repository:

```bash
git clone https://github.com/your-username/weather-shield.git
cd weather-shield
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# OpenWeather API Configuration (used as fallback when Weather.gov is unavailable)
NEXT_PUBLIC_OPENWEATHER_API_KEY=your_openweather_api_key

# Optional: Vercel URL (for production deployments)
VERCEL_URL=
```

## Database Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)

2. Run the database migrations:

```sql
-- Create project sites table
CREATE TABLE project_sites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  coordinates JSONB NOT NULL,
  type TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id)
);

-- Create weather data table
CREATE TABLE weather_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_site_id UUID REFERENCES project_sites(id),
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  temperature DECIMAL,
  wind_speed DECIMAL,
  conditions TEXT
);
```

## Development Server

Start the development server:

```bash
npm run dev
# or
yarn dev
```

Visit [http://localhost:3000](http://localhost:3000) to see your application.

## Production Deployment

### Deploying to Vercel

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Configure environment variables in Vercel dashboard
4. Deploy!

```bash
vercel --prod
```

### Manual Deployment

Build the application:

```bash
npm run build
npm start
# or
yarn build
yarn start
```

## Configuration Options

### Weather Data Sources

Weather Shield uses Weather.gov as the primary data source with OpenWeather as a fallback:

```typescript
// Example weather service configuration
const weatherConfig = {
  primary: {
    service: 'weather.gov',
    rateLimit: '60 requests/minute'
  },
  fallback: {
    service: 'openweather',
    requiresKey: true,
    rateLimit: '60 requests/minute'
  }
};
```

### Risk Assessment Configuration

Customize risk thresholds in `utils/services/risk-calculator.ts`:

```typescript
const riskThresholds = {
  extreme: 80,
  severe: 60,
  high: 40,
  moderate: 20,
  minor: 1
};
```

## Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Verify Supabase credentials
   - Check database permissions
   - Ensure RLS policies are configured

2. **Weather Data Issues**
   - Validate API keys
   - Check rate limits
   - Verify location coordinates

3. **Authentication Problems**
   - Clear browser cache
   - Check Supabase authentication settings
   - Verify email configuration

## Next Steps

- [Quick Start Guide](/docs/quick-start)
- [API Documentation](/docs/api/authentication)
- [Weather Monitoring](/docs/weather-monitoring)
