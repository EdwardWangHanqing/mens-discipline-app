import assert from 'node:assert/strict';
import test from 'node:test';

import {
  extractKneelingDriveFeatures,
  KneelingDriveRepCounter,
} from './kneelingDrive.ts';

function reliableSample(timestampMs, score, source = 'vision2D') {
  return {
    timestampMs,
    reliable: true,
    score,
    alignmentScore: score,
    source,
    criticalJointCount: 4,
    shoulderEvidenceAvailable: true,
    reason: null,
  };
}

function calibrate(counter, startTimestampMs = 0) {
  let timestampMs = startTimestampMs;
  for (let index = 0; index < 6; index += 1) {
    counter.processFeatureSample(reliableSample(timestampMs, 0.2));
    timestampMs += 100;
  }
  let snapshot;
  for (let index = 0; index < 6; index += 1) {
    snapshot = counter.processFeatureSample(reliableSample(timestampMs, 0.82));
    timestampMs += 100;
  }
  assert.equal(snapshot.isCalibrated, true);
  return timestampMs;
}

function move(counter, timestampMs, score, frames, intervalMs = 100) {
  let snapshot;
  for (let index = 0; index < frames; index += 1) {
    snapshot = counter.processFeatureSample(reliableSample(timestampMs, score));
    timestampMs += intervalMs;
  }
  return { snapshot, timestampMs };
}

function completeRep(counter, startTimestampMs) {
  let result = move(counter, startTimestampMs, 0.2, 5);
  result = move(counter, result.timestampMs, 0.82, 9);
  result = move(counter, result.timestampMs, 0.2, 5);
  return result;
}

test('counts exactly one BACK → FORWARD → BACK cycle', () => {
  const counter = new KneelingDriveRepCounter();
  const timestampMs = calibrate(counter);
  const result = completeRep(counter, timestampMs);

  assert.equal(result.snapshot.repCount, 1);
  assert.equal(result.snapshot.phase, 'back');
});

test('does not count an incomplete half-rep or threshold jitter', () => {
  const counter = new KneelingDriveRepCounter();
  let timestampMs = calibrate(counter);
  let result = move(counter, timestampMs, 0.2, 5);
  result = move(counter, result.timestampMs, 0.48, 14);
  result = move(counter, result.timestampMs, 0.2, 5);
  timestampMs = result.timestampMs;

  assert.equal(result.snapshot.repCount, 0);

  result = completeRep(counter, timestampMs);
  assert.equal(result.snapshot.repCount, 1);
  result = move(counter, result.timestampMs, 0.49, 20, 50);
  assert.equal(result.snapshot.repCount, 1);
});

test('preserves an armed cycle through a short pose interruption', () => {
  const counter = new KneelingDriveRepCounter();
  let timestampMs = calibrate(counter);
  let result = move(counter, timestampMs, 0.2, 5);
  result = move(counter, result.timestampMs, 0.82, 5);
  timestampMs = result.timestampMs;

  const lost = counter.processUnavailable(timestampMs + 400, 'noPose');
  assert.equal(lost.trackingStatus, 'temporarilyLost');

  result = move(counter, timestampMs + 800, 0.2, 5);
  assert.equal(result.snapshot.repCount, 1);
});

test('abandons only the in-progress cycle after prolonged pose loss', () => {
  const counter = new KneelingDriveRepCounter();
  let timestampMs = calibrate(counter);
  let result = completeRep(counter, timestampMs);
  assert.equal(result.snapshot.repCount, 1);
  timestampMs = result.timestampMs;

  result = move(counter, timestampMs, 0.82, 5);
  const lost = counter.processUnavailable(
    result.timestampMs + 1_500,
    'noPose'
  );
  assert.equal(lost.repCount, 1);
  assert.equal(lost.phase, 'seekingBack');

  result = move(counter, result.timestampMs + 1_600, 0.2, 5);
  assert.equal(result.snapshot.repCount, 1);
});

test('2D feature ignores whole-body translation and shoulder-only rocking', () => {
  const first = poseFrame({ hipX: 0.4, hipY: 0.58, kneeX: 0.4, kneeY: 0.25, shoulderY: 0.85 });
  const translated = poseFrame({ hipX: 0.6, hipY: 0.68, kneeX: 0.6, kneeY: 0.35, shoulderY: 0.95 });
  const rockedShoulder = poseFrame({ hipX: 0.4, hipY: 0.58, kneeX: 0.4, kneeY: 0.25, shoulderY: 0.63 });

  const firstFeature = extractKneelingDriveFeatures(first).twoDimensional;
  const translatedFeature = extractKneelingDriveFeatures(translated).twoDimensional;
  const rockedFeature = extractKneelingDriveFeatures(rockedShoulder).twoDimensional;

  assert.ok(Math.abs(firstFeature.score - translatedFeature.score) < 1e-9);
  assert.ok(Math.abs(firstFeature.score - rockedFeature.score) < 1e-9);
});

test('accepts hips plus one knee without shoulders, but not a hip alone', () => {
  const partial = poseFrame({ includeShoulders: false, includeKnees: true });
  const insufficient = poseFrame({ includeShoulders: false, includeKnees: false });

  const partialFeature = extractKneelingDriveFeatures(partial).twoDimensional;
  const insufficientFeature =
    extractKneelingDriveFeatures(insufficient).twoDimensional;

  assert.equal(partialFeature.reliable, true);
  assert.equal(partialFeature.shoulderEvidenceAvailable, false);
  assert.equal(insufficientFeature.reliable, false);
  assert.equal(insufficientFeature.reason, 'hipsOrKneesUnavailable');
});

function poseFrame({
  hipX = 0.4,
  hipY = 0.58,
  kneeX = 0.4,
  kneeY = 0.25,
  shoulderY = 0.85,
  includeShoulders = true,
  includeKnees = true,
} = {}) {
  const joints = [
    joint('leftHip', hipX, hipY),
    joint('rightHip', hipX + 0.12, hipY),
  ];
  if (includeKnees) {
    joints.push(
      joint('leftKnee', kneeX, kneeY),
      joint('rightKnee', kneeX + 0.12, kneeY)
    );
  }
  if (includeShoulders) {
    joints.push(
      joint('leftShoulder', hipX, shoulderY),
      joint('rightShoulder', hipX + 0.12, shoulderY)
    );
  }
  return {
    source: 'liveCamera',
    timestampMs: 1_000,
    orientation: 'right',
    isMirrored: false,
    coordinateOrigin: 'bottomLeft',
    overallConfidence: 0.9,
    availableJointCount: joints.length,
    joints,
  };
}

function joint(name, x, y) {
  return { name, x, y, confidence: 0.9, available: true };
}
