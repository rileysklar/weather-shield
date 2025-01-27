# Site Management

Learn how to effectively manage your project sites in Weather Shield, from creation to monitoring and maintenance.

## Site Types

Weather Shield supports various types of energy production sites, each with specific monitoring needs:

```typescript
type ProjectSiteType = 
  | 'solar_array'    // 1.2x weather sensitivity
  | 'wind_farm'      // 1.3x weather sensitivity
  | 'hydroelectric'  // 1.1x weather sensitivity
  | 'coal'          // 0.9x weather sensitivity
  | 'natural_gas'   // 0.9x weather sensitivity
  | 'nuclear'       // 0.8x weather sensitivity
  | 'geothermal'    // 0.9x weather sensitivity
  | 'biomass'       // 0.9x weather sensitivity
  | 'other';        // 1.0x weather sensitivity
```

## Creating Sites

### Using the Map Interface

1. Click "Project Site Map" in the dashboard
2. Enter drawing mode using the polygon tool
3. Click to place boundary points
4. Double-click to complete the polygon

```typescript
interface ProjectSite {
  id: string;
  name: string;
  description: string;
  type: ProjectSiteType;
  coordinates: number[][]; // [longitude, latitude] pairs
  user_id: string;
}
```

### Required Information

- Site Name
- Site Type
- Location (drawn polygon)
- Description (optional)

### Best Practices

1. **Accurate Boundaries**
   - Include all equipment
   - Follow property lines
   - Mark access points

2. **Descriptive Names**
   - Location-based naming
   - Unique identifiers
   - Consistent format

3. **Complete Information**
   - Detailed descriptions
   - Accurate site type
   - Contact information

## Managing Sites

### Site Dashboard

The site dashboard provides:
- Current weather conditions
- Risk assessment
- Active alerts
- Historical data

### Editing Sites

```typescript
interface SiteUpdate {
  name?: string;
  description?: string;
  type?: ProjectSiteType;
  coordinates?: number[][];
}

// Example site update
const updateSite = async (siteId: string, updates: SiteUpdate) => {
  try {
    const result = await projectSiteService.updateProjectSite(siteId, updates);
    return result;
  } catch (error) {
    console.error('Error updating site:', error);
    throw error;
  }
};
```

### Site Statistics

View important site metrics:
- Weather patterns
- Risk history
- Alert frequency
- Downtime events

## Site Organization

### Filtering and Sorting

```typescript
interface SiteFilters {
  riskLevel: RiskCategory[];
  weatherConditions: string[];
  alertStatus: 'active' | 'none';
  siteType: ProjectSiteType[];
}
```

### Grouping Options

- By risk level
- By site type
- By region
- By alert status

## Site Monitoring

### Dashboard Views

1. **Overview**
   - All sites status
   - Risk distribution
   - Active alerts

2. **Detailed View**
   - Individual site metrics
   - Historical data
   - Trend analysis

### Alert Configuration

```typescript
interface SiteAlertConfig {
  site_id: string;
  thresholds: {
    temperature: {
      min: number;
      max: number;
    };
    wind_speed: number;
    precipitation: number;
  };
  notifications: {
    email: boolean;
    sms: boolean;
    webhook: string[];
  };
}
```

## Data Management

### Export Options

1. **Site Data**
```typescript
interface ExportConfig {
  sites: string[];
  dateRange: {
    start: Date;
    end: Date;
  };
  format: 'CSV' | 'JSON' | 'PDF';
  metrics: string[];
}
```

2. **Bulk Operations**
```typescript
interface BulkOperation {
  operation: 'export' | 'update' | 'delete';
  sites: string[];
  options?: Record<string, any>;
}
```

### Import Options

```typescript
interface ImportConfig {
  format: 'CSV' | 'JSON' | 'KML';
  options: {
    skipDuplicates: boolean;
    updateExisting: boolean;
    validateData: boolean;
  };
}
```

## Site Security

### Access Control

```typescript
interface SitePermissions {
  view: boolean;
  edit: boolean;
  delete: boolean;
  manage_alerts: boolean;
  export_data: boolean;
}

interface SiteRole {
  name: string;
  permissions: SitePermissions;
}
```

### Audit Trail

Track all site changes:
- Creation date
- Modifications
- Access logs
- Alert history

## Best Practices

### Site Setup

1. **Location Accuracy**
   - Precise boundaries
   - Correct coordinates
   - Clear markers

2. **Data Quality**
   - Complete information
   - Regular updates
   - Verified contacts

3. **Alert Configuration**
   - Appropriate thresholds
   - Correct notification paths
   - Regular testing

### Maintenance

1. **Regular Reviews**
   - Verify site details
   - Update contacts
   - Check configurations

2. **Data Cleanup**
   - Archive old data
   - Remove duplicates
   - Update outdated info

3. **Performance Checks**
   - Monitor response times
   - Verify data accuracy
   - Test integrations

## Troubleshooting

### Common Issues

1. **Site Creation Problems**
   - Invalid coordinates
   - Missing required fields
   - Duplicate names

2. **Update Failures**
   - Permission issues
   - Invalid data
   - Network errors

3. **Data Sync Issues**
   - Cache problems
   - API timeouts
   - Database errors

## Next Steps

- [Weather Monitoring](/docs/weather-monitoring)
- [Risk Assessment](/docs/risk-assessment)
- [API Documentation](/docs/api/endpoints)
