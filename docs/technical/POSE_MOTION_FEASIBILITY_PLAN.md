# Pose & Motion Tracking Feasibility Plan

**Status:** Active Phase 03 spike plan

**Branch:** `spike/vision-pose-foundation`

**Authority:** `docs/product/MVP_SCOPE.md` and `docs/DECISIONS.md`

## 1. Objective

Prove that on-device pose observations can support broad movement verification and tolerant repetition counting without requiring perfect full-body framing or allowing tracking failure to trap the user in the locked state.

The normal path remains automatic rep counting. When reliable tracking cannot be recovered, assisted completion must allow the daily requirement to finish and selected apps to unlock.

## 2. Privacy and Data Boundary

Preferred processing boundary:

Camera or local test input

→ native on-device Vision processing

→ normalized derived pose observations

→ movement state / repetition engine

→ minimal derived completion data

Raw camera frames must not be uploaded or persisted by default. The React Native layer should receive only the minimum derived information required for diagnostics, movement logic, and UI.

No third-party pose SDK is approved by this plan. Adding one later requires an explicit dependency, privacy, and release review.

## 3. Accepted Reliability Behavior

- Do not require a complete skeleton when the current movement can be verified from a smaller joint set.
- Treat per-joint availability and confidence independently.
- Smooth observations over time rather than judging isolated frames.
- Count broad movement state transitions rather than exact form.
- Preserve valid repetitions through temporary observation loss.
- Never reset completed progress merely because tracking confidence drops.
- Provide limited, calm setup/recovery guidance.
- Offer assisted completion when automatic recovery fails.
- Allow assisted completion to satisfy the routine and unlock selected apps.

Exact thresholds and timings must come from real-device evidence rather than being invented during foundation work.

## 4. Checkpoint A — Movement-Agnostic Offline Foundation

This checkpoint can proceed before Apple Developer Program enrollment is ready.

### Scope

1. Define a platform-neutral pose observation contract containing:
   - joint identifier;
   - normalized coordinates;
   - per-joint confidence;
   - frame timestamp;
   - orientation / mirroring metadata;
   - explicit unavailable-joint representation.
2. Establish an application-local Apple Vision adapter boundary.
3. Process local test input without camera permission, networking, or persistence.
4. Return typed outcomes for:
   - pose available;
   - partial pose available;
   - no person detected;
   - unsupported or invalid input;
   - native processing failure.
5. Keep movement-specific rules and production UI out of this checkpoint.

### Acceptance Evidence

- TypeScript and native boundaries compile.
- The iOS Simulator build loads the native adapter.
- Local input produces normalized derived observations or a typed failure result.
- Missing joints do not crash the bridge.
- No raw image/video data is uploaded or persisted.
- No camera permission is added by Checkpoint A.

Checkpoint A proves architecture and data flow only. It does not prove live-camera performance, rep-counting accuracy, or real-world framing tolerance.

## 5. Checkpoint B — Real-Device Live Camera Feasibility

This checkpoint requires a physical iPhone and must include the applicable camera permission and release-impact review before implementation.

Validate:

- front/rear camera choice and practical phone placement;
- portrait orientation and mirrored preview handling;
- end-to-end observation latency and sustained performance;
- reasonable room sizes and camera distances;
- movement-specific partial-body visibility;
- low/uneven light and common clothing variation;
- temporary occlusion and leaving/re-entering frame;
- thermal and battery behavior for a full routine;
- permission denied/revoked and interruption recovery;
- confirmation that raw frames are not stored or uploaded.

## 6. Checkpoint C — Representative Movement and Assisted Completion

Select one representative MVP movement before implementing movement-specific logic.

For that movement:

1. Define the minimum required joints/body regions.
2. Define tolerant movement states and temporal smoothing.
3. Count complete state transitions without form scoring.
4. Preserve count through temporary tracking loss.
5. Provide one calm recovery prompt when framing becomes unusable.
6. Enter assisted completion when reliable tracking cannot be restored.
7. Verify both automatic and assisted paths complete the routine and unlock correctly.

The representative movement, exact repetition target, confidence thresholds, recovery duration, assisted confirmation friction, and progress presentation are intentionally not selected by this plan.

## 7. Explicit Non-Goals

- all seven movement detectors;
- detailed form correction or scoring;
- production camera/training UI;
- cloud video analysis;
- stored training recordings;
- custom Core ML model training;
- third-party pose SDK adoption;
- Android motion implementation;
- coach animations or final audio;
- final assisted-completion UX polish.

## 8. Immediate Next Engineering Task

After this plan is accepted and committed, implement Checkpoint A only:

1. define the normalized pose observation TypeScript types;
2. scaffold the Apple-only local Vision module;
3. add a local-input diagnostic method with typed results;
4. validate compilation, module loading, privacy boundaries, and missing-joint handling;
5. stop before camera permission, live capture, or movement-specific counting.

Checkpoint B and Checkpoint C remain explicitly dependent on physical-iPhone evidence.
