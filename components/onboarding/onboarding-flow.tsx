'use client';

import { 
  Dialog, 
  DialogContent, 
  DialogTitle,
  DialogDescription,
  DialogHeader
} from "@/components/ui/dialog";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useState } from "react";

const steps = [
  {
    title: "Welcome to Weather Shield",
    description: "Let's get you set up with everything you need to protect your assets from weather risks.",
  },
  {
    title: "Create Your First Project Site",
    description: "Add a project site by drawing a polygon on the map to define your area of interest.",
  },
  {
    title: "Monitor Weather Risks",
    description: "Get real-time alerts and insights about weather conditions affecting your sites.",
  }
];

export function OnboardingFlow() {
  const { isOnboardingOpen, setIsOnboardingOpen, setHasCompletedOnboarding } = useOnboarding();
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep === steps.length - 1) {
      setHasCompletedOnboarding(true);
      setIsOnboardingOpen(false);
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleSkip = () => {
    setHasCompletedOnboarding(true);
    setIsOnboardingOpen(false);
  };

  return (
    <Dialog open={isOnboardingOpen} onOpenChange={setIsOnboardingOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{steps[currentStep].title}</DialogTitle>
          <DialogDescription>
            {steps[currentStep].description}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6">
          <Progress value={(currentStep + 1) / steps.length * 100} />

          <div className="flex justify-between">
            <Button variant="ghost" onClick={handleSkip}>
              Skip
            </Button>
            <Button onClick={handleNext}>
              {currentStep === steps.length - 1 ? "Get Started" : "Next"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 
