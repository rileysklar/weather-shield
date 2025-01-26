'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Skeleton } from "@/components/ui/skeleton";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { FileText } from "lucide-react";
import Link from "next/link";

export default function DocsPage() {
  const [content, setContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/reference-file.md')
      .then(response => response.text())
      .then(text => {
        setContent(text);
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Error loading documentation:', error);
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <Skeleton className="h-8 w-64 mb-4" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-3/4 mb-2" />
        <Skeleton className="h-4 w-5/6" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="scroll-m-20 text-4xl font-bold tracking-tight">Documentation</h1>
        <p className="text-lg text-muted-foreground">
          Welcome to the Weather Shield documentation. Learn how to monitor weather conditions and manage risks for your construction sites.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="p-6 hover:shadow-lg transition-all">
          <FileText className="h-8 w-8 mb-4 text-blue-500" />
          <h3 className="font-semibold mb-2">Quick Start Guide</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Get up and running with Weather Shield in minutes.
          </p>
          <Link href="/docs/quick-start" className="text-sm text-blue-500 hover:underline">
            Learn more →
          </Link>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-all">
          <FileText className="h-8 w-8 mb-4 text-green-500" />
          <h3 className="font-semibold mb-2">Weather Monitoring</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Learn about real-time weather tracking and alerts.
          </p>
          <Link href="/docs/weather-monitoring" className="text-sm text-blue-500 hover:underline">
            Learn more →
          </Link>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-all">
          <FileText className="h-8 w-8 mb-4 text-purple-500" />
          <h3 className="font-semibold mb-2">API Reference</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Integrate Weather Shield into your applications.
          </p>
          <Link href="/docs/api/authentication" className="text-sm text-blue-500 hover:underline">
            Learn more →
          </Link>
        </Card>
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Latest Updates</h2>
        <div className="space-y-4">
          <div className="border-l-2 border-blue-500 pl-4">
            <h3 className="font-semibold">New Risk Assessment Algorithm</h3>
            <p className="text-sm text-muted-foreground">
              Improved accuracy in weather risk predictions for construction sites.
            </p>
            <span className="text-xs text-muted-foreground">March 15, 2024</span>
          </div>
          <div className="border-l-2 border-blue-500 pl-4">
            <h3 className="font-semibold">Enhanced Mobile Support</h3>
            <p className="text-sm text-muted-foreground">
              Better responsive design for on-site weather monitoring.
            </p>
            <span className="text-xs text-muted-foreground">March 10, 2024</span>
          </div>
        </div>
      </div>
    </div>
  );
} 