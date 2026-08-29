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
import { AccountScreen, PaywallScreen, type AuthRequest, type AuthResult, type SubscriptionPlan } from '../screens/AccountAndPaywall';
import {
  InformationScreen,
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
import { DeveloperControls } from '../screens/DeveloperControls';
import { initialDraft, initialProgress, useAppShell } from '../state/appShell';
import {
  hasActiveEntitlement,
  normalizeAccessState,
  resolveAccessDestination,
  type AccessState,
} from '../state/accessState';
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
  const [pickerBusy, setPickerBusy] = useState(false);
  const [authorizationStatus, setAuthorizationStatus] = useState<FamilyControlsAuthorizationDisplayStatus>('checking');
  const [selectionRequiresReview, setSelectionRequiresReview] = useState(false);
  const [familyControlsMessage, setFamilyControlsMessage] = useState<string | null>(null);
  const [grace, setGrace] = useState<GraceState>(initialGraceState);
  const [access, setAccess] = useState<AccessState>(() => normalizeAccessState());
  const [legalPage, setLegalPage] = useState<'terms' | 'privacy'>('terms');
  const [developerReturnScreen, setDeveloperReturnScreen] = useState<'account' | 'paywall'>('account');
  const [hydrated, setHydrated] = useState(false);
  const [activeDateKey, setActiveDateKey] = useState(() => localDateKey(new Date()));
  const [movementCycle, setMovementCycle] = useState(() => createMovementCycle(localDateKey(new Date())));
  const [launchFinished, setLaunchFinished] = useState(false);
  const todayMovement = movementById(movementForCycle(movementCycle).id);
  const trainingAccessActive = access.authStatus === 'signedIn' && hasActiveEntitlement(access.entitlementStatus);
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
        access,
        movementCycle,
        selectionRequiresReview,
        dateKey: activeDateKey,
      })
    );
  }, [access, activeDateKey, dailyStatus, draft, grace, hydrated, movementCycle, progress, selectionRequiresReview]);

  useEffect(() => {
    if (!hydrated || Platform.OS !== 'ios') return;
    if (!trainingAccessActive) {
      void FamilyControls.cancelScheduledLocks().catch(() => undefined);
      return;
    }
    const parsed = parseLockTime(draft.lockTime);
    if (!parsed || !canScheduleAccountability({
      authorizationStatus,
      dailyStatus,
      selectedAppCount: draft.selectedAppCount,
      selectionRequiresReview,
      hasActiveTrainingEntitlement: true,
    })) return;
    void FamilyControls.scheduleDailyLock(parsed.hour, parsed.minute).catch(() => undefined);
  }, [authorizationStatus, dailyStatus, draft.lockTime, draft.selectedAppCount, hydrated, selectionRequiresReview, trainingAccessActive]);

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
          chooseApps={chooseApps}
          pickerBusy={pickerBusy}
          authorizationStatus={authorizationStatus}
          familyControlsMessage={familyControlsMessage}
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
          onCompletionContinue={() => setScreen('main')}
          onOpenAccount={() => {
            setAccountMode('signIn');
            setScreen('account');
          }}
          onOpenPaywall={() => {
            setAccountMode('signIn');
            setScreen(access.authStatus === 'signedIn' ? 'paywall' : 'account');
          }}
          onChooseApps={chooseApps}
          familyControlsStatus={authorizationStatus}
          familyControlsBusy={pickerBusy}
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
          onContinue={() => {
            const next = { ...access, authStatus: 'signedIn' as const };
            setAccess(next);
            setScreen(resolveAccessDestination(next));
          }}
          onAuthenticate={authenticate}
          onForgotPassword={requestPasswordReset}
          onBack={() => {
            if (trainingAccessActive) {
              setScreen('main');
              return;
            }
            setOnboardingStep(access.onboardingCompleted ? 4 : 0);
            setScreen('onboarding');
          }}
          onOpenDeveloperControls={__DEV__ ? () => openDeveloperControls('account') : undefined}
        />
      ) : null}
      {hydrated && screen === 'paywall' ? (
        <PaywallScreen
          onPurchase={purchaseSubscription}
          onRestore={restorePurchases}
          onOpenLegal={(page) => { setLegalPage(page); setScreen('legal'); }}
          onOpenDeveloperControls={__DEV__ ? () => openDeveloperControls('paywall') : undefined}
        />
      ) : null}
      {hydrated && screen === 'legal' ? (
        <InformationScreen page={legalPage} onBack={() => setScreen('paywall')} />
      ) : null}
      {hydrated && __DEV__ && screen === 'developer' ? (
        <DeveloperControls
          onboardingCompleted={access.onboardingCompleted}
          authStatus={access.authStatus}
          entitlementStatus={access.entitlementStatus}
          onBack={() => setScreen(developerReturnScreen)}
          onReset={resetLocalState}
          onRestartOnboarding={() => {
            setAccess(normalizeAccessState());
            setOnboardingStep(0);
          }}
          onMarkOnboardingComplete={() => setAccess((current) => ({ ...current, onboardingCompleted: true }))}
          onSetAuth={(authStatus) => setAccess((current) => ({ ...current, authStatus }))}
          onSetEntitlement={(entitlementStatus) => setAccess((current) => ({ ...current, entitlementStatus }))}
          onResolveRoute={() => setScreen(resolveAccessDestination(access))}
        />
      ) : null}
      {hydrated && !launchFinished ? (
        <BrandLaunchOverlay onReady={handleLaunchReady} onFinished={handleLaunchFinished} />
      ) : null}
    </SafeAreaProvider>
  );

  function advanceOnboarding() {
    if (onboardingStep < 4) {
      setOnboardingStep((step) => step + 1);
      return;
    }
    setDailyStatus('unrevealed');
    setTab('home');
    setAccess((current) => ({ ...current, onboardingCompleted: true }));
    setAccountMode('signUp');
    setScreen('account');
    void updateLockTime(draft.lockTime);
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
        if (parsed && access.onboardingCompleted && canScheduleAccountability({
          authorizationStatus: status,
          dailyStatus,
          selectedAppCount: count,
          selectionRequiresReview: false,
          hasActiveTrainingEntitlement: trainingAccessActive,
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
    if (!parsed || !canScheduleAccountability({
      authorizationStatus,
      dailyStatus,
      selectedAppCount: draft.selectedAppCount,
      selectionRequiresReview,
      hasActiveTrainingEntitlement: trainingAccessActive,
    })) return;
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
        access?: Partial<AccessState>;
        movementCycle?: MovementCycleState;
        selectionRequiresReview?: boolean;
        dateKey?: string;
      };
      const restoredAccess = normalizeAccessState(saved.access ?? { onboardingCompleted: saved.onboardingCompleted });
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
      setAccess(restoredAccess);
      setScreen(resolveAccessDestination(restoredAccess));
    } catch {
      // Corrupt local UI state falls back to the safe first-ever experience.
    } finally {
      setHydrated(true);
    }
  }

  function openDeveloperControls(returnScreen: 'account' | 'paywall') {
    setDeveloperReturnScreen(returnScreen);
    setScreen('developer');
  }

  function resetLocalState() {
    void AsyncStorage.removeItem(appStateStorageKey);
    void FamilyControls.cancelScheduledLocks().catch(() => undefined);
    setDraft(initialDraft);
    setProgress(initialProgress);
    setGrace(initialGraceState());
    setDailyStatus('unrevealed');
    setMovementCycle(createMovementCycle(localDateKey(new Date())));
    setSelectionRequiresReview(false);
    setFamilyControlsMessage(null);
    setAccess(normalizeAccessState());
    setOnboardingStep(0);
    setTab('home');
    setScreen('onboarding');
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

async function purchaseSubscription(_plan: SubscriptionPlan): Promise<AuthResult> {
  return {
    ok: false,
    error: 'App Store purchasing is not connected in this build. Use Debug Developer Controls to test entitlement routing.',
  };
}

async function restorePurchases(): Promise<AuthResult> {
  return {
    ok: false,
    error: 'Restore Purchases will activate when the StoreKit or RevenueCat entitlement adapter is connected.',
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
