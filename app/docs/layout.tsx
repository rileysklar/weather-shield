'use client';

import { ThemeProvider } from "next-themes";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileText, Home, Book, Cloud, Shield, ChevronDown } from "lucide-react";
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
    <div className="relative min-h-screen">
      <div className="container flex-1 items-start md:grid md:grid-cols-[220px_1fr] md:gap-6 lg:grid-cols-[240px_1fr] lg:gap-10">
        {/* Mobile Accordion */}
        <div className="block md:hidden my-6 rounded-lg overflow-hidden">
          <Accordion type="single" collapsible className="w-full">
            {sidebarItems.map((section) => (
              <AccordionItem key={section.title} value={section.title} className="border-none p-2 bg-background">
                <AccordionTrigger className="text-sm font-medium p-2">
                  {section.title}
                </AccordionTrigger>
                <AccordionContent>
                  <div className="grid grid-flow-row auto-rows-max text-sm gap-1 py-1">
                    {section.items.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="flex w-full items-center rounded-md px-2 py-1.5 hover:bg-accent hover:text-accent-foreground"
                      >
                        {item.title}
                      </Link>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* Desktop Sidebar */}
        <aside className="hidden md:block sticky top-14 h-[calc(100vh-3.5rem)] w-full shrink-0 overflow-y-auto border-r">
          <div className="relative overflow-hidden py-6 pr-6 lg:py-8">
            {sidebarItems.map((section) => (
              <div key={section.title} className="pb-8">
                <h4 className="mb-1 rounded-md px-2 py-1 text-sm font-medium">
                  {section.title}
                </h4>
                <div className="grid grid-flow-row auto-rows-max text-sm">
                  {section.items.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="group flex w-full items-center rounded-md border border-transparent px-2 py-1 hover:underline"
                    >
                      {item.title}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* Main content */}
        <main className="relative py-6 lg:gap-10 lg:py-8 xl:grid xl:grid-cols-[1fr_300px]">
          {children}
        </main>
      </div>
    </div>
  );
} 