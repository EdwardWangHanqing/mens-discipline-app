# Pose & Motion Tracking Feasibility Plan

**Status:** Phase 03.9 closed — technical capability demonstrated; mandatory MVP UX feasibility rejected

**Validation branch:** `spike/vision-kneeling-drive`

**Authority:** `docs/product/MVP_SCOPE.md`, `docs/DECISIONS.md` (especially DEC-021)

## 1. Final Conclusion

The real-device Kneeling Drive / Kneeling Hip Thrust spike demonstrated that an
on-device AVFoundation → Apple Vision → normalized pose → movement-state pipeline
can detect pose and count a representative movement.

It did not meet the usability bar for a mandatory MVP completion path:

- movement-critical joints leave frame during normal motion often enough to make
  tracking too sensitive;
- partial-body framing remains too brittle;
- landscape side view performs materially better than portrait;
- front and near-front views are unreliable;
- calibration and framing create too much daily-user friction.

The accepted result is:

**Technical capability demonstrated; mandatory MVP UX feasibility rejected due
to framing/tracking friction.**

This is a usability/product conclusion, not a claim that Apple Vision cannot
detect poses or that the prototype never counted repetitions.

## 2. Current Product Consequence

Camera / Apple Vision is not an MVP user feature, release gate, reviewer path, or
mandatory completion path. The MVP does not request camera permission.

Do not replace the rejected path with manual tapping, hardware-volume-button
counting, or another proof/counting workaround. The accepted MVP path is guided
cadence training:

Movement demonstration

→ countdown

→ guided repetitions

→ set completion

→ 20-second rest

→ next set

→ routine completion

→ accountability satisfied / unlock.

Camera/Vision may return only through an explicitly approved post-MVP R&D task
with a fresh permission, privacy, release, and usability review.

## 3. Privacy and Data Boundary Demonstrated

The spike used this boundary:

Camera or local test input

→ native on-device Vision processing

→ normalized derived pose observations

→ movement state / repetition engine

→ non-sensitive diagnostic output.

Raw camera frames were processed in memory and were not uploaded, persisted,
recorded, or bridged to React Native. No microphone/photo-library permission,
networking, cloud analysis, or third-party camera/pose SDK was added.

This remains the required privacy baseline if the R&D is ever resumed; it does
not create an MVP camera requirement.

## 4. Checkpoint A — Offline Foundation

The accepted movement-agnostic foundation remains in the repository:

- 19 canonical joints with normalized coordinates, confidence, timestamps,
  orientation/mirroring, and explicit unavailable joints;
- an application-local Apple Vision adapter for local image files;
- typed complete/partial/no-pose/input/processing outcomes;
- no camera permission, live capture, networking, or image/video persistence.

The iOS Simulator loaded the adapter and returned the expected typed
`invalidInput / fileNotFound` result. A valid local PNG reached Vision but returned
typed `processingFailed / visionError` in the Simulator, so that checkpoint proved
the adapter/data boundary rather than reliable pose inference.

## 5. Phase 03.9 Prototype Architecture

The historical live prototype implemented:

Camera / `AVCaptureSession`

→ Apple Vision 2D plus optional iOS 17+ 3D observations

→ normalized 19-joint pose frame with optional model-relative 3D positions

→ movement-critical visibility/confidence assessment

→ pure-TypeScript Kneeling Drive adaptive state machine

→ repetition events and non-sensitive validation diagnostics.

The 2D feature used hip position relative to the same-side knee to ignore
whole-body translation and shoulder-only rocking. One hip/knee pair was
sufficient; shoulders were corroborating rather than mandatory. Optional 3D
geometry was preferred when available for depth evidence.

The state machine included session endpoint learning, smoothing, hysteresis,
stable-frame requirements, minimum cycle time, movement excursion checks, and a
bounded pose-loss grace period. Six deterministic tests covered a complete
cycle, incomplete/jitter rejection, short/long pose loss, translation and
shoulder-rocking rejection, and partial-body critical-joint behavior.

Repository checks, native/full builds, signing, strict signature validation,
physical-device installation, and live use were completed. The qualitative
real-device finding above is authoritative; no unsupported quantitative accuracy
rate is claimed.

## 6. Source Preservation

The full live-camera implementation is preserved in Git checkpoint `463e4f2`
(`spike: prototype Kneeling Drive Vision counting`) on
`spike/vision-kneeling-drive`.

The branch tip intentionally removes the live-camera diagnostic route, camera
purpose string, AVFoundation capture view, and movement counter from the MVP
runtime. This prevents an unfinished beta feature from shipping while keeping
the implementation recoverable for future R&D. The offline Vision foundation is
retained in the current source tree.

## 7. Historical Non-Goals and Unfinished Validation

The spike did not produce or approve:

- seven production movement detectors;
- a production camera/training UI;
- assisted-completion UX;
- detailed form correction/scoring;
- exact production confidence thresholds;
- custom Core ML training;
- Android motion tracking;
- stored recordings or cloud video analysis.

Those items are not open MVP tasks. Seven-movement Camera validation and Camera
reviewer instructions are explicitly removed from MVP release planning.

## 8. Official References Used

- [Requesting authorization to capture and save media](https://developer.apple.com/documentation/avfoundation/requesting-authorization-to-capture-and-save-media)
- [Detecting Human Body Poses in Images](https://developer.apple.com/documentation/vision/detecting-human-body-poses-in-images)
- [Identifying 3D human body poses in images](https://developer.apple.com/documentation/vision/identifying-3d-human-body-poses-in-images)
- [Detecting human body poses in 3D with Vision](https://developer.apple.com/documentation/vision/detecting-human-body-poses-in-3d-with-vision)

Apple's 2D APIs expose normalized joint coordinates/confidence, while its 3D
sample guidance expects broad limb visibility. That documented visibility
constraint is consistent with the real-device framing friction observed here.
