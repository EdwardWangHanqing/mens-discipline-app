import { useCallback, useEffect, useRef, useState } from 'react';
import {
  AppState,
  type AppStateStatus,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import FamilyControls, {
  type FamilyControlsAuthorizationDisplayStatus,
  type FamilyControlsAuthorizationSample,
  type FamilyControlsAuthorizationStatus,
  type FamilyControlsSelectionSummary,
  type FamilyControlsShieldState,
} from '../../modules/family-controls';
import VisionPose, {
  type PoseDetectionResult,
} from '../../modules/vision-pose';

const missingDiagnosticImagePath =
  '/expo-vision-pose-diagnostic/missing-image.png';
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

export default function HomeScreen() {
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
  const [lastPickerOutcome, setLastPickerOutcome] = useState<
    'saved' | 'cancelled' | null
  >(null);
  const [familyActivityErrorMessage, setFamilyActivityErrorMessage] =
    useState<string | null>(null);
  const [poseResult, setPoseResult] = useState<PoseDetectionResult | null>(null);
  const [poseErrorMessage, setPoseErrorMessage] = useState<string | null>(null);
  const [isRunningPoseDiagnostic, setIsRunningPoseDiagnostic] = useState(false);
  const authorizationCheckGeneration = useRef(0);
  const authorizationCheckingStartedAtMs = useRef<number | null>(null);
  const latestResolvedAuthorizationStatus =
    useRef<FamilyControlsAuthorizationStatus | null>(null);
  const appState = useRef<AppStateStatus>(AppState.currentState);

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
        status: 'unknown',
        errorMessage,
      }));
    } finally {
      setIsRequesting(false);
    }
  }, [
    recordAuthorizationTimeline,
    resolveAuthorizationSample,
    runAuthorizationCheck,
  ]);

  const refreshFamilyActivityState = useCallback(async () => {
    setIsLoadingFamilyActivityState(true);

    try {
      const [nextSelectionSummary, nextShieldState] = await Promise.all([
        FamilyControls.getSelectionSummary(),
        FamilyControls.getShieldState(),
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

  const runPoseBridgeDiagnostic = useCallback(async () => {
    setIsRunningPoseDiagnostic(true);
    setPoseResult(null);
    setPoseErrorMessage(null);

    try {
      const result = await VisionPose.detectPoseFromImageFile(
        missingDiagnosticImagePath
      );
      setPoseResult(result);
    } catch (error) {
      setPoseErrorMessage(formatError(error));
    } finally {
      setIsRunningPoseDiagnostic(false);
    }
  }, []);

  useEffect(() => {
    const startPoseDiagnosticTimer = setTimeout(() => {
      void runPoseBridgeDiagnostic();
    }, 0);

    return () => clearTimeout(startPoseDiagnosticTimer);
  }, [runPoseBridgeDiagnostic]);

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
          Tokens stay opaque in native storage. Editing the saved selection does
          not change an active shield until Apply Shield is tapped again. Remove
          Shield always clears this diagnostic store.
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
        <Text style={styles.diagnosticTitle}>Vision pose diagnostic</Text>
        <Text style={styles.status}>
          Status: {poseResult?.status ?? 'notRun'}
        </Text>
        {poseResult?.errorCode ? (
          <Text style={styles.status}>Code: {poseResult.errorCode}</Text>
        ) : null}

        <Pressable
          accessibilityRole="button"
          disabled={isRunningPoseDiagnostic}
          onPress={runPoseBridgeDiagnostic}
          style={[
            styles.button,
            isRunningPoseDiagnostic && styles.buttonDisabled,
          ]}
        >
          <Text style={styles.buttonText}>
            {isRunningPoseDiagnostic ? 'Running…' : 'Test native bridge'}
          </Text>
        </Pressable>

        <Text style={styles.caption}>
          Uses an intentionally missing local file. Expected: invalidInput /
          fileNotFound.
        </Text>

        {poseResult?.message || poseErrorMessage ? (
          <Text selectable style={styles.error}>
            {poseResult?.message ?? poseErrorMessage}
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
  timeline: {
    color: '#7F807B',
    fontFamily: 'Menlo',
    fontSize: 10,
    lineHeight: 14,
  },
});
