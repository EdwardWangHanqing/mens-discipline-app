import { useCallback, useEffect, useRef, useState } from 'react';
import {
  AppState,
  type AppStateStatus,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import FamilyControls, {
  type FamilyControlsAuthorizationDisplayStatus,
  type FamilyControlsAuthorizationSample,
  type FamilyControlsAuthorizationStatus,
  type FamilyControlsSelectionSummary,
  type FamilyControlsShieldState,
  type ScheduledLockState,
} from '../../modules/family-controls';
import {
  GUIDED_ROUTINE_SET_COUNT,
  advanceRoutine,
  createInitialRoutineState,
  interruptRoutine,
  isTimedRoutinePhase,
  markAccountabilityFailed,
  markAccountabilitySucceeded,
  remainingPhaseMs,
  representativeMovementSpecification,
  retryAccountability,
  startRoutine,
} from '../training/guidedRoutineEngine';
const jsModuleInitializedAtMs = Date.now();
const authorizationRetryDelaysMs = [0, 100, 200, 400, 800, 1_000, 1_500];

function formatError(error: unknown): string {
  if (error instanceof Error) {
    return `${error.name}: ${error.message}`;
  }

  return String(error);
}

type AuthorizationDiagnostic = {
  status: FamilyControlsAuthorizationDisplayStatus;
  errorMessage: string | null;
  lastSample: FamilyControlsAuthorizationSample | null;
  checkingStartedAtMs: number | null;
  resolvedAtMs: number | null;
  resolutionDurationMs: number | null;
  timeline: string[];
};

const initialAuthorizationDiagnostic: AuthorizationDiagnostic = {
  status: 'checking',
  errorMessage: null,
  lastSample: null,
  checkingStartedAtMs: null,
  resolvedAtMs: null,
  resolutionDurationMs: null,
  timeline: [],
};

function formatTimestamp(timestampMs: number | null): string {
  return timestampMs === null
    ? 'pending'
    : new Date(timestampMs).toISOString();
}

function isResolvedAuthorizationStatus(
  status: FamilyControlsAuthorizationStatus
): boolean {
  return status !== 'notDetermined' && status !== 'unknown';
}

function wait(delayMs: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, delayMs));
}

function routinePhaseLabel(
  phase: ReturnType<typeof createInitialRoutineState>['phase']
): string {
  switch (phase) {
    case 'idle':
      return 'Ready';
    case 'demonstration':
      return 'Demonstration';
    case 'countdown':
      return 'Countdown';
    case 'guidedSet':
      return 'Guided set';
    case 'rest':
      return '20-second rest';
    case 'awaitingAccountability':
      return 'Saving completion + unlocking';
    case 'completionFailed':
      return 'Completion write failed';
    case 'completed':
      return 'Routine completed today';
  }
}

export default function HomeScreen() {
  const [routineState, setRoutineState] = useState(createInitialRoutineState);
  const [routineWasAlreadyCompletedToday, setRoutineWasAlreadyCompletedToday] =
    useState<boolean | null>(null);
  const [diagnostic, setDiagnostic] = useState(
    initialAuthorizationDiagnostic
  );
  const [isRequesting, setIsRequesting] = useState(false);
  const [selectionSummary, setSelectionSummary] =
    useState<FamilyControlsSelectionSummary | null>(null);
  const [shieldState, setShieldState] =
    useState<FamilyControlsShieldState | null>(null);
  const [isLoadingFamilyActivityState, setIsLoadingFamilyActivityState] =
    useState(true);
  const [isPresentingPicker, setIsPresentingPicker] = useState(false);
  const [isRunningShieldAction, setIsRunningShieldAction] = useState(false);
  const [scheduledLockState, setScheduledLockState] =
    useState<ScheduledLockState | null>(null);
  const [dailyLockHour, setDailyLockHour] = useState('21');
  const [dailyLockMinute, setDailyLockMinute] = useState('00');
  const [isRunningScheduledLockAction, setIsRunningScheduledLockAction] =
    useState(false);
  const [scheduledLockErrorMessage, setScheduledLockErrorMessage] =
    useState<string | null>(null);
  const [lastPickerOutcome, setLastPickerOutcome] = useState<
    'saved' | 'cancelled' | null
  >(null);
  const [familyActivityErrorMessage, setFamilyActivityErrorMessage] =
    useState<string | null>(null);
  const [authorizationSafetyMessage, setAuthorizationSafetyMessage] =
    useState<string | null>(null);
  const authorizationCheckGeneration = useRef(0);
  const authorizationCheckingStartedAtMs = useRef<number | null>(null);
  const latestResolvedAuthorizationStatus =
    useRef<FamilyControlsAuthorizationStatus | null>(null);
  const appState = useRef<AppStateStatus>(AppState.currentState);
  const lastRoutineTickAtMs = useRef<number | null>(null);
  const routineCompletionRequestKey = useRef<string | null>(null);

  const recordAuthorizationTimeline = useCallback((message: string) => {
    const timestampMs = Date.now();
    const entry = `${new Date(timestampMs).toISOString()} ${message}`;
    console.info(`[FamilyControlsDiagnostic] ${entry}`);
    setDiagnostic((current) => ({
      ...current,
      timeline: [...current.timeline, entry].slice(-12),
    }));
  }, []);

  const resolveAuthorizationSample = useCallback(
    (
      sample: FamilyControlsAuthorizationSample,
      checkingStartedAtMs: number
    ) => {
      const resolvedAtMs = Date.now();
      authorizationCheckGeneration.current += 1;
      latestResolvedAuthorizationStatus.current = sample.status;
      if (
        sample.status === 'approved' ||
        sample.status === 'approvedWithDataAccess'
      ) {
        setAuthorizationSafetyMessage(null);
      }
      setDiagnostic((current) => ({
        ...current,
        status: sample.status,
        errorMessage: null,
        lastSample: sample,
        checkingStartedAtMs,
        resolvedAtMs,
        resolutionDurationMs: resolvedAtMs - checkingStartedAtMs,
      }));
      recordAuthorizationTimeline(
        `resolved status=${sample.status} source=${sample.source} ` +
          `durationMs=${resolvedAtMs - checkingStartedAtMs}`
      );
    },
    [recordAuthorizationTimeline]
  );

  const runAuthorizationCheck = useCallback(
    async (reason: string) => {
      latestResolvedAuthorizationStatus.current = null;
      const generation = authorizationCheckGeneration.current + 1;
      authorizationCheckGeneration.current = generation;
      const checkingStartedAtMs = Date.now();
      authorizationCheckingStartedAtMs.current = checkingStartedAtMs;
      let lastSample: FamilyControlsAuthorizationSample | null = null;

      setDiagnostic((current) => ({
        ...current,
        status: 'checking',
        errorMessage: null,
        checkingStartedAtMs,
        resolvedAtMs: null,
        resolutionDurationMs: null,
      }));
      recordAuthorizationTimeline(
        `check-start reason=${reason} jsAppState=${appState.current}`
      );

      for (const delayMs of authorizationRetryDelaysMs) {
        if (delayMs > 0) {
          await wait(delayMs);
        }
        if (authorizationCheckGeneration.current !== generation) {
          return;
        }

        const readStartedAtMs = Date.now();
        recordAuthorizationTimeline(
          `native-read-start delayMs=${delayMs} at=${readStartedAtMs}`
        );

        try {
          const sample = FamilyControls.getAuthorizationStatusDiagnostic();
          lastSample = sample;
          recordAuthorizationTimeline(
            `native-read-result status=${sample.status} ` +
              `source=${sample.source} nativeAppState=${sample.applicationState} ` +
              `roundTripMs=${Date.now() - readStartedAtMs}`
          );

          setDiagnostic((current) => ({
            ...current,
            lastSample: sample,
          }));

          if (
            sample.applicationState === 'active' &&
            isResolvedAuthorizationStatus(sample.status)
          ) {
            resolveAuthorizationSample(sample, checkingStartedAtMs);
            return;
          }
        } catch (error) {
          if (authorizationCheckGeneration.current !== generation) {
            return;
          }
          const errorMessage = formatError(error);
          recordAuthorizationTimeline(`native-read-error ${errorMessage}`);
          setDiagnostic((current) => ({
            ...current,
            status: 'unknown',
            errorMessage,
          }));
          return;
        }
      }

      if (
        authorizationCheckGeneration.current === generation &&
        lastSample?.applicationState === 'active'
      ) {
        resolveAuthorizationSample(lastSample, checkingStartedAtMs);
      }
    },
    [recordAuthorizationTimeline, resolveAuthorizationSample]
  );

  const refreshAuthorizationStatus = useCallback(() => {
    void runAuthorizationCheck('manual-refresh');
  }, [runAuthorizationCheck]);

  const requestAuthorization = useCallback(async () => {
    const requestStartedAtMs = Date.now();
    latestResolvedAuthorizationStatus.current = null;
    authorizationCheckingStartedAtMs.current = requestStartedAtMs;
    setIsRequesting(true);
    setDiagnostic((current) => ({
      ...current,
      status: 'checking',
      errorMessage: null,
      checkingStartedAtMs: requestStartedAtMs,
    }));
    recordAuthorizationTimeline(`request-start at=${requestStartedAtMs}`);

    try {
      const sample = await FamilyControls.requestAuthorization();
      recordAuthorizationTimeline(
        `request-result status=${sample.status} ` +
          `durationMs=${Date.now() - requestStartedAtMs}`
      );
      if (isResolvedAuthorizationStatus(sample.status)) {
        resolveAuthorizationSample(sample, requestStartedAtMs);
      } else {
        await runAuthorizationCheck('request-completed');
      }
    } catch (error) {
      const errorMessage = formatError(error);
      recordAuthorizationTimeline(`request-error ${errorMessage}`);
      setDiagnostic((current) => ({
        ...current,
        errorMessage,
      }));
      await runAuthorizationCheck('request-error-recovery');
    } finally {
      setIsRequesting(false);
    }
  }, [
    recordAuthorizationTimeline,
    resolveAuthorizationSample,
    runAuthorizationCheck,
  ]);

  useEffect(() => {
    if (diagnostic.status !== 'denied') {
      return;
    }

    let isCurrent = true;
    void FamilyControls.reconcileAuthorizationSafety()
      .then((result) => {
        if (!isCurrent) {
          return;
        }
        setScheduledLockState(result.schedule);
        setShieldState(result.shield);
        setAuthorizationSafetyMessage(
          result.didCancelMonitoringAndRemoveShields
            ? 'Authorization is unusable. Monitoring was cancelled and all known shields were removed; the opaque saved selection was preserved for recovery.'
            : 'Authorization is unusable. Permission-dependent actions remain disabled.'
        );
        recordAuthorizationTimeline(
          `safety-reconcile status=${result.authorizationStatus} ` +
            `monitoringCancelled=${result.didCancelMonitoringAndRemoveShields} ` +
            `shieldApplied=${result.shield.isApplied}`
        );
      })
      .catch((error: unknown) => {
        if (isCurrent) {
          setAuthorizationSafetyMessage(
            `Authorization safety reconciliation failed: ${formatError(error)}`
          );
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [diagnostic.status, recordAuthorizationTimeline]);

  const refreshFamilyActivityState = useCallback(async () => {
    setIsLoadingFamilyActivityState(true);

    try {
      const [nextSelectionSummary, nextShieldState, nextScheduledLockState] =
        await Promise.all([
        FamilyControls.getSelectionSummary(),
        FamilyControls.getShieldState(),
        FamilyControls.getScheduledLockState(),
      ]);
      console.info(
        '[FamilyControlsSelectionDiagnostic] ' +
          `storage=${nextSelectionSummary.storageStatus} ` +
          `apps=${nextSelectionSummary.applicationCount} ` +
          `categories=${nextSelectionSummary.categoryCount} ` +
          `webDomains=${nextSelectionSummary.webDomainCount} ` +
          `shieldApplied=${nextShieldState.isApplied}`
      );
      setSelectionSummary(nextSelectionSummary);
      setShieldState(nextShieldState);
      setScheduledLockState(nextScheduledLockState);
      setFamilyActivityErrorMessage(
        nextSelectionSummary.errorMessage ??
          (nextShieldState.usesAllCategories
            ? 'Unexpected broad category shield policy detected. Remove the shield.'
            : null)
      );
    } catch (error) {
      setFamilyActivityErrorMessage(formatError(error));
    } finally {
      setIsLoadingFamilyActivityState(false);
    }
  }, []);

  const presentActivityPicker = useCallback(async () => {
    setIsPresentingPicker(true);
    setFamilyActivityErrorMessage(null);

    try {
      const result = await FamilyControls.presentActivityPicker();
      console.info(
        '[FamilyControlsSelectionDiagnostic] ' +
          `picker=${result.outcome} ` +
          `apps=${result.selection.applicationCount} ` +
          `categories=${result.selection.categoryCount} ` +
          `webDomains=${result.selection.webDomainCount}`
      );
      setSelectionSummary(result.selection);
      setLastPickerOutcome(result.outcome);
      setShieldState(await FamilyControls.getShieldState());
    } catch (error) {
      setFamilyActivityErrorMessage(formatError(error));
    } finally {
      setIsPresentingPicker(false);
    }
  }, []);

  const applyShield = useCallback(async () => {
    setIsRunningShieldAction(true);
    setFamilyActivityErrorMessage(null);

    try {
      const nextShieldState = await FamilyControls.applyShield();
      console.info(
        '[FamilyControlsSelectionDiagnostic] ' +
          `shieldApplied=${nextShieldState.isApplied}`
      );
      setShieldState(nextShieldState);
    } catch (error) {
      setFamilyActivityErrorMessage(formatError(error));
    } finally {
      setIsRunningShieldAction(false);
    }
  }, []);

  const removeShield = useCallback(async () => {
    setIsRunningShieldAction(true);
    setFamilyActivityErrorMessage(null);

    try {
      const nextShieldState = await FamilyControls.removeShield();
      console.info(
        '[FamilyControlsSelectionDiagnostic] ' +
          `shieldApplied=${nextShieldState.isApplied}`
      );
      setShieldState(nextShieldState);
    } catch (error) {
      setFamilyActivityErrorMessage(formatError(error));
    } finally {
      setIsRunningShieldAction(false);
    }
  }, []);

  const runScheduledLockAction = useCallback(
    async (action: () => Promise<ScheduledLockState>) => {
      setIsRunningScheduledLockAction(true);
      setScheduledLockErrorMessage(null);

      try {
        const nextScheduledLockState = await action();
        setScheduledLockState(nextScheduledLockState);
        setShieldState(await FamilyControls.getShieldState());
      } catch (error) {
        setScheduledLockErrorMessage(formatError(error));
      } finally {
        setIsRunningScheduledLockAction(false);
      }
    },
    []
  );

  const scheduleDailyLock = useCallback(() => {
    const hour = Number.parseInt(dailyLockHour, 10);
    const minute = Number.parseInt(dailyLockMinute, 10);
    void runScheduledLockAction(() =>
      FamilyControls.scheduleDailyLock(hour, minute)
    );
  }, [dailyLockHour, dailyLockMinute, runScheduledLockAction]);

  const scheduleDiagnosticLock = useCallback(() => {
    void runScheduledLockAction(() =>
      FamilyControls.scheduleDiagnosticLock(2)
    );
  }, [runScheduledLockAction]);

  const setAccountabilityCompleted = useCallback(
    (completed: boolean) => {
      void runScheduledLockAction(() =>
        FamilyControls.setDiagnosticAccountabilityCompleted(completed)
      );
    },
    [runScheduledLockAction]
  );

  const cancelScheduledLocks = useCallback(() => {
    void runScheduledLockAction(() => FamilyControls.cancelScheduledLocks());
  }, [runScheduledLockAction]);

  const resetScheduledLockDiagnostics = useCallback(() => {
    void runScheduledLockAction(() =>
      FamilyControls.resetScheduledLockDiagnostics()
    );
  }, [runScheduledLockAction]);

  const beginGuidedRoutine = useCallback(() => {
    setRoutineWasAlreadyCompletedToday(null);
    routineCompletionRequestKey.current = null;
    setRoutineState((current) =>
      startRoutine(current, representativeMovementSpecification)
    );
  }, []);

  const retryRoutineCompletion = useCallback(() => {
    setRoutineState(retryAccountability);
  }, []);

  useEffect(() => {
    if (!isTimedRoutinePhase(routineState.phase)) {
      lastRoutineTickAtMs.current = null;
      return;
    }

    lastRoutineTickAtMs.current = Date.now();
    const timer = setInterval(() => {
      const now = Date.now();
      const previousTick = lastRoutineTickAtMs.current ?? now;
      lastRoutineTickAtMs.current = now;
      if (appState.current !== 'active') {
        return;
      }

      // Never catch up a long event-loop/background gap. Recovery is
      // conservative: only short, foreground time slices advance the routine.
      const foregroundElapsedMs = Math.min(250, Math.max(0, now - previousTick));
      setRoutineState((current) =>
        advanceRoutine(
          current,
          representativeMovementSpecification,
          foregroundElapsedMs
        )
      );
    }, 100);

    return () => clearInterval(timer);
  }, [routineState.phase]);

  useEffect(() => {
    if (routineState.phase !== 'awaitingAccountability') {
      return;
    }

    const requestKey = `${routineState.sessionId}:${routineState.completionAttempt}`;
    if (routineCompletionRequestKey.current === requestKey) {
      return;
    }
    routineCompletionRequestKey.current = requestKey;
    let isCurrent = true;

    void FamilyControls.completeRoutineToday()
      .then((result) => {
        if (!isCurrent) {
          return;
        }
        setScheduledLockState((current) =>
          current
            ? { ...current, accountability: result.accountability }
            : current
        );
        setShieldState(result.shield);
        setRoutineWasAlreadyCompletedToday(result.wasAlreadyCompletedToday);
        setRoutineState(markAccountabilitySucceeded);
      })
      .catch((error: unknown) => {
        if (isCurrent) {
          setRoutineState((current) =>
            markAccountabilityFailed(current, formatError(error))
          );
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [
    routineState.completionAttempt,
    routineState.phase,
    routineState.sessionId,
  ]);

  useEffect(() => {
    const refreshFamilyActivityStateTimer = setTimeout(() => {
      void refreshFamilyActivityState();
    }, 0);

    return () => clearTimeout(refreshFamilyActivityStateTimer);
  }, [refreshFamilyActivityState]);

  useEffect(() => {
    const nativeSubscription = FamilyControls.addListener(
      'onAuthorizationStatusChanged',
      (sample) => {
        recordAuthorizationTimeline(
          `native-event status=${sample.status} source=${sample.source} ` +
            `nativeAppState=${sample.applicationState} ` +
            `nativeStabilizationMs=${sample.stabilizationDurationMs ?? 'pending'}`
        );
        setDiagnostic((current) => ({
          ...current,
          lastSample: sample,
        }));

        if (
          appState.current === 'active' &&
          isResolvedAuthorizationStatus(sample.status)
        ) {
          resolveAuthorizationSample(
            sample,
            authorizationCheckingStartedAtMs.current ??
              sample.firstNotDeterminedAtMs ??
              Date.now()
          );
        }
      }
    );

    const appStateSubscription = AppState.addEventListener(
      'change',
      (nextAppState) => {
        const previousAppState = appState.current;
        appState.current = nextAppState;
        recordAuthorizationTimeline(
          `js-app-state previous=${previousAppState} next=${nextAppState}`
        );
        if (nextAppState === 'active') {
          void runAuthorizationCheck('app-became-active');
          void refreshFamilyActivityState();
        } else {
          setRoutineState(interruptRoutine);
          authorizationCheckGeneration.current += 1;
          latestResolvedAuthorizationStatus.current = null;
          setDiagnostic((current) => ({
            ...current,
            status: 'checking',
          }));
        }
      }
    );

    const startAuthorizationDiagnosticTimer = setTimeout(() => {
      recordAuthorizationTimeline(
        `js-mounted moduleInitializedAt=${new Date(
          jsModuleInitializedAtMs
        ).toISOString()} initialAppState=${AppState.currentState}`
      );
      appState.current = AppState.currentState;
      if (
        AppState.currentState === 'active' &&
        latestResolvedAuthorizationStatus.current === null
      ) {
        void runAuthorizationCheck('initial-active');
      }
    }, 0);

    return () => {
      clearTimeout(startAuthorizationDiagnosticTimer);
      authorizationCheckGeneration.current += 1;
      nativeSubscription.remove();
      appStateSubscription.remove();
    };
  }, [
    recordAuthorizationTimeline,
    refreshFamilyActivityState,
    resolveAuthorizationSample,
    runAuthorizationCheck,
  ]);

  const canRequestAuthorization =
    diagnostic.status === 'notDetermined' || diagnostic.status === 'denied';
  const isAuthorizationApproved =
    diagnostic.status === 'approved' ||
    diagnostic.status === 'approvedWithDataAccess';
  const canApplyShield =
    isAuthorizationApproved &&
    selectionSummary?.hasSelection === true &&
    !isRunningShieldAction;
  const canScheduleLock =
    isAuthorizationApproved &&
    selectionSummary?.hasSelection === true &&
    scheduledLockState?.sharedStorageAvailable === true &&
    !isRunningScheduledLockAction;
  const routineRemainingMs = remainingPhaseMs(
    routineState,
    representativeMovementSpecification
  );
  const isRoutineRunning =
    isTimedRoutinePhase(routineState.phase) ||
    routineState.phase === 'awaitingAccountability';

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      style={styles.screen}
    >
      <Text style={styles.eyebrow}>{"MEN'S DISCIPLINE"}</Text>
      <Text style={styles.title}>Technical baseline</Text>
      <Text style={styles.body}>
        Official Expo application shell is running.
      </Text>

      <View style={styles.diagnosticSection}>
        <Text style={styles.diagnosticTitle}>Family Controls diagnostic</Text>
        <Text style={styles.status}>Status: {diagnostic.status}</Text>

        <View style={styles.actions}>
          <Pressable
            accessibilityRole="button"
            onPress={refreshAuthorizationStatus}
            style={styles.button}
          >
            <Text style={styles.buttonText}>Refresh status</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            disabled={isRequesting || !canRequestAuthorization}
            onPress={requestAuthorization}
            style={[
              styles.button,
              (isRequesting || !canRequestAuthorization) &&
                styles.buttonDisabled,
            ]}
          >
            <Text style={styles.buttonText}>
              {isRequesting
                ? 'Requesting…'
                : diagnostic.status === 'approved' ||
                    diagnostic.status === 'approvedWithDataAccess'
                  ? 'Authorization approved'
                  : 'Request authorization'}
            </Text>
          </Pressable>
        </View>

        <Text selectable style={styles.caption}>
          JS module initialized: {formatTimestamp(jsModuleInitializedAtMs)}
          {'\n'}Native module initialized:{' '}
          {formatTimestamp(
            diagnostic.lastSample?.moduleInitializedAtMs ?? null
          )}
          {'\n'}App became active:{' '}
          {formatTimestamp(
            diagnostic.lastSample?.appBecameActiveAtMs ?? null
          )}
          {'\n'}Last native sample:{' '}
          {formatTimestamp(diagnostic.lastSample?.observedAtMs ?? null)}
          {'\n'}Native source: {diagnostic.lastSample?.source ?? 'pending'}
          {'\n'}Native app state:{' '}
          {diagnostic.lastSample?.applicationState ?? 'pending'}
          {'\n'}Native stabilization:{' '}
          {diagnostic.lastSample?.stabilizationDurationMs ?? 'pending'} ms
          {'\n'}JS resolution: {diagnostic.resolutionDurationMs ?? 'pending'} ms
        </Text>

        {diagnostic.timeline.length > 0 ? (
          <Text selectable style={styles.timeline}>
            {diagnostic.timeline.join('\n')}
          </Text>
        ) : null}

        {diagnostic.errorMessage ? (
          <Text selectable style={styles.error}>
            {diagnostic.errorMessage}
          </Text>
        ) : null}
        {authorizationSafetyMessage ? (
          <Text selectable style={styles.error}>
            {authorizationSafetyMessage}
          </Text>
        ) : null}
      </View>

      <View style={styles.diagnosticSection}>
        <Text style={styles.diagnosticTitle}>
          App selection and shield diagnostic
        </Text>
        <Text style={styles.status}>
          Selection:{' '}
          {isLoadingFamilyActivityState
            ? 'loading'
            : selectionSummary?.storageStatus ?? 'unknown'}
        </Text>
        <Text style={styles.status}>
          Saved selection:{' '}
          {selectionSummary?.hasStoredSelection ? 'yes' : 'no'}
          {selectionSummary?.isEmpty ? ' (empty)' : ''}
        </Text>
        <Text style={styles.status}>
          Apps: {selectionSummary?.applicationCount ?? 0} · Categories:{' '}
          {selectionSummary?.categoryCount ?? 0} · Web domains:{' '}
          {selectionSummary?.webDomainCount ?? 0}
        </Text>
        <Text style={styles.status}>
          Diagnostic shield: {shieldState?.isApplied ? 'applied' : 'removed'}
        </Text>
        {shieldState?.isApplied ? (
          <Text style={styles.caption}>
            Shield store counts — apps: {shieldState.applicationCount} ·
            categories: {shieldState.categoryCount} · web domains:{' '}
            {shieldState.webDomainCount}
          </Text>
        ) : null}

        <View style={styles.actions}>
          <Pressable
            accessibilityRole="button"
            disabled={!isAuthorizationApproved || isPresentingPicker}
            onPress={presentActivityPicker}
            style={[
              styles.button,
              (!isAuthorizationApproved || isPresentingPicker) &&
                styles.buttonDisabled,
            ]}
          >
            <Text style={styles.buttonText}>
              {isPresentingPicker ? 'Picker open…' : 'Choose Apps'}
            </Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            disabled={!canApplyShield}
            onPress={applyShield}
            style={[styles.button, !canApplyShield && styles.buttonDisabled]}
          >
            <Text style={styles.buttonText}>
              {isRunningShieldAction ? 'Working…' : 'Apply Shield'}
            </Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            disabled={isRunningShieldAction}
            onPress={removeShield}
            style={[
              styles.button,
              isRunningShieldAction && styles.buttonDisabled,
            ]}
          >
            <Text style={styles.buttonText}>
              {isRunningShieldAction ? 'Working…' : 'Remove Shield'}
            </Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            disabled={isLoadingFamilyActivityState}
            onPress={refreshFamilyActivityState}
            style={[
              styles.button,
              isLoadingFamilyActivityState && styles.buttonDisabled,
            ]}
          >
            <Text style={styles.buttonText}>Refresh selection/shield</Text>
          </Pressable>
        </View>

        <Text style={styles.caption}>
          Tokens stay opaque in native storage. Editing to another non-empty
          selection does not change an active shield until Apply Shield is
          tapped again. Saving an empty selection or tapping Remove Shield
          clears all diagnostic shield stores.
          {'\n'}Storage: {selectionSummary?.storageScope ?? 'unknown'} · App
          Group available:{' '}
          {selectionSummary?.sharedStorageAvailable ? 'yes' : 'no'}
          {'\n'}Saved at:{' '}
          {formatTimestamp(selectionSummary?.persistedAtMs ?? null)}
          {lastPickerOutcome ? `\nLast picker outcome: ${lastPickerOutcome}` : ''}
        </Text>

        {familyActivityErrorMessage ? (
          <Text selectable style={styles.error}>
            {familyActivityErrorMessage}
          </Text>
        ) : null}
      </View>

      <View style={styles.diagnosticSection}>
        <Text style={styles.diagnosticTitle}>
          Phase 03.10 guided routine
        </Text>
        <Text style={styles.status}>
          State: {routinePhaseLabel(routineState.phase)}
        </Text>
        <Text style={styles.status}>
          Set: {routineState.setNumber || 0}/{GUIDED_ROUTINE_SET_COUNT} · Reps:{' '}
          {routineState.repetitionsCompleted}/
          {representativeMovementSpecification.repsPerSet}
        </Text>
        {routineRemainingMs !== null ? (
          <Text style={styles.status}>
            Phase remaining: {Math.ceil(routineRemainingMs / 1_000)}s
          </Text>
        ) : null}
        <Text style={styles.caption}>
          Architecture-test movement only — 5 reps at a 1-second cadence. These
          are representative values, not final movement content. The locked
          structure is five sets with four 20-second inter-set rests and no rest
          after set five.
        </Text>

        <View style={styles.actions}>
          <Pressable
            accessibilityRole="button"
            disabled={isRoutineRunning}
            onPress={beginGuidedRoutine}
            style={[styles.button, isRoutineRunning && styles.buttonDisabled]}
          >
            <Text style={styles.buttonText}>
              {routineState.phase === 'idle'
                ? 'Start guided routine'
                : 'Start again'}
            </Text>
          </Pressable>
          {routineState.phase === 'completionFailed' ? (
            <Pressable
              accessibilityRole="button"
              onPress={retryRoutineCompletion}
              style={styles.button}
            >
              <Text style={styles.buttonText}>Retry completion + unlock</Text>
            </Pressable>
          ) : null}
        </View>

        {routineState.interruptionReason ? (
          <Text style={styles.error}>
            Routine interrupted when the app left the foreground. No completion
            was granted; start again. This is the conservative Phase 03.10
            recovery baseline.
          </Text>
        ) : null}
        {routineState.completionError ? (
          <Text selectable style={styles.error}>
            {routineState.completionError}
          </Text>
        ) : null}
        {routineState.phase === 'completed' ? (
          <Text style={styles.success}>
            Shared completion is present for today and all known shield stores
            were cleared.
            {routineWasAlreadyCompletedToday
              ? ' The existing same-day completion was reused idempotently.'
              : ''}
          </Text>
        ) : null}
      </View>

      <View style={styles.diagnosticSection}>
        <Text style={styles.diagnosticTitle}>
          Scheduled Lock Time diagnostic
        </Text>
        <Text style={styles.status}>
          Accountability today:{' '}
          {scheduledLockState?.accountability.completedToday
            ? 'Completed'
            : 'Incomplete'}
        </Text>
        <Text style={styles.status}>
          Daily recurring schedule:{' '}
          {scheduledLockState?.daily.isMonitoring ? 'active' : 'inactive'}
        </Text>
        <Text style={styles.caption}>
          Daily next start:{' '}
          {formatTimestamp(
            scheduledLockState?.daily.nextIntervalStartMs ?? null
          )}
          {'\n'}One-off diagnostic:{' '}
          {scheduledLockState?.diagnostic.isMonitoring
            ? 'active'
            : 'inactive'}
          {'\n'}Diagnostic next start:{' '}
          {formatTimestamp(
            scheduledLockState?.diagnostic.nextIntervalStartMs ?? null
          )}
          {'\n'}Last monitor callback:{' '}
          {scheduledLockState?.lastCallback
            ? `${scheduledLockState.lastCallback.callback} / ${scheduledLockState.lastCallback.outcome}`
            : 'none'}
          {'\n'}Callback time:{' '}
          {formatTimestamp(
            scheduledLockState?.lastCallback?.occurredAtMs ?? null
          )}
        </Text>

        <View style={styles.timeInputs}>
          <TextInput
            accessibilityLabel="Daily lock hour"
            keyboardType="number-pad"
            maxLength={2}
            onChangeText={setDailyLockHour}
            placeholder="21"
            placeholderTextColor="#666762"
            style={styles.timeInput}
            value={dailyLockHour}
          />
          <Text style={styles.timeSeparator}>:</Text>
          <TextInput
            accessibilityLabel="Daily lock minute"
            keyboardType="number-pad"
            maxLength={2}
            onChangeText={setDailyLockMinute}
            placeholder="00"
            placeholderTextColor="#666762"
            style={styles.timeInput}
            value={dailyLockMinute}
          />
        </View>

        <View style={styles.actions}>
          <Pressable
            accessibilityRole="button"
            disabled={!canScheduleLock}
            onPress={scheduleDailyLock}
            style={[styles.button, !canScheduleLock && styles.buttonDisabled]}
          >
            <Text style={styles.buttonText}>Schedule recurring daily lock</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            disabled={!canScheduleLock}
            onPress={scheduleDiagnosticLock}
            style={[styles.button, !canScheduleLock && styles.buttonDisabled]}
          >
            <Text style={styles.buttonText}>Schedule one-off test (+2 min)</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            disabled={isRunningScheduledLockAction}
            onPress={() => setAccountabilityCompleted(false)}
            style={[
              styles.button,
              isRunningScheduledLockAction && styles.buttonDisabled,
            ]}
          >
            <Text style={styles.buttonText}>Set Incomplete today</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            disabled={isRunningScheduledLockAction}
            onPress={() => setAccountabilityCompleted(true)}
            style={[
              styles.button,
              isRunningScheduledLockAction && styles.buttonDisabled,
            ]}
          >
            <Text style={styles.buttonText}>Set Completed today</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            disabled={isRunningScheduledLockAction}
            onPress={cancelScheduledLocks}
            style={[
              styles.button,
              isRunningScheduledLockAction && styles.buttonDisabled,
            ]}
          >
            <Text style={styles.buttonText}>Cancel schedules + remove shield</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            disabled={isRunningScheduledLockAction}
            onPress={resetScheduledLockDiagnostics}
            style={[
              styles.button,
              isRunningScheduledLockAction && styles.buttonDisabled,
            ]}
          >
            <Text style={styles.buttonText}>Reset scheduled-lock diagnostic</Text>
          </Pressable>
        </View>

        <Text style={styles.caption}>
          Production concept: the daily schedule repeats from Lock Time until
          23:59. The +2 minute button is a separate one-off Device Activity test
          with a 16-minute interval, satisfying Apple&apos;s 15-minute minimum.
          System callbacks occur when the device is used within the interval.
        </Text>

        {scheduledLockErrorMessage ? (
          <Text selectable style={styles.error}>
            {scheduledLockErrorMessage}
          </Text>
        ) : null}
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: '#171817',
  },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingBottom: 48,
    paddingHorizontal: 32,
    paddingTop: 48,
  },
  eyebrow: {
    marginBottom: 12,
    color: '#A8A8A2',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 2,
  },
  title: {
    color: '#F2F0EA',
    fontSize: 32,
    fontWeight: '600',
  },
  body: {
    marginTop: 12,
    color: '#A8A8A2',
    fontSize: 16,
    lineHeight: 24,
  },
  diagnosticSection: {
    marginTop: 32,
    gap: 12,
  },
  diagnosticTitle: {
    color: '#F2F0EA',
    fontSize: 18,
    fontWeight: '600',
  },
  status: {
    color: '#A8A8A2',
    fontSize: 16,
  },
  caption: {
    color: '#7F807B',
    fontSize: 13,
    lineHeight: 18,
  },
  actions: {
    gap: 10,
  },
  timeInputs: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  timeInput: {
    minWidth: 64,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderColor: '#7F807B',
    borderRadius: 6,
    borderWidth: 1,
    color: '#F2F0EA',
    fontFamily: 'Menlo',
    fontSize: 18,
    textAlign: 'center',
  },
  timeSeparator: {
    color: '#A8A8A2',
    fontSize: 20,
  },
  button: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderColor: '#A8A8A2',
    borderRadius: 6,
    borderWidth: 1,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#F2F0EA',
    fontSize: 15,
    fontWeight: '600',
  },
  error: {
    color: '#F08A84',
    fontSize: 14,
    lineHeight: 20,
  },
  success: {
    color: '#8CCB9B',
    fontSize: 14,
    lineHeight: 20,
  },
  timeline: {
    color: '#7F807B',
    fontFamily: 'Menlo',
    fontSize: 10,
    lineHeight: 14,
  },
});
