import Map from "@/components/map";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function MapPage() {
  return (
    <div className="relative h-[100svh] w-screen overflow-hidden">
      <Map />
    </div>
  );
} 