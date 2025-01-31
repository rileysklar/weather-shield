'use client';

import { ThemeProvider } from "next-themes";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileText, Home, Book, Map, Shield, ChevronDown } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const sidebarItems = [
  {
    title: "Getting Started",
    items: [
      { title: "Introduction", href: "/docs" },
      { title: "Quick Start", href: "/docs/quick-start" },
      { title: "Installation", href: "/docs/installation" },
    ],
  },
  {
    title: "Features",
    items: [
      { title: "Weather Monitoring", href: "/docs/weather-monitoring" },
      { title: "Risk Assessment", href: "/docs/risk-assessment" },
      { title: "Site Management", href: "/docs/site-management" },
    ],
  },
];

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="container mx-auto py-8">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-[250px_1fr]">
        <aside className=" md:block">
          <nav className="sticky top-20 space-y-6">
            <div className="flex items-center space-x-2">
              <Book className="h-6 w-6" />
              <h2 className="text-lg font-semibold">Documentation</h2>
            </div>
            <Accordion type="single" collapsible defaultValue="Getting Started" className="space-y-2">
              {sidebarItems.map((section) => (
                <AccordionItem key={section.title} value={section.title} className="border-none">
                  <AccordionTrigger className="py-2 hover:no-underline">
                    <span className="text-sm font-semibold">{section.title}</span>
                  </AccordionTrigger>
                  <AccordionContent className="pb-2">
                    <div className="flex flex-col space-y-1">
                      {section.items.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={cn(
                            "text-sm text-muted-foreground hover:text-foreground hover:bg-accent rounded-md px-3 py-2 transition-colors",
                          )}
                        >
                          {item.title}
                        </Link>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
            <div className="space-y-2">
              <Button variant="outline" asChild className="w-full justify-start">
                <Link href="/home" className="flex items-center space-x-2">
                  <Home className="h-4 w-4" />
                  <span>Back to Home</span>
                </Link>
              </Button>
              <Button variant="outline" asChild className="w-full justify-start">
                <Link href="/protected" className="flex items-center space-x-2">
                  <Shield className="h-4 w-4" />
                  <span>Dashboard</span>
                </Link>
              </Button>
              <Button variant="outline" asChild className="w-full justify-start">
                <Link href="/protected/map" className="flex items-center space-x-2">
                  <Map className="h-4 w-4" />
                  <span>Map</span>
                </Link>
              </Button>
            </div>
          </nav>
        </aside>
        <main className="prose dark:prose-invert max-w-none">{children}</main>
      </div>
    </div>
  );
} 