import { OnboardingFlow } from "@/components/onboarding/onboarding-flow";
import { useOnboarding } from "@/hooks/use-onboarding";
import { useEffect } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isOnboardingOpen, setIsOnboardingOpen, hasCompletedOnboarding, setHasCompletedOnboarding } = useOnboarding();

  useEffect(() => {
    if (!hasCompletedOnboarding) {
      setIsOnboardingOpen(true);
    }
  }, [hasCompletedOnboarding, setIsOnboardingOpen]);

  const handleOpenChange = (open: boolean) => {
    setIsOnboardingOpen(open);
    if (!open) {
      setHasCompletedOnboarding(true);
    }
  };

  return (
    <>
      <OnboardingFlow 
        open={isOnboardingOpen} 
        onOpenChange={handleOpenChange}
      />
      {children}
    </>
  );
} 