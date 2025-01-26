import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";
import Link from "next/link";

export function CTASection() {
  return (
    <section className="py-24 bg-blue-500 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('/topo-light.svg')] opacity-10" />
      
      <div className="container mx-auto px-4 relative">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <Shield className="h-16 w-16 mx-auto text-white/90" />
          
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white">
            Start Protecting Your Projects Today
          </h2>
          
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Join thousands of construction professionals who trust Weather Shield to keep their projects and teams safe from weather risks.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              size="lg"
              variant="secondary"
              className="text-blue-500 hover:text-blue-600 bg-white hover:bg-white/90 text-lg"
            >
              <Link href="/sign-up">Get Started for Free</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="text-white border-white hover:bg-white/10 text-lg"
            >
              <Link href="#pricing">View Pricing</Link>
            </Button>
          </div>
          
          <p className="text-sm text-white/80">
            No credit card required · 14-day free trial · Cancel anytime
          </p>
        </div>
      </div>
    </section>
  );
} 