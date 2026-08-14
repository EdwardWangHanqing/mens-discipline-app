# Men's Discipline App — Project Handoff

**Last updated:** 2026-08-13 (America/Vancouver)

**Repository:** `/Users/hanqingwang/Developer/mens-discipline-app`

**Current branch:** `main`

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

## Exact Git State at Handoff

Branch:

`main`

The accepted Checkpoint 1 implementation commit is:

`aa8351350db14c31e56e0f638b70b05cbef4cb96 spike: establish Family Controls authorization foundation`

The checkpoint and this continuity update have been fast-forwarded into `main` and pushed to `origin/main`. The source branch remains available as `spike/family-controls-foundation`; it has not been deleted.

Checkpoint files:

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
- TestFlight or App Store verification

## Release and Privacy Impact

Checkpoint 1 adds the main-app Family Controls development entitlement declaration and a native iOS framework bridge. This creates a real Apple capability, provisioning, signing, and App Review dependency.

It does not add a third-party SDK, upload data, collect camera data, alter subscriptions, or change account behavior. The current diagnostic UI is temporary engineering UI and is not a production feature.

Real-device and distribution viability remain gated by Apple Developer Program membership, provisioning, signing, and later App Store distribution entitlement approval.

## Next Safe Development Sequence

1. Apple Developer Program membership is not ready; the owner will report when enrollment is complete.
2. Validate Family Controls authorization on a physical iPhone when membership, provisioning, signing, and the device are ready.
3. Do not claim FamilyActivityPicker, shielding, extensions, App Groups, or scheduling feasibility until the relevant real-device path can actually be verified.
4. While the Apple account gate remains, the recommended independent Phase 03 work is a separately scoped on-device pose / motion-tracking feasibility spike or release/business-readiness documentation.
5. Create a new logical branch before beginning either engineering track; do not implement normal work directly on `main`.

Do not fill the Apple gate with production UI or lower-priority product work. Technical feasibility remains the priority.

## Safe Rollback Position

The baseline before Checkpoint 1 is commit:

`6e4753162b8feb3ac05893391bd2355a590274ad`

The safest non-destructive comparison is `git diff 6e47531..spike/family-controls-foundation`. If Checkpoint 1 must be undone after review, use a new `git revert` commit for the Checkpoint 1 branch head rather than reset, clean, or history rewriting.

## Remote Permission Setup

The owner may be away from the Mac during development. The supported remote-approval path is ChatGPT Remote, not WhatsApp.

On the Mac:

`Settings -> Connections -> Control this Mac or PC -> Set up/Add`

Then scan the QR code using the ChatGPT mobile app signed into the same account and workspace. Keep the Mac awake and online. Remote can display task progress and requested command/action approvals on the phone.

Routine work inside this repository is already writable. Do not weaken security settings or request unrestricted access merely to avoid occasional prompts.

## New-Chat Startup Instruction

Use the following instruction to resume work in a new conversation:

> Open `/Users/hanqingwang/Developer/mens-discipline-app`. Read `AGENTS.md` and `docs/PROJECT_HANDOFF.md` completely, then read the required project and release documents referenced by them. Confirm that `main` contains the accepted Family Controls Checkpoint 1 and preserve a clean working tree. Apple Developer Program membership is not ready, so real-device Family Controls authorization and later app-selection/shielding work remain gated. If continuing independent Phase 03 work, create a new branch and scope the on-device pose / motion-tracking feasibility spike before implementation. Do not use Superpowers. Explain important decisions and final status in Chinese.
