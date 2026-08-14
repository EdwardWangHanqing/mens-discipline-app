# Men's Discipline App — Project Handoff

**Last updated:** 2026-08-13 (America/Vancouver)

**Repository:** `/Users/hanqingwang/Developer/mens-discipline-app`

**Current branch:** `spike/vision-pose-foundation`

## Purpose

This document is the continuity record for starting a new ChatGPT/Codex conversation. It summarizes the project authority, owner instructions, work completed so far, the exact current Git state, validation evidence, and the next safe development step.

The repository Markdown documents remain authoritative. If this handoff conflicts with `AGENTS.md`, `docs/DECISIONS.md`, or locked product scope, follow those authoritative documents and surface the conflict to the owner.

## Owner Working Agreement

- ChatGPT/Codex is authorized to continue development autonomously from the repository documents.
- Explain important product and technical decisions in clear Chinese.
- Continue until owner intervention is genuinely required, such as:
  - Apple Developer Program payment or enrollment;
  - Apple ID login or two-factor authentication;
  - physical iPhone connection or an action that only the owner can perform;
  - quota, subscription, or payment limits;
  - a material product decision not already locked in the documents;
  - a dangerous or destructive operation requiring explicit approval.
- Routine implementation, narrow fixes, documentation, validation, stable commits, and branch pushes may proceed according to `AGENTS.md`.
- Do not merge into `main` until the stable checkpoint has been reviewed and accepted by the owner.
- Superpowers has been uninstalled. Do not install, invoke, search for, or depend on Superpowers or Superpowers workflows.
- No extra plugin is currently required for the engineering work.

## Required Startup Reading

Before meaningful product or technical work, read:

1. `AGENTS.md`
2. `docs/CURRENT_PHASE.md`
3. `docs/DECISIONS.md`
4. `docs/product/MVP_SCOPE.md`
5. `docs/product/MASTER_PRODUCT_PLAN.md` when broader context is needed
6. `docs/release/IOS_LAUNCH_READINESS.md` for Apple capability, permissions, signing, TestFlight, privacy, subscription, or release work
7. `docs/release/APP_REVIEW_RISK_REGISTER.md` when work can affect App Review risk
8. `docs/business/BUSINESS_APPLE_ACCOUNT_PLAN.md` for Apple business/account work

Always begin a new coding task with the Git safety check required by `AGENTS.md`. Preserve all existing uncommitted work.

## Product and Technical Direction

This is an iOS-first React Native / Expo application with native iOS functionality where required.

The current top technical priorities are:

1. App Lock / Screen Time feasibility using Apple Family Controls technologies
2. On-device motion and pose tracking feasibility
3. Reliable React Native-to-native iOS integration

Privacy remains a core requirement:

- do not upload camera video unless explicitly approved;
- do not persist camera recordings by default;
- prefer on-device pose and motion processing;
- store only the minimum derived training data required by the product.

Do not broaden the MVP or silently change locked behavior in the product documents.

## Completed Repository Milestones

### Phase 03.2 — Apple / iOS Prerequisites

Marked complete in `docs/CURRENT_PHASE.md`.

### Phase 03.3 — Official App Baseline / Expo Project Bootstrap

Marked complete. The stable repository baseline is:

- commit: `6e4753162b8feb3ac05893391bd2355a590274ad`
- message: `chore: establish official Expo application baseline`
- iOS Bundle ID: `com.temperline.mensdiscipline`
- official Expo SDK 57 application baseline builds and launches in the iPhone Simulator
- Expo Continuous Native Generation (CNG) is the current working native-project strategy

### Phase 03.4 — Family Controls Engineering, Checkpoint 1

The smallest Family Controls authorization foundation has been implemented, reviewed, validated locally, accepted by the project owner, and integrated into `main`. The implementation checkpoint is commit `aa8351350db14c31e56e0f638b70b05cbef4cb96`.

Implemented:

- application-local Expo native module under `modules/family-controls/`;
- Apple-only native module configuration;
- Swift bridge using `FamilyControls` and `AuthorizationCenter.shared`;
- synchronous authorization-status read;
- asynchronous individual authorization request;
- explicit main-queue / main-actor execution for `AuthorizationCenter` access;
- TypeScript API and status union;
- tracked main-app Family Controls development entitlement in `app.json`;
- temporary engineering diagnostic UI for reading, refreshing, and requesting authorization;
- accurate Phase 03.4 status and verification boundaries in `docs/CURRENT_PHASE.md`.

The native Expo module is named `ExpoFamilyControls` because Apple's framework is already named `FamilyControls`.

## Owner-Review Follow-up Results

### Simulator / Expo Runtime Warning

An earlier Simulator screenshot showed the generic React Native banner:

`Open debugger to view warnings.`

The underlying warning text was not preserved in the available log history. The app was rebuilt and relaunched multiple times and the banner could not be reproduced. No evidence was found that the warning was caused by the Family Controls implementation, so no speculative code change was made.

Two separate messages were observed and classified:

- `UIScene lifecycle will soon be required` is a platform/runtime lifecycle warning unrelated to the Family Controls bridge;
- the Expo CLI `NO_COLOR` message concerns the host CLI environment and is not a Family Controls application warning.

If the in-app warning banner returns, capture the exact debugger/Metro warning text and source before changing code.

### Simulator Family Controls Service Boundary

The Checkpoint 1 app builds, launches, loads the native module, and displays `notDetermined` in the iOS 26.5 Simulator. The Simulator system log also reports that its `com.apple.FamilyControlsAgent` service connection is invalidated.

This does not block the local bridge checkpoint, but it confirms that Simulator behavior must not be used as evidence for real-device authorization, provisioning, or entitlement feasibility. Those checks remain gated on a paid Apple Developer membership, signing/provisioning, and a physical iPhone.

### AuthorizationCenter Threading Correction

Apple requires `AuthorizationCenter.authorizationStatus` to be accessed on the main queue. Expo synchronous functions run on the React Native JavaScript thread, so the bridge now dispatches status reads to the main queue when necessary and performs the async authorization request through a `@MainActor` helper.

The TypeScript API and product behavior did not change.

### Current SDK Authorization Status Cases

The installed Xcode 26.6 / iOS SDK 26.5 includes:

- `notDetermined`
- `denied`
- `approved`
- `approvedWithDataAccess` (available from iOS 26.4)

The Swift bridge and TypeScript type now explicitly map `approvedWithDataAccess`. The Swift switch retains `@unknown default -> "unknown"` for forward compatibility.

This mapping does **not** enable or request the App & Website Usage entitlement. That additional data-access capability is not required for the current MVP checkpoint and must not be added silently.

### Documentation Scope Correction

`docs/CURRENT_PHASE.md` now distinguishes what has actually been verified:

- verified in Simulator: build, launch, native-module loading, and authorization-status read;
- not yet verified: paid Apple membership/provisioning, real-device authorization, signing entitlement behavior, and physical-iPhone Family Controls runtime behavior;
- not started: FamilyActivityPicker, ManagedSettings shielding, Screen Time extensions, App Groups, and scheduling.

### Accepted Motion Reliability Direction

The owner accepted tolerant automatic rep counting with a non-blocking assisted-completion path.

- Automatic counting remains the normal path.
- Movement-specific minimum joints should replace perfect full-body framing where technically sufficient.
- Temporary tracking loss must preserve valid repetition progress.
- If reliable tracking cannot be recovered, assisted completion must allow the routine to complete and selected apps to unlock.
- Exact thresholds, recovery timing, confirmation friction, and progress presentation remain pending real-device validation.

The active plan is `docs/technical/POSE_MOTION_FEASIBILITY_PLAN.md`. Checkpoint A intentionally stops before camera permission, live capture, movement-specific counting, or production UI.

### Phase 03 — Pose & Motion Tracking, Checkpoint A

The movement-agnostic offline foundation is implemented in commit `8a6f7378b6a15cafb31c2699df354442e216f5ee` (`spike: establish offline Vision pose foundation`).

Implemented:

- application-local Apple-only Expo module under `modules/vision-pose/`;
- Apple Vision `VNDetectHumanBodyPoseRequest` adapter for local image files;
- 19-joint TypeScript contract with normalized coordinates, per-joint confidence, timestamp, orientation, mirroring, coordinate origin, and explicit unavailable joints;
- typed complete-pose, partial-pose, no-pose, invalid-input, and native-processing-failure results;
- rejection of network/non-file URIs and unsupported local inputs;
- asynchronous native processing and derived-observation-only bridge output;
- engineering-only Technical Baseline diagnostic that automatically verifies native-module loading and the typed missing-file result.

Privacy and scope boundaries were preserved: no camera permission, `AVFoundation` capture, image picker, networking, raw-image return, image/video persistence, movement-specific rule, repetition counter, assisted-completion UI, or production training UI was added.

The iOS 26.5 Simulator loads the module and returns `invalidInput / fileNotFound` for the diagnostic request. A valid local PNG passed native file validation but Vision returned the typed `processingFailed / visionError` result in the Simulator. A separate macOS-host Vision sanity check accepted the same PNG and returned zero observations. This proves the adapter/error boundary but is not physical-iPhone pose evidence. Normalized human-joint output, partial-body behavior, live-camera performance, and tolerant counting remain unverified until Checkpoints B–C.

## Verification Evidence

The following checks were re-run successfully after the final threading correction:

- `git diff --check`
- `npm run lint`
- `npx tsc --noEmit`
- `npx expo-doctor` — 20/20 checks passed
- `npx expo config --type introspect` — locked Bundle ID and Family Controls entitlement confirmed
- full iOS Simulator Debug build — succeeded with no project-source errors; existing third-party Expo / React Native dependency warnings were emitted
- `ExpoFamilyControls` target build — succeeded with no Family Controls source warning
- application installation and launch in iPhone 17 Pro / iOS 26.5 Simulator
- native Family Controls status read in Simulator — returned `notDetermined`
- runtime screenshot inspection — diagnostic UI rendered without the earlier generic React Native warning banner
- generated native entitlement inspection — `com.apple.developer.family-controls = true`

The Simulator system log still contains the known `UIScene` lifecycle warning, transient development-server connection attempts, and the Simulator-only `FamilyControlsAgent` connection error described above. No claim of zero dependency warnings or real-device authorization is made.

For Pose Checkpoint A, the following checks were run successfully:

- `git diff --check`
- `npm run lint`
- `npx tsc --noEmit`
- `npx expo-doctor` — 20/20 checks passed
- `npx expo-modules-autolinking search --platform apple` — `vision-pose` discovered
- `npx expo config --type introspect` — `vision-pose` discovered and no camera usage description added
- `npx pod-install ios` — `ExpoVisionPose (1.0.0)` installed into the generated iOS workspace
- `ExpoVisionPose` iOS Simulator target build — succeeded
- full `MensDiscipline` iOS Simulator Debug build — succeeded with existing third-party dependency warnings only
- application installation and launch in iPhone 17 Pro / iOS 26.5 Simulator
- runtime missing-local-file diagnostic — returned `invalidInput / fileNotFound` through the native bridge
- runtime valid-local-PNG diagnostic — returned typed `processingFailed / visionError`; successful Simulator or physical-iPhone pose inference is not claimed
- screenshot inspection — both Family Controls and Vision engineering diagnostics rendered in the scrollable Technical Baseline screen

## Exact Git State at Handoff

Branch:

`spike/vision-pose-foundation`

The accepted Checkpoint 1 implementation commit is:

`aa8351350db14c31e56e0f638b70b05cbef4cb96 spike: establish Family Controls authorization foundation`

The checkpoint and this continuity update have been fast-forwarded into `main` and pushed to `origin/main`. The source branch remains available as `spike/family-controls-foundation`; it has not been deleted.

The current pose-foundation branch starts from `main` commit `9f433ff0a28913e7de1c288b6563428a24a761fe`. Its first documentation checkpoint is `a5110c745ce0d029ce8574db9f7149ce925066ee`; it records DEC-020, the locked MVP clarification, release/risk updates, and the movement-agnostic feasibility plan.

The Checkpoint A implementation commit is:

`8a6f7378b6a15cafb31c2699df354442e216f5ee spike: establish offline Vision pose foundation`

Family Controls Checkpoint 1 files:

- `AGENTS.md`
- `app.json`
- `docs/CURRENT_PHASE.md`
- `docs/PROJECT_HANDOFF.md`
- `src/app/index.tsx`
- `modules/family-controls/expo-module.config.json`
- `modules/family-controls/index.ts`
- `modules/family-controls/ios/ExpoFamilyControls.podspec`
- `modules/family-controls/ios/ExpoFamilyControlsModule.swift`
- `modules/family-controls/src/ExpoFamilyControls.types.ts`
- `modules/family-controls/src/ExpoFamilyControlsModule.ios.ts`
- `modules/family-controls/src/ExpoFamilyControlsModule.ts`
- `modules/family-controls/src/ExpoFamilyControlsModule.web.ts`

`package.json` and `package-lock.json` have not changed.

Pose-foundation documentation checkpoint files:

- `docs/CURRENT_PHASE.md`
- `docs/DECISIONS.md`
- `docs/PROJECT_HANDOFF.md`
- `docs/product/MVP_SCOPE.md`
- `docs/release/APP_REVIEW_RISK_REGISTER.md`
- `docs/release/IOS_LAUNCH_READINESS.md`
- `docs/technical/POSE_MOTION_FEASIBILITY_PLAN.md`

Pose Checkpoint A implementation files:

- `docs/CURRENT_PHASE.md`
- `docs/release/IOS_LAUNCH_READINESS.md`
- `docs/technical/POSE_MOTION_FEASIBILITY_PLAN.md`
- `src/app/index.tsx`
- `modules/vision-pose/expo-module.config.json`
- `modules/vision-pose/index.ts`
- `modules/vision-pose/ios/ExpoVisionPose.podspec`
- `modules/vision-pose/ios/ExpoVisionPoseModule.swift`
- `modules/vision-pose/src/ExpoVisionPose.types.ts`
- `modules/vision-pose/src/ExpoVisionPoseModule.ios.ts`
- `modules/vision-pose/src/ExpoVisionPoseModule.ts`
- `modules/vision-pose/src/ExpoVisionPoseModule.web.ts`

## Explicitly Not Implemented

Do not infer that the following exists:

- FamilyActivityPicker
- ManagedSettings shielding
- Device Activity extension
- Shield Configuration extension
- Shield Action extension
- App Groups
- scheduling or recurring lock enforcement
- production Family Controls UI
- App & Website Usage entitlement
- real-device Family Controls verification
- camera permission or live camera capture
- normalized pose output verified from human input on a physical iPhone
- movement-specific pose rules or repetition counting
- assisted-completion implementation
- production camera/training UI
- TestFlight or App Store verification

## Release and Privacy Impact

Family Controls Checkpoint 1 adds the main-app Family Controls development entitlement declaration and a native iOS framework bridge. This creates a real Apple capability, provisioning, signing, and App Review dependency.

Pose Checkpoint A links Apple's system Vision and ImageIO frameworks through an application-local Expo module. It adds no entitlement, permission, native target, third-party SDK, networking, raw-image return, storage behavior, account behavior, subscription behavior, or App Privacy collection claim. The module accepts only caller-provided local files and returns derived joint/status metadata. The current diagnostic UI is temporary engineering UI and is not a production feature.

Real-device and distribution viability remain gated by Apple Developer Program membership, provisioning, signing, and later App Store distribution entitlement approval.

## Next Safe Development Sequence

1. Apple Developer Program membership is not ready; the owner will report when enrollment is complete.
2. Validate Family Controls authorization on a physical iPhone when membership, provisioning, signing, and the device are ready.
3. Do not claim FamilyActivityPicker, shielding, extensions, App Groups, or scheduling feasibility until the relevant real-device path can actually be verified.
4. The owner accepted tolerant automatic rep counting with non-blocking assisted completion; tracking failure must not prevent routine completion or app unlock.
5. Review and accept Pose Checkpoint A; keep it isolated on `spike/vision-pose-foundation` until owner acceptance.
6. When Apple Developer Program enrollment and a physical iPhone are ready, perform Checkpoint B live-camera feasibility with the required permission/release review.
7. Select one representative MVP movement before implementing Checkpoint C movement rules and tolerant counting.
8. Stop before camera permission, live capture, movement-specific counting, or assisted-completion UI until the applicable checkpoint and real-device validation are ready.

Do not fill the Apple gate with production UI or lower-priority product work. Technical feasibility remains the priority.

## Safe Rollback Position

The baseline before Checkpoint 1 is commit:

`6e4753162b8feb3ac05893391bd2355a590274ad`

The safest non-destructive comparison is `git diff 6e47531..spike/family-controls-foundation`. If Checkpoint 1 must be undone after review, use a new `git revert` commit for the Checkpoint 1 branch head rather than reset, clean, or history rewriting.

The baseline immediately before Pose Checkpoint A implementation is `a5110c745ce0d029ce8574db9f7149ce925066ee`. Compare with `git diff a5110c7..8a6f737`. If the implementation must be undone after review, create a new `git revert 8a6f737` commit on the pose branch; do not reset or rewrite history.

## Remote Permission Setup

The owner may be away from the Mac during development. The supported remote-approval path is ChatGPT Remote, not WhatsApp.

On the Mac:

`Settings -> Connections -> Control this Mac or PC -> Set up/Add`

Then scan the QR code using the ChatGPT mobile app signed into the same account and workspace. Keep the Mac awake and online. Remote can display task progress and requested command/action approvals on the phone.

Routine work inside this repository is already writable. Do not weaken security settings or request unrestricted access merely to avoid occasional prompts.

## New-Chat Startup Instruction

Use the following instruction to resume work in a new conversation:

> Open `/Users/hanqingwang/Developer/mens-discipline-app`. Read `AGENTS.md`, `docs/PROJECT_HANDOFF.md`, and `docs/technical/POSE_MOTION_FEASIBILITY_PLAN.md` completely, then read the required product and release documents referenced by them. Confirm the `spike/vision-pose-foundation` branch and preserve existing work. Pose Checkpoint A is implemented in `8a6f737` and awaits owner review/acceptance; do not merge it without acceptance. The accepted direction is tolerant automatic rep counting with assisted completion that prevents technical lockout. Do not add camera permission, live capture, movement-specific counting, assisted-completion UI, or production UI before the applicable physical-iPhone checkpoint. Apple Developer Program and physical-iPhone gates remain. Do not use Superpowers. Explain important decisions and final status in Chinese.
