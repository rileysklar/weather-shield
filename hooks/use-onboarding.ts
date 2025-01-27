import { create, StateCreator } from 'zustand';
import { persist, PersistOptions } from 'zustand/middleware';

interface OnboardingStore {
  hasCompletedOnboarding: boolean;
  isOnboardingOpen: boolean;
  setHasCompletedOnboarding: (completed: boolean) => void;
  setIsOnboardingOpen: (open: boolean) => void;
}

type OnboardingPersist = (
  config: StateCreator<OnboardingStore>,
  options: PersistOptions<OnboardingStore>
) => StateCreator<OnboardingStore>;

export const useOnboarding = create<OnboardingStore>()(
  (persist as OnboardingPersist)(
    (set: (partial: Partial<OnboardingStore> | ((state: OnboardingStore) => Partial<OnboardingStore>)) => void) => ({
      hasCompletedOnboarding: false,
      isOnboardingOpen: false,
      setHasCompletedOnboarding: (completed: boolean) => set({ hasCompletedOnboarding: completed }),
      setIsOnboardingOpen: (open: boolean) => set({ isOnboardingOpen: open }),
    }),
    {
      name: 'onboarding-storage',
    }
  )
); 
