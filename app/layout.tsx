import { Geist } from "next/font/google";
import "./globals.css";
import ClientLayout from "@/components/client-layout";
import { ThemeProvider } from "next-themes";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Weather Shield - Real-time Weather Monitoring & Risk Management",
  description: "Protect your assets with Weather Shield's comprehensive weather monitoring, risk assessment, and real-time alerts for construction and outdoor projects.",
  keywords: "weather monitoring, risk management, construction safety, weather alerts, site protection",
  openGraph: {
    title: "Weather Shield - Real-time Weather Monitoring & Risk Management",
    description: "Protect your assets with Weather Shield's comprehensive weather monitoring, risk assessment, and real-time alerts for construction and outdoor projects.",
    url: defaultUrl,
    siteName: "Weather Shield",
    images: [
      {
        url: `${defaultUrl}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: "Weather Shield Dashboard Preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Weather Shield - Real-time Weather Monitoring & Risk Management",
    description: "Protect your assets with Weather Shield's comprehensive weather monitoring, risk assessment, and real-time alerts for construction and outdoor projects.",
    images: [`${defaultUrl}/og-image.jpg`],
  },
  robots: {
    index: true,
    follow: true,
  },
};

const geistSans = Geist({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist-sans",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={geistSans.className} suppressHydrationWarning>
      <body className="text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
            <ClientLayout>
              {children}
            </ClientLayout>
        </ThemeProvider>
      </body>
    </html>
  );
}
