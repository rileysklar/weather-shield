'use client';

import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ProjectSite {
  id: string;
  name: string;
  description: string;
  type: string;
  coordinates: number[][];
}

interface ProjectSiteListProps {
  sites: ProjectSite[];
  onSelect?: (site: ProjectSite) => void;
}

export function ProjectSiteList({ sites, onSelect }: ProjectSiteListProps) {
  if (!sites.length) {
    return (
      <Card className="p-4">
        <p className="text-sm text-muted-foreground">No project sites created yet</p>
      </Card>
    );
  }

  return (
    <ScrollArea className="h-auto max-h-[300px]">
      <div className="space-y-2">
        {sites.map((site) => (
          <Card 
            key={site.id} 
            className="p-4 cursor-pointer hover:bg-accent transition-colors"
            onClick={() => onSelect?.(site)}
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">{site.name}</h4>
                <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded">
                  {site.type}
                </span>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {site.description}
              </p>
            </div>
          </Card>
        ))}
      </div>
    </ScrollArea>
  );
} 