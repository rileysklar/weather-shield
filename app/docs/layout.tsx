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
    <div className="container mx-auto py-8">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-[250px_1fr]">
        <aside className="hidden md:block">
          {/* Sidebar content can be added here */}
        </aside>
        <main>{children}</main>
      </div>
    </div>
  );
} 