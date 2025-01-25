'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Map, LayoutDashboard, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <div className="flex items-center justify-between p-4 border-b">
      <div className="flex items-center gap-6">
        <Link href="/protected" className="font-semibold text-lg">
          Weather Shield
        </Link>
        <nav className="flex items-center gap-4">
          <Link href="/protected">
            <Button
              variant={pathname === '/protected' ? 'default' : 'ghost'}
              size="sm"
              className="gap-2"
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Button>
          </Link>
          <Link href="/map">
            <Button
              variant={pathname === '/map' ? 'default' : 'ghost'}
              size="sm"
              className="gap-2"
            >
              <Map className="h-4 w-4" />
              Map View
            </Button>
          </Link>
        </nav>
      </div>
      <Button
        variant="ghost"
        size="sm"
        className="gap-2"
        onClick={() => signOut()}
      >
        <LogOut className="h-4 w-4" />
        Sign Out
      </Button>
    </div>
  );
} 
