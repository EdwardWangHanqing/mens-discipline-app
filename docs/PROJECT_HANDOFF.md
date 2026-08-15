# Men's Discipline App — Project Handoff

**Last updated:** 2026-08-14 (America/Vancouver)

**Repository:** `/Users/hanqingwang/Developer/mens-discipline-app`

**Active validation branch:** `spike/family-controls-real-device`

**Accepted integration base:** `main` at `02bef80b8af4209470fbf8b5dd54a1fe984a15ae`

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

### Family Controls Real-Device Authorization — Approved Cold-Launch Path Fixed, Pending Owner Review

On 2026-08-14, the development authorization path was validated on an iPhone 13 running iOS 26. Account, certificate, device, profile, and other private identifiers were intentionally not recorded.

- Xcode recognized the active paid Individual developer team.
- The iPhone paired over USB, was trusted, and had Developer Mode enabled.
- Automatic Signing registered the device and created an Xcode-managed development provisioning profile.
- The built app retained the locked `com.temperline.mensdiscipline` Bundle ID, passed code-signature verification, and contained `com.apple.developer.family-controls = true` in both the signed app entitlements and embedded development profile.
- Xcode built, installed, launched, and debugged the app on the physical iPhone.
- The native `ExpoFamilyControls` module registered in the device process; Metro delivered the React Native bundle; the pre-request status read was `notDetermined`.
- `AuthorizationCenter.shared.requestAuthorization(for: .individual)` presented the real Apple system authorization UI. The owner selected Allow, and the post-request status read was `approved`.
- Authorization persisted across complete app termination: on two cold-launch repetitions, the immediate startup read showed `notDetermined`, then a status refresh after several seconds returned `approved`.

The initial validation checkpoint was a partial pass rather than a full pass. Development signing, provisioning, installation, bridge loading, real system authorization, approval, and persisted authorization were demonstrated, while the repeatable transient `notDetermined` value on immediate cold-launch reads remained unresolved.

Follow-up diagnosis confirmed that the transient value is the real initial value of Apple's `AuthorizationCenter.authorizationStatus`, not a JavaScript default. Apple exposes the property as `@Published`; observing `$authorizationStatus` caused the persisted `approved` state to arrive automatically after the initial value. The issue still reproduced with Metro already running, so Debug/Metro startup order was not the root cause.

The branch now contains a minimal lifecycle-aware stabilization path:

- the UI starts in `checking` rather than displaying the initial native value as final;
- the native module records module initialization, app-active, raw-read, publisher, and resolution timestamps;
- the app subscribes to the official authorization-status publisher;
- status resolution begins after the app is active and uses bounded incremental retries as a fallback;
- no automatic authorization request is made, and an already-approved state disables the request action.

Five consecutive physical-iPhone cold starts fully terminated the previous process and relaunched the app. All five showed `checking` and automatically resolved to `approved` without manual refresh, without displaying `notDetermined` as a final/user-actionable state, and without presenting another authorization request. Native stabilization took approximately 0.12–0.55 ms in these runs; JavaScript resolved the approved state in approximately 0.61–0.71 seconds. The owner visually confirmed the user-visible behavior. Denied and revoked states were intentionally not tested because they would change the device's current authorization and require separate approval.

No FamilyActivityPicker, app selection, shielding, Screen Time extension, App Group, scheduling, unlock logic, camera, pose Checkpoint B, movement logic, assisted-completion UI, production UI, dependency upgrade, or unrelated refactor was added.

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

Apple Developer Program enrollment is active and the Family Controls individual development-authorization path has been exercised on a physical iPhone. The approved-state cold-launch timing issue is diagnosed and has passed five consecutive real-device cold starts on the current branch. The implementation and evidence remain at owner review; denied/revoked lifecycle behavior is still unverified and must not be tested without explicit owner approval.

Until the applicable real-device checkpoint and release review, do not add or claim:

- live camera permission/capture or physical-device pose performance;
- movement-specific thresholds, repetition counting, or assisted-completion implementation;
- denied/revoked cold-launch behavior or a complete authorization-state reliability claim;
- app selection, shielding, extensions, App Groups, scheduling, or reliable unlock integration;
- production training UI, TestFlight readiness, or App Store readiness.

## Authorized Integration and Next Safe Sequence

1. The owner accepted the limited Checkpoint A scope and authorized fast-forward-only integration into `main`, pushing `origin/main`, and retaining the source branch.
2. Review the Family Controls publisher/lifecycle stabilization implementation and five-run real-device evidence on `spike/family-controls-real-device`.
3. Decide whether and when to test denied/revoked lifecycle behavior; changing the current device authorization requires explicit owner approval and a documented recovery path.
4. Add FamilyActivityPicker only after this authorization checkpoint is accepted.
5. Investigate the valid-local-PNG Vision failure and perform Pose Checkpoint B live-camera feasibility only after camera-permission and release-impact review.
6. Select one representative MVP movement before Checkpoint C tolerant counting, recovery, and assisted completion work.
7. Build the smallest App Selection → Lock/Shield → Routine → Completion → Unlock prototype only after the underlying real-device paths are proven.

Do not fill the Apple/device gate with production UI or invented thresholds.

## Release, Privacy, and Rollback

Family Controls creates a real Apple capability, provisioning, distribution-entitlement, and App Review dependency. Pose Checkpoint A uses Apple system Vision/ImageIO only and added no entitlement, permission, third-party SDK, networking, storage, account, subscription, or App Privacy collection change.

Safe comparison/rollback points:

- Family Controls pre-checkpoint baseline: `6e47531`; revert accepted commits rather than rewriting history.
- Pose implementation baseline: `a5110c7`; compare with `git diff a5110c7..8a6f737`.
- To undo Pose Checkpoint A after review, create revert commits for its implementation/documentation commits; do not reset, clean, or force-push.

## New-Chat Startup Instruction

> Open `/Users/hanqingwang/Developer/mens-discipline-app`. First run `git status --short --branch`, then completely read `AGENTS.md`, `docs/PROJECT_HANDOFF.md`, `docs/CURRENT_PHASE.md`, `docs/product/MVP_SCOPE.md`, `docs/DECISIONS.md`, and `docs/technical/POSE_MOTION_FEASIBILITY_PLAN.md`. Read the relevant release documents before permission, capability, account, privacy, subscription, TestFlight, or App Store work. Preserve all existing work. Family Controls Checkpoint 1 and the owner-accepted Pose Checkpoint A are integrated into `main`; retain `spike/vision-pose-foundation`. The paid Individual developer account, Automatic Signing, physical-device provisioning, signed Family Controls development entitlement, installation, bridge loading, real `.individual` system authorization, owner approval, and persisted `approved` state have been demonstrated on `spike/family-controls-real-device`. The initial cold-launch `notDetermined` result is the real initial value of Apple's published authorization property. The current branch observes the publisher, waits in `checking`, reads after active, and uses bounded fallback retries; five consecutive real-device cold starts automatically resolved to `approved` without manual refresh or another authorization request. The implementation is pending owner review. Do not test denied/revoked behavior without explicit owner approval and a recovery plan. Do not start FamilyActivityPicker, shielding, extensions, App Groups, scheduling, camera permission/live capture, movement thresholds, automatic counting, assisted-completion UI, or production UI without the next approved checkpoint. Do not use Superpowers. Explain important decisions and final status in Chinese.
