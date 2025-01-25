import Map from "@/components/map";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function MapPage() {
  return (
    <>
      <div className="fixed top-4 left-4 z-[60]">
        {/* <Button asChild variant="outline" size="sm" className="bg-glass backdrop-blur-sm">
          <Link href="/protected">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button> */}
      </div>
      <Map />
    </>
  );
} 