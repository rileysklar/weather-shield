import Map from "@/components/map";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

// Force dynamic rendering to prevent static build errors
export const dynamic = 'force-dynamic';

export default function MapPage() {
  return (
    <div className="relative h-[calc(100svh-64px)] w-screen overflow-hidden">
      <Map />
    </div>
  );
} 