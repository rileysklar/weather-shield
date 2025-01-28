import { HeroSection } from "@/components/landing/hero-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { TestimonialsSection } from "@/components/landing/testimonials-section";
import { PricingSection } from "@/components/landing/pricing-section";
import { CTASection } from "@/components/landing/cta-section";
import { Heart, MapPin } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <HeroSection />
      <FeaturesSection />
      <TestimonialsSection />
      <PricingSection />
      <CTASection />
      
      <footer className="py-6 border-t border-border/10">
        <div className="container flex items-center justify-center gap-1 text-sm text-muted-foreground">
          Built by{" "}
          <Link 
            href="https://rileysklar.io" 
            target="_blank" 
            rel="noopener noreferrer"
            className="font-medium text-foreground hover:underline"
          >
            Riley Sklar
          </Link>{" "}
          with{" "}
          <Heart className="h-4 w-4 text-red-500 inline-block" />{" "}
          in{" "}
          <span className="flex items-center gap-1">
            Austin, Texas <MapPin className="h-4 w-4 inline-block" />
          </span>
        </div>
      </footer>
    </main>
  );
} 