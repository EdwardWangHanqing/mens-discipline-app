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

**03.6 — Family Controls Real-Device Authorization Validation**

## Current Objective

Validate the existing Family Controls development-signing and individual-authorization foundation on a physical iPhone before app selection, shielding, extensions, App Groups, or scheduling are introduced.

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
- The iOS Simulator can load the bridge and return `notDetermined`, but its system log reports that the `FamilyControlsAgent` service is unavailable; this is not evidence of real-device authorization behavior.
- The Technical Baseline screen is only a temporary engineering test surface; it is not production UI.
- FamilyActivityPicker, ManagedSettings shielding, Screen Time extensions, App Groups, and scheduling have not started.
- The accepted motion-tracking direction is tolerant automatic rep counting with a non-blocking assisted-completion path; tracking failure must not prevent routine completion or app unlock.
- Movement-agnostic pose architecture and offline/local Vision Checkpoint A is accepted and integrated; Pose Checkpoint B remains outside this Family Controls validation task.
- Checkpoint A adds a local Apple Vision adapter, a 19-joint normalized TypeScript contract, explicit unavailable-joint representation, and typed complete/partial/no-pose/input/processing outcomes.
- The adapter accepts local image files only; it adds no camera permission, live capture, networking, raw-image return, persistence, movement rules, repetition counting, or production training UI.
- The iOS Simulator loads the module and returns the expected typed `invalidInput / fileNotFound` bridge result. A valid local PNG reached Vision but returned typed `processingFailed / visionError` in the Simulator, so successful pose inference and partial-body behavior are not yet claimed.

## Primary Track — Technical Feasibility

Immediate work:

1. Review the physical-iPhone development-signing, entitlement, bridge, and individual-authorization evidence
2. Preserve the locked iOS Bundle ID and reproducible CNG configuration
3. Review and accept the publisher/lifecycle stabilization implementation and five-run approved-state cold-launch evidence
4. Add FamilyActivityPicker only after this real-device authorization checkpoint is accepted
5. Validate CNG and native integration against the required Family Controls / Screen Time extension architecture
6. Build the smallest App Selection → Lock/Shield → Unlock prototype
7. Review and accept the implemented movement-agnostic pose data contract and offline/local Vision Checkpoint A
8. Validate live camera framing, latency, partial-body behavior, tolerant counting, and assisted completion on a physical iPhone

The Family Controls Checkpoint 1 implementation is complete, accepted, and merged. Real-device development signing, authorization, and the approved-state cold-launch stabilization path have passed their current validation criteria on `spike/family-controls-real-device` and are pending owner code review. Denied/revoked behavior has not been tested. Pose Checkpoint A is accepted and integrated. App selection, shielding, extensions, App Groups, scheduling, live camera, and movement counting remain future tasks.

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

1. Track Family Controls Distribution entitlement requirements for the main app and every Screen Time extension actually used
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
5. Family Controls Distribution entitlement request strategy is documented and started at the appropriate point
6. User can begin a routine
7. Camera can detect the user
8. At least one representative MVP movement can be counted reliably enough to justify further implementation
9. Routine completion can trigger app unlock
10. Major failure states discovered during feasibility work are documented
11. No known P0 technical assumption is being postponed solely for visual polish

The prototype may be visually rough.

Technical feasibility matters more than visual polish in this phase.
