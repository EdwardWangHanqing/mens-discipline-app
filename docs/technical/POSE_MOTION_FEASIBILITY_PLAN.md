# Pose & Motion Tracking Feasibility Plan

**Status:** Checkpoint A accepted; Phase 03.9 Checkpoints B–C implementation is built and installed, awaiting physical movement evidence

**Branch:** `spike/vision-kneeling-drive`

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

## 8. Checkpoint A Implementation Status

Checkpoint A is implemented on `spike/vision-pose-foundation`:

- the TypeScript contract defines 19 canonical joints, normalized coordinates, per-joint confidence, timestamp, orientation, mirroring, coordinate origin, and explicit unavailable joints;
- the application-local `ExpoVisionPose` module wraps Apple's on-device Vision framework;
- the native API accepts local image files only and rejects network/non-file URIs;
- processing runs through an Expo asynchronous native function rather than the main UI queue;
- JavaScript receives only derived pose observations and typed status/error metadata;
- typed results distinguish complete pose, partial pose, no pose, invalid input, and Vision processing failure;
- the Technical Baseline screen includes an engineering-only bridge diagnostic;
- no camera permission, live capture, image picker, networking, raw-image return, or persistence was added.

Local validation proved that the module compiles, autolinks, loads in the iOS Simulator, and returns `invalidInput / fileNotFound` across the native bridge for a missing local file. A valid local PNG reached the Vision request and returned the typed `processingFailed / visionError` result in the iOS 26.5 Simulator. Therefore, Checkpoint A proves the adapter and error/data boundary but does **not** claim successful Simulator pose inference. A partial-pose result and normalized joint output still require representative human input and physical-iPhone validation.

## 9. Immediate Next Engineering Task

1. Review and accept the Checkpoint A implementation as an architecture checkpoint.
2. Keep Checkpoint A isolated on `spike/vision-pose-foundation` until owner acceptance.
3. When Apple Developer Program enrollment and a physical iPhone are ready, perform Checkpoint B before implementing production live-camera behavior.
4. Select one representative MVP movement before Checkpoint C movement logic.
5. Stop before camera permission, live capture, movement-specific counting, or assisted-completion UI until the applicable checkpoint and release review are ready.

## 10. Phase 03.9 Implementation Ready for Device Validation

Phase 03.9 selects **Kneeling Drive / Kneeling Hip Thrust** as the representative movement and implements the approved live-camera/counting slice without adding production training UI or assisted completion.

Architecture:

Camera / `AVCaptureSession`

→ Apple Vision 2D plus optional iOS 17+ 3D observations

→ normalized 19-joint pose frame with optional model-relative 3D positions

→ movement-critical visibility and confidence assessment

→ Kneeling Drive features and adaptive state machine in pure TypeScript

→ rep events and non-sensitive validation diagnostics.

The 2D path uses hip position relative to the same-side knee so whole-body translation and shoulder-only rocking do not produce motion evidence. One hip/knee pair is sufficient; shoulders, head, arms, hands, feet, and ankles are not required. When Vision supplies a 3D skeleton, view-invariant hip/shoulder/knee geometry becomes the preferred evidence for near-front movement, while 2D remains the required partial-body fallback. Apple 3D is not treated as a full-body requirement.

Session movement endpoints are learned from observed geometry. Smoothing, hysteresis, stable frames, minimum cycle time, relative hip/knee excursion, and a bounded tracking-loss grace period prevent jitter, half reps, double counts, whole-body translation, and short pose loss from corrupting progress. The checked-in bootstrap confidence/noise/timing values are spike parameters pending the required real-device matrix; they are not locked product biomechanics.

Repository/build evidence currently passes, but no live-pose or movement-accuracy claim is made. The signed app is installed on the paired iPhone; the next action is to unlock it and record five post-calibration reps in each of the six required side/oblique/near-front × fuller/partial scenarios. Tune only from those results, then rerun validation, document the observed 2D/3D decision, commit, and push.

Official implementation references reviewed for this slice:

- [Requesting authorization to capture and save media](https://developer.apple.com/documentation/avfoundation/requesting-authorization-to-capture-and-save-media)
- [Detecting Human Body Poses in Images](https://developer.apple.com/documentation/vision/detecting-human-body-poses-in-images)
- [Identifying 3D human body poses in images](https://developer.apple.com/documentation/vision/identifying-3d-human-body-poses-in-images)
- [Detecting human body poses in 3D with Vision](https://developer.apple.com/documentation/vision/detecting-human-body-poses-in-3d-with-vision)

Apple documents 2D normalized joint coordinates/confidence and recommends substantial key-region visibility, while the 3D sample asks for all limbs to be visible. The project therefore treats 2D hips/knees as the tolerant partial-body baseline and 3D as optional evidence whose practical value must be established on the real device.
