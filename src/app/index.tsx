import { useCallback, useEffect, useState } from 'react';
import { AppState, Platform } from 'react-native';
import * as Linking from 'expo-linking';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import * as SplashScreen from 'expo-splash-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';

import FamilyControls, {
  type FamilyControlsAuthorizationDisplayStatus,
  type FamilyControlsAuthorizationStatus,
} from '../../modules/family-controls';
import { AccountScreen, PaywallScreen, type AuthRequest, type AuthResult } from '../screens/AccountAndPaywall';
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
import { movementById } from '../data/movements';
import {
  canReplaceTodayMovement,
  createMovementCycle,
  movementForCycle,
  normalizeMovementCycle,
  replaceTodayMovement,
  type MovementCycleState,
} from '../state/movementCycle';
import { BrandLaunchOverlay } from '../components/Brand';
import { initialDraft, initialProgress, useAppShell } from '../state/appShell';
import {
  canScheduleAccountability,
  chooseAppsAuthorizationAction,
  isFamilyControlsAuthorizationUsable,
} from '../state/familyControlsState';

void SplashScreen.preventAutoHideAsync();

const appStateStorageKey = 'mens-discipline.app-state.v1';

function initialGraceState(): GraceState {
  return createGraceBudget(localDateKey(new Date()));
}

export default function AppExperience() {
  const {
    accountMode,
    draft,
    progress,
    screen,
    setAccountMode,
    setDraft,
    setProgress,
    setScreen,
  } = useAppShell();
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [tab, setTab] = useState<MainTab>('home');
  const [dailyStatus, setDailyStatus] = useState<DailyStatus>('unrevealed');
  const [authorizationBusy, setAuthorizationBusy] = useState(false);
  const [pickerBusy, setPickerBusy] = useState(false);
  const [authorizationStatus, setAuthorizationStatus] = useState<FamilyControlsAuthorizationDisplayStatus>('checking');
  const [selectionRequiresReview, setSelectionRequiresReview] = useState(false);
  const [familyControlsMessage, setFamilyControlsMessage] = useState<string | null>(null);
  const [grace, setGrace] = useState<GraceState>(initialGraceState);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [activeDateKey, setActiveDateKey] = useState(() => localDateKey(new Date()));
  const [movementCycle, setMovementCycle] = useState(() => createMovementCycle(localDateKey(new Date())));
  const [launchFinished, setLaunchFinished] = useState(false);
  const todayMovement = movementById(movementForCycle(movementCycle).id);
  const handleLaunchReady = useCallback(() => {
    void SplashScreen.hideAsync();
  }, []);
  const handleLaunchFinished = useCallback(() => setLaunchFinished(true), []);

  const refreshSelectionSummary = useCallback(async () => {
    if (Platform.OS !== 'ios') return;
    try {
      const summary = await FamilyControls.getSelectionSummary();
      const count = summary.applicationCount + summary.categoryCount + summary.webDomainCount;
      setDraft((current) => ({ ...current, selectedAppCount: count }));
    } catch {
      // Authorization recovery remains available even when selection storage is unavailable.
    }
  }, [setDraft]);

  const applyAuthorizationStatus = useCallback(async (status: FamilyControlsAuthorizationStatus) => {
    setAuthorizationStatus(status);
    const connected = isFamilyControlsAuthorizationUsable(status);
    setDraft((current) => ({ ...current, screenTimeConnected: connected }));
    if (status === 'denied') {
      setSelectionRequiresReview(true);
      await FamilyControls.reconcileAuthorizationSafety().catch(() => undefined);
    }
    return connected;
  }, [setDraft]);

  const refreshFamilyControls = useCallback(async () => {
    if (Platform.OS !== 'ios') {
      setAuthorizationStatus('unknown');
      return false;
    }
    try {
      const sample = FamilyControls.getAuthorizationStatusDiagnostic();
      const connected = await applyAuthorizationStatus(sample.status);
      if (connected) await refreshSelectionSummary();
      return connected;
    } catch {
      setAuthorizationStatus('unknown');
      setDraft((current) => ({ ...current, screenTimeConnected: false }));
      return false;
    }
  }, [applyAuthorizationStatus, refreshSelectionSummary, setDraft]);

  useEffect(() => {
    void SystemUI.setBackgroundColorAsync(colors.canvas);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => void restoreLocalState(), 0);
    return () => clearTimeout(timer);
    // Local hydration intentionally runs once; the callback applies the saved snapshot.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const initialRefresh = setTimeout(() => void refreshFamilyControls(), 0);
    const authorizationSubscription = FamilyControls.addListener(
      'onAuthorizationStatusChanged',
      (sample) => void applyAuthorizationStatus(sample.status)
    );
    const appStateSubscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') void refreshFamilyControls();
    });
    return () => {
      clearTimeout(initialRefresh);
      authorizationSubscription.remove();
      appStateSubscription.remove();
    };
  }, [applyAuthorizationStatus, hydrated, refreshFamilyControls]);

  useEffect(() => {
    if (!hydrated) return;
    const reconcileDate = () => {
      const nextDateKey = localDateKey(new Date());
      if (nextDateKey === activeDateKey) return;
      setActiveDateKey(nextDateKey);
      setDailyStatus('unrevealed');
      setGrace(initialGraceState());
      setMovementCycle((current) => normalizeMovementCycle(current, nextDateKey));
      setProgress((current) => ({
        ...current,
        momentumDays: calculateCurrentMomentum(current.completedDates, new Date()),
      }));
    };
    const timer = setInterval(reconcileDate, 30_000);
    return () => clearInterval(timer);
  }, [activeDateKey, hydrated, setProgress]);

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
        movementCycle,
        selectionRequiresReview,
        dateKey: activeDateKey,
      })
    );
  }, [activeDateKey, dailyStatus, draft, grace, hydrated, movementCycle, onboardingCompleted, progress, selectionRequiresReview]);

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
          movement={todayMovement}
          canReplaceMovement={canReplaceTodayMovement(movementCycle)}
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
          onChooseApps={chooseApps}
          familyControlsStatus={authorizationStatus}
          familyControlsBusy={authorizationBusy || pickerBusy}
          familyControlsMessage={familyControlsMessage}
          selectionRequiresReview={selectionRequiresReview}
          onRefreshFamilyControls={refreshFamilyControls}
          onOpenFamilyControlsSettings={() => void Linking.openSettings()}
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
          onReplaceMovement={() => {
            setMovementCycle((current) => replaceTodayMovement(current));
            setDailyStatus('revealed');
          }}
        />
      ) : null}
      {hydrated && screen === 'account' ? (
        <AccountScreen
          mode={accountMode}
          setMode={setAccountMode}
          onContinue={() => setScreen('paywall')}
          onAuthenticate={authenticate}
          onForgotPassword={requestPasswordReset}
          onBack={() => setScreen(onboardingStep === 0 && !draft.nickname ? 'onboarding' : 'main')}
          onNotNow={() => setScreen('main')}
        />
      ) : null}
      {hydrated && screen === 'paywall' ? (
        <PaywallScreen onClose={() => setScreen('main')} onStartTrial={() => setScreen('main')} />
      ) : null}
      {hydrated && !launchFinished ? (
        <BrandLaunchOverlay onReady={handleLaunchReady} onFinished={handleLaunchFinished} />
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
    setFamilyControlsMessage(null);
    try {
      const result = await FamilyControls.requestAuthorization();
      const connected = await applyAuthorizationStatus(result.status);
      if (!connected && result.status === 'denied') {
        setFamilyControlsMessage('Screen Time access is off. You can enable it from iOS Settings.');
      }
    } catch {
      await refreshFamilyControls();
      setFamilyControlsMessage('Screen Time access was not enabled. You can continue training without Locks.');
    } finally {
      setAuthorizationBusy(false);
      setOnboardingStep((step) => (step === 8 ? 9 : step));
    }
  }

  async function chooseApps() {
    if (pickerBusy) return;
    setPickerBusy(true);
    setFamilyControlsMessage(null);
    try {
      let status = FamilyControls.getAuthorizationStatusDiagnostic().status;
      if (chooseAppsAuthorizationAction(status) === 'requestAuthorization') {
        const requested = await FamilyControls.requestAuthorization();
        status = requested.status;
      }
      const connected = await applyAuthorizationStatus(status);
      if (!connected) {
        setFamilyControlsMessage(
          status === 'denied'
            ? 'Screen Time access is off. Enable it in iOS Settings, then return to VAEL.'
            : 'Screen Time access is currently unavailable. Training remains available.'
        );
        return;
      }
      const result = await FamilyControls.presentActivityPicker();
      if (result.outcome === 'saved') {
        const summary = result.selection;
        const count = summary.applicationCount + summary.categoryCount + summary.webDomainCount;
        setDraft((current) => ({ ...current, selectedAppCount: count }));
        setSelectionRequiresReview(false);
        setFamilyControlsMessage(count > 0 ? null : 'No apps selected. Training still works without Locks.');
        const parsed = parseLockTime(draft.lockTime);
        if (parsed && onboardingCompleted && canScheduleAccountability({
          authorizationStatus: status,
          dailyStatus,
          selectedAppCount: count,
          selectionRequiresReview: false,
        })) {
          await FamilyControls.scheduleDailyLock(parsed.hour, parsed.minute).catch(() => undefined);
        }
      }
    } catch {
      await refreshFamilyControls();
      setFamilyControlsMessage('VAEL could not open app selection. Check Screen Time access and try again.');
    } finally {
      setPickerBusy(false);
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
    if (!parsed || !canScheduleAccountability({ authorizationStatus, dailyStatus, selectedAppCount: draft.selectedAppCount, selectionRequiresReview })) return;
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
        movementCycle?: MovementCycleState;
        selectionRequiresReview?: boolean;
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
      setMovementCycle(normalizeMovementCycle(saved.movementCycle, todayKey));
      setSelectionRequiresReview(Boolean(saved.selectionRequiresReview));
      setOnboardingCompleted(completed);
      setScreen(completed ? 'main' : 'onboarding');
    } catch {
      // Corrupt local UI state falls back to the safe first-ever experience.
    } finally {
      setHydrated(true);
    }
  }
}

async function authenticate(_request: AuthRequest): Promise<AuthResult> {
  return {
    ok: false,
    error: 'Authentication is ready for provider integration, but this build has no backend or Apple/Google credentials configured yet.',
  };
}

async function requestPasswordReset(_email: string): Promise<AuthResult> {
  return {
    ok: false,
    error: 'Password reset will activate when the VAEL authentication backend is connected.',
  };
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
