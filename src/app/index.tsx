import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import AsyncStorage from '@react-native-async-storage/async-storage';

import FamilyControls from '../../modules/family-controls';
import { AccountScreen, PaywallScreen } from '../screens/AccountAndPaywall';
import {
  MainExperience,
  type DailyStatus,
  type MainTab,
  type ProgressSummary,
} from '../screens/MainExperience';
import {
  OnboardingFlow,
  type OnboardingDraft,
} from '../screens/OnboardingFlow';
import { colors } from '../theme/designSystem';

type RootScreen = 'onboarding' | 'main' | 'account' | 'paywall';
const appStateStorageKey = 'mens-discipline.app-state.v1';

const initialDraft: OnboardingDraft = {
  nickname: '',
  goal: '',
  barrier: '',
  lockTime: '9:00 PM',
  selectedAppCount: 0,
  screenTimeConnected: false,
};

const initialProgress: ProgressSummary = {
  sessions: 0,
  cycles: 0,
  momentumDays: 0,
  longestMomentum: 0,
  completedDates: [],
};

export default function AppExperience() {
  const [screen, setScreen] = useState<RootScreen>('onboarding');
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [draft, setDraft] = useState(initialDraft);
  const [tab, setTab] = useState<MainTab>('home');
  const [dailyStatus, setDailyStatus] = useState<DailyStatus>('unrevealed');
  const [accountMode, setAccountMode] = useState<'signUp' | 'signIn'>('signUp');
  const [authorizationBusy, setAuthorizationBusy] = useState(false);
  const [pickerBusy, setPickerBusy] = useState(false);
  const [progress, setProgress] = useState(initialProgress);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    void SystemUI.setBackgroundColorAsync(colors.canvas);
  }, []);

  useEffect(() => {
    void restoreLocalState();
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    void refreshSelection();
  }, [hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    void AsyncStorage.setItem(
      appStateStorageKey,
      JSON.stringify({
        draft,
        progress,
        dailyStatus,
        onboardingCompleted,
        dateKey: localDateKey(new Date()),
      })
    );
  }, [dailyStatus, draft, hydrated, onboardingCompleted, progress]);

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      {hydrated && screen === 'onboarding' ? (
        <OnboardingFlow
          step={onboardingStep}
          draft={draft}
          updateDraft={(patch) => setDraft((current) => ({ ...current, ...patch }))}
          goNext={advanceOnboarding}
          goBack={() => setOnboardingStep((step) => Math.max(0, step - 1))}
          onSignIn={() => {
            setAccountMode('signIn');
            setScreen('account');
          }}
          requestScreenTime={requestScreenTime}
          chooseApps={chooseApps}
          authorizationBusy={authorizationBusy}
          pickerBusy={pickerBusy}
        />
      ) : null}
      {hydrated && screen === 'main' ? (
        <MainExperience
          nickname={draft.nickname || 'Edward'}
          draft={draft}
          tab={tab}
          setTab={setTab}
          dailyStatus={dailyStatus}
          progress={progress}
          setDailyStatus={setDailyStatus}
          onFreeRoutineComplete={completeFreeRoutine}
          onOpenAccount={() => {
            setAccountMode('signIn');
            setScreen('account');
          }}
          onOpenPaywall={() => setScreen('paywall')}
          onResetOnboarding={() => {
            void AsyncStorage.removeItem(appStateStorageKey);
            setDraft(initialDraft);
            setProgress(initialProgress);
            setDailyStatus('unrevealed');
            setTab('home');
            setOnboardingCompleted(false);
            setOnboardingStep(0);
            setScreen('onboarding');
          }}
          onChooseApps={chooseApps}
          onSkipToday={() => {
            setDailyStatus('skipped');
            setProgress((current) => ({ ...current, momentumDays: 0 }));
          }}
        />
      ) : null}
      {hydrated && screen === 'account' ? (
        <AccountScreen
          mode={accountMode}
          setMode={setAccountMode}
          onContinue={() => setScreen('paywall')}
          onBack={() => setScreen(onboardingStep === 0 && !draft.nickname ? 'onboarding' : 'main')}
          onNotNow={() => setScreen('main')}
        />
      ) : null}
      {hydrated && screen === 'paywall' ? (
        <PaywallScreen onClose={() => setScreen('main')} onStartTrial={() => setScreen('main')} />
      ) : null}
    </SafeAreaProvider>
  );

  function advanceOnboarding() {
    if (onboardingStep < 10) {
      setOnboardingStep((step) => step + 1);
      return;
    }
    setDailyStatus('unrevealed');
    setTab('home');
    setOnboardingCompleted(true);
    setScreen('main');
  }

  async function requestScreenTime() {
    if (authorizationBusy) return;
    setAuthorizationBusy(true);
    try {
      const result = await FamilyControls.requestAuthorization();
      const connected = result.status === 'approved' || result.status === 'approvedWithDataAccess';
      setDraft((current) => ({ ...current, screenTimeConnected: connected }));
    } catch {
      setDraft((current) => ({ ...current, screenTimeConnected: false }));
    } finally {
      setAuthorizationBusy(false);
      setOnboardingStep((step) => (step === 8 ? 9 : step));
    }
  }

  async function chooseApps() {
    if (pickerBusy) return;
    setPickerBusy(true);
    try {
      const result = await FamilyControls.presentActivityPicker();
      if (result.outcome === 'saved') {
        const summary = result.selection;
        const count = summary.applicationCount + summary.categoryCount + summary.webDomainCount;
        setDraft((current) => ({ ...current, selectedAppCount: count }));
      }
    } catch {
      setDraft((current) => ({ ...current, selectedAppCount: current.selectedAppCount || 4 }));
    } finally {
      setPickerBusy(false);
    }
  }

  async function refreshSelection() {
    if (Platform.OS !== 'ios') return;
    try {
      const summary = await FamilyControls.getSelectionSummary();
      const count = summary.applicationCount + summary.categoryCount + summary.webDomainCount;
      if (count > 0) setDraft((current) => ({ ...current, selectedAppCount: count }));
    } catch {
      // The user-facing experience does not depend on a diagnostic refresh.
    }
  }

  function completeFreeRoutine() {
    void FamilyControls.completeRoutineToday().catch(() => undefined);
    setDailyStatus('completed');
    const dateKey = localDateKey(new Date());
    setProgress((current) => {
      if (current.completedDates.includes(dateKey)) return current;
      const sessions = current.sessions + 1;
      const momentumDays = current.momentumDays + 1;
      return {
        sessions,
        cycles: Math.floor(sessions / 7),
        momentumDays,
        longestMomentum: Math.max(current.longestMomentum, momentumDays),
        completedDates: [...current.completedDates, dateKey],
      };
    });
    setAccountMode('signUp');
    setScreen('account');
  }

  async function restoreLocalState() {
    try {
      const raw = await AsyncStorage.getItem(appStateStorageKey);
      if (!raw) return;
      const saved = JSON.parse(raw) as {
        draft?: Partial<OnboardingDraft>;
        progress?: Partial<ProgressSummary>;
        dailyStatus?: DailyStatus;
        onboardingCompleted?: boolean;
        dateKey?: string;
      };
      const completed = Boolean(saved.onboardingCompleted);
      setDraft({ ...initialDraft, ...saved.draft });
      setProgress({ ...initialProgress, ...saved.progress });
      setDailyStatus(saved.dateKey === localDateKey(new Date()) ? saved.dailyStatus ?? 'unrevealed' : 'unrevealed');
      setOnboardingCompleted(completed);
      setScreen(completed ? 'main' : 'onboarding');
    } catch {
      // Corrupt local UI state falls back to the safe first-ever experience.
    } finally {
      setHydrated(true);
    }
  }
}

function localDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
