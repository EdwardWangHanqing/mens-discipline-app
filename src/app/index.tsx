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
  type GraceState,
  type MainTab,
  type ProgressSummary,
} from '../screens/MainExperience';
import {
  OnboardingFlow,
  type OnboardingDraft,
} from '../screens/OnboardingFlow';
import { colors } from '../theme/designSystem';
import { calculateCurrentMomentum, createGraceBudget } from '../state/dailyState';

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
  skippedDates: [],
};

function initialGraceState(): GraceState {
  return createGraceBudget(localDateKey(new Date()));
}

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
  const [grace, setGrace] = useState<GraceState>(initialGraceState);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [activeDateKey, setActiveDateKey] = useState(() => localDateKey(new Date()));

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
    const reconcileDate = () => {
      const nextDateKey = localDateKey(new Date());
      if (nextDateKey === activeDateKey) return;
      setActiveDateKey(nextDateKey);
      setDailyStatus('unrevealed');
      setGrace(initialGraceState());
      setProgress((current) => ({
        ...current,
        momentumDays: calculateCurrentMomentum(current.completedDates, new Date()),
      }));
    };
    const timer = setInterval(reconcileDate, 30_000);
    return () => clearInterval(timer);
  }, [activeDateKey, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    void AsyncStorage.setItem(
      appStateStorageKey,
      JSON.stringify({
        draft,
        progress,
        grace,
        dailyStatus,
        onboardingCompleted,
        dateKey: activeDateKey,
      })
    );
  }, [activeDateKey, dailyStatus, draft, grace, hydrated, onboardingCompleted, progress]);

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
          grace={grace}
          setGrace={setGrace}
          setDailyStatus={setDailyStatus}
          onRoutineCompleted={completeRoutine}
          onCompletionContinue={() => {
            setAccountMode('signUp');
            setScreen('account');
          }}
          onOpenAccount={() => {
            setAccountMode('signIn');
            setScreen('account');
          }}
          onOpenPaywall={() => setScreen('paywall')}
          onResetOnboarding={() => {
            void AsyncStorage.removeItem(appStateStorageKey);
            setDraft(initialDraft);
            setProgress(initialProgress);
            setGrace(initialGraceState());
            setDailyStatus('unrevealed');
            setTab('home');
            setOnboardingCompleted(false);
            setOnboardingStep(0);
            setScreen('onboarding');
          }}
          onChooseApps={chooseApps}
          onSkipToday={() => {
            setDailyStatus('skipped');
            const dateKey = localDateKey(new Date());
            setProgress((current) => ({
              ...current,
              momentumDays: 0,
              skippedDates: current.skippedDates.includes(dateKey)
                ? current.skippedDates
                : [...current.skippedDates, dateKey],
            }));
          }}
          onUpdateLockTime={updateLockTime}
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
    void updateLockTime(draft.lockTime);
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

  function completeRoutine() {
    void FamilyControls.completeRoutineToday().catch(() => undefined);
    setDailyStatus('completed');
    const dateKey = localDateKey(new Date());
    setProgress((current) => {
      if (current.completedDates.includes(dateKey)) return current;
      const sessions = current.sessions + 1;
      const completedDates = [...current.completedDates, dateKey];
      const momentumDays = calculateCurrentMomentum(completedDates, new Date());
      return {
        sessions,
        cycles: Math.floor(sessions / 7),
        momentumDays,
        longestMomentum: Math.max(current.longestMomentum, momentumDays),
        completedDates,
        skippedDates: current.skippedDates.filter((date) => date !== dateKey),
      };
    });
  }

  async function updateLockTime(lockTime: string) {
    setDraft((current) => ({ ...current, lockTime }));
    const parsed = parseLockTime(lockTime);
    if (!parsed || !draft.screenTimeConnected || draft.selectedAppCount === 0) return;
    await FamilyControls.scheduleDailyLock(parsed.hour, parsed.minute).catch(() => undefined);
  }

  async function restoreLocalState() {
    try {
      const raw = await AsyncStorage.getItem(appStateStorageKey);
      if (!raw) return;
      const saved = JSON.parse(raw) as {
        draft?: Partial<OnboardingDraft>;
        progress?: Partial<ProgressSummary>;
        grace?: GraceState;
        dailyStatus?: DailyStatus;
        onboardingCompleted?: boolean;
        dateKey?: string;
      };
      const completed = Boolean(saved.onboardingCompleted);
      setDraft({ ...initialDraft, ...saved.draft });
      const restoredProgress = { ...initialProgress, ...saved.progress };
      setProgress({
        ...restoredProgress,
        momentumDays: calculateCurrentMomentum(restoredProgress.completedDates, new Date()),
      });
      const todayKey = localDateKey(new Date());
      setGrace(saved.grace?.dateKey === todayKey ? saved.grace : initialGraceState());
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

function parseLockTime(value: string) {
  const match = /^(\d{1,2}):(\d{2})\s(AM|PM)$/.exec(value);
  if (!match) return null;
  const [, rawHour, rawMinute, meridiem] = match;
  let hour = Number(rawHour) % 12;
  if (meridiem === 'PM') hour += 12;
  return { hour, minute: Number(rawMinute) };
}

function localDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
