# Current Project Phase

## Project

Men's Discipline App

## Current Phase

**03 — Technical Feasibility**

## Completed Sub-phases

**03.1 — Project Bootstrap**

**03.2 — Apple / iOS Prerequisites**

**03.3 — Official App Baseline / Expo Project Bootstrap**

**Status:** Complete

## Current Sub-phase

**03.7 — Family Activity Selection and Managed Settings Shielding**

**Status:** Complete — real-device validation passed

## Current Objective

Completed: prove the smallest privacy-preserving real-device path from Apple's `FamilyActivityPicker` through locally persisted opaque selection tokens to applying and removing a `ManagedSettingsStore` shield.

## Family Controls Current State

- The official Expo SDK 57 application baseline is established in this repository.
- The Checkpoint 1 Family Controls authorization bridge/native module builds, launches, and reads authorization status successfully in the iPhone Simulator.
- The iOS Bundle ID is `com.temperline.mensdiscipline`.
- Expo Continuous Native Generation (CNG) remains the current working native-project strategy.
- The first checkpoint is a local Expo module for reading and requesting Family Controls authorization from the main application.
- The bridge performs `AuthorizationCenter` status access and authorization requests on the main queue / main actor as required by Apple.
- The main-app development entitlement is expressed through tracked Expo application configuration.
- The paid Individual Apple Developer membership is active and recognized by Xcode.
- An iPhone 13 running iOS 26 paired over USB, was trusted, and had Developer Mode enabled.
- Automatic Signing registered the device and produced an Xcode-managed development provisioning profile.
- The physical-device app build, installation, and launch succeeded. The signed app and embedded development profile both contained the Family Controls development entitlement.
- The React Native bundle loaded and the application-local Swift module registered on the physical device.
- The pre-request status was `notDetermined`; the real system authorization UI appeared for `.individual`; the owner allowed access; and the post-request status was `approved`.
- On two complete termination/relaunch repetitions, the old implementation's immediate startup read was transiently `notDetermined`; a status refresh after several seconds returned the persisted `approved` state.
- Follow-up diagnosis confirmed that Apple's published authorization property itself begins at `notDetermined` and then updates to the persisted value. The old UI synchronously exposed that initial native value; it was not a JavaScript default-value race, and the behavior still reproduced with Metro already ready.
- The current branch observes the native publisher, begins in `checking`, reads after App active, and uses bounded incremental retries without automatically requesting authorization.
- Five consecutive physical-iPhone cold starts automatically resolved from `checking` to `approved` without manual refresh, without presenting `notDetermined` as a final/user-actionable state, and without another authorization prompt. The owner visually confirmed the result. Denied/revoked behavior remains untested pending explicit approval.
- Phase 03.6's approved cold-start authorization path is accepted as the base for Phase 03.7 and has not been redesigned.
- Apple has assigned Family Controls (Distribution) to the developer account for the main-app path. Distribution signing/TestFlight behavior is not yet validated, and any future Screen Time extension will still require its own entitlement request.
- The iOS Simulator can load the bridge and return `notDetermined`, but its system log reports that the `FamilyControlsAgent` service is unavailable; this is not evidence of real-device authorization behavior.
- The Technical Baseline screen is only a temporary engineering test surface; it is not production UI.
- The local `ExpoFamilyControls` module now presents Apple's SwiftUI `FamilyActivityPicker` from the React Native diagnostic screen without exposing token contents to JavaScript.
- A picker draft is initialized from the prior stored selection; Cancel or interactive dismissal preserves the old selection, while Done encodes `FamilyActivitySelection` locally through its Apple-provided `Codable` conformance. No-selection, legitimately empty, replacement, and corrupt-decode states are represented without crashing.
- JavaScript receives only storage status, saved-selection existence, opaque token counts, saved time, and non-sensitive errors.
- One fixed named `ManagedSettingsStore` applies only the explicit application, category, and web-domain tokens from the saved selection. Apply requires usable authorization and a non-empty selection; Remove clears only this diagnostic store and remains available as the escape path.
- Authorization, selection, and shield state remain separate. Selection/shield state is reread on mount and foreground, and editing a selection does not silently mutate an active shield until Apply is tapped again.
- The new module target, full iOS Simulator app, and automatically signed generic iPhoneOS app build succeeded. The build was installed and launched on the connected iPhone; Metro confirmed `approved` authorization plus a successful empty selection/shield bridge read (`none`, zero counts, shield removed).
- Physical-iPhone validation passed: `FamilyActivityPicker` presented successfully, and the owner created and edited an explicit selection containing 5 application tokens, 1 category token, and 0 web-domain tokens.
- Selecting an individual app within an Apple category increased the application-token count; selecting the entire category increased the category-token count. This is treated as expected `FamilyActivitySelection` behavior, not a project defect.
- Apply Shield restricted the selected applications, and opening a selected application displayed Apple's system `Restricted` screen.
- Remove Shield restored normal access. Repeated Apply → Remove also succeeded.
- The saved selection remained available after the Debug development relaunch workflow once Metro connectivity was restored.
- Clearing the picker produced 0 application, 0 category, and 0 web-domain tokens while retaining `Saved selection: yes (empty)`; Apply Shield was disabled.
- No Family Controls functional error was observed during this validation.
- Separately, force-quitting and directly reopening the Debug build while Metro was unavailable produced `No script URL provided`. Restoring Metro and relaunching restored the React Native UI and the saved selection. This is currently a Debug/Metro workflow observation, not evidence of authorization, picker, persistence, or shielding failure. Production/TestFlight bundle behavior remains untested.
- Screen Time extensions, App Groups, scheduling, and production lock UX remain uncreated.
- The accepted motion-tracking direction is tolerant automatic rep counting with a non-blocking assisted-completion path; tracking failure must not prevent routine completion or app unlock.
- Movement-agnostic pose architecture and offline/local Vision Checkpoint A is accepted and integrated; Pose Checkpoint B remains outside this Family Controls validation task.
- Checkpoint A adds a local Apple Vision adapter, a 19-joint normalized TypeScript contract, explicit unavailable-joint representation, and typed complete/partial/no-pose/input/processing outcomes.
- The adapter accepts local image files only; it adds no camera permission, live capture, networking, raw-image return, persistence, movement rules, repetition counting, or production training UI.
- The iOS Simulator loads the module and returns the expected typed `invalidInput / fileNotFound` bridge result. A valid local PNG reached Vision but returned typed `processingFailed / visionError` in the Simulator, so successful pose inference and partial-body behavior are not yet claimed.

## Primary Track — Technical Feasibility

Phase 03.7 closeout:

1. Preserve the verified authorization → explicit selection → local persistence → Apply Shield → system `Restricted` screen → Remove Shield path.
2. Keep the Debug/Metro `No script URL provided` observation separate from Family Controls functionality and validate production/TestFlight bundle behavior later.
3. Do not test denied/revoked authorization without explicit approval and a documented recovery path.
4. Do not begin DeviceActivity scheduling, recurring Lock Time, extensions, App Groups, production UI, or camera/pose integration as part of this completed checkpoint.
5. Select and authorize the next technical slice in a new conversation.

The Family Controls Checkpoint 1 implementation is complete and merged. Real-device signing, authorization, and the approved-state cold-launch stabilization path are accepted. Phase 03.7 app selection, local persistence, shielding, unshielding, repeated apply/remove, and safe empty-selection behavior have now passed physical-iPhone validation on `spike/family-controls-real-device`. Denied/revoked behavior remains untested. Pose Checkpoint A is accepted and integrated. Extensions, App Groups, scheduling, production/TestFlight bundle behavior, live camera, and movement counting remain future tasks. Phase 03 as a whole is not complete.

## Parallel Track — Business / Apple Account

This track must not block Phase 03 coding.

1. Apple Developer membership may begin as **Individual** if company setup is still pending
2. Incorporate the intended company
3. Obtain D-U-N-S for the company
4. Prepare company-domain email and public functional website
5. Convert the same Apple Developer membership from Individual → Organization before public commercial App Store launch
6. Complete paid commerce setup after the organization identity is stable

Detailed business sequencing is tracked in:

`docs/business/BUSINESS_APPLE_ACCOUNT_PLAN.md`

## Parallel Track — Release Compliance

Start release readiness now rather than waiting until Phase 16.

Current release-readiness work:

1. Record the main-app Family Controls Distribution entitlement as Assigned; continue tracking separate entitlement requirements for every Screen Time extension actually introduced
2. Maintain the App Review risk register
3. Start data / permission / SDK inventory as technical dependencies are selected
4. Treat Apple Guideline 4.10—which explicitly names camera and Screen Time APIs—as a P1 packaging/review risk with no explicit safe harbor for this implementation; do not redesign the locked subscription model solely on that basis, and review the final paywall, metadata, value proposition, and Review Notes before submission
5. Record any release impact when Phase 03 introduces a new capability, permission, native target, SDK, or data flow

Operational source:

`docs/release/IOS_LAUNCH_READINESS.md`

Risk source:

`docs/release/APP_REVIEW_RISK_REGISTER.md`

## Phase 03 Primary Goal

Prove that the core product loop is technically feasible:

App Selection

→ App Lock

→ Begin Routine

→ Camera / Pose Tracking

→ Rep Completion

→ Routine Complete

→ Unlock Selected Apps

## Technical Risks To Validate First

### 1. iOS App Lock

Validate:

- Family Controls authorization
- App selection
- Managed Settings shielding
- Locking selected apps
- Unlocking selected apps
- Required Screen Time extensions
- main-app / extension Bundle ID architecture
- Distribution entitlement requirements
- behavior after app relaunch / device reboot where relevant
- Lock Time state behavior around device/system edge cases

### 2. Camera / Motion Tracking

Validate:

- Camera access
- On-device human pose detection
- Body landmark normalization
- Simple movement state detection
- Rep counting
- Reliable basic completion verification
- realistic failure states such as no person / partial body / poor lighting / denied camera permission

Core principle:

**Verify, don't judge.**

The system should verify general movement completion and count repetitions.

It should NOT provide detailed form scoring or detailed corrective coaching in the MVP.

## Current Platform Priority

**iOS first.**

Android architecture should remain possible later, but Android implementation is not part of Phase 03.

## Do Not Start Yet

Do not begin:

- Full production UI
- Full Figma implementation
- Production coach animations
- Final audio system
- RevenueCat integration
- Subscription paywall implementation
- Analytics implementation
- Android implementation
- Social features
- Leaderboards
- Large exercise library

Business formation, Apple account preparation, and release-readiness documentation are exceptions because they run in parallel and prevent avoidable launch delays.

## Exit Criteria For Phase 03

Phase 03 is complete only when we have enough evidence that:

1. User can select distracting apps on a real iPhone
2. Selected apps can be restricted
3. Selected apps can be reliably unshielded/unlocked in the intended core loop
4. Main app + required Screen Time extension architecture is known
5. Main-app Family Controls Distribution is Assigned and every extension actually introduced has a documented/requested entitlement path
6. User can begin a routine
7. Camera can detect the user
8. At least one representative MVP movement can be counted reliably enough to justify further implementation
9. Routine completion can trigger app unlock
10. Major failure states discovered during feasibility work are documented
11. No known P0 technical assumption is being postponed solely for visual polish

The prototype may be visually rough.

Technical feasibility matters more than visual polish in this phase.
