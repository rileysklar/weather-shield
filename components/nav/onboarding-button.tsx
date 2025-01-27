'use client';

import { Button } from "@/components/ui/button";
import { HelpCircle } from "lucide-react";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { cn } from "@/lib/utils";

export function OnboardingButton({ className }: { className?: string }) {
  const { setHasCompletedOnboarding, setIsOnboardingOpen } = useOnboarding();

  const handleStartOnboarding = () => {
    setHasCompletedOnboarding(false);
    setIsOnboardingOpen(true);
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      className={cn("gap-2", className)}
      onClick={handleStartOnboarding}
    >
      <HelpCircle className="h-4 w-4" />
      Onboarding
    </Button>
  );
} 