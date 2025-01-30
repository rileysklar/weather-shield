import { Geist } from "next/font/google";
import "./globals.css";
import ClientLayout from "@/components/client-layout";
import { OnboardingProvider } from "@/contexts/OnboardingContext";
import { ThemeProvider } from "next-themes";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Weather Shield",
  description: "Your personal weather companion",
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
          <OnboardingProvider>
            <ClientLayout>
              {children}
            </ClientLayout>
          </OnboardingProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
