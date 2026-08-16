import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'expo-router';
import {
  AppState,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import VisionPose, {
  type CameraPermissionStatus,
  type LivePoseFrameEvent,
  type VisionPoseCameraPosition,
  type VisionPoseCameraState,
  VisionPoseCameraView,
} from '../../modules/vision-pose';
import {
  type KneelingDriveCounterSnapshot,
  KneelingDriveRepCounter,
} from '../motion/kneelingDrive';

const VALIDATION_SCENARIOS = [
  'Side — fuller framing',
  'Side — partial body',
  'Oblique — fuller framing',
  'Oblique — partial body',
  'Front / near-front — fuller framing',
  'Front / near-front — partial body',
] as const;

type RunMetrics = {
  processedFrames: number;
  poseFrames: number;
  noPoseFrames: number;
  insufficientLandmarkFrames: number;
  twoDimensionalFrames: number;
  threeDimensionalFrames: number;
  processingDurationTotalMs: number;
  processingDurationMaximumMs: number;
};

type ValidationRecord = {
  scenario: (typeof VALIDATION_SCENARIOS)[number];
  cameraPosition: VisionPoseCameraPosition;
  actualReps: number;
  countedReps: number;
  missedReps: number;
  extraCounts: number;
  processedFrames: number;
  noPoseFrames: number;
  insufficientLandmarkFrames: number;
  twoDimensionalFrames: number;
  threeDimensionalFrames: number;
  averageProcessingMs: number;
  maximumProcessingMs: number;
};

const emptyMetrics = (): RunMetrics => ({
  processedFrames: 0,
  poseFrames: 0,
  noPoseFrames: 0,
  insufficientLandmarkFrames: 0,
  twoDimensionalFrames: 0,
  threeDimensionalFrames: 0,
  processingDurationTotalMs: 0,
  processingDurationMaximumMs: 0,
});

function initialSnapshot(): KneelingDriveCounterSnapshot {
  return new KneelingDriveRepCounter().reset();
}

export default function MotionDiagnosticScreen() {
  const router = useRouter();
  const counter = useRef(new KneelingDriveRepCounter());
  const latestSnapshot = useRef<KneelingDriveCounterSnapshot | null>(null);
  const metricsRef = useRef(emptyMetrics());
  const [permissionStatus, setPermissionStatus] =
    useState<CameraPermissionStatus>('unknown');
  const [cameraState, setCameraState] =
    useState<VisionPoseCameraState | null>(null);
  const [cameraPosition, setCameraPosition] =
    useState<VisionPoseCameraPosition>('front');
  const [isTracking, setIsTracking] = useState(false);
  const [snapshot, setSnapshot] = useState(initialSnapshot);
  const [metrics, setMetrics] = useState(emptyMetrics);
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [actualRepsText, setActualRepsText] = useState('5');
  const [records, setRecords] = useState<ValidationRecord[]>([]);
  const [permissionError, setPermissionError] = useState<string | null>(null);

  const refreshPermission = useCallback(() => {
    const result = VisionPose.getCameraPermissionStatus();
    setPermissionStatus(result.status);
  }, []);

  useEffect(() => {
    const permissionRefreshTimer = setTimeout(refreshPermission, 0);
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        refreshPermission();
      } else {
        setIsTracking(false);
      }
    });
    return () => {
      clearTimeout(permissionRefreshTimer);
      subscription.remove();
    };
  }, [refreshPermission]);

  const requestPermission = useCallback(async () => {
    setPermissionError(null);
    try {
      const result = await VisionPose.requestCameraPermission();
      setPermissionStatus(result.status);
    } catch (error) {
      setPermissionError(error instanceof Error ? error.message : String(error));
    }
  }, []);

  const resetRun = useCallback(() => {
    const nextSnapshot = counter.current.reset();
    const nextMetrics = emptyMetrics();
    latestSnapshot.current = nextSnapshot;
    metricsRef.current = nextMetrics;
    setSnapshot(nextSnapshot);
    setMetrics(nextMetrics);
  }, []);

  const startTracking = useCallback(() => {
    resetRun();
    setIsTracking(true);
  }, [resetRun]);

  const handleCameraState = useCallback((state: VisionPoseCameraState) => {
    setCameraState(state);
    setPermissionStatus(state.permissionStatus);
  }, []);

  const handlePoseFrame = useCallback((event: LivePoseFrameEvent) => {
    const nextMetrics = { ...metricsRef.current };
    nextMetrics.processedFrames += 1;
    nextMetrics.processingDurationTotalMs += event.processingDurationMs;
    nextMetrics.processingDurationMaximumMs = Math.max(
      nextMetrics.processingDurationMaximumMs,
      event.processingDurationMs
    );

    let nextSnapshot: KneelingDriveCounterSnapshot;
    if (
      (event.result.status === 'poseAvailable' ||
        event.result.status === 'partialPoseAvailable') &&
      event.result.frame
    ) {
      nextMetrics.poseFrames += 1;
      if (event.result.frame.hasThreeDimensionalPose) {
        nextMetrics.threeDimensionalFrames += 1;
      } else {
        nextMetrics.twoDimensionalFrames += 1;
      }
      nextSnapshot = counter.current.processFrame(event.result.frame);
      if (!nextSnapshot.feature.reliable) {
        nextMetrics.insufficientLandmarkFrames += 1;
      }
    } else {
      nextMetrics.noPoseFrames += 1;
      nextSnapshot = counter.current.processUnavailable(
        Date.now(),
        event.result.status
      );
    }

    latestSnapshot.current = nextSnapshot;
    metricsRef.current = nextMetrics;
    setSnapshot(nextSnapshot);
    setMetrics(nextMetrics);
  }, []);

  const finishRun = useCallback(() => {
    setIsTracking(false);
    const actualReps = Math.max(Number.parseInt(actualRepsText, 10) || 0, 0);
    const countedReps = latestSnapshot.current?.repCount ?? snapshot.repCount;
    const runMetrics = metricsRef.current;
    setRecords((current) => [
      ...current,
      {
        scenario: VALIDATION_SCENARIOS[scenarioIndex],
        cameraPosition,
        actualReps,
        countedReps,
        missedReps: Math.max(actualReps - countedReps, 0),
        extraCounts: Math.max(countedReps - actualReps, 0),
        processedFrames: runMetrics.processedFrames,
        noPoseFrames: runMetrics.noPoseFrames,
        insufficientLandmarkFrames: runMetrics.insufficientLandmarkFrames,
        twoDimensionalFrames: runMetrics.twoDimensionalFrames,
        threeDimensionalFrames: runMetrics.threeDimensionalFrames,
        averageProcessingMs:
          runMetrics.processedFrames === 0
            ? 0
            : Number(
                (
                  runMetrics.processingDurationTotalMs /
                  runMetrics.processedFrames
                ).toFixed(1)
              ),
        maximumProcessingMs: Number(
          runMetrics.processingDurationMaximumMs.toFixed(1)
        ),
      },
    ]);
  }, [actualRepsText, cameraPosition, scenarioIndex, snapshot.repCount]);

  const averageProcessingMs =
    metrics.processedFrames === 0
      ? 0
      : metrics.processingDurationTotalMs / metrics.processedFrames;
  const canUseCamera = permissionStatus === 'authorized';

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
      <Pressable
        accessibilityRole="button"
        onPress={() => router.back()}
        style={styles.smallButton}
      >
        <Text style={styles.buttonText}>Back to technical baseline</Text>
      </Pressable>

      <Text style={styles.eyebrow}>PHASE 03.9 FEASIBILITY</Text>
      <Text style={styles.title}>Kneeling Drive</Text>
      <Text style={styles.body}>
        On-device camera → Apple Vision → normalized landmarks → adaptive
        movement state → rep event. No video is saved or uploaded.
      </Text>

      <View style={styles.section}>
        <Text style={styles.heading}>Camera permission</Text>
        <Text style={styles.status}>Permission: {permissionStatus}</Text>
        {permissionStatus === 'notDetermined' ? (
          <Pressable
            accessibilityRole="button"
            onPress={requestPermission}
            style={styles.button}
          >
            <Text style={styles.buttonText}>Allow on-device camera</Text>
          </Pressable>
        ) : null}
        {permissionStatus === 'denied' || permissionStatus === 'restricted' ? (
          <>
            <Text style={styles.guidance}>
              Camera access is unavailable. Enable Camera in iOS Settings to
              run this diagnostic.
            </Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => Linking.openSettings()}
              style={styles.button}
            >
              <Text style={styles.buttonText}>Open iOS Settings</Text>
            </Pressable>
          </>
        ) : null}
        {permissionError ? (
          <Text selectable style={styles.error}>
            {permissionError}
          </Text>
        ) : null}
      </View>

      <View style={styles.cameraFrame}>
        <VisionPoseCameraView
          active={isTracking && canUseCamera}
          cameraPosition={cameraPosition}
          onCameraState={handleCameraState}
          onPoseFrame={handlePoseFrame}
          style={styles.camera}
        />
        {!isTracking ? (
          <View pointerEvents="none" style={styles.cameraPlaceholder}>
            <Text style={styles.placeholderText}>Camera stopped</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.row}>
        <Pressable
          accessibilityRole="button"
          disabled={isTracking}
          onPress={() => setCameraPosition('front')}
          style={[
            styles.compactButton,
            cameraPosition === 'front' && styles.selectedButton,
            isTracking && styles.disabled,
          ]}
        >
          <Text style={styles.buttonText}>Front camera</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          disabled={isTracking}
          onPress={() => setCameraPosition('back')}
          style={[
            styles.compactButton,
            cameraPosition === 'back' && styles.selectedButton,
            isTracking && styles.disabled,
          ]}
        >
          <Text style={styles.buttonText}>Back camera</Text>
        </Pressable>
      </View>

      <View style={styles.section}>
        <Text style={styles.heading}>Live detector</Text>
        <Text style={styles.repCount}>{snapshot.repCount}</Text>
        <Text style={styles.status}>counted reps</Text>
        <Text style={styles.status}>
          Camera: {cameraState?.status ?? 'stopped'} · Tracking:{' '}
          {snapshot.trackingStatus}
        </Text>
        <Text style={styles.status}>
          State: {snapshot.phase} · Feature:{' '}
          {snapshot.feature.source ?? 'none'}
        </Text>
        <Text style={styles.status}>
          Calibration: {Math.round(snapshot.calibrationProgress * 100)}% ·
          Critical joints: {snapshot.feature.criticalJointCount}/4
        </Text>
        <Text style={styles.caption}>
          Shoulders available:{' '}
          {snapshot.feature.shoulderEvidenceAvailable ? 'yes' : 'no'} · Score:{' '}
          {snapshot.smoothedScore?.toFixed(3) ?? 'n/a'} · 2D frames:{' '}
          {metrics.twoDimensionalFrames} · 3D frames:{' '}
          {metrics.threeDimensionalFrames}
          {'\n'}Pose loss: {metrics.noPoseFrames} · Landmark loss:{' '}
          {metrics.insufficientLandmarkFrames} · Vision average:{' '}
          {averageProcessingMs.toFixed(1)} ms · max:{' '}
          {metrics.processingDurationMaximumMs.toFixed(1)} ms
        </Text>
        {snapshot.guidance ? (
          <Text style={styles.guidance}>{snapshot.guidance}</Text>
        ) : (
          <Text style={styles.ready}>Ready — broad movement only.</Text>
        )}

        <View style={styles.actions}>
          <Pressable
            accessibilityRole="button"
            disabled={!canUseCamera || isTracking}
            onPress={startTracking}
            style={[
              styles.button,
              (!canUseCamera || isTracking) && styles.disabled,
            ]}
          >
            <Text style={styles.buttonText}>Start / reset live run</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            disabled={!isTracking}
            onPress={() => setIsTracking(false)}
            style={[styles.button, !isTracking && styles.disabled]}
          >
            <Text style={styles.buttonText}>Pause camera</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.heading}>Validation run label</Text>
        <Text style={styles.caption}>
          This label records the test condition only. It does not select a
          detector mode or change counting behavior.
        </Text>
        <View style={styles.scenarioList}>
          {VALIDATION_SCENARIOS.map((scenario, index) => (
            <Pressable
              accessibilityRole="button"
              key={scenario}
              onPress={() => setScenarioIndex(index)}
              style={[
                styles.scenario,
                scenarioIndex === index && styles.selectedButton,
              ]}
            >
              <Text style={styles.buttonText}>{scenario}</Text>
            </Pressable>
          ))}
        </View>
        <Text style={styles.label}>Actual completed reps</Text>
        <TextInput
          accessibilityLabel="Actual completed repetitions"
          keyboardType="number-pad"
          maxLength={2}
          onChangeText={setActualRepsText}
          style={styles.input}
          value={actualRepsText}
        />
        <Pressable
          accessibilityRole="button"
          disabled={metrics.processedFrames === 0}
          onPress={finishRun}
          style={[
            styles.button,
            metrics.processedFrames === 0 && styles.disabled,
          ]}
        >
          <Text style={styles.buttonText}>Finish and record this run</Text>
        </Pressable>
      </View>

      <View style={styles.section}>
        <Text style={styles.heading}>Recorded matrix ({records.length}/6)</Text>
        {records.length === 0 ? (
          <Text style={styles.caption}>No physical-device runs recorded yet.</Text>
        ) : (
          <Text selectable style={styles.log}>
            {JSON.stringify(records, null, 2)}
          </Text>
        )}
        {records.length > 0 ? (
          <Pressable
            accessibilityRole="button"
            onPress={() => setRecords([])}
            style={styles.smallButton}
          >
            <Text style={styles.buttonText}>Clear recorded matrix</Text>
          </Pressable>
        ) : null}
      </View>

      <Text style={styles.privacy}>
        Diagnostic records contain counts and processing timings only. Raw
        camera frames and video are neither persisted nor uploaded.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: '#171817' },
  container: {
    gap: 20,
    paddingBottom: 56,
    paddingHorizontal: 24,
    paddingTop: 52,
  },
  eyebrow: {
    color: '#A8A8A2',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.8,
  },
  title: { color: '#F2F0EA', fontSize: 34, fontWeight: '600' },
  body: { color: '#A8A8A2', fontSize: 15, lineHeight: 22 },
  section: { gap: 10, marginTop: 8 },
  heading: { color: '#F2F0EA', fontSize: 19, fontWeight: '600' },
  status: { color: '#B8B8B1', fontSize: 15, lineHeight: 21 },
  caption: { color: '#858680', fontSize: 12, lineHeight: 18 },
  guidance: { color: '#E5C77A', fontSize: 14, lineHeight: 20 },
  ready: { color: '#8BC99A', fontSize: 14, lineHeight: 20 },
  error: { color: '#F08A84', fontSize: 14, lineHeight: 20 },
  privacy: { color: '#73746F', fontSize: 12, lineHeight: 18, marginTop: 8 },
  cameraFrame: {
    backgroundColor: '#050505',
    borderColor: '#343532',
    borderRadius: 12,
    borderWidth: 1,
    height: 440,
    overflow: 'hidden',
  },
  camera: { flex: 1 },
  cameraPlaceholder: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    alignItems: 'center',
    backgroundColor: '#0D0E0D',
    justifyContent: 'center',
  },
  placeholderText: { color: '#686963', fontSize: 15 },
  row: { flexDirection: 'row', gap: 10 },
  actions: { gap: 10 },
  button: {
    alignItems: 'center',
    borderColor: '#A8A8A2',
    borderRadius: 7,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  smallButton: {
    alignSelf: 'flex-start',
    borderColor: '#6E6F69',
    borderRadius: 7,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  compactButton: {
    alignItems: 'center',
    borderColor: '#666762',
    borderRadius: 7,
    borderWidth: 1,
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 11,
  },
  selectedButton: { backgroundColor: '#394239', borderColor: '#A7BCA7' },
  disabled: { opacity: 0.4 },
  buttonText: { color: '#F2F0EA', fontSize: 14, fontWeight: '600' },
  repCount: { color: '#F2F0EA', fontSize: 64, fontWeight: '600', lineHeight: 68 },
  scenarioList: { gap: 8 },
  scenario: {
    borderColor: '#555650',
    borderRadius: 7,
    borderWidth: 1,
    paddingHorizontal: 13,
    paddingVertical: 11,
  },
  label: { color: '#A8A8A2', fontSize: 13, marginTop: 4 },
  input: {
    borderColor: '#777872',
    borderRadius: 7,
    borderWidth: 1,
    color: '#F2F0EA',
    fontFamily: 'Menlo',
    fontSize: 19,
    paddingHorizontal: 14,
    paddingVertical: 11,
    width: 84,
  },
  log: {
    backgroundColor: '#101110',
    borderRadius: 8,
    color: '#9FA19A',
    fontFamily: 'Menlo',
    fontSize: 10,
    lineHeight: 15,
    padding: 12,
  },
});
