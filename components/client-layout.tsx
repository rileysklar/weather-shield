'use client';

import { createClient } from '@/utils/supabase/client';
import { useEffect, useState } from 'react';
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FileText, Home, Map, Menu, PieChart, Shield } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { OnboardingFlow } from "@/components/onboarding/onboarding-flow";
import { hasEnvVars } from "@/utils/supabase/check-env-vars";
import { EnvVarWarning } from "@/components/env-var-warning";
import HeaderAuth from "@/components/header-auth";
import { Toaster } from "@/components/ui/toaster";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
    };
    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-200 via-gray-50/10 to-gray-200 dark:from-gray-900 dark:via-slate-800/20 dark:to-slate-900">
      <div className="absolute inset-0 bg-[url('/topo-dark.svg')] opacity-30 dark:opacity-90 bg-repeat" />
      
      <nav className="relative w-full flex justify-center border-b border-b-foreground/10 bg-transparent h-16 glass backdrop-blur-sm">
        <div className="w-full flex justify-between items-center p-3 px-6 text-sm">
          <div className="flex gap-5 items-center font-semibold roboto">
            <Link href="/home" className="text-xl black-ops flex flex-row gap-2">
              <Shield className="h-6 w-6" />Weather Shield
            </Link>
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-4">
              <Link href="/home">
                <Button variant="ghost" size="sm" className="gap-2">
                  <Home className="h-4 w-4" />
                  Home
                </Button>
              </Link>
              <Link href="/docs">
                <Button variant="ghost" size="sm" className="gap-2">
                  <FileText className="h-4 w-4" />
                  Docs
                </Button>
              </Link>
              {isAuthenticated && (
                <>
                  <Link href="/protected">
                    <Button variant="ghost" size="sm" className="gap-2">
                      <PieChart className="h-4 w-4" />
                      Dashboard
                    </Button>
                  </Link>
                  <Link href="/protected/map">
                    <Button variant="ghost" size="sm" className="gap-2">
                      <Map className="h-4 w-4" />
                      Map
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4">
            {/* Desktop Controls */}
            <div className="hidden md:flex items-center gap-4">
              <ThemeSwitcher />
              {!hasEnvVars ? <EnvVarWarning /> : <HeaderAuth />}
            </div>
            {/* Mobile Menu */}
            <div className="md:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Menu</SheetTitle>
                  </SheetHeader>
                  <div className="flex justify-start flex-col gap-4 mt-4">
                    <Link href="/home">
                      <Button variant="ghost" size="sm" className="w-full justify-start gap-2">
                        <Home className="h-4 w-4" />
                        Home
                      </Button>
                    </Link>
                    {isAuthenticated && (
                      <>
                        <Link href="/protected">
                          <Button variant="ghost" size="sm" className="w-full justify-start gap-2">
                            <PieChart className="h-4 w-4" />
                            Dashboard
                          </Button>
                        </Link>
                        <Link href="/protected/map">
                          <Button variant="ghost" size="sm" className="w-full justify-start gap-2">
                            <Map className="h-4 w-4" />
                            Map
                          </Button>
                        </Link>
                      </>
                    )}
                    <Link href="/docs">
                      <Button variant="ghost" size="sm" className="w-full justify-start gap-2">
                        <FileText className="h-4 w-4" />
                        Documentation
                      </Button>
                    </Link>
                    <div className="flex items-center gap-2">
                      <ThemeSwitcher />
                      <span className="text-sm">Theme</span>
                    </div>
                    <div className="pt-2 border-t">
                      {!hasEnvVars ? <EnvVarWarning /> : <HeaderAuth />}
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </nav>

      <div className="relative flex-1">
        {children}
      </div>
      <OnboardingFlow />
      <Toaster />
    </div>
  );
} 