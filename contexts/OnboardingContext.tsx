'use client';

import React, { createContext, useContext, useState } from 'react';

interface OnboardingContextType {
  isOnboardingOpen: boolean;
  hasCompletedOnboarding: boolean;
  setIsOnboardingOpen: (open: boolean) => void;
  setHasCompletedOnboarding: (completed: boolean) => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

  return (
    <OnboardingContext.Provider
      value={{
        isOnboardingOpen,
        hasCompletedOnboarding,
        setIsOnboardingOpen,
        setHasCompletedOnboarding,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
} 