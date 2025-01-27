import { ThemeSwitcher } from "@/components/theme-switcher";
import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import HeaderAuth from "@/components/header-auth";
import { hasEnvVars } from "@/utils/supabase/check-env-vars";
import { EnvVarWarning } from "@/components/env-var-warning";
import Link from "next/link";
import { Toaster } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { FileText, Menu, Home, Shield, PieChart, Map, HelpCircle } from "lucide-react";
import MobileNav from "@/components/mobile-nav";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { OnboardingButton } from "@/components/nav/onboarding-button";
import { OnboardingProvider } from "@/contexts/OnboardingContext";
import { OnboardingFlow } from "@/components/onboarding/onboarding-flow";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Weather Shield",
  description: "Your personal weather companion",
};

const geistSans = Geist({
  display: "swap",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={geistSans.className} suppressHydrationWarning>
      <body className="bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <OnboardingProvider>
            <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-200 via-gray-50/10 to-gray-200 dark:from-gray-900 dark:via-slate-800/20 dark:to-slate-900">
              <div className="absolute inset-0 bg-[url('/topo-dark.svg')] opacity-30 dark:opacity-90 bg-repeat" />
              
              <nav className="relative w-full flex justify-center border-b border-b-foreground/10 bg-transparent h-16 glass backdrop-blur-sm">
                <div className="w-full flex justify-between items-center p-3 px-6 text-sm">
                  <div className="flex gap-5 items-center font-semibold roboto">
                    <Link href="/home" className="text-xl black-ops flex flex-row gap-2"> <Shield className="h-6 w-6" />Weather Shield</Link>
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
                      <OnboardingButton />
                      <Link href="/protected">
                        <Button variant="ghost" size="sm" className="gap-2">
                          <PieChart className="h-4 w-4" />
                          Dashboard
                        </Button>
                      </Link>
                      <Link href="/map">
                        <Button variant="ghost" size="sm" className="gap-2">
                          <Map className="h-4 w-4" />
                          Map
                        </Button>
                      </Link>
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
                            <Link href="/protected">
                        <Button variant="ghost" size="sm" className="gap-2">
                          <PieChart className="h-4 w-4" />
                          Dashboard
                        </Button>
                      </Link>
                      <Link href="/map">
                        <Button variant="ghost" size="sm" className="gap-2">
                          <Map className="h-4 w-4" />
                          Map
                        </Button>
                      </Link>
                            <Link href="/docs">
                              <Button variant="ghost" size="sm" className="w-full justify-start gap-2">
                                <FileText className="h-4 w-4" />
                                Documentation
                              </Button>
                            </Link>
                            <OnboardingButton className="w-full justify-start" />
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

              {/* <MobileNav /> */}
              <div className="relative flex-1">
                {children}
              </div>
            </div>
            <OnboardingFlow />
            <Toaster />
          </OnboardingProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
