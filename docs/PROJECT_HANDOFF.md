# Men's Discipline App — Project Handoff

**Last updated:** 2026-08-15 (America/Vancouver)

**Repository:** `/Users/hanqingwang/Developer/mens-discipline-app`

**Active validation branch:** `spike/device-activity-schedule`

**Phase 03.8 source base:** `spike/family-controls-real-device` at `a161936`

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

Current validation work remains intentionally separate from `main`: Phase 03.8 is on `spike/device-activity-schedule`, based on the completed Phase 03.7 checkpoint `a161936`. Its repository implementation checkpoint is `ced7111`; signed physical-device Incomplete, Completed, replacement, and recovery validation now pass. The branch still must not be merged without owner acceptance.

Key commits:

- `6e4753162b8feb3ac05893391bd2355a590274ad` — official Expo application baseline;
- `aa8351350db14c31e56e0f638b70b05cbef4cb96` — Family Controls authorization foundation;
- `9f433ff0a28913e7de1c288b6563428a24a761fe` — Family Controls owner acceptance; merged `main` state;
- `a5110c745ce0d029ce8574db9f7149ce925066ee` — tolerant pose recovery decision and Checkpoint A plan;
- `8a6f7378b6a15cafb31c2699df354442e216f5ee` — offline Apple Vision pose foundation;
- `de150e8fcf8c5d71e231c6b36467e9a5c9a507dd` — Pose Checkpoint A verification handoff;
- `6e24178` — Phase 03.7 Family Activity selection and manual shielding implementation;
- `a161936` — Phase 03.7 physical-iPhone selection/shielding results;
- `ced7111` — Phase 03.8 Device Activity scheduling and monitor-extension implementation.

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

At that checkpoint, FamilyActivityPicker, shielding, Screen Time extensions, App Groups, scheduling, and the complete lock → routine → unlock prototype were not yet implemented.

### Family Controls Real-Device Authorization — Approved Cold-Launch Path Accepted

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

That Phase 03.6 checkpoint added no FamilyActivityPicker, app selection, shielding, Screen Time extension, App Group, scheduling, unlock logic, camera, pose Checkpoint B, movement logic, assisted-completion UI, production UI, dependency upgrade, or unrelated refactor.

### Family Controls Phase 03.7 — Real-Device Validation Passed

Apple has assigned Family Controls (Distribution) to the developer account for the main-app path. This closes the account-level main-app request item, but does not prove a distribution archive/TestFlight path. At the Phase 03.7 checkpoint no Screen Time extension existed; Phase 03.8 now introduces one, whose entitlement status is tracked separately below.

The Phase 03.7 checkpoint contains this diagnostic slice:

- Apple's SwiftUI `FamilyActivityPicker` is presented from the existing local Expo module and receives a draft initialized from the prior saved `FamilyActivitySelection`;
- Cancel and interactive dismissal leave the prior saved selection unchanged; Done persists the draft locally using `FamilyActivitySelection`'s Apple-provided `Codable` conformance;
- React Native receives only storage status, opaque selection counts, saved time, and non-sensitive errors—never token contents or reverse-engineered identifiers;
- absent, legitimately empty, replacement, and corrupt/unreadable stored-state paths are represented without crashing;
- one fixed named `ManagedSettingsStore` applies `.specific` policies only for the explicit saved app/category/web-domain tokens;
- Apply requires usable authorization and a non-empty selection; Remove clears only this diagnostic store and remains the owner escape path;
- selection edits do not silently alter an already-active shield; Apply must be invoked again;
- authorization, selection, and shield state are separate and selection/shield state is reread on component mount and app foreground;
- no extension, App Group, DeviceActivity schedule, production lock UX, third-party SDK, cloud sync, new permission, or Bundle ID/signing change was added.

Fresh code/build evidence:

- `git diff --check`, Expo lint, and TypeScript checks passed during the current implementation;
- fresh `npx expo-doctor` completed 20/21 checks; its only failure is the known Expo patch-version mismatch, and no dependency was upgraded during this scoped phase;
- CocoaPods integration succeeded;
- the `ExpoFamilyControls` iOS Simulator target built successfully;
- the full Debug iOS Simulator app built successfully;
- the automatically signed generic iPhoneOS Debug app built, installed, and launched on the connected iPhone;
- Metro loaded the React Native bundle, preserved the Phase 03.6 `approved` path, and received a successful native empty-state read: no stored selection, zero opaque counts, and this diagnostic shield store removed.

Physical-iPhone validation then demonstrated:

- Family Controls authorization continued to resolve automatically to `approved`;
- `FamilyActivityPicker` presented successfully, and the owner created and edited an explicit selection;
- the tested summary contained 5 application tokens, 1 category token, and 0 web-domain tokens;
- selecting an individual app inside an Apple category increased the application-token count, while selecting the entire category increased the category-token count; this is treated as expected `FamilyActivitySelection` behavior rather than a project defect;
- Apply Shield restricted the selected applications, and opening one displayed Apple's system `Restricted` screen;
- Remove Shield restored normal access, and repeated Apply → Remove succeeded;
- the saved selection remained available after the Debug development relaunch workflow once Metro connectivity was restored;
- clearing the picker produced 0 application, 0 category, and 0 web-domain tokens, retained `Saved selection: yes (empty)`, and disabled Apply Shield;
- no Family Controls functional error was observed.

Picker Cancel/interactive-dismiss behavior was implemented but was not included in the reported owner test evidence, so it is not promoted to a verified real-device claim.

### Family Controls Phase 03.8 — Scheduled Lock Real-Device Proof Passed

Apple's official Screen Time architecture is now represented directly: the main application registers schedules through `DeviceActivityCenter`, while exactly one `DeviceActivityMonitor` extension receives `intervalDidStart` / `intervalDidEnd` outside the React Native process. No Shield Action, Shield Configuration, Device Activity Report, JS timer, or third-party dependency was added. References: [DeviceActivityCenter](https://developer.apple.com/documentation/deviceactivity/deviceactivitycenter), [DeviceActivityMonitor](https://developer.apple.com/documentation/deviceactivity/deviceactivitymonitor), [Family Controls configuration](https://developer.apple.com/help/account/capabilities/configure-app-capabilities/configuring-family-controls/), and [App Groups](https://developer.apple.com/documentation/xcode/configuring-app-groups).

Tracked architecture:

- host app: `com.temperline.mensdiscipline`;
- Device Activity Monitor target: `MensDisciplineDeviceActivityMonitor`;
- extension Bundle ID: `com.temperline.mensdiscipline.deviceactivitymonitor`;
- shared App Group: `group.com.temperline.mensdiscipline`;
- both targets declare Family Controls development and the same App Group entitlements;
- a local Expo config plugin copies tracked extension/shared Swift sources, creates and links the native target during CNG, embeds the `.appex`, aligns the extension version/build number, and declares EAS app-extension metadata;
- the main-app Family Controls Distribution entitlement remains Assigned;
- the extension's separate Family Controls Distribution entitlement is not requested or Assigned and will be required before TestFlight/App Store distribution, not for this development proof.

Process/privacy boundary:

- the previously saved Apple-opaque `FamilyActivitySelection` migrates from main-app defaults to App Group `UserDefaults`, with readback verification before legacy data is removed;
- the shared state contains only Apple's opaque encoded selection, a local date-scoped completed/incomplete diagnostic flag, configuration timestamp, and last callback outcome/counts;
- neither Swift logs nor JavaScript receive token contents or inferred app identities;
- the extension never relies on JS memory and applies only the explicit decoded token sets;
- absent, empty, corrupt, or unavailable shared selection state never creates an all-app/all-category policy;
- the extension does not gate on `AuthorizationCenter`'s transient process-initial `notDetermined` value; if authorization is actually unavailable, Apple's framework cannot enforce the selected-token settings, while the implementation still avoids broad policy construction.

Scheduling/recovery behavior:

- recurring production-shaped schedule: selected Lock Time through 23:59:59 each day, with 23:44 as the latest accepted start so the interval meets Apple's 15-minute minimum;
- separate one-off diagnostic: `+2 minutes`, nonrepeating, 16-minute interval;
- incomplete at callback applies only the stored explicit selection; completed at callback suppresses/clears that scheduled shield;
- daily, one-off, and manual paths use separate named `ManagedSettingsStore` instances so one interval ending cannot clear another active interval;
- rescheduling stops the previous activity and clears only that activity's store;
- interval end, Completed Today, Cancel, Reset, Remove Shield, and saving an empty selection provide visible recovery paths;
- React Native exposes only diagnostic controls and non-sensitive schedule/callback status; it is not the scheduling mechanism.

Fresh repository/build evidence:

- CNG regeneration and CocoaPods integration succeed;
- generated Xcode project parses and exposes the host and monitor schemes/targets;
- the Device Activity Monitor target and `ExpoFamilyControls` native target compile;
- the full unsigned Debug iOS Simulator app compiles, embeds the monitor `.appex`, uses the `com.apple.deviceactivity.monitor-extension` extension point, and matches host/extension version `1.0.0`;
- Expo config inspection confirms the main App Group and EAS extension declaration;
- `npm run lint`, `npx tsc --noEmit`, and `git diff --check` pass;
- a paired iPhone 13 remains connected and available.

Real-device boundary:

- after the owner restored the Apple team login, the Team was selected for both targets and Xcode Automatic Signing produced updated host/extension development profiles;
- a fresh signed Debug build for the paired iPhone 13 succeeded. The host and embedded `.appex` signatures passed strict verification; both signed entitlements and embedded profiles contained Family Controls plus `group.com.temperline.mensdiscipline`;
- the signed app installed and launched on the iPhone, authorization resolved to `approved`, and the existing opaque selection read as `available` from App Group storage with one category token;
- the first one-off schedule started with the host app inactive. The extension recorded `intervalDidStart / appliedShield`, `completedToday=false`, and one category token. YouTube displayed Apple's system `Restricted` screen without a manual Apply Shield action, while Instagram remained usable;
- Reset stopped the first interval, removed its shield, and immediately restored YouTube. The second one-off started with `completedToday=true`; the extension recorded `intervalDidStart / skippedCompletedToday`, YouTube stayed usable, and the aggregate diagnostic shield state remained inactive;
- same-activity re-registration advanced the pending start and remained active without error. Final Cancel stopped both schedules and left all diagnostic shield counts at zero; interval-end recovery recorded `removedShieldAtIntervalEnd`;
- this proves the bounded development path with the host inactive. It does not prove force-quit/reboot, midnight/timezone/DST, production/TestFlight, or the extension's separate Distribution entitlement.

### Debug Development-Build / Metro Observation

After the owner force-quit the Debug development build and reopened it directly from the iPhone Home Screen while Metro connectivity was unavailable, React Native displayed `No script URL provided`. Once Metro was restarted and the installed app relaunched, the JavaScript bundle loaded, authorization resolved to `approved`, and the persisted selection was available.

Treat this as a development-build/Metro workflow observation, not as a Family Controls authorization, picker, selection-persistence, or ManagedSettings failure. Production/TestFlight bundle behavior remains untested.

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

Phase 03.7 real-device evidence additionally verifies picker presentation, explicit selection/editing, local selection persistence through the restored development relaunch workflow, ManagedSettings shield application and removal, repeated apply/remove, and safe empty-selection behavior. No new automated code validation was required for the documentation-only closeout.

Phase 03.8 fresh validation additionally passed CNG regeneration, CocoaPods integration, Expo extension-config inspection, strict `swift-format` lint for the three new Swift files, the standalone Device Activity Monitor target, the standalone `ExpoFamilyControls` target, the full unsigned iOS Simulator Debug build, and the full unsigned generic iPhoneOS Debug build. Fresh `npx expo-doctor` passed 20/21 checks; its only failure is the pre-existing six-package Expo patch-version mismatch, and this phase did not upgrade dependencies. The generated host app embeds a version-matched monitor `.appex` with the correct extension point. The Simulator app installed, launched through the existing Metro development server, loaded the native module, and rendered the diagnostic screen without a startup crash; Simulator `notDetermined` remains non-device evidence. After the team login was restored, a fresh signed iPhone build passed, both target profiles/entitlements contained Family Controls and the shared App Group, installation/launch succeeded, and physical Incomplete, Completed, same-activity replacement, Reset, and Cancel paths produced the expected system UI and non-sensitive callback state described above.

## Current Blockers and Explicit Non-Goals

Apple Developer Program enrollment is active, the main-app Family Controls Distribution request is Assigned at the account level, and the individual development-authorization path has been exercised on a physical iPhone. Phase 03.7 and the bounded Phase 03.8 scheduled-lock development proof are verified. Development provisioning is no longer blocked: both targets have valid Xcode-managed profiles containing Family Controls and the shared App Group. The Device Activity Monitor extension's separate Distribution entitlement remains unrequested/unassigned and blocks TestFlight/App Store distribution readiness, not local development proof. Denied/revoked lifecycle behavior also remains unverified and must not be tested without explicit owner approval.

Until the applicable real-device checkpoint and release review, do not add or claim:

- live camera permission/capture or physical-device pose performance;
- movement-specific thresholds, repetition counting, or assisted-completion implementation;
- denied/revoked cold-launch behavior or a complete authorization-state reliability claim;
- force-quit/reboot/midnight/timezone/DST schedule reliability, or reliable production unlock integration beyond the accepted inactive-host development proof;
- production/TestFlight bundle behavior or Metro-independent release launching;
- production training UI, TestFlight readiness, or App Store readiness.

## Authorized Integration and Next Safe Sequence

1. Treat Phase 03.8's signed inactive-host Incomplete/Completed/replacement/recovery proof as the accepted development baseline; do not redo it unless relevant implementation or provisioning changes.
2. Request and verify Family Controls Distribution separately for `com.temperline.mensdiscipline.deviceactivitymonitor` before attempting TestFlight/App Store distribution.
3. In a later controlled reliability slice, test force-quit, reboot, midnight rollover, timezone, DST, and longer-running recurring daily behavior on supported shipping iOS versions.
4. Validate a Release archive/TestFlight build launches independently of Metro before release readiness is claimed.
5. Keep denied/revoked authorization testing behind explicit owner approval, and do not begin live camera/movement work as part of this scheduled-lock closeout.

Do not fill the Apple/device gate with production UI or invented thresholds.

## Release, Privacy, and Rollback

Family Controls creates a real Apple capability, provisioning, distribution-entitlement, selected-app-token privacy, and App Review dependency. The main-app account-level Distribution request is Assigned. Phase 03.8 adds one Device Activity Monitor native target, its explicit Bundle ID, Device Activity framework linkage, and an App Group on both targets. The extension requires its own Family Controls Distribution request before TestFlight/App Store distribution. The implementation shares only opaque selection encoding and minimal local diagnostic state, adds no server sharing, third-party SDK, account/subscription behavior, camera permission, or App Privacy collection category. Pose Checkpoint A remains Apple-only and unchanged.

Safe comparison/rollback points:

- Family Controls pre-checkpoint baseline: `6e47531`; revert accepted commits rather than rewriting history.
- Phase 03.8 pre-implementation baseline: `a161936`; use a normal revert of the Phase 03.8 commit(s) after they are created, not reset/clean/force-push.
- Pose implementation baseline: `a5110c7`; compare with `git diff a5110c7..8a6f737`.
- To undo Pose Checkpoint A after review, create revert commits for its implementation/documentation commits; do not reset, clean, or force-push.

## New-Chat Startup Instruction

> Open `/Users/hanqingwang/Developer/mens-discipline-app` on branch `spike/device-activity-schedule`. First run `git status --short --branch`, then completely read `AGENTS.md`, `docs/PROJECT_HANDOFF.md`, `docs/CURRENT_PHASE.md`, `docs/product/MVP_SCOPE.md`, and `docs/DECISIONS.md`; read the release documents before capability/privacy/release work. Preserve all existing work. Phase 03.7 authorization, picker, opaque selection, manual shield/remove, repeated apply/remove, and empty-selection paths are verified on a physical iPhone. Phase 03.8 adds one Device Activity Monitor extension (`com.temperline.mensdiscipline.deviceactivitymonitor`), App Group `group.com.temperline.mensdiscipline`, native recurring/one-off schedules, shared date-scoped accountability state, automatic selected-token shielding, and visible recovery/reset. CNG, native/full builds, signed host/extension entitlements, and iPhone 13 installation pass. With the host inactive, Incomplete recorded `intervalDidStart / appliedShield` and Apple Restricted UI without manual Apply; Reset restored access; Completed recorded `skippedCompletedToday` and left the same app usable; replacement plus final Cancel left no monitoring or diagnostic shield. Main-app Family Controls Distribution remains Assigned; extension Distribution is unrequested/unassigned. Force-quit/reboot/midnight/timezone/DST and Release/TestFlight behavior remain unverified. Do not merge to `main`, begin camera/live pose work, or claim release readiness. Do not use Superpowers. Explain important decisions and final status in Chinese.
