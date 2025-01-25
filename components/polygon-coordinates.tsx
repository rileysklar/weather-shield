'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { ScrollArea } from './ui/scroll-area';
import { Button } from './ui/button';
import { Trash2 } from 'lucide-react';
import type { PolygonCoordinates } from '@/utils/services/polygon';

interface PolygonCoordinatesProps {
  onClear?: () => void;
}

export function PolygonCoordinates({ onClear }: PolygonCoordinatesProps) {
  const [coordinates, setCoordinates] = useState<number[][]>([]);

  useEffect(() => {
    const handlePolygonCreated = (e: CustomEvent<PolygonCoordinates>) => {
      const coords = e.detail.geometry.coordinates[0];
      setCoordinates(coords);
    };

    const handlePolygonUpdated = (e: CustomEvent<PolygonCoordinates>) => {
      const coords = e.detail.geometry.coordinates[0];
      setCoordinates(coords);
    };

    const handlePolygonDeleted = () => {
      setCoordinates([]);
    };

    // Add event listeners
    window.addEventListener('polygon.created', handlePolygonCreated as EventListener);
    window.addEventListener('polygon.updated', handlePolygonUpdated as EventListener);
    window.addEventListener('polygon.deleted', handlePolygonDeleted);

    // Cleanup
    return () => {
      window.removeEventListener('polygon.created', handlePolygonCreated as EventListener);
      window.removeEventListener('polygon.updated', handlePolygonUpdated as EventListener);
      window.removeEventListener('polygon.deleted', handlePolygonDeleted);
    };
  }, []);

  if (coordinates.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Area Coordinates</CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClear}
          className="h-8 w-8 p-0"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[200px] w-full rounded-md border p-4">
          <div className="space-y-2">
            {coordinates.map((coord, index) => (
              <div key={index} className="text-sm">
                <span className="font-medium">Point {index + 1}:</span>
                <br />
                <span className="text-muted-foreground">
                  Lat: {coord[1].toFixed(6)}, Lng: {coord[0].toFixed(6)}
                </span>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
} 