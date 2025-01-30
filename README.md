# Weather Shield

A comprehensive weather monitoring and risk assessment platform for construction and solar projects.

## Features

### Project Site Management
- Create and manage multiple project sites
- Draw custom polygons on map to define site boundaries
- Categorize sites by type (Solar Array, Construction, etc.)
- Import/Export project sites as JSON

### Weather Monitoring
- Real-time weather data from NOAA Weather API
- Detailed weather forecasts with temperature and wind conditions
- Interactive temperature charts
- Historical weather data tracking

### Risk Assessment
- Automated risk level assessment for each site
- Weather alerts and warnings
- Site-specific risk indicators
- Real-time monitoring and updates

### Dashboard
- Comprehensive overview of all project sites
- Site filtering and search capabilities
- Weather history visualization
- Risk assessment summaries

### Interactive Map
- Visual representation of all project sites
- Draw and edit site boundaries
- Weather overlay capabilities
- Location-based weather data

## Tech Stack
- Next.js 14 with App Router
- TypeScript
- Tailwind CSS
- shadcn/ui Components
- SWR for data fetching
- Framer Motion for animations
- Mapbox for mapping features

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Mapbox API key
- NOAA Weather API access

### Installation
1. Clone the repository
```bash
git clone https://github.com/yourusername/weather-shield.git
cd weather-shield
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp .env.example .env.local
```
Fill in your API keys and configuration in `.env.local`

4. Run the development server
```bash
npm run dev
```

### Environment Variables
```
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token
NEXT_PUBLIC_WEATHER_API_KEY=your_weather_api_key
DATABASE_URL=your_database_url
```

## Deployment

### Deploying to Vercel

1. Push your code to a GitHub repository
2. Visit [Vercel](https://vercel.com) and sign up/login with your GitHub account
3. Click "Add New Project"
4. Import your GitHub repository
5. Configure the following environment variables in Vercel's dashboard:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   NEXT_PUBLIC_OPENWEATHER_API_KEY=your-openweather-api-key
   NEXT_PUBLIC_MAPBOX_TOKEN=your-mapbox-token
   AUTH_SECRET=your-auth-secret-key
   ```
6. Click "Deploy"

Your application will be automatically built and deployed. Vercel will provide you with a production URL where your app is accessible.

### Environment Variables Setup

1. Development: Copy `.env.example` to `.env.local` and fill in your values
2. Production: Add the same variables in your Vercel project settings
3. Make sure to keep your `.env.local` file private and never commit it to the repository

### Post-Deployment Checks

1. Verify Supabase connection
2. Test weather data fetching
3. Confirm map functionality
4. Check authentication flow
5. Verify all API integrations

## Usage

### Creating a Project Site
1. Navigate to the Map View
2. Click "Create Project Site"
3. Draw a polygon on the map
4. Fill in site details
5. Save the project site

### Monitoring Weather
1. Select a project site
2. View current conditions
3. Check the forecast
4. Monitor risk levels

### Managing Sites
- Use the dashboard to view all sites
- Filter sites by type or risk level
- Export/Import site data
- Edit site details as needed

## Contributing
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License
This project is licensed under the MIT License - see the LICENSE file for details.
