import { ProjectSite } from '@/types/project-site';

export interface NOAAAlert {
  id: string;
  areaDesc: string;
  messageType: string;
  severity: string;
  certainty: string;
  urgency: string;
  event: string;
  headline: string;
  description: string;
  instruction: string;
  response: string;
  parameters: {
    NWSheadline: string[];
    [key: string]: string[];
  };
  references: Array<{
    id: string;
    identifier: string;
    sender: string;
    sent: string;
  }>;
  sent: string;
  effective: string;
  onset: string;
  expires: string;
  ends: string;
  status: string;
  category: string;
}

export interface ProcessedAlert {
  id: string;
  event: string;
  headline: string;
  description: string;
  severity: string;
  urgency: string;
  areas: string[];
  instruction?: string;
  expires: string;
  status: string;
}

export class NOAAService {
  private static readonly BASE_URL = typeof window !== 'undefined' ? window.location.origin : '';

  private static severityMap: { [key: string]: string } = {
    'Extreme': 'Extreme',
    'Severe': 'Severe',
    'Moderate': 'Moderate',
    'Minor': 'Minor',
    'Unknown': 'Unknown'
  };

  private static urgencyMap: { [key: string]: string } = {
    'Immediate': 'Take action immediately',
    'Expected': 'Take action soon',
    'Future': 'Take action in the near future',
    'Past': 'No action needed',
    'Unknown': 'Unknown urgency'
  };

  static async getAlertsForSite(site: { coordinates: number[][] }): Promise<ProcessedAlert[]> {
    try {
      console.log('NOAAService - Fetching alerts for site coordinates:', site.coordinates);
      
      // Get the center point of the polygon for the alert area
      const centerLat = site.coordinates.reduce((sum: number, coord: number[]) => sum + coord[1], 0) / site.coordinates.length;
      const centerLng = site.coordinates.reduce((sum: number, coord: number[]) => sum + coord[0], 0) / site.coordinates.length;

      console.log('NOAAService - Using base URL:', this.BASE_URL);
      const response = await fetch(`${this.BASE_URL}/api/alerts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lat: centerLat,
          lon: centerLng
        }),
        cache: 'no-store'
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('NOAAService - Error response:', {
          status: response.status,
          statusText: response.statusText,
          text: errorText
        });
        throw new Error(`Failed to fetch alerts: ${errorText}`);
      }

      const data = await response.json();
      console.log('NOAAService - Raw alert data:', data);

      const alerts: NOAAAlert[] = data.alerts || [];
      const processedAlerts = this.processAlerts(alerts);
      console.log('NOAAService - Processed alerts:', processedAlerts);

      return processedAlerts;
    } catch (error) {
      console.error('Error fetching alerts:', error);
      return [];
    }
  }

  static async getAllSiteAlerts(sites: ProjectSite[]): Promise<ProcessedAlert[]> {
    try {
      const allAlerts = await Promise.all(
        sites.map(site => this.getAlertsForSite(site))
      );

      // Flatten and deduplicate alerts
      const flatAlerts = allAlerts.flat();
      const uniqueAlerts = this.deduplicateAlerts(flatAlerts);

      return uniqueAlerts;
    } catch (error) {
      console.error('Error fetching all site alerts:', error);
      return [];
    }
  }

  private static processAlerts(alerts: NOAAAlert[]): ProcessedAlert[] {
    return alerts.map(alert => ({
      id: alert.id,
      event: alert.event,
      headline: alert.headline,
      description: alert.description,
      severity: this.severityMap[alert.severity] || alert.severity,
      urgency: this.urgencyMap[alert.urgency] || alert.urgency,
      areas: alert.areaDesc.split(';').map(area => area.trim()),
      instruction: alert.instruction,
      expires: new Date(alert.expires).toLocaleString(),
      status: alert.status
    }));
  }

  private static deduplicateAlerts(alerts: ProcessedAlert[]): ProcessedAlert[] {
    const uniqueAlerts = new Map<string, ProcessedAlert>();

    alerts.forEach(alert => {
      const key = `${alert.event}-${alert.headline}`;
      if (!uniqueAlerts.has(key)) {
        uniqueAlerts.set(key, alert);
      } else {
        // If we have a duplicate, merge the areas
        const existing = uniqueAlerts.get(key)!;
        existing.areas = Array.from(new Set([...existing.areas, ...alert.areas]));
      }
    });

    return Array.from(uniqueAlerts.values());
  }
} 
