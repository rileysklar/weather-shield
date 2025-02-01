Weather Shield is a sophisticated web application that helps organizations monitor and assess weather-related risks for their project sites across the United States. The platform combines interactive mapping, real-time weather data, and comprehensive risk assessment tools to provide actionable insights for asset protection.

Core Features

✅ Interactive Map Interface
- Dynamic Map Navigation: Pan, zoom, and explore project sites across the United States
- Site Visualization:
  - Project sites displayed with custom polygons
  - Color-coded based on risk level and alert status
  - Site names and current weather conditions always visible
  - Active weather alerts displayed with severity indicators

✅ Project Site Management
- Site Types Support:
  - Solar Arrays (1.2x weather sensitivity)
  - Wind Farms (1.3x weather sensitivity)
  - Hydroelectric (1.1x weather sensitivity)
  - Coal (0.9x weather sensitivity)
  - Natural Gas (0.9x weather sensitivity)
  - Nuclear (0.8x weather sensitivity)
  - Geothermal (0.9x weather sensitivity)
  - Biomass (0.9x weather sensitivity)
- Site Creation:
  - Interactive polygon drawing tool
  - Custom site naming and description
  - Automatic coordinate capture and center point calculation
- Site Editing:
  - Update site names, types, and descriptions
  - Immediate UI updates across all components
- Site Deletion:
  - Remove sites with confirmation
  - Automatic cleanup of associated weather data

✅ Weather Monitoring
- Real-time Weather Data:
  - Temperature readings (current and feels like)
  - Wind speed and direction measurements
  - Cloud cover percentage
  - Visibility conditions
  - Detailed weather descriptions
- Multi-source Weather Data:
  - Weather.gov integration
  - OpenWeather fallback support
  - Automatic source selection based on availability
- Weather Statistics:
  - Average and maximum temperatures
  - Average and maximum wind speeds
  - Site-wide weather trends

✅ Risk Assessment
- Comprehensive Risk Analysis:
  - Five-level risk categorization (Minor, Moderate, High, Severe, Extreme)
  - Customized risk thresholds:
    - Extreme: ≥80 risk score
    - Severe: ≥60 risk score
    - High: ≥40 risk score
    - Moderate: ≥20 risk score
    - Minor: >0 risk score
- Site-specific Risk Factors:
  - Hail risk assessment for solar panels
  - Wind speed impact on equipment
  - Cloud cover effect on generation
  - Precipitation interference
  - Temperature extremes
- Risk Visualization:
  - Color-coded risk indicators
  - Interactive risk factor charts
  - Historical risk trends
  - Site type-specific risk multipliers

✅ Alert Management
- Alert Processing:
  - Real-time NOAA alert integration
  - Geographical alert matching
  - Severity classification
  - Multi-site alert correlation
- Alert Features:
  - Configurable alert preferences
  - Filter by severity levels
  - Location-based alert matching
  - Expandable alert details
- Alert Statistics:
  - Total active alerts count
  - Sites affected by alerts
  - Highest severity tracking
  - Alert duration monitoring

✅ Dashboard Interface
- Site Overview:
  - Paginated site listings
  - Grouping by risk level
  - Quick site selection
  - Detailed site information cards
- Weather Statistics:
  - Fleet-wide weather trends
  - Site-specific weather data
  - Statistical analysis tools
- Risk Assessment Views:
  - Risk factor breakdown
  - Site vulnerability analysis
  - Historical risk patterns
- Progressive Loading:
  - Component-based loading states
  - Optimized data fetching
  - Smooth loading transitions

✅ Technical Implementation
- Built with Next.js and React
- TypeScript for type safety
- Tailwind CSS for styling
- Real-time data updates
- Responsive design
- Error handling and fallbacks
- Multiple weather data source support
- Geographical coordinate processing

🚧 To Do:
1. Fix search bar click handling in map view
2. Add loading states for weather data fetching
3. Improve empty state UX with better skeleton loading
4. Add error boundaries for failed weather data fetches
5. Implement better mobile responsiveness for map controls
6. Add tooltips for risk indicators
7. Implement data caching for better performance
8. Add export functionality for weather data
9. Implement batch operations for site management
10. Add site comparison feature
