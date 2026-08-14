# Current Project Phase

## Project

Men's Discipline App

## Current Phase

**03 — Technical Feasibility**

## Completed Sub-phases

**03.1 — Project Bootstrap**

**03.2 — Apple / iOS Prerequisites**

**Status:** Complete

## Current Sub-phase

**03.3 — Official App Baseline / Expo Project Bootstrap**

## Current Objective

Close out a reproducible official Expo SDK 57 application baseline in this repository before the Family Controls / App Lock technical spike begins.

## Phase 03.3 Baseline State

- The official Expo SDK 57 application baseline is established in this repository.
- The official repository builds and launches successfully in the iPhone Simulator.
- The iOS Bundle ID is `com.temperline.mensdiscipline`.
- Expo Continuous Native Generation (CNG) is the current working native-project strategy, subject to validation against upcoming Family Controls and App Extension requirements.
- The current Technical Baseline screen confirms the application shell only; it is not production UI.

## Primary Track — Technical Feasibility

Immediate work:

1. Complete and verify the Phase 03.3 official Expo application baseline checkpoint
2. Preserve the locked iOS Bundle ID and reproducible CNG configuration
3. Begin the Family Controls / App Lock technical spike only after this checkpoint is accepted
4. Validate CNG and native integration against the required Family Controls / Screen Time extension architecture
5. Build the smallest App Selection → Lock/Shield → Unlock prototype
6. Plan the camera / pose prototype after the first Family Controls feasibility work is understood

Family Controls implementation has not started. It is the next technical task after the Phase 03.3 baseline checkpoint.

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
