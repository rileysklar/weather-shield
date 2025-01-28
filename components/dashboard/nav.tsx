'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Map, LayoutDashboard, LogOut, Home, HelpCircle } from "lucide-react";
import { signOut } from "next-auth/react";
import { useOnboarding } from "@/hooks/use-onboarding";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export function DashboardNav() {
  const pathname = usePathname();
  const { setIsOnboardingOpen, setHasCompletedOnboarding } = useOnboarding();

  const handleStartOnboarding = () => {
    setHasCompletedOnboarding(false);
    setIsOnboardingOpen(true);
  };

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
          <Link href="/protected/map">
            <Button
              variant={pathname === '/protected/map' ? 'default' : 'ghost'}
              size="sm"
              className="gap-2"
            >
              <Map className="h-4 w-4" />
              Map View
            </Button>
          </Link>
          <Link href="/home">
            <Button
              variant={pathname === '/home' ? 'default' : 'ghost'}
              size="sm"
              className="gap-2"
            >
              <Home className="h-4 w-4" />
              Home
            </Button>
          </Link>
        </nav>
      </div>
      <div className="flex items-center gap-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="gap-2"
                onClick={handleStartOnboarding}
              >
                <HelpCircle className="h-4 w-4" />
                <span className="sr-only">Start Onboarding</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Start Onboarding</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
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
    </div>
  );
} 
