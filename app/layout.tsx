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
import { FileText } from "lucide-react";

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
          <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-200 via-gray-50/10 to-gray-200 dark:from-gray-900 dark:via-slate-800/20 dark:to-slate-900">
            <div className="absolute inset-0 bg-[url('/topo-dark.svg')] opacity-30 dark:opacity-90 bg-repeat" />
            
            <nav className="relative w-full flex justify-center border-b border-b-foreground/10 bg-transparent h-16 glass backdrop-blur-sm">
              <div className="w-full flex justify-between items-center p-3 px-6 text-sm">
                <div className="flex gap-5 items-center font-semibold roboto">
                  <span className="text-xl black-ops">Weather Shield</span>
                  <Link href="/docs">
                    <Button variant="ghost" size="sm" className="gap-2">
                      <FileText className="h-4 w-4" />
                      Docs
                    </Button>
                  </Link>
                </div>
                <div className="flex items-center gap-4">
                  <ThemeSwitcher />
                  {!hasEnvVars ? <EnvVarWarning /> : <HeaderAuth />}
                </div>
              </div>
            </nav>
            
            <div className="relative flex-1">
              {children}
            </div>
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
