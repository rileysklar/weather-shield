export interface ProjectSite {
  id: string;
  name: string;
  description: string;
  type: string;
  coordinates: number[][];
}

export interface ProjectSiteUpdateInput {
  name?: string;
  description?: string;
  type?: string;
  coordinates?: number[][];
} 