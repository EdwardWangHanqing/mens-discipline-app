import { createContext, useContext, useMemo, useState, type Dispatch, type ReactNode, type SetStateAction } from 'react';

import type { OnboardingDraft } from '../screens/OnboardingFlow';
import type { ProgressSummary } from '../screens/MainExperience';
import { normalizeAccessState, type AccessState, type PaywallContext } from './accessState';

export type RootScreen = 'onboarding' | 'main' | 'account' | 'paywall' | 'legal' | 'developer';

export const initialDraft: OnboardingDraft = {
  nickname: '',
  goal: '',
  barrier: '',
  lockTime: '9:00 PM',
  selectedAppCount: 0,
  screenTimeConnected: false,
};

export const initialProgress: ProgressSummary = {
  sessions: 0,
  cycles: 0,
  momentumDays: 0,
  longestMomentum: 0,
  completedDates: [],
  skippedDates: [],
};

type AppShellState = {
  screen: RootScreen;
  setScreen: Dispatch<SetStateAction<RootScreen>>;
  accountMode: 'signUp' | 'signIn';
  setAccountMode: Dispatch<SetStateAction<'signUp' | 'signIn'>>;
  draft: OnboardingDraft;
  setDraft: Dispatch<SetStateAction<OnboardingDraft>>;
  progress: ProgressSummary;
  setProgress: Dispatch<SetStateAction<ProgressSummary>>;
  access: AccessState;
  setAccess: Dispatch<SetStateAction<AccessState>>;
  paywallContext: PaywallContext;
  setPaywallContext: Dispatch<SetStateAction<PaywallContext>>;
  onboardingStep: number;
  setOnboardingStep: Dispatch<SetStateAction<number>>;
};

const AppShellContext = createContext<AppShellState | null>(null);

export function AppShellProvider({ children }: { children: ReactNode }) {
  const [screen, setScreen] = useState<RootScreen>('onboarding');
  const [accountMode, setAccountMode] = useState<'signUp' | 'signIn'>('signUp');
  const [draft, setDraft] = useState(initialDraft);
  const [progress, setProgress] = useState(initialProgress);
  const [access, setAccess] = useState<AccessState>(() => normalizeAccessState());
  const [paywallContext, setPaywallContext] = useState<PaywallContext>('required');
  const [onboardingStep, setOnboardingStep] = useState(0);
  const value = useMemo(
    () => ({ screen, setScreen, accountMode, setAccountMode, draft, setDraft, progress, setProgress, access, setAccess, paywallContext, setPaywallContext, onboardingStep, setOnboardingStep }),
    [access, accountMode, draft, onboardingStep, paywallContext, progress, screen]
  );

  return <AppShellContext.Provider value={value}>{children}</AppShellContext.Provider>;
}

export function useAppShell() {
  const value = useContext(AppShellContext);
  if (!value) throw new Error('useAppShell must be used inside AppShellProvider.');
  return value;
}
