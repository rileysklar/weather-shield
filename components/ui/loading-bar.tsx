'use client';

import { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';

export function LoadingBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Start loading immediately on route change
    setLoading(true);
    setShow(true);

    // Set a longer timeout for the animation
    const loadingTimeout = setTimeout(() => {
      setLoading(false);
    }, 200);

    // Set a separate timeout for hiding the bar
    const hideTimeout = setTimeout(() => {
      setShow(false);
    }, 250);

    return () => {
      clearTimeout(loadingTimeout);
      clearTimeout(hideTimeout);
    };
  }, [pathname, searchParams]);

  if (!show) return null;

  return (
    <div className="absolute bottom-0 left-0 right-0 h-[8px] overflow-hidden">
      <div 
        className={cn(
          "h-full bg-blue-500/20 transition-opacity duration-100",
          loading ? "animate-loading-bar" : "opacity-0"
        )}
      />
    </div>
  );
} 
