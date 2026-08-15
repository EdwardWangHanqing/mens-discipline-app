# Men's Discipline App — Project Handoff

**Last updated:** 2026-08-14 (America/Vancouver)

**Repository:** `/Users/hanqingwang/Developer/mens-discipline-app`

**Active branch after accepted integration:** `main`

**Retained source branch:** `spike/vision-pose-foundation`

## Purpose and Authority

This is the short continuity summary for a new Codex conversation. It records the current checkpoint, validated boundaries, blockers, and next safe action; it does not replace the authoritative project documents.

If documents conflict, follow this order and surface the conflict:

1. `AGENTS.md`
2. latest accepted decision in `docs/DECISIONS.md`
3. `docs/product/MVP_SCOPE.md`
4. `docs/product/MASTER_PRODUCT_PLAN.md`

Before meaningful work, read `AGENTS.md`, this handoff, `docs/CURRENT_PHASE.md`, `docs/DECISIONS.md`, and `docs/product/MVP_SCOPE.md`. Also read:

- `docs/technical/POSE_MOTION_FEASIBILITY_PLAN.md` for pose/motion work;
- `docs/release/IOS_LAUNCH_READINESS.md` and `docs/release/APP_REVIEW_RISK_REGISTER.md` before permission, capability, privacy, subscription, TestFlight, or App Store work;
- `docs/business/BUSINESS_APPLE_ACCOUNT_PLAN.md` for Apple membership or company/commercial setup.

Always begin a coding task with `git status --short --branch` and preserve existing work.

## Owner Working Agreement

- Continue routine implementation, narrow fixes, documentation, validation, stable commits, and branch pushes autonomously under `AGENTS.md`.
- Explain important technical and product decisions in clear Chinese.
- Stop for owner action when Apple enrollment/payment, login/2FA, a physical device, a material product choice, or a dangerous operation is required.
- Do not merge a checkpoint into `main` without explicit owner acceptance.
- Do not install, invoke, search for, or depend on Superpowers.
- Do not broaden MVP scope or add an SDK, permission, capability, entitlement, or data flow silently.

## Locked Product and Technical Direction

- iOS first, using React Native / Expo plus native iOS where required.
- Current priority: Family Controls feasibility, on-device pose/motion feasibility, and reliable React Native ↔ native iOS integration.
- Camera is for broad movement verification and repetition counting, not strict form scoring.
- Raw camera video must not be uploaded or persisted by default; expose only minimum derived pose/training data.
- Automatic counting is the normal path, using movement-specific minimum joints and tolerant temporal logic.
- Tracking loss must preserve valid progress; assisted completion must allow routine completion and app unlock when tracking cannot recover.
- Exact movement thresholds, timings, recovery duration, and assisted-completion friction require real-device evidence.

The accepted reliability decision is DEC-020 in `docs/DECISIONS.md`. The implementation plan is `docs/technical/POSE_MOTION_FEASIBILITY_PLAN.md`.

## Accepted Integration State

The owner accepted Pose Checkpoint A on 2026-08-14 and explicitly authorized a fast-forward-only integration into `main` followed by a push to `origin/main`. The source branch must remain available locally and remotely.

Immediately before this acceptance update:

- working tree: clean;
- source branch: `spike/vision-pose-foundation` at `8d2e7b6276459ea778de2333345d2283c630cafb`;
- `main` / `origin/main`: `9f433ff0a28913e7de1c288b6563428a24a761fe`;
- `main` was the source branch's linear ancestor, with five source commits ahead and no divergence.

After the authorized integration, local `main`, `origin/main`, and the retained source branch are expected to point to the accepted checkpoint including this documentation update. Verify exact hashes from Git rather than treating the pre-update hashes above as the final integrated SHA.

Key commits:

- `6e4753162b8feb3ac05893391bd2355a590274ad` — official Expo application baseline;
- `aa8351350db14c31e56e0f638b70b05cbef4cb96` — Family Controls authorization foundation;
- `9f433ff0a28913e7de1c288b6563428a24a761fe` — Family Controls owner acceptance; merged `main` state;
- `a5110c745ce0d029ce8574db9f7149ce925066ee` — tolerant pose recovery decision and Checkpoint A plan;
- `8a6f7378b6a15cafb31c2699df354442e216f5ee` — offline Apple Vision pose foundation;
- `de150e8fcf8c5d71e231c6b36467e9a5c9a507dd` — Pose Checkpoint A verification handoff.

## Completed Checkpoints

### Official Expo Baseline

- Expo SDK 57 application builds and launches in the iOS Simulator.
- Bundle ID is locked as `com.temperline.mensdiscipline`.
- Expo Continuous Native Generation is the current working native-project strategy.

### Family Controls Checkpoint 1 — Accepted and Merged

- Application-local `ExpoFamilyControls` module reads authorization status and requests individual authorization.
- `AuthorizationCenter` access uses the required main queue / main actor handling.
- The main-app development entitlement is tracked in `app.json`.
- Simulator build, launch, module load, and `notDetermined` status read succeeded.
- The iOS Simulator reports `FamilyControlsAgent` unavailable; this is not real-device authorization, signing, provisioning, or distribution-entitlement evidence.

Not yet implemented: FamilyActivityPicker, shielding, Screen Time extensions, App Groups, scheduling, and the complete lock → routine → unlock prototype.

### Pose Checkpoint A — Owner Accepted and Integrated

Owner acceptance is limited to:

- the offline Apple Vision native-module foundation;
- the Swift and TypeScript type contract;
- the 19-joint data structure;
- the local-file and derived-data privacy boundary;
- typed error results;
- the React Native ↔ Swift bridge;
- the Pose Checkpoint A/B/C technical plan.

Acceptance does not claim that real human pose inference, partial-human behavior, orientation/mirroring output, live camera processing, automatic counting, assisted completion, or unlock integration has been verified.

- Application-local Apple-only `ExpoVisionPose` module wraps `VNDetectHumanBodyPoseRequest` for caller-provided local image files.
- TypeScript contract defines 19 joints, normalized coordinates, confidence, timestamp, orientation/mirroring, coordinate origin, and explicit unavailable joints.
- Typed results distinguish complete pose, partial pose, no pose, invalid input, and native processing failure.
- Network/non-file URIs and unsupported inputs are rejected.
- React Native receives derived observations/status only.
- No camera permission, live capture, image picker, networking, raw-image return, image/video persistence, movement rules, counter, assisted-completion UI, or production training UI was added.

Simulator evidence:

- the module autolinks, compiles, loads, and returns `invalidInput / fileNotFound` across the native bridge;
- a valid local PNG reached Vision but returned typed `processingFailed / visionError` in the iOS 26.5 Simulator;
- no successful runtime result has yet produced `poseAvailable`, `partialPoseAvailable`, or `noPose`;
- the valid-PNG `visionError` requires continued investigation during the physical-device checkpoint;
- therefore successful human-pose inference, partial-body behavior, orientation/mirroring output, live-camera performance, and counting are not yet claimed.

## Validation Summary

The validated checkpoints and acceptance review passed:

- `git diff --check`;
- `npm run lint`;
- `npx tsc --noEmit`;
- `npx expo-doctor` — the acceptance review used a temporary `/tmp` npm cache and passed 21/21 without changing `~/.npm` ownership; the earlier checkpoint's historical 20/20 result is not represented as a fresh run;
- Expo config/autolinking inspection;
- CocoaPods integration;
- individual native module target builds;
- full iOS Simulator Debug build;
- Simulator installation, launch, native-module loading, and diagnostic rendering.

Existing third-party Expo / React Native build warnings remain; no project-source build error was observed. Do not convert Simulator evidence into a real-device claim.

## Current Blockers and Explicit Non-Goals

The owner has not yet completed Apple Developer Program enrollment and will report when ready. Physical-iPhone validation is also pending.

Until the applicable real-device checkpoint and release review, do not add or claim:

- live camera permission/capture or physical-device pose performance;
- movement-specific thresholds, repetition counting, or assisted-completion implementation;
- real-device Family Controls authorization;
- app selection, shielding, extensions, App Groups, scheduling, or reliable unlock integration;
- production training UI, TestFlight readiness, or App Store readiness.

## Authorized Integration and Next Safe Sequence

1. The owner accepted the limited Checkpoint A scope and authorized fast-forward-only integration into `main`, pushing `origin/main`, and retaining the source branch.
2. After that integration, stop and wait for the owner to confirm Apple Developer Program enrollment, provisioning/signing readiness, and physical iPhone availability.
3. Validate Family Controls authorization on the real iPhone.
4. Investigate the valid-local-PNG Vision failure and perform Pose Checkpoint B live-camera feasibility only after camera-permission and release-impact review.
5. Select one representative MVP movement before Checkpoint C tolerant counting, recovery, and assisted completion work.
6. Build the smallest App Selection → Lock/Shield → Routine → Completion → Unlock prototype only after the underlying real-device paths are proven.

Do not fill the Apple/device gate with production UI or invented thresholds.

## Release, Privacy, and Rollback

Family Controls creates a real Apple capability, provisioning, distribution-entitlement, and App Review dependency. Pose Checkpoint A uses Apple system Vision/ImageIO only and added no entitlement, permission, third-party SDK, networking, storage, account, subscription, or App Privacy collection change.

Safe comparison/rollback points:

- Family Controls pre-checkpoint baseline: `6e47531`; revert accepted commits rather than rewriting history.
- Pose implementation baseline: `a5110c7`; compare with `git diff a5110c7..8a6f737`.
- To undo Pose Checkpoint A after review, create revert commits for its implementation/documentation commits; do not reset, clean, or force-push.

## New-Chat Startup Instruction

> Open `/Users/hanqingwang/Developer/mens-discipline-app`. First run `git status --short --branch`, then completely read `AGENTS.md`, `docs/PROJECT_HANDOFF.md`, `docs/CURRENT_PHASE.md`, `docs/product/MVP_SCOPE.md`, `docs/DECISIONS.md`, and `docs/technical/POSE_MOTION_FEASIBILITY_PLAN.md`. Read the relevant release documents before permission, capability, account, privacy, subscription, TestFlight, or App Store work. Preserve all existing work. Family Controls Checkpoint 1 and the owner-accepted Pose Checkpoint A are integrated into `main`; retain `spike/vision-pose-foundation`. Pose acceptance is limited to the offline Apple Vision module foundation, Swift/TypeScript contract, 19-joint structure, local-file/derived-data boundary, typed errors, bridge, and A/B/C plan. No runtime result has yet produced `poseAvailable`, `partialPoseAvailable`, or `noPose`; a valid local PNG returned `processingFailed / visionError` and requires physical-device investigation. The accepted product direction is tolerant automatic counting plus assisted completion so tracking failure can never trap the user in the locked state, but neither path is implemented yet. Apple Developer Program enrollment, Family Controls real-device validation, and Pose Checkpoint B remain pending. Until the owner confirms the physical-device gate, do not add camera permission/live capture, movement thresholds, automatic counting, assisted-completion UI, or production UI. Do not use Superpowers. Explain important decisions and final status in Chinese.
