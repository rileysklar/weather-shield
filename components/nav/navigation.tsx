'use client';

import { ThemeSwitcher } from "@/components/theme-switcher";
import { hasEnvVars } from "@/utils/supabase/check-env-vars";
import { EnvVarWarning } from "@/components/env-var-warning";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileText, Menu, Home, HelpCircle } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import HeaderAuth from "@/components/header-auth";
import { useOnboarding } from "@/contexts/OnboardingContext";

export function Navigation() {
  const { setHasCompletedOnboarding, setIsOnboardingOpen } = useOnboarding();

  const handleStartOnboarding = () => {
    setHasCompletedOnboarding(false);
    setIsOnboardingOpen(true);
  };

  return (
    <nav className="relative w-full flex justify-center border-b border-b-foreground/10 bg-transparent h-16 glass backdrop-blur-sm">
      <div className="w-full flex justify-between items-center p-3 px-6 text-sm">
        <div className="flex gap-5 items-center font-semibold roboto">
          <Link href="/home" className="text-xl black-ops">Weather Shield</Link>
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
            <Button
              variant="ghost"
              size="sm"
              className="gap-2"
              onClick={handleStartOnboarding}
            >
              <HelpCircle className="h-4 w-4" />
              Onboarding
            </Button>
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
                <div className="flex flex-col gap-4 mt-4">
                  <Link href="/home">
                    <Button variant="ghost" size="sm" className="w-full justify-start gap-2">
                      <Home className="h-4 w-4" />
                      Home
                    </Button>
                  </Link>
                  <Link href="/docs">
                    <Button variant="ghost" size="sm" className="w-full justify-start gap-2">
                      <FileText className="h-4 w-4" />
                      Documentation
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start gap-2"
                    onClick={handleStartOnboarding}
                  >
                    <HelpCircle className="h-4 w-4" />
                    Onboarding
                  </Button>
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
  );
} 