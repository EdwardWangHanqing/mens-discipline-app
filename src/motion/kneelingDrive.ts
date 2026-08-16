import type {
  PoseFrame,
  PoseJointName,
  PoseJointObservation,
  PoseJointPosition3D,
} from '../../modules/vision-pose/src/ExpoVisionPose.types';

export type KneelingDriveFeatureSource =
  | 'vision2D'
  | 'vision3D';

export type KneelingDrivePhase =
  | 'seekingBack'
  | 'back'
  | 'forward';

export type KneelingDriveTrackingStatus =
  | 'calibrating'
  | 'ready'
  | 'temporarilyLost'
  | 'insufficient';

export type KneelingDriveFeatureSample = {
  timestampMs: number;
  reliable: boolean;
  score: number | null;
  alignmentScore: number | null;
  source: KneelingDriveFeatureSource | null;
  criticalJointCount: number;
  shoulderEvidenceAvailable: boolean;
  reason: string | null;
};

export type KneelingDriveCounterSnapshot = {
  repCount: number;
  repEvent: boolean;
  phase: KneelingDrivePhase;
  trackingStatus: KneelingDriveTrackingStatus;
  calibrationProgress: number;
  isCalibrated: boolean;
  feature: KneelingDriveFeatureSample;
  smoothedScore: number | null;
  backThreshold: number | null;
  forwardThreshold: number | null;
  guidance: string | null;
  lastReliableTimestampMs: number | null;
};

export type KneelingDriveCounterConfig = {
  minimumJointConfidence: number;
  smoothingAlpha: number;
  calibrationMinimumSamples: number;
  calibrationMinimumScoreRange: number;
  calibrationMinimumAlignmentRange: number;
  backThresholdFraction: number;
  forwardThresholdFraction: number;
  stableFramesRequired: number;
  minimumRepDurationMs: number;
  temporaryLossGraceMs: number;
  threeDimensionalHoldMs: number;
  alignmentExcursionFraction: number;
  minimumAlignmentExcursion: number;
};

// These are conservative spike bootstrap controls for confidence, noise, and
// timing. Movement endpoints are learned from each real session rather than
// being encoded as a fixed "correct" hip angle. Phase 03.9 device data must
// validate or replace these defaults before they can become product values.
export const KNEELING_DRIVE_SPIKE_CONFIG: KneelingDriveCounterConfig = {
  minimumJointConfidence: 0.25,
  smoothingAlpha: 0.35,
  calibrationMinimumSamples: 12,
  calibrationMinimumScoreRange: 0.18,
  calibrationMinimumAlignmentRange: 0.1,
  backThresholdFraction: 0.32,
  forwardThresholdFraction: 0.68,
  stableFramesRequired: 2,
  minimumRepDurationMs: 600,
  temporaryLossGraceMs: 1_200,
  threeDimensionalHoldMs: 700,
  alignmentExcursionFraction: 0.35,
  minimumAlignmentExcursion: 0.05,
};

type Point2D = { x: number; y: number };
type Point3D = { x: number; y: number; z: number };

type SideFeature = {
  score: number;
  alignmentScore: number;
  shoulderEvidenceAvailable: boolean;
};

export function extractKneelingDriveFeatures(
  frame: PoseFrame,
  config: KneelingDriveCounterConfig = KNEELING_DRIVE_SPIKE_CONFIG
): { twoDimensional: KneelingDriveFeatureSample; threeDimensional: KneelingDriveFeatureSample } {
  const joints = new Map<PoseJointName, PoseJointObservation>(
    frame.joints.map((joint) => [joint.name, joint])
  );
  const twoDimensionalSides = ['left', 'right']
    .map((side) => extractTwoDimensionalSide(joints, side, config))
    .filter((feature): feature is SideFeature => feature !== null);
  const threeDimensionalSides = ['left', 'right']
    .map((side) => extractThreeDimensionalSide(joints, side, config))
    .filter((feature): feature is SideFeature => feature !== null);

  return {
    twoDimensional: aggregateFeatures(
      frame.timestampMs,
      'vision2D',
      twoDimensionalSides,
      joints,
      config
    ),
    threeDimensional: aggregateFeatures(
      frame.timestampMs,
      'vision3D',
      threeDimensionalSides,
      joints,
      config
    ),
  };
}

export class KneelingDriveRepCounter {
  private readonly config: KneelingDriveCounterConfig;
  private repCount = 0;
  private phase: KneelingDrivePhase = 'seekingBack';
  private smoothedScore: number | null = null;
  private calibrationScoreMinimum = Number.POSITIVE_INFINITY;
  private calibrationScoreMaximum = Number.NEGATIVE_INFINITY;
  private calibrationAlignmentMinimum = Number.POSITIVE_INFINITY;
  private calibrationAlignmentMaximum = Number.NEGATIVE_INFINITY;
  private calibrationSamples = 0;
  private backThreshold: number | null = null;
  private forwardThreshold: number | null = null;
  private stableBackFrames = 0;
  private stableForwardFrames = 0;
  private backAlignmentScore: number | null = null;
  private forwardReachedAtMs: number | null = null;
  private lastReliableTimestampMs: number | null = null;
  private lastThreeDimensionalTimestampMs: number | null = null;
  private modelSource: KneelingDriveFeatureSource | null = null;

  constructor(
    config: KneelingDriveCounterConfig = KNEELING_DRIVE_SPIKE_CONFIG
  ) {
    this.config = config;
  }

  reset(): KneelingDriveCounterSnapshot {
    this.repCount = 0;
    this.resetTrackingModel();
    return this.snapshot(unavailableFeature(Date.now(), 'reset'), false);
  }

  processFrame(frame: PoseFrame): KneelingDriveCounterSnapshot {
    const features = extractKneelingDriveFeatures(frame, this.config);
    if (features.threeDimensional.reliable) {
      this.lastThreeDimensionalTimestampMs = frame.timestampMs;
      return this.processFeatureSample(features.threeDimensional);
    }

    if (
      this.lastThreeDimensionalTimestampMs !== null &&
      frame.timestampMs - this.lastThreeDimensionalTimestampMs <
        this.config.threeDimensionalHoldMs
    ) {
      return this.processFeatureSample(
        unavailableFeature(frame.timestampMs, 'waitingForNext3DSample')
      );
    }

    return this.processFeatureSample(features.twoDimensional);
  }

  processUnavailable(
    timestampMs: number,
    reason = 'poseUnavailable'
  ): KneelingDriveCounterSnapshot {
    return this.processFeatureSample(unavailableFeature(timestampMs, reason));
  }

  processFeatureSample(
    feature: KneelingDriveFeatureSample
  ): KneelingDriveCounterSnapshot {
    if (
      !feature.reliable ||
      feature.score === null ||
      feature.alignmentScore === null ||
      feature.source === null
    ) {
      if (
        this.lastReliableTimestampMs !== null &&
        feature.timestampMs - this.lastReliableTimestampMs >
          this.config.temporaryLossGraceMs
      ) {
        this.abandonPendingCycle();
      }
      return this.snapshot(feature, false);
    }

    if (this.modelSource !== null && this.modelSource !== feature.source) {
      this.resetTrackingModel();
    }
    this.modelSource = feature.source;
    this.lastReliableTimestampMs = feature.timestampMs;
    this.smoothedScore =
      this.smoothedScore === null
        ? feature.score
        : this.config.smoothingAlpha * feature.score +
          (1 - this.config.smoothingAlpha) * this.smoothedScore;

    if (this.backThreshold === null || this.forwardThreshold === null) {
      this.updateCalibration(this.smoothedScore, feature.alignmentScore);
      return this.snapshot(feature, false);
    }

    const score = this.smoothedScore;
    let repEvent = false;

    if (score <= this.backThreshold) {
      this.stableBackFrames += 1;
      this.stableForwardFrames = 0;
    } else if (score >= this.forwardThreshold) {
      this.stableForwardFrames += 1;
      this.stableBackFrames = 0;
    } else {
      this.stableBackFrames = 0;
      this.stableForwardFrames = 0;
    }

    if (
      (this.phase === 'seekingBack' || this.phase === 'forward') &&
      this.stableBackFrames >= this.config.stableFramesRequired
    ) {
      if (
        this.phase === 'forward' &&
        this.forwardReachedAtMs !== null &&
        feature.timestampMs - this.forwardReachedAtMs >=
          this.config.minimumRepDurationMs
      ) {
        this.repCount += 1;
        repEvent = true;
      }
      this.phase = 'back';
      this.backAlignmentScore = feature.alignmentScore;
      this.forwardReachedAtMs = null;
      this.stableBackFrames = 0;
    } else if (
      this.phase === 'back' &&
      this.stableForwardFrames >= this.config.stableFramesRequired &&
      this.hasAlignmentExcursion(feature.alignmentScore)
    ) {
      this.phase = 'forward';
      this.forwardReachedAtMs = feature.timestampMs;
      this.stableForwardFrames = 0;
    }

    return this.snapshot(feature, repEvent);
  }

  private updateCalibration(score: number, alignmentScore: number) {
    this.calibrationSamples += 1;
    this.calibrationScoreMinimum = Math.min(
      this.calibrationScoreMinimum,
      score
    );
    this.calibrationScoreMaximum = Math.max(
      this.calibrationScoreMaximum,
      score
    );
    this.calibrationAlignmentMinimum = Math.min(
      this.calibrationAlignmentMinimum,
      alignmentScore
    );
    this.calibrationAlignmentMaximum = Math.max(
      this.calibrationAlignmentMaximum,
      alignmentScore
    );

    const scoreRange =
      this.calibrationScoreMaximum - this.calibrationScoreMinimum;
    const alignmentRange =
      this.calibrationAlignmentMaximum - this.calibrationAlignmentMinimum;
    if (
      this.calibrationSamples >= this.config.calibrationMinimumSamples &&
      scoreRange >= this.config.calibrationMinimumScoreRange &&
      alignmentRange >= this.config.calibrationMinimumAlignmentRange
    ) {
      this.backThreshold =
        this.calibrationScoreMinimum +
        scoreRange * this.config.backThresholdFraction;
      this.forwardThreshold =
        this.calibrationScoreMinimum +
        scoreRange * this.config.forwardThresholdFraction;
      this.phase = 'seekingBack';
      this.stableBackFrames = 0;
      this.stableForwardFrames = 0;
    }
  }

  private hasAlignmentExcursion(alignmentScore: number): boolean {
    if (this.backAlignmentScore === null) {
      return false;
    }
    const learnedAlignmentRange =
      this.calibrationAlignmentMaximum - this.calibrationAlignmentMinimum;
    const requiredExcursion = Math.max(
      this.config.minimumAlignmentExcursion,
      learnedAlignmentRange * this.config.alignmentExcursionFraction
    );
    return (
      Math.abs(alignmentScore - this.backAlignmentScore) >= requiredExcursion
    );
  }

  private resetTrackingModel() {
    this.phase = 'seekingBack';
    this.smoothedScore = null;
    this.calibrationScoreMinimum = Number.POSITIVE_INFINITY;
    this.calibrationScoreMaximum = Number.NEGATIVE_INFINITY;
    this.calibrationAlignmentMinimum = Number.POSITIVE_INFINITY;
    this.calibrationAlignmentMaximum = Number.NEGATIVE_INFINITY;
    this.calibrationSamples = 0;
    this.backThreshold = null;
    this.forwardThreshold = null;
    this.stableBackFrames = 0;
    this.stableForwardFrames = 0;
    this.backAlignmentScore = null;
    this.forwardReachedAtMs = null;
    this.lastReliableTimestampMs = null;
    this.modelSource = null;
  }

  private abandonPendingCycle() {
    this.phase = 'seekingBack';
    this.stableBackFrames = 0;
    this.stableForwardFrames = 0;
    this.backAlignmentScore = null;
    this.forwardReachedAtMs = null;
  }

  private snapshot(
    feature: KneelingDriveFeatureSample,
    repEvent: boolean
  ): KneelingDriveCounterSnapshot {
    const isCalibrated =
      this.backThreshold !== null && this.forwardThreshold !== null;
    const trackingLossMs =
      this.lastReliableTimestampMs === null
        ? Number.POSITIVE_INFINITY
        : feature.timestampMs - this.lastReliableTimestampMs;
    let trackingStatus: KneelingDriveTrackingStatus;
    let guidance: string | null;

    if (feature.reliable) {
      trackingStatus = isCalibrated ? 'ready' : 'calibrating';
      guidance = isCalibrated
        ? null
        : 'Move slowly back and forward through two comfortable cycles.';
    } else if (
      this.lastReliableTimestampMs !== null &&
      trackingLossMs <= this.config.temporaryLossGraceMs
    ) {
      trackingStatus = 'temporarilyLost';
      guidance = 'Tracking paused. Hold position and keep hips and one knee visible.';
    } else {
      trackingStatus = 'insufficient';
      guidance = 'Keep your hips and at least one knee visible.';
    }

    return {
      repCount: this.repCount,
      repEvent,
      phase: this.phase,
      trackingStatus,
      calibrationProgress: isCalibrated ? 1 : this.calibrationProgress(),
      isCalibrated,
      feature,
      smoothedScore: this.smoothedScore,
      backThreshold: this.backThreshold,
      forwardThreshold: this.forwardThreshold,
      guidance,
      lastReliableTimestampMs: this.lastReliableTimestampMs,
    };
  }

  private calibrationProgress(): number {
    if (this.calibrationSamples === 0) {
      return 0;
    }
    const sampleProgress =
      this.calibrationSamples / this.config.calibrationMinimumSamples;
    const scoreProgress =
      (this.calibrationScoreMaximum - this.calibrationScoreMinimum) /
      this.config.calibrationMinimumScoreRange;
    const alignmentProgress =
      (this.calibrationAlignmentMaximum - this.calibrationAlignmentMinimum) /
      this.config.calibrationMinimumAlignmentRange;
    return clamp(Math.min(sampleProgress, scoreProgress, alignmentProgress));
  }
}

function aggregateFeatures(
  timestampMs: number,
  source: KneelingDriveFeatureSource,
  sideFeatures: SideFeature[],
  joints: Map<PoseJointName, PoseJointObservation>,
  config: KneelingDriveCounterConfig
): KneelingDriveFeatureSample {
  const criticalJointCount = [
    'leftHip',
    'rightHip',
    'leftKnee',
    'rightKnee',
  ].filter((name) =>
    isReliableJoint(joints.get(name as PoseJointName), config)
  ).length;
  if (sideFeatures.length === 0) {
    return {
      timestampMs,
      reliable: false,
      score: null,
      alignmentScore: null,
      source,
      criticalJointCount,
      shoulderEvidenceAvailable: false,
      reason: 'hipsOrKneesUnavailable',
    };
  }

  return {
    timestampMs,
    reliable: true,
    score: average(sideFeatures.map((feature) => feature.score)),
    alignmentScore: average(
      sideFeatures.map((feature) => feature.alignmentScore)
    ),
    source,
    criticalJointCount,
    shoulderEvidenceAvailable: sideFeatures.some(
      (feature) => feature.shoulderEvidenceAvailable
    ),
    reason: null,
  };
}

function extractTwoDimensionalSide(
  joints: Map<PoseJointName, PoseJointObservation>,
  side: string,
  config: KneelingDriveCounterConfig
): SideFeature | null {
  const hip = joints.get(`${side}Hip` as PoseJointName);
  const knee = joints.get(`${side}Knee` as PoseJointName);
  if (!isReliableJoint(hip, config) || !isReliableJoint(knee, config)) {
    return null;
  }
  const hipPoint = { x: hip.x, y: hip.y } as Point2D;
  const kneePoint = { x: knee.x, y: knee.y } as Point2D;
  const alignmentScore = verticalAlignment2D(hipPoint, kneePoint);
  const shoulder = joints.get(`${side}Shoulder` as PoseJointName);
  const shoulderEvidenceAvailable = isReliableJoint(shoulder, config);

  // Hips relative to knees remain the 2D counting signal. Shoulder geometry is
  // diagnostic corroboration only, so torso rocking cannot create a rep and a
  // cropped shoulder does not block counting.
  return {
    score: alignmentScore,
    alignmentScore,
    shoulderEvidenceAvailable,
  };
}

function extractThreeDimensionalSide(
  joints: Map<PoseJointName, PoseJointObservation>,
  side: string,
  config: KneelingDriveCounterConfig
): SideFeature | null {
  const hip = joints.get(`${side}Hip` as PoseJointName);
  const knee = joints.get(`${side}Knee` as PoseJointName);
  const shoulder = joints.get(`${side}Shoulder` as PoseJointName);
  if (
    !isReliableJoint(hip, config) ||
    !isReliableJoint(knee, config) ||
    !hip.position3D ||
    !knee.position3D ||
    !shoulder?.position3D
  ) {
    return null;
  }

  const hipPoint = position3D(hip.position3D);
  const kneePoint = position3D(knee.position3D);
  const shoulderPoint = position3D(shoulder.position3D);
  const alignmentScore = verticalAlignment3D(hipPoint, kneePoint);
  const hipAngleScore = angle3D(shoulderPoint, hipPoint, kneePoint) / 180;
  return {
    score: hipAngleScore * 0.65 + alignmentScore * 0.35,
    alignmentScore,
    shoulderEvidenceAvailable: isReliableJoint(shoulder, config),
  };
}

function isReliableJoint(
  joint: PoseJointObservation | undefined,
  config: KneelingDriveCounterConfig
): joint is PoseJointObservation & { x: number; y: number } {
  return Boolean(
    joint?.available &&
      joint.x !== null &&
      joint.y !== null &&
      joint.confidence >= config.minimumJointConfidence
  );
}

function verticalAlignment2D(hip: Point2D, knee: Point2D): number {
  const dx = hip.x - knee.x;
  const dy = hip.y - knee.y;
  const length = Math.hypot(dx, dy);
  return length === 0 ? 0.5 : clamp((dy / length + 1) / 2);
}

function verticalAlignment3D(hip: Point3D, knee: Point3D): number {
  const dx = hip.x - knee.x;
  const dy = hip.y - knee.y;
  const dz = hip.z - knee.z;
  const length = Math.hypot(dx, dy, dz);
  return length === 0 ? 0.5 : clamp((dy / length + 1) / 2);
}

function angle3D(a: Point3D, vertex: Point3D, b: Point3D): number {
  const first = {
    x: a.x - vertex.x,
    y: a.y - vertex.y,
    z: a.z - vertex.z,
  };
  const second = {
    x: b.x - vertex.x,
    y: b.y - vertex.y,
    z: b.z - vertex.z,
  };
  const denominator =
    Math.hypot(first.x, first.y, first.z) *
    Math.hypot(second.x, second.y, second.z);
  if (denominator === 0) {
    return 0;
  }
  const cosine = clampSigned(
    (first.x * second.x + first.y * second.y + first.z * second.z) /
      denominator
  );
  return (Math.acos(cosine) * 180) / Math.PI;
}

function position3D(point: PoseJointPosition3D): Point3D {
  return { x: point.x, y: point.y, z: point.z };
}

function unavailableFeature(
  timestampMs: number,
  reason: string
): KneelingDriveFeatureSample {
  return {
    timestampMs,
    reliable: false,
    score: null,
    alignmentScore: null,
    source: null,
    criticalJointCount: 0,
    shoulderEvidenceAvailable: false,
    reason,
  };
}

function average(values: number[]): number {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function clamp(value: number): number {
  return Math.min(Math.max(value, 0), 1);
}

function clampSigned(value: number): number {
  return Math.min(Math.max(value, -1), 1);
}
