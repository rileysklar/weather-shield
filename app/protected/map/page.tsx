'use client';

import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import Map from '@/components/map';

export default function MapPage() {
  return (
    <div className="relative h-[calc(100svh-64px)] w-screen overflow-hidden">
      <Suspense fallback={
        <div className="relative h-[calc(100svh-64px)] w-screen overflow-hidden">
          <Skeleton className="h-full w-full" />
        </div>
      }>
        <Map />
      </Suspense>
    </div>
  );
} 